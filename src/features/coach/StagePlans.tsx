import { Band, PillButton, SectionHead } from '../../design/primitives';
import { AGE_STAGES, PILOT_ATHLETES, PLAN_TEMPLATES, stageOf, yearsOf, type PilotSport } from '../../data/pilot';
import { useStore } from '../../state/store';
import { useT } from '../../i18n';

/** Plan templates by sport and age stage. Nothing reaches an athlete until the coach approves it. */
export function StagePlans({ sport, i }: { sport: PilotSport; i: number }) {
  const t = useT();
  const approved = useStore((s) => s.approvedPlans);
  const approve = useStore((s) => s.approvePlan);
  return (
    <Band rule="ink" i={i} flush aria-label="Plans by age stage">
      <SectionHead title="Plans" aside="By age stage · you approve" />
      {PLAN_TEMPLATES.filter((p) => p.sport === sport).map((p) => {
        const st = AGE_STAGES.find((x) => x.id === p.stage)!;
        const group = PILOT_ATHLETES.filter((a) => a.sport === sport && stageOf(yearsOf(a.ageMonths)).id === p.stage);
        const on = approved.includes(p.id);
        return (
          <div className="pb__card" key={p.id}>
            <div className="pb__cardhead">
              <span className="M">
                {t(st.label)} · {st.ages}
              </span>
              <span className="M">{t('{n} athletes', { n: group.length })}</span>
            </div>
            <span className="row__name">{t(p.name)}</span>
            <span className="M">
              {t('{n} a week · {m} min', { n: p.perWeek, m: p.minutes })} · {t(p.session)}
            </span>
            <span className="M tone-cobalt">{t(p.rule)}</span>
            <div className="pb__actions">
              <PillButton className="pill--sm" aria-pressed={on} disabled={!group.length} onClick={() => approve(p.id)}>
                {on ? 'Approved ✓' : 'Approve & assign'}
              </PillButton>
            </div>
          </div>
        );
      })}
    </Band>
  );
}
