import { useState } from 'react';
import { Band, Bar, Label, SectionHead, Segmented, cx } from '../../design/primitives';
import {
  BALANCED_PLATE, FOODS, MESS_MENU, MESS_SITE, adultRanges, type Allergen, type Budget, type FoodType, type When,
} from '../../data/foods';
import { BODY } from '../../data/stats';
import { formatIN } from '../../lib/format';
import { useT } from '../../i18n';
import '../pilot/pilot.css';

const TYPES = [
  { value: 'veg', label: 'Veg' },
  { value: 'egg', label: 'Egg' },
  { value: 'non-veg', label: 'Non-veg' },
] as const;
const WHEN = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'competition', label: 'Meet day' },
] as const;
const BUDGET = [
  { value: 'low', label: 'Low cost' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'Any' },
] as const;
const ALLERGENS: Allergen[] = ['Peanut', 'Milk', 'Gluten', 'Fish'];
const RANK: Record<Budget, number> = { low: 0, medium: 1, high: 2 };
// An egg eater also eats veg; a non-veg eater eats everything.
const ALLOWED: Record<FoodType, FoodType[]> = { veg: ['veg'], egg: ['veg', 'egg'], 'non-veg': ['veg', 'egg', 'non-veg'] };

/** Indian and Tamil Nadu foods filtered by diet, budget, allergies and when they are eaten. */
export function FoodFinder({ i, initialAllergies = ['Peanut'] }: { i: number; initialAllergies?: Allergen[] }) {
  const t = useT();
  const [type, setType] = useState<FoodType>('egg');
  const [when, setWhen] = useState<When>('before');
  const [budget, setBudget] = useState<Budget>('low');
  const [avoid, setAvoid] = useState<Allergen[]>(initialAllergies);
  const shown = FOODS.filter(
    (f) => ALLOWED[type].includes(f.type) && f.when.includes(when) && RANK[f.budget] <= RANK[budget] && !f.allergens.some((a) => avoid.includes(a)),
  );
  return (
    <Band rule="ink" i={i} aria-label="Food finder">
      <SectionHead title="Food finder" aside="Nutritionist templates" />
      <div className="fm__filters">
        <Segmented label="Diet" options={TYPES} value={type} onChange={setType} />
        <Segmented label="When" options={WHEN} value={when} onChange={setWhen} />
        <Segmented label="Budget" options={BUDGET} value={budget} onChange={setBudget} />
      </div>
      <Label>Avoid</Label>
      <div className="ct__chips fm__chips">
        {ALLERGENS.map((a) => {
          const on = avoid.includes(a);
          return (
            <button key={a} type="button" className="pill pill--sm slm__chip" aria-pressed={on} onClick={() => setAvoid(on ? avoid.filter((x) => x !== a) : [...avoid, a])}>
              {t(a)}
            </button>
          );
        })}
      </div>
      <ul className="pb__list">
        {shown.length === 0 && <li className="M">{t('Nothing matches. Loosen a filter.')}</li>}
        {shown.map((f) => (
          <li key={f.name}>
            <span className="row__name">{t(f.name)}</span>
            <span className="M">{t(f.note)}</span>
          </li>
        ))}
      </ul>
    </Band>
  );
}

/** This week's hostel mess menu and what to add to it. */
export function MessMenu({ i }: { i: number }) {
  const t = useT();
  const today = (new Date().getDay() + 6) % 7;
  return (
    <Band i={i} flush aria-label="Hostel mess menu">
      <SectionHead title="Mess menu" aside={t(MESS_SITE)} />
      <ul className="rows">
        {MESS_MENU.map((m, k) => (
          <li key={m.day}>
            <div className={cx('row fm__mess', k === today && 'is-today')}>
              <span className="D row__num">{t(m.day)}</span>
              <span className="row__main">
                <span className="fm__meals">{t(m.meals)}</span>
                <span className="M tone-ok">+ {t(m.add)}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Band>
  );
}

/** Ages 18–24: ranges from weight, height and load. A nutritionist reviews any weight change. */
export function AdultRanges({ i, ageYears, heightCm }: { i: number; ageYears: number; heightCm: number }) {
  const t = useT();
  const r = adultRanges(BODY.weightKg, heightCm, ageYears, true, 'high');
  return (
    <Band tone="panel" i={i} aria-label="Your ranges">
      <div className="labelrow">
        <Label>Your daily range · 18 to 24</Label>
        <Label>{t('{w} kg · {h} cm · high load', { w: BODY.weightKg.toFixed(1), h: heightCm })}</Label>
      </div>
      <p className="D fm__range">
        {formatIN(r.kcal[0])}–{formatIN(r.kcal[1])} <small>kcal</small>
      </p>
      <p className="D fm__range">
        {r.protein[0]}–{r.protein[1]} <small>{t('g protein')}</small>
      </p>
      <p className="pb__note">{t('Ranges, not targets. A nutritionist reviews any plan that changes your body weight.')}</p>
      <p className="pb__note">{t('Thinking about a supplement? Check it against the national anti-doping list first: supplements can contain banned substances.')}</p>
    </Band>
  );
}

/** Ages 10–17: the plate, with numbers only for the guardian, coach and nutritionist. */
export function BalancedPlate({ i, kcal, protein }: { i: number; kcal?: readonly [number, number]; protein?: readonly [number, number] }) {
  const t = useT();
  return (
    <Band rule="ink" i={i} aria-label="Food">
      <SectionHead title="Food" aside="Balanced plate" />
      <ul className="pb__bars">
        {BALANCED_PLATE.map((p, k) => (
          <li key={p.part}>
            <span className="M">{t(p.part)}</span>
            <Bar value={p.share / 0.35} tone={k % 2 ? 'coral' : 'cobalt'} i={k} />
            <span className="D">{Math.round(p.share * 100)}%</span>
          </li>
        ))}
      </ul>
      {kcal && protein && (
        <p className="pb__note">
          {t('For you as guardian: about {a}–{b} kcal and {p}–{q} g protein a day. Your child sees the plate, not the numbers.', {
            a: formatIN(kcal[0]),
            b: formatIN(kcal[1]),
            p: protein[0],
            q: protein[1],
          })}
        </p>
      )}
      <p className="pb__note">{t('No weight-loss goals and no supplements under 18. Weight-class talk is led in person by the coach and nutritionist.')}</p>
    </Band>
  );
}
