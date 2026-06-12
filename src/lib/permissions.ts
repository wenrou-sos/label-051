import { RoleType } from '@prisma/client';

export const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  [RoleType.ADMIN]: [
    'trial:create',
    'trial:read',
    'trial:update',
    'trial:delete',
    'subject:create',
    'subject:read',
    'subject:update',
    'subject:delete',
    'visit:create',
    'visit:read',
    'visit:update',
    'visit:delete',
    'ae:create',
    'ae:read',
    'ae:update',
    'ae:delete',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'timeline:read',
    'report:read',
    'audit:read',
  ],
  [RoleType.INVESTIGATOR]: [
    'trial:create',
    'trial:read',
    'trial:update',
    'subject:create',
    'subject:read',
    'subject:update',
    'visit:create',
    'visit:read',
    'visit:update',
    'ae:create',
    'ae:read',
    'ae:update',
    'timeline:read',
    'report:read',
  ],
  [RoleType.DOCTOR]: [
    'trial:read',
    'subject:create',
    'subject:read',
    'subject:update',
    'visit:create',
    'visit:read',
    'visit:update',
    'ae:create',
    'ae:read',
    'ae:update',
    'timeline:read',
  ],
  [RoleType.COORDINATOR]: [
    'trial:read',
    'subject:create',
    'subject:read',
    'subject:update',
    'visit:create',
    'visit:read',
    'visit:update',
    'ae:read',
    'timeline:read',
  ],
  [RoleType.MONITOR]: [
    'trial:read',
    'subject:read',
    'visit:read',
    'ae:read',
    'timeline:read',
    'report:read',
    'audit:read',
  ],
};

export function hasPermission(role: RoleType, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: RoleType, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error('权限不足');
  }
}
