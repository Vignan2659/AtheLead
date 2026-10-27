import { Link } from 'react-router-dom';
import { Band, Label, RowNum, ScreenHeader, SectionHead, Title } from '../../design/primitives';
import { SQUADS } from '../../data/squad';
import { BOARD_RECS } from '../../slm/sources';
import { SlmChat } from '../../slm/SlmChat';
import { useCurrentUser, useStore } from '../../state/store';
import { GENDERS } from '../../data/inclusion';
import { useT } from '../../i18n';
import './coachtabs.css';

/** Everything waiting on the coach: board-forwarded items, SLM caps, athlete requests. */
export function CoachSlm() {
  const user = useCurrentUser();
  const boardRecs = useStore((s) => s.boardRecs);
  const done = useStore((s) => s.coachQueueDone);
  const complete = useStore((s) => s.completeQueueItem);
  const recDecisions = useStore((s) => s.recDecisions);
  const decideRec = useStore((s) => s.decideRec);
  const requests = useStore((s) => s.planRequests);
  const setGender = useStore((s) => s.setGenderView);
  const t = useT();

  const forwarded = BOARD_RECS.filter((r) => boardRecs[r.id] === 'sent' && r.forwardTo === user?.id);
  const caps = GENDERS.map((g) => ({ g, rec: SQUADS[g.value].rec })).filter((x) => (recDecisions[x.rec.id] ?? 'pending') === 'pending');
  const open = forwarded.filter((r) => !done.includes(r.id)).length + caps.length + requests.length;
  let n = 0;

  return (
    <>
      <ScreenHeader label="Sports SLM — Coach" initials={user?.initials ?? 'RM'}>
        <Title lines={['Squad', 'Intel.']} />
      </ScreenHeader>

      <Band rule="ink" i={2} flush aria-label="Your queue">
        <SectionHead title="Queue" aside={t('{n} waiting', { n: open })} />
        {open === 0 && forwarded.length === 0 ? (
          <p className="body ct__empty">{t('All clear. New SLM suggestions and items from the board land here.')}</p>
        ) : (
          <ul className="rows">
            {forwarded.map((r) => {
              const isDone = done.includes(r.id);
              return (
                <li key={r.id} className="cascade" style={{ ['--i' as string]: n }}>
                  <div className="row cq__item">
                    <RowNum n={++n} />
                    <span className="row__main">
                      <span className="M cq__from">{t('From the board')}</span>
                      <span className="row__name">{t(r.title)}</span>
                      <span className="M">{t(r.detail)}</span>
                    </span>
                    <span className="M">{r.confidence}%</span>
                    <div className="cq__actions">
                      {isDone ? (
                        <span className="M tone-ok" role="status">
                          {t('Accepted · board notified')}
                        </span>
                      ) : (
                        <button type="button" className="pill pill--sm" onClick={() => complete(r.id)}>
                          {t('Accept · add to plan')}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {caps.map(({ g, rec }) => (
              <li key={rec.id} className="cascade" style={{ ['--i' as string]: n }}>
                <div className="row cq__item">
                  <RowNum n={++n} />
                  <span className="row__main">
                    <span className="M tone-cobalt">SLM · {t(g.label)}</span>
                    <span className="row__name">{t(rec.title)}</span>
                    <span className="M">{t(rec.reason)}</span>
                  </span>
                  <span className="M">{rec.confidence}%</span>
                  <div className="cq__actions">
                    <button type="button" className="pill pill--sm" onClick={() => decideRec(rec.id, 'approved')}>
                      {t('Approve')}
                    </button>
                    <button type="button" className="textbtn" onClick={() => decideRec(rec.id, 'dismissed')}>
                      {t('Not now')}
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {requests.length > 0 && (
              <li className="cascade" style={{ ['--i' as string]: n }}>
                <div className="row cq__item">
                  <RowNum n={++n} />
                  <span className="row__main">
                    <span className="M cq__from">{t('From athletes')}</span>
                    <span className="row__name">
                      {t(requests.length > 1 ? '{n} plan changes to approve' : '{n} plan change to approve', { n: requests.length })}
                    </span>
                  </span>
                  <span />
                  <div className="cq__actions">
                    <Link to="/coach/squad" className="pill pill--sm" onClick={() => setGender('men')}>
                      {t('Review on Squad →')}
                    </Link>
                  </div>
                </div>
              </li>
            )}
          </ul>
        )}
      </Band>

      <Band rule="ink" i={3}>
        <SlmChat role="coach" />
      </Band>

      <Band tone="panel" i={4} aria-label="Access">
        <Label>Your access</Label>
        <p className="body" style={{ marginTop: 8 }}>
          {t('Your squads, scouting and fixtures, including medical notes for your players. Budgets and other teams stay with the board.')}
        </p>
      </Band>
    </>
  );
}
