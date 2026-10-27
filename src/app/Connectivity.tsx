import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';
import { useT } from '../i18n';

/** Online unless the browser says otherwise or the demo switch is on. */
export function useOnline(): boolean {
  const sim = useStore((s) => s.simOffline);
  const [net, setNet] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setNet(true);
    const off = () => setNet(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return net && !sim;
}

/**
 * Offline-first: results wait in a queue on the phone and sync within moments
 * of the network coming back. The bar tells people where their data is.
 */
export function OfflineBar() {
  const online = useOnline();
  const queued = useStore((s) => s.syncQueue.length);
  const syncNow = useStore((s) => s.syncNow);
  const [syncing, setSyncing] = useState(false);
  const t = useT();

  useEffect(() => {
    if (!online || !queued) return;
    setSyncing(true);
    const id = window.setTimeout(() => {
      syncNow();
      setSyncing(false);
    }, 1200);
    return () => window.clearTimeout(id);
  }, [online, queued, syncNow]);

  if (online && !syncing) return null;
  return (
    <div className={`offbar M ${online ? 'is-sync' : ''}`} role="status" aria-live="polite">
      {online
        ? t('Back online · syncing {n} results', { n: queued })
        : queued
          ? t('Offline · {n} results saved on this phone', { n: queued })
          : t('Offline · entries save on this phone and sync later')}
    </div>
  );
}

/** Signs out after a stretch without input, for shared coach phones. */
export function useIdleSignOut(minutes = 15) {
  const signOut = useStore((s) => s.signOut);
  const signedIn = useStore((s) => !!s.userId);
  const navigate = useNavigate();
  useEffect(() => {
    if (!signedIn) return;
    let id = 0;
    const reset = () => {
      window.clearTimeout(id);
      id = window.setTimeout(() => {
        signOut();
        navigate('/signin', { replace: true, state: { timedOut: true } });
      }, minutes * 60_000);
    };
    const events = ['pointerdown', 'keydown', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(id);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [signedIn, minutes, signOut, navigate]);
}
