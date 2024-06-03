import { z } from 'zod';

import { createSelectSchema } from 'drizzle-zod';
import { requestsTable } from '../../db/schema/requests';
import { tokensTable } from '../../db/schema/tokens';
import { idSchema, imageUrlSchema, nameSchema, paginationQuerySchema, passwordSchema, slugSchema, validSlugSchema } from '../../lib/common-schemas';
import { apiMembershipSchema } from '../memberships/schema';
import { apiUserSchema } from '../users/schema';
import { config } from 'config';

export const tokensSchema = createSelectSchema(tokensTable);

export const checkTokenSchema = z.object({
  type: tokensSchema.shape.type,
  email: z.string().email(),
  organizationName: z.string().optional(),
  organizationSlug: z.string().optional(),
});

export const inviteJsonSchema = z.object({
  emails: apiUserSchema.shape.email.array().min(1),
  role: z.union([apiUserSchema.shape.role, apiMembershipSchema.shape.role]).optional(),
});

export const inviteQuerySchema = z.object({
  idOrSlug: idSchema.or(validSlugSchema).optional(),
});

export const acceptInviteJsonSchema = z.object({
  password: passwordSchema.optional(),
  oauth: z.enum(['google', 'microsoft', 'github']).optional(),
});

export const apiPublicCountsSchema = z.object({
  organizations: z.number(),
  users: z.number(),
});

const suggestionSchema = z.object({
  slug: slugSchema,
  id: idSchema,
  name: nameSchema,
  email: z.string().optional(),
  thumbnailUrl: imageUrlSchema.nullable().optional(),
});

export const entitySuggestionSchema = suggestionSchema.extend({ type: z.enum(config.entityTypes) });

export const suggestionsSchema = z.object({
  entities: z.array(entitySuggestionSchema),
  total: z.number(),
});

export const actionReqTableSchema = createSelectSchema(requestsTable);

export const actionRequestSchema = z.object({
  userId: idSchema.nullable(),
  organizationId: idSchema.nullable(),
  email: z.string().min(1).email(),
  type: actionReqTableSchema.shape.type,
  message: z.string().nullable(),
});

export const actionResponseSchema = z.object({
  userId: idSchema.nullable(),
  organizationId: idSchema.nullable(),
  email: z.string().min(1).email(),
  type: actionReqTableSchema.shape.type,
});

export const getRequestsSchema = z.object({
  requestsInfo: z.array(
    z.object({
      id: idSchema,
      email: z.string(),
      createdAt: z.string(),
      type: actionReqTableSchema.shape.type,
      message: z.string().nullable(),
    }),
  ),
  total: z.number(),
});

export const getRequestsQuerySchema = paginationQuerySchema.merge(
  z.object({
    sort: z.enum(['id', 'email', 'type', 'createdAt']).default('createdAt').optional(),
  }),
);
