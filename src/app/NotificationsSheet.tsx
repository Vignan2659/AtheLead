import { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Label, RowNum, cx } from '../design/primitives';
import { Sheet } from '../design/Sheet';
import { KIND_LABEL, type Notice } from '../data/notifications';
import { pad2, timeAgo } from '../lib/format';
import { inboxFor, useStore } from '../state/store';
import { useT } from '../i18n';

/** The signed-in user's notices only — the store never hands another user's to this sheet. */
export function NotificationsSheet() {
  const open = useStore((s) => s.inboxOpen);
  const setOpen = useStore((s) => s.setInboxOpen);
  const userId = useStore((s) => s.userId);
  const notices = useStore((s) => s.notices);
  const markRead = useStore((s) => s.markRead);
  const markAllRead = useStore((s) => s.markAllRead);
  const navigate = useNavigate();
  const t = useT();
  const close = useCallback(() => setOpen(false), [setOpen]);

  const mine = useMemo(() => inboxFor(notices, userId), [notices, userId]);
  const unread = mine.filter((n) => !n.read).length;

  const openNotice = useCallback(
    (n: Notice) => {
      markRead(n.id);
      setOpen(false);
      if (n.href) navigate(n.href);
    },
    [markRead, setOpen, navigate],
  );

  if (!userId) return null;
  const now = Date.now();

  return (
    <Sheet open={open} onClose={close} label={t('Notifications')}>
      <div className="sheet__pad inbox__head">
        <div>
          <Label>{unread ? t('{n} unread', { n: pad2(unread) }) : t('All read')}</Label>
          <h2 className="D acct__name">{t('Inbox')}</h2>
        </div>
        <button type="button" className="textbtn" onClick={markAllRead} disabled={!unread}>
          {t('Mark all read')}
        </button>
      </div>

      {mine.length === 0 ? (
        <p className="sheet__pad body">{t('Nothing yet. Updates from your coach, athletes and the board land here.')}</p>
      ) : (
        <ul className="rows inbox__list" aria-live="polite">
          {mine.map((n, i) => (
            <li key={n.id}>
              <NoticeRow n={n} index={i + 1} ago={timeAgo(n.at, now)} onOpen={openNotice} />
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

const NoticeRow = memo(function NoticeRow({
  n,
  index,
  ago,
  onOpen,
}: {
  n: Notice;
  index: number;
  ago: string;
  onOpen: (n: Notice) => void;
}) {
  const t = useT();
  const alert = n.kind === 'injury' || n.kind === 'performance';
  return (
    <button type="button" className={cx('row inbox__row press', !n.read && 'is-unread')} onClick={() => onOpen(n)}>
      <span className="inbox__mark">
        {n.read ? <RowNum n={index} /> : <span className="inbox__dot" aria-label={t('Unread')} />}
      </span>
      <span className="row__main">
        <span className={cx('M', alert && 'tone-bad')}>
          {t(KIND_LABEL[n.kind])} · {t(ago)}
        </span>
        <span className="row__name">{t(n.title)}</span>
        <span className="inbox__body">{t(n.body)}</span>
      </span>
      <span className="M inbox__go" aria-hidden="true">
        {n.href ? '→' : ''}
      </span>
    </button>
  );
});
