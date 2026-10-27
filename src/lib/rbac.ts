import { ROLES, type Role } from '../data/users';

export type AccessResult = { ok: true } | { ok: false; reason: 'signed-out' | 'forbidden' };

/** Routes are namespaced per role; a role may only enter its own namespace. */
export function checkAccess(role: Role | null | undefined, required: Role): AccessResult {
  if (!role) return { ok: false, reason: 'signed-out' };
  if (role !== required) return { ok: false, reason: 'forbidden' };
  return { ok: true };
}

export function roleFromPath(pathname: string): Role | null {
  const seg = pathname.split('/')[1];
  return (ROLES as string[]).includes(seg) ? (seg as Role) : null;
}
