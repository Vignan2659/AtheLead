import { useState } from 'react';
import { Band, Bar, Chevron, Expander, Label, ScreenHeader, SectionHead, Title, cx } from '../../design/primitives';
import { BOARD_RECS } from '../../slm/sources';
import { SlmChat } from '../../slm/SlmChat';
import type { Recommendation } from '../../slm/types';
import { useCurrentUser, useStore, type BoardRecDecision } from '../../state/store';
import { useT } from '../../i18n';
import './boardtabs.css';

const STATUS: Record<BoardRecDecision, { text: string; tone: string }> = {
  approved: { text: 'Approved · logged', tone: 'tone-ok' },
  rejected: { text: 'Rejected · logged for audit', tone: 'tone-bad' },
  sent: { text: 'Sent to Coach Ravi', tone: 'tone-cobalt' },
};

const BRIEF = [
  'U-20 Nationals start 03.11 in Bhubaneswar. Arjun Reddy and Anjali Munda are one gate from national camp.',
  'Rural retention is 84% against 93% urban. Travel cost is the main reason.',
  'Men’s race walk form is 63, the lowest event group. A technique review is asked for.',
];

export function BoardSlm() {
  const user = useCurrentUser();
  const decisions = useStore((s) => s.boardRecs);
  const pending = BOARD_RECS.filter((r) => !decisions[r.id]).length;
  const t = useT();

  return (
    <>
      <ScreenHeader label="Sports SLM — Board" initials={user?.initials ?? 'MI'}>
        <Title lines={['Intel', 'Desk.']} />
      </ScreenHeader>

      <Band tone="panel" i={2} aria-label="This week's brief">
        <div className="labelrow">
          <Label>Board brief · week of 19.10</Label>
          <span className="pulse tone-coral" aria-hidden="true" />
        </div>
        <ol className="bs__brief">
          {BRIEF.map((b) => (
            <li key={b}>{t(b)}</li>
          ))}
        </ol>
      </Band>

      <Band rule="ink" i={3} flush aria-label="Recommendations">
        <SectionHead title="Recommends" aside={t('{n} to decide', { n: pending })} />
        <ul className="bs__recs">
          {BOARD_RECS.map((r, i) => (
            <li key={r.id} className="cascade" style={{ ['--i' as string]: i }}>
              <RecCard r={r} n={i + 1} />
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={4}>
        <SlmChat role="board" />
      </Band>
    </>
  );
}

function RecCard({ r, n }: { r: Recommendation; n: number }) {
  const [open, setOpen] = useState(false);
  const d = useStore((s) => s.boardRecs[r.id]);
  const coachDone = useStore((s) => s.coachQueueDone.includes(r.id));
  const decide = useStore((s) => s.decideBoardRec);
  const id = `why-${r.id}`;
  const t = useT();

  return (
    <article className={cx('bs__rec', d && 'is-decided')}>
      <div className="labelrow">
        <Label>{`${String(n).padStart(2, '0')} · ${t('{n}% confident', { n: r.confidence })}`}</Label>
        {d && <span className={cx('M', STATUS[d].tone)}>{t(d === 'sent' && coachDone ? 'Coach Ravi accepted' : STATUS[d].text)}</span>}
      </div>
      <h3 className="bs__title">{t(r.title)}</h3>
      <p className="bs__detail">{t(r.detail)}</p>
      <p className="M tone-ok">{t(r.impact)}</p>
      <button type="button" className="textbtn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {t('Why?')} <Chevron />
      </button>
      <Expander open={open} id={id}>
        <ul className="bs__factors">
          {r.factors.map((f, i) => (
            <li key={f.label}>
              <div className="labelrow">
                <span>{t(f.label)}</span>
                <span className="M">{f.weight}%</span>
              </div>
              {open && <Bar value={f.weight / 100} thin i={i} />}
            </li>
          ))}
        </ul>
      </Expander>
      <div className="bs__actions">
        {d ? (
          <button type="button" className="textbtn" onClick={() => decide(r.id, null)}>
            {t('Undo')}
          </button>
        ) : (
          <>
            <button type="button" className="pill pill--sm bs__approve" onClick={() => decide(r.id, 'approved')}>
              {t('Approve')}
            </button>
            <button type="button" className="pill pill--sm" onClick={() => decide(r.id, 'rejected')}>
              {t('Reject')}
            </button>
            {r.forwardTo && (
              <button type="button" className="pill pill--sm" onClick={() => decide(r.id, 'sent')}>
                {t('Send to coach')}
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
