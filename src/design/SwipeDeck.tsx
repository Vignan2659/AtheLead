import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { dragProgress, stackOpacity, stackTransform, swipeDecision, type SwipeDir } from '../lib/swipe';
import './swipedeck.css';
import { useT } from '../i18n';

export interface DeckItem {
  id: string;
  node: ReactNode;
}

export interface SwipeDeckHandle {
  fling: (dir: SwipeDir) => void;
}

const FLING_MS = 380;
const SPRING_MS = 450;
const SHADE_PER_DEPTH = 0.08;

/**
 * Card positions are written straight to the DOM (refs + rAF), so a drag
 * never re-renders React. Cards are keyed by id, so when the top card leaves
 * the others keep their DOM nodes and already sit where they need to be.
 */
export const SwipeDeck = forwardRef<SwipeDeckHandle, { items: DeckItem[]; onDecide: (id: string, dir: SwipeDir) => void; label: string }>(
  function SwipeDeck({ items, onDecide, label }, ref) {
    const t = useT();
    const visible = items.slice(0, 4);
    const els = useRef<(HTMLDivElement | null)[]>([]);
    const drag = useRef({ active: false, pointer: -1, x0: 0, y0: 0, dx: 0, dy: 0, raf: 0 });
    const busy = useRef(false);

    const parts = (el: HTMLDivElement) => ({
      shade: el.querySelector<HTMLElement>('.deck__shade'),
      yes: el.querySelector<HTMLElement>('.deck__stamp--yes'),
      no: el.querySelector<HTMLElement>('.deck__stamp--no'),
      up: el.querySelector<HTMLElement>('.deck__stamp--up'),
    });

    /** Place every card behind the top one at depth (k - lift). */
    const placeBehind = useCallback((lift: number, animate: boolean) => {
      for (let k = 1; k < els.current.length; k++) {
        const el = els.current[k];
        if (!el) continue;
        const d = k - lift;
        const t = animate ? `transform ${FLING_MS}ms var(--ease), opacity ${FLING_MS}ms var(--ease)` : 'none';
        el.style.transition = t;
        el.style.transform = stackTransform(d);
        el.style.opacity = String(stackOpacity(d));
        const { shade } = parts(el);
        if (shade) {
          shade.style.transition = animate ? `opacity ${FLING_MS}ms var(--ease)` : 'none';
          shade.style.opacity = String(Math.min(d, 2) * SHADE_PER_DEPTH);
        }
      }
    }, []);

    // Snap every card to its resting slot whenever the stack changes.
    const key = visible.map((v) => v.id).join('|');
    useLayoutEffect(() => {
      els.current.length = visible.length;
      els.current.forEach((el, k) => {
        if (!el) return;
        el.style.transition = 'none';
        el.style.transform = stackTransform(k);
        el.style.opacity = String(stackOpacity(k));
        const { shade, yes, no, up } = parts(el);
        if (shade) {
          shade.style.transition = 'none';
          shade.style.opacity = String(Math.min(k, 2) * SHADE_PER_DEPTH);
        }
        [yes, no, up].forEach((s) => s && (s.style.opacity = '0'));
        void el.offsetHeight;
      });
      busy.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const applyDrag = () => {
      drag.current.raf = 0;
      const top = els.current[0];
      if (!top) return;
      const { dx, dy } = drag.current;
      top.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${dx / 18}deg)`;
      const { yes, no } = parts(top);
      if (yes) yes.style.opacity = String(Math.max(0, Math.min(1, dx / 110)));
      if (no) no.style.opacity = String(Math.max(0, Math.min(1, -dx / 110)));
      placeBehind(dragProgress(dx), false);
    };

    const fling = useCallback(
      (dir: SwipeDir) => {
        const top = els.current[0];
        const item = visible[0];
        if (!top || !item || busy.current) return;
        busy.current = true;
        const w = top.offsetWidth;
        const { dy } = drag.current;
        const { yes, no, up } = parts(top);
        const stamp = dir === 'right' ? yes : dir === 'left' ? no : up;
        if (stamp) {
          stamp.style.transition = `opacity 160ms var(--ease)`;
          stamp.style.opacity = '1';
        }
        top.style.transition = `transform ${FLING_MS}ms var(--ease), opacity ${FLING_MS}ms var(--ease)`;
        top.style.transform =
          dir === 'up'
            ? `translate3d(0, ${-Math.max(420, window.innerHeight * 0.6)}px, 0)`
            : `translate3d(${(dir === 'right' ? 1 : -1) * (w * 1.4)}px, ${dy}px, 0) rotate(${dir === 'right' ? 22 : -22}deg)`;
        top.style.opacity = '0';
        placeBehind(1, true);
        drag.current.dx = 0;
        drag.current.dy = 0;
        window.setTimeout(() => onDecide(item.id, dir), FLING_MS);
      },
      [visible, onDecide, placeBehind],
    );

    useImperativeHandle(ref, () => ({ fling }), [fling]);

    const springBack = () => {
      const top = els.current[0];
      if (!top) return;
      top.style.transition = `transform ${SPRING_MS}ms var(--ease)`;
      top.style.transform = stackTransform(0);
      const { yes, no } = parts(top);
      [yes, no].forEach((s) => {
        if (!s) return;
        s.style.transition = `opacity ${SPRING_MS}ms var(--ease)`;
        s.style.opacity = '0';
      });
      for (let k = 1; k < els.current.length; k++) {
        const el = els.current[k];
        if (!el) continue;
        el.style.transition = `transform ${SPRING_MS}ms var(--ease), opacity ${SPRING_MS}ms var(--ease)`;
        el.style.transform = stackTransform(k);
        el.style.opacity = String(stackOpacity(k));
        const { shade } = parts(el);
        if (shade) {
          shade.style.transition = `opacity ${SPRING_MS}ms var(--ease)`;
          shade.style.opacity = String(Math.min(k, 2) * SHADE_PER_DEPTH);
        }
      }
    };

    const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (busy.current || e.button > 0) return;
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);
      el.style.transition = 'none';
      drag.current = { active: true, pointer: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, raf: 0 };
    };
    const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d.active || e.pointerId !== d.pointer) return;
      d.dx = e.clientX - d.x0;
      d.dy = (e.clientY - d.y0) * 0.35;
      if (!d.raf) d.raf = requestAnimationFrame(applyDrag);
    };
    const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d.active || e.pointerId !== d.pointer) return;
      d.active = false;
      if (d.raf) cancelAnimationFrame(d.raf);
      d.raf = 0;
      const dir = e.type === 'pointercancel' ? null : swipeDecision(d.dx);
      if (dir) fling(dir);
      else springBack();
    };

    return (
      <div className="deck" role="group" aria-label={label}>
        {visible.map((item, k) => (
          <div
            key={item.id}
            ref={(el) => (els.current[k] = el)}
            className="deck__card"
            style={{ zIndex: 10 - k }}
            aria-hidden={k > 0}
            {...(k === 0
              ? { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }
              : {})}
          >
            <div className="deck__shade" />
            <span className="deck__stamp deck__stamp--yes M">{t('Approve')}</span>
            <span className="deck__stamp deck__stamp--no M">{t('Reject')}</span>
            <span className="deck__stamp deck__stamp--up M">{t('To coach')}</span>
            {item.node}
          </div>
        ))}
      </div>
    );
  },
);
