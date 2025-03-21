import { eq, max } from 'drizzle-orm';
import { db } from '#/db/db';
import { type InsertMembershipModel, type MembershipModel, membershipsTable } from '#/db/schema/memberships';
import type { UserModel } from '#/db/schema/users';
import { logEvent } from '#/middlewares/logger/log-event';
import type { BaseEntityModel, ContextEntity } from '#/types/common';

interface Props<T> {
  user: UserModel;
  role: MembershipModel['role'];
  entity: T;
  createdBy?: UserModel['id'];
}

// Helper function to insert a membership and give it proper order number
export const insertMembership = async <T extends BaseEntityModel<ContextEntity>>({ user, role, entity, createdBy = user.id }: Props<T>) => {
  // Get the max order number
  const [{ maxOrder }] = await db
    .select({
      maxOrder: max(membershipsTable.order),
    })
    .from(membershipsTable)
    .where(eq(membershipsTable.userId, user.id));

  const newMembership: InsertMembershipModel = {
    organizationId: '',
    type: entity.entity,
    userId: user.id,
    role,
    createdBy,
    order: maxOrder ? maxOrder + 1 : 1,
  };
  // If inserted membership is not organization
  newMembership.organizationId = entity.organizationId ?? entity.id;
  // If you add more entities to membership
  newMembership[`${entity.entity}Id`] = entity.id;

  // Insert
  const [result] = await db.insert(membershipsTable).values(newMembership).returning({
    id: membershipsTable.id,
    role: membershipsTable.role,
    archived: membershipsTable.archived,
    muted: membershipsTable.muted,
    order: membershipsTable.order,
    userId: membershipsTable.userId,
    organizationId: membershipsTable.organizationId,
  });

  // Log
  logEvent(`User added to ${entity.entity}`, { user: user.id, id: entity.id });

  return result;
};
