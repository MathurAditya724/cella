import type { UserModel } from '../../../db/schema/users';

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const transformDatabaseUser = ({ hashedPassword, ...user }: MakeOptional<UserModel, 'hashedPassword'>) => {
  return {
    ...user,
    lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
    lastVisitAt: user.lastVisitAt?.toISOString() ?? null,
    lastSignInAt: user.lastSignInAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    modifiedAt: user.modifiedAt?.toISOString() ?? null,
  };
};
