import { and, count, desc, eq } from 'drizzle-orm';

import { db } from '../../db/db';
import { auth } from '../../db/lucia';
import { membershipsTable } from '../../db/schema/memberships';
import { organizationsTable } from '../../db/schema/organizations';
import { projectsTable } from '../../db/schema/projects';
import { usersTable } from '../../db/schema/users';
import { workspacesTable } from '../../db/schema/workspaces';
import { type ErrorType, createError, errorResponse } from '../../lib/errors';
import { logEvent } from '../../middlewares/logger/log-event';
import { CustomHono } from '../../types/common';
import { removeSessionCookie } from '../auth/helpers/cookies';
import { checkSlugAvailable } from '../general/helpers/check-slug';
import { transformDatabaseUser } from '../users/helpers/transform-database-user';
import { deleteSelfConfig, getUserMenuConfig, meRouteConfig, terminateSessionsConfig, updateSelfConfig } from './routes';

import { projectsToWorkspacesTable } from '../../db/schema/projects-to-workspaces';
import { generateElectricJWTToken } from '../../lib/utils';
import { toMembershipInfo } from '../memberships/helpers/to-membership-info';

const app = new CustomHono();

// Me (self) endpoints
const meRoutes = app
  /*
   * Get current user
   */
  .openapi(meRouteConfig, async (ctx) => {
    const user = ctx.get('user');

    const [{ memberships }] = await db
      .select({
        memberships: count(),
      })
      .from(membershipsTable)
      .where(eq(membershipsTable.userId, user.id));

    //TODO: move this to a helper function
    const sessions = await auth.getUserSessions(user.id);
    const currentSessionId = auth.readSessionCookie(ctx.req.raw.headers.get('Cookie') ?? '');
    const preparedSessions = sessions.map((session) => ({
      ...session,
      type: 'DESKTOP' as const,
      current: session.id === currentSessionId,
    }));

    // Generate a JWT token for electric
    const electricJWTToken = await generateElectricJWTToken({ userId: user.id });

    return ctx.json(
      {
        success: true,
        data: {
          ...transformDatabaseUser(user),
          sessions: preparedSessions,
          electricJWTToken,
          counts: {
            memberships,
          },
        },
      },
      200,
    );
  })
  /*
   * Get current user menu
   */
  .openapi(getUserMenuConfig, async (ctx) => {
    const user = ctx.get('user');

    const organizationsWithMemberships = await db
      .select({
        organization: organizationsTable,
        membership: membershipsTable,
      })
      .from(organizationsTable)
      .where(and(eq(membershipsTable.userId, user.id), eq(membershipsTable.type, 'ORGANIZATION')))
      .orderBy(desc(organizationsTable.createdAt))
      .innerJoin(membershipsTable, eq(membershipsTable.organizationId, organizationsTable.id));

    const workspacesWithMemberships = await db
      .select({
        workspace: workspacesTable,
        membership: membershipsTable,
      })
      .from(workspacesTable)
      .where(and(eq(membershipsTable.userId, user.id), eq(membershipsTable.type, 'WORKSPACE')))
      .orderBy(desc(workspacesTable.createdAt))
      .innerJoin(membershipsTable, eq(membershipsTable.workspaceId, workspacesTable.id));

    const projectsWithMemberships = await db
      .select({
        project: projectsTable,
        membership: membershipsTable,
        workspace: projectsToWorkspacesTable,
      })
      .from(projectsTable)
      .where(and(eq(membershipsTable.userId, user.id), eq(membershipsTable.type, 'PROJECT')))
      .orderBy(desc(projectsTable.createdAt))
      .innerJoin(membershipsTable, eq(membershipsTable.projectId, projectsTable.id))
      .innerJoin(projectsToWorkspacesTable, eq(projectsToWorkspacesTable.projectId, projectsTable.id));

    const organizations = organizationsWithMemberships.map(({ organization, membership }) => {
      return {
        slug: organization.slug,
        id: organization.id,
        createdAt: organization.createdAt,
        modifiedAt: organization.modifiedAt,
        name: organization.name,
        entity: organization.entity,
        thumbnailUrl: organization.thumbnailUrl,
        membership: toMembershipInfo.required(membership),
      };
    });

    const projects = projectsWithMemberships.map(({ project, membership, workspace }) => {
      return {
        slug: project.slug,
        id: project.id,
        createdAt: project.createdAt,
        modifiedAt: project.modifiedAt,
        name: project.name,
        color: project.color,
        entity: project.entity,
        organizationId: project.organizationId,
        membership: toMembershipInfo.required(membership),
        // @TODO: what is mainId?
        mainId: workspace.workspaceId,
      };
    });

    const workspaces = workspacesWithMemberships.map(({ workspace, membership }) => {
      return {
        slug: workspace.slug,
        id: workspace.id,
        createdAt: workspace.createdAt,
        modifiedAt: workspace.modifiedAt,
        name: workspace.name,
        thumbnailUrl: workspace.thumbnailUrl,
        organizationId: workspace.organizationId,
        entity: workspace.entity,
        membership: toMembershipInfo.required(membership),
        submenu: projects.filter((p) => p.mainId === workspace.id),
      };
    });

    return ctx.json(
      {
        success: true,
        data: {
          organizations: organizations,
          workspaces: workspaces,
        },
      },
      200,
    );
  })
  /*
   * Terminate a session
   */
  .openapi(terminateSessionsConfig, async (ctx) => {
    const { ids } = ctx.req.valid('query');

    const sessionIds = Array.isArray(ids) ? ids : [ids];

    const cookieHeader = ctx.req.raw.headers.get('Cookie');
    const currentSessionId = auth.readSessionCookie(cookieHeader ?? '');

    const errors: ErrorType[] = [];

    await Promise.all(
      sessionIds.map(async (id) => {
        try {
          if (id === currentSessionId) {
            removeSessionCookie(ctx);
          }
          await auth.invalidateSession(id);
        } catch (error) {
          errors.push(createError(ctx, 404, 'not_found', 'warn', undefined, { session: id }));
        }
      }),
    );

    return ctx.json({ success: true, errors: errors }, 200);
  })
  /*
   * Update current user (self)
   */
  .openapi(updateSelfConfig, async (ctx) => {
    const user = ctx.get('user');

    if (!user) return errorResponse(ctx, 404, 'not_found', 'warn', 'USER', { user: 'self' });

    const { email, bannerUrl, bio, firstName, lastName, language, newsletter, thumbnailUrl, slug } = ctx.req.valid('json');

    if (slug && slug !== user.slug) {
      const slugAvailable = await checkSlugAvailable(slug);
      if (!slugAvailable) return errorResponse(ctx, 409, 'slug_exists', 'warn', 'USER', { slug });
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        email,
        bannerUrl,
        bio,
        firstName,
        lastName,
        language,
        newsletter,
        thumbnailUrl,
        slug,
        name: [firstName, lastName].filter(Boolean).join(' ') || slug,
        modifiedAt: new Date(),
        modifiedBy: user.id,
      })
      .where(eq(usersTable.id, user.id))
      .returning();

    const [{ memberships }] = await db
      .select({
        memberships: count(),
      })
      .from(membershipsTable)
      .where(eq(membershipsTable.userId, updatedUser.id));

    logEvent('User updated', { user: updatedUser.id });

    // Generate a JWT token for electric
    const electricJWTToken = await generateElectricJWTToken({ userId: user.id });

    //TODO: move this to a helper function
    const sessions = await auth.getUserSessions(user.id);
    const currentSessionId = auth.readSessionCookie(ctx.req.raw.headers.get('Cookie') ?? '');
    const preparedSessions = sessions.map((session) => ({
      ...session,
      type: 'DESKTOP' as const,
      current: session.id === currentSessionId,
    }));

    return ctx.json(
      {
        success: true,
        data: {
          ...transformDatabaseUser(updatedUser),
          electricJWTToken,
          sessions: preparedSessions,
          counts: {
            memberships,
          },
        },
      },
      200,
    );
  })
  /*
   * Delete current user (self)
   */
  .openapi(deleteSelfConfig, async (ctx) => {
    const user = ctx.get('user');
    // * Check if user exists
    if (!user) return errorResponse(ctx, 404, 'not_found', 'warn', 'USER', { user: 'self' });

    // * Delete user
    await db.delete(usersTable).where(eq(usersTable.id, user.id));

    // * Invalidate sessions
    await auth.invalidateUserSessions(user.id);
    removeSessionCookie(ctx);
    logEvent('User deleted', { user: user.id });

    return ctx.json({ success: true }, 200);
  });

export default meRoutes;
