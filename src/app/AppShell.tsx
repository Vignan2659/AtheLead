import { Outlet } from 'react-router-dom';
import type { Role } from '../data/users';
import { BottomNav } from './BottomNav';
import { Overlays } from './Overlays';
import { OfflineBar, useIdleSignOut } from './Connectivity';
import { NextStep, StepStrip } from './Guide';

export function AppShell({ role }: { role: Role }) {
  useIdleSignOut();
  return (
    <>
      <OfflineBar />
      <main className="screen">
        <StepStrip role={role} />
        <Outlet />
        <NextStep role={role} />
      </main>
      <BottomNav role={role} />
      <Overlays />
    </>
  );
}
