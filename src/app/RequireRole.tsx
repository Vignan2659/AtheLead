import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../data/users';
import { checkAccess } from '../lib/rbac';
import { useCurrentUser } from '../state/store';
import { Forbidden } from './Forbidden';

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const user = useCurrentUser();
  const location = useLocation();
  const access = checkAccess(user?.role, role);
  if (access.ok) return <>{children}</>;
  if (access.reason === 'signed-out' || !user) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  return <Forbidden user={user} required={role} />;
}
