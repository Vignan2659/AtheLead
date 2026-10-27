import { memo } from 'react';
import { Band, Bar, CountUp, Label, PillButton, RowNum, ScreenHeader, SectionHead, Title, cx } from '../../design/primitives';
import { MEAL_LABEL, dietPlanFor, type Meal } from '../../data/diet';
import { formatIN } from '../../lib/format';
import { useCurrentUser, useStore } from '../../state/store';
import { useT } from '../../i18n';
import './today.css';
import './fuel.css';
import { AdultRanges, FoodFinder, MessMenu } from './FuelMore';
import { ARJUN_AGE_MONTHS, ARJUN_HEIGHT_CM, yearsOf } from '../../data/pilot';

export function AthleteFuel() {
  const user = useCurrentUser();
  const logged = useStore((s) => s.mealsLogged);
  const toggleMeal = useStore((s) => s.toggleMeal);
  const waterMl = useStore((s) => s.waterMl);
  const addWater = useStore((s) => s.addWater);
  const plan = dietPlanFor(user?.id ?? '');
  const tr = useT();

  if (!plan) {
    return (
      <>
        <ScreenHeader label="Fuel" initials={user?.initials ?? ''}>
          <Title lines={['Eat to', 'Train.']} />
        </ScreenHeader>
        <Band rule="ink" i={2}>
          <Label>Plan on its way</Label>
          <p className="body fu__text">{tr('Your nutrition team is preparing a plan for your sport and position.')}</p>
        </Band>
      </>
    );
  }

  const eaten = plan.meals.filter((m) => logged.includes(m.id));
  const kcal = eaten.reduce((a, m) => a + m.kcal, 0);
  const protein = eaten.reduce((a, m) => a + m.protein, 0);
  const t = plan.targets;
  const waterL = waterMl / 1000;

  return (
    <>
      <ScreenHeader label={`${tr('Fuel')} — ${tr(plan.position)}`} initials={user?.initials ?? 'AR'}>
        <Title lines={['Eat to', 'Race.']} />
      </ScreenHeader>

      {plan.source === 'sample' && (
        <Band rule="ink" i={2} aria-label="Sample plan notice">
          <Label className="tone-coral">Sample plan</Label>
          <p className="fu__text">
            {tr('The nutrition team’s sport-specific plans are being added. This sample is built for {sport} · {position} · {pref} · {allergy} allergy.', {
              sport: tr(plan.sport).toLowerCase(),
              position: tr(plan.position).toLowerCase(),
              pref: tr(plan.preference),
              allergy: plan.allergies.map((a) => tr(a)).join(', ').toLowerCase(),
            })}
          </p>
        </Band>
      )}

      <Band tone="panel" i={3} aria-label="Today's energy">
        <div className="labelrow">
          <Label>Energy · kcal</Label>
          <span className="M tone-coral">{tr('{n} to go', { n: formatIN(Math.max(0, t.kcal - kcal)) })}</span>
        </div>
        <div className="fu__kcal">
          <CountUp value={kcal} format={formatIN} className="D fu__kcalnum" />
          <span className="fu__of">{tr('of {n}', { n: formatIN(t.kcal) })}</span>
        </div>
        <Bar value={kcal / t.kcal} tone="coral" i={3} className="fu__bigbar" />
        <dl className="fu__macros">
          <div>
            <dt className="M">{tr('Protein · g')}</dt>
            <dd className="D fu__mnum">
              {protein}
              <small>/{t.protein}</small>
            </dd>
            <Bar value={protein / t.protein} tone="cobalt" thin i={4} />
          </div>
          <div>
            <dt className="M">{tr('Carbs · g')}</dt>
            <dd className="D fu__mnum">{t.carbs}</dd>
            <span className="M">{tr('Daily target')}</span>
          </div>
          <div>
            <dt className="M">{tr('Fat · g')}</dt>
            <dd className="D fu__mnum">{t.fat}</dd>
            <span className="M">{tr('Daily target')}</span>
          </div>
        </dl>
      </Band>

      <Band rule="ink" i={4} aria-label="Hydration">
        <div className="labelrow">
          <Label>Water · litres</Label>
          <Label>Target {t.water} L</Label>
        </div>
        <div className="fu__water">
          <span className="D fu__wnum" aria-live="polite">
            {waterL.toFixed(2)}
          </span>
          <div className="fu__wbtns">
            <PillButton variant="outline" onClick={() => addWater(250)}>
              +250 ml
            </PillButton>
            <PillButton variant="ink" onClick={() => addWater(500)}>
              +500 ml
            </PillButton>
          </div>
        </div>
        <Bar value={waterL / t.water} tone="cobalt" i={4} />
      </Band>

      <Band rule="ink" i={5} flush aria-label="Meals">
        <SectionHead title="Meals" aside="Tap to log" />
        <ul className="rows">
          {plan.meals.map((m, i) => (
            <li key={m.id}>
              <MealRow meal={m} n={i + 1} done={logged.includes(m.id)} onToggle={toggleMeal} />
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={6} className="fu__duo" aria-label="Foods to prioritise and limit">
        <div>
          <Label className="tone-ok">Prioritise</Label>
          <ul className="fu__list">
            {plan.prioritise.map((f) => (
              <li key={f}>{tr(f)}</li>
            ))}
          </ul>
        </div>
        <div>
          <Label className="tone-bad">Limit</Label>
          <ul className="fu__list">
            {plan.limit.map((f) => (
              <li key={f}>{tr(f)}</li>
            ))}
          </ul>
        </div>
      </Band>

      <AdultRanges i={7} ageYears={yearsOf(ARJUN_AGE_MONTHS)} heightCm={ARJUN_HEIGHT_CM} />
      <FoodFinder i={8} initialAllergies={['Peanut']} />
      <MessMenu i={9} />
    </>
  );
}

const MealRow = memo(function MealRow({
  meal,
  n,
  done,
  onToggle,
}: {
  meal: Meal;
  n: number;
  done: boolean;
  onToggle: (id: string) => void;
}) {
  const t = useT();
  return (
    <button type="button" className={cx('row td__ex fu__meal', done && 'is-done')} aria-pressed={done} onClick={() => onToggle(meal.id)}>
      <span className="td__numcell" aria-hidden="true">
        <span className="td__num">
          <RowNum n={n} />
        </span>
        <svg className="td__check" viewBox="0 0 24 24" width="24" height="24">
          <circle cx="12" cy="12" r="12" fill="var(--cobalt)" />
          <path d="M7 12.5 10.5 16 17 8.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="row__main">
        <span className="row__name">
          {t(meal.name)}
          <span className="td__strike" aria-hidden="true" />
        </span>
        <span className="M">
          {meal.time} · {t(MEAL_LABEL[meal.slot])} · {t('{n} g protein', { n: meal.protein })}
        </span>
        <span className="fu__items">{meal.items.map((x) => t(x)).join(' · ')}</span>
      </span>
      <span className="D row__val">{meal.kcal}</span>
      <span className="sr-only">{t(done ? 'logged' : 'not logged')}</span>
    </button>
  );
});
