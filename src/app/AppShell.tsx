import { Outlet } from 'react-router-dom';
import type { Role } from '../data/users';
import { BottomNav } from './BottomNav';
import { Overlays } from './Overlays';
import { OfflineBar, useIdleSignOut } from './Connectivity';

export function AppShell({ role }: { role: Role }) {
  useIdleSignOut();
  return (
    <>
      <OfflineBar />
      <main className="screen">
        <Outlet />
      </main>
      <BottomNav role={role} />
      <Overlays />
    </>
  );
}
