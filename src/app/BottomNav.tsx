import type { CSSProperties } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { Role } from '../data/users';
import { PARENT_TAB, TABS } from './nav';
import { useT } from '../i18n';

export function BottomNav({ role }: { role: Role }) {
  const { pathname } = useLocation();
  const tr = useT();
  const tabs = TABS[role];
  const parent = PARENT_TAB[pathname];
  const found = tabs.findIndex((t) => (parent ? t.path === parent : pathname.startsWith(`/${role}/${t.path}`)));
  // The engine explainer is reached from the SLM chat, which sits in the last tab.
  const active = found >= 0 ? found : pathname.endsWith('/engine') ? tabs.length - 1 : 0;
  return (
    <nav className="nav" aria-label={tr('Main')} style={{ '--tabs': tabs.length } as CSSProperties}>
      <span className="nav__marker" style={{ transform: `translate3d(${active * 100}%,0,0)` }} aria-hidden="true" />
      {tabs.map((t) => (
        <NavLink key={t.path} to={`/${role}/${t.path}`} className="nav__tab">
          <span className="M">{tr(t.label)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
