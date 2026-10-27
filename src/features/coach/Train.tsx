import { useState } from 'react';
import { Band, Label, PillButton, RowNum, ScreenHeader, SectionHead, Segmented, Title, cx } from '../../design/primitives';
import { GenderSwitch } from '../../design/GenderSwitch';
import { ROUTINES } from '../../data/training';
import { SQUADS } from '../../data/squad';
import { DAY_NAMES, playersFor, useCurrentUser, useStore } from '../../state/store';
import { useT } from '../../i18n';
import { DrillsLink } from '../athlete/Drills';
import './coachtabs.css';

const DAYS = DAY_NAMES.map((d, i) => ({ value: String(i), label: d.slice(0, 2) }));

/** SLM pre-fill: a no-equipment routine for the player who is struggling to get to the ground. */
const SUGGEST = {
  men: { playerId: 'p-nikhil', routineId: 'rt-home', why: 'Nikhil misses sessions; a home routine keeps him training.' },
  women: { playerId: 'p-fatima', routineId: 'rt-home', why: 'Fatima has board exams; 25 minutes at home, no equipment.' },
};

export function CoachTrain() {
  const user = useCurrentUser();
  const gender = useStore((s) => s.genderView);
  const assignments = useStore((s) => s.assignments);
  const assign = useStore((s) => s.assignRoutine);
  const unassign = useStore((s) => s.unassign);
  const squad = SQUADS[gender];
  const t = useT();

  const [routineId, setRoutineId] = useState<string>(ROUTINES[0].id);
  const [target, setTarget] = useState<string>(`squad:${gender}`);
  const [day, setDay] = useState('3');
  const [flash, setFlash] = useState<string | null>(null);

  // Keep the target inside the squad in view.
  const tgt = target === `squad:${gender}` || squad.players.some((p) => p.id === target) ? target : `squad:${gender}`;
  const routine = ROUTINES.find((r) => r.id === routineId)!;
  const reach = playersFor(tgt);
  const linked = reach.filter((p) => p.userId);
  const mine = assignments.filter((a) => a.target === `squad:${gender}` || squad.players.some((p) => p.id === a.target));
  const s = SUGGEST[gender];

  const submit = () => {
    assign(routineId, tgt, Number(day));
    const who = tgt.startsWith('squad:') ? t('the whole squad') : reach[0]?.name.split(' ')[0];
    setFlash(
      `${t(routine.name)} → ${who}, ${t(DAY_NAMES[Number(day)])}.${linked.length ? ` ${t('{names} notified in the app.', { names: linked.map((p) => p.name.split(' ')[0]).join(', ') })}` : ''}`,
    );
  };

  return (
    <>
      <ScreenHeader label="Track Squad U-20 — Training" initials={user?.initials ?? 'RM'}>
        <Title lines={['Plan', 'Work.']} />
      </ScreenHeader>

      <Band rule="ink" i={2}>
        <GenderSwitch note={squad.name} />
      </Band>

      <DrillsLink to="/coach/drills" i={3} />

      <Band tone="cobalt" i={3} aria-label="SLM suggestion">
        <Label>Sports SLM · suggestion</Label>
        <p className="ct__sugg">{t(s.why)}</p>
        <PillButton
          variant="white"
          arrow
          onClick={() => {
            setRoutineId(s.routineId);
            setTarget(s.playerId);
            setDay('2');
          }}
        >
          Fill in the form
        </PillButton>
      </Band>

      <Band rule="ink" i={4} flush aria-label="Routine">
        <SectionHead title="01 Routine" aside="Library" />
        <ul className="rows">
          {ROUTINES.map((r, i) => (
            <li key={r.id}>
              <button type="button" className={cx('row ct__pick', r.id === routineId && 'is-on')} aria-pressed={r.id === routineId} onClick={() => setRoutineId(r.id)}>
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">
                    {t(r.name)}
                    {r.noEquipment && <span className="M tag tag--rural">{t('No kit')}</span>}
                  </span>
                  <span className="M">
                    {t(r.focus)} · {t(r.dose)}
                  </span>
                </span>
                <span className="D row__val">
                  {r.minutes}
                  <span className="M ct__unit">{t('min')}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={5} aria-label="Who">
        <SectionHead title="02 Who" aside={t(reach.length === 1 ? '{n} player' : '{n} players', { n: reach.length })} />
        <div className="ct__chips" role="group" aria-label={t('Assign to')}>
          <button type="button" className="slm__chip" aria-pressed={tgt === `squad:${gender}`} onClick={() => setTarget(`squad:${gender}`)}>
            {t('Whole squad')}
          </button>
          {squad.players.map((p) => (
            <button key={p.id} type="button" className="slm__chip" aria-pressed={tgt === p.id} onClick={() => setTarget(p.id)}>
              {p.name.split(' ')[0]}
              {p.status === 'injured' && ` · ${t('injured')}`}
            </button>
          ))}
        </div>
        {reach.some((p) => p.status === 'injured') && (
          <p className="M tone-bad ct__warn">{t('Includes an injured player. Check with the physio first.')}</p>
        )}
      </Band>

      <Band rule="ink" i={6} aria-label="When">
        <SectionHead title="03 When" aside="Week of 19.10" />
        <Segmented label="Day" options={DAYS} value={day} onChange={setDay} />
        <div className="ct__go">
          <PillButton variant="coral" block arrow onClick={submit}>
            {t('Assign {name}', { name: t(routine.name).toLowerCase() })}
          </PillButton>
          <p className="M ct__flash" role="status" aria-live="polite">
            {flash ?? t('Players with the app get a notice and see it in their week.')}
          </p>
        </div>
      </Band>

      <Band rule="ink" i={7} flush aria-label="Assigned this week">
        <SectionHead title="Assigned" aside={t('{n} this week', { n: mine.length })} />
        {mine.length === 0 ? (
          <p className="body ct__empty">{t('Nothing assigned yet this week.')}</p>
        ) : (
          <ul className="rows">
            {mine.map((a, i) => {
              const r = ROUTINES.find((x) => x.id === a.routineId);
              const who = a.target.startsWith('squad:') ? t('Whole squad') : playersFor(a.target)[0]?.name;
              return (
                <li key={a.id} className="cascade" style={{ ['--i' as string]: i }}>
                  <div className="row">
                    <RowNum n={i + 1} />
                    <span className="row__main">
                      <span className="row__name">{r && t(r.name)}</span>
                      <span className="M">
                        {who} · {t(DAY_NAMES[a.day])}
                      </span>
                    </span>
                    <button type="button" className="textbtn" onClick={() => unassign(a.id)}>
                      {t('Undo')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Band>
    </>
  );
}
