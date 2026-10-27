/**
 * Diet plans — part of the MVP.
 *
 * The real, sport-specific plans come from the nutrition teammate. Until they
 * land, SAMPLE_PLANS holds one placeholder plan so the Fuel screens can be
 * demoed; the UI labels it "Sample plan" whenever `source` is 'sample'.
 *
 * To add the real data: export plans in this shape (one per athlete, or one per
 * sport + position + gender and map athletes to them), set `source` to
 * 'nutrition-team', and replace SAMPLE_PLANS in `dietPlanFor`.
 */
import type { Gender } from './inclusion';

export type DietPreference = 'veg' | 'eggetarian' | 'non-veg' | 'vegan' | 'jain';

export type MealSlot = 'breakfast' | 'pre-training' | 'lunch' | 'snack' | 'post-training' | 'dinner';

export interface Meal {
  id: string;
  slot: MealSlot;
  time: string;
  name: string;
  items: string[];
  kcal: number;
  protein: number;
}

export interface DietTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Litres per day. */
  water: number;
}

export interface DietPlan {
  id: string;
  source: 'sample' | 'nutrition-team';
  athleteId: string;
  sport: string;
  position: string;
  gender: Gender;
  preference: DietPreference;
  allergies: string[];
  targets: DietTargets;
  meals: Meal[];
  prioritise: string[];
  limit: string[];
}

export const MEAL_LABEL: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  'pre-training': 'Pre-training',
  lunch: 'Lunch',
  snack: 'Snack',
  'post-training': 'Post-training',
  dinner: 'Dinner',
};

/** Placeholder until the nutrition team's data arrives. */
export const SAMPLE_PLANS: DietPlan[] = [
  {
    id: 'diet-arjun-sample',
    source: 'sample',
    athleteId: 'ath-arjun',
    sport: 'Athletics',
    position: '400 m sprinter',
    gender: 'men',
    preference: 'eggetarian',
    allergies: ['Peanut'],
    targets: { kcal: 3050, protein: 165, carbs: 390, fat: 85, water: 3.8 },
    meals: [
      { id: 'm-bf', slot: 'breakfast', time: '07:00', name: 'Egg bhurji + rotis', items: ['3 eggs', '2 rotis', 'Curd', 'Banana'], kcal: 620, protein: 32 },
      { id: 'm-pre', slot: 'pre-training', time: '09:30', name: 'Poha + lassi', items: ['Poha, no peanuts', 'Sweet lassi'], kcal: 430, protein: 14 },
      { id: 'm-lunch', slot: 'lunch', time: '13:00', name: 'Rice, dal, paneer', items: ['Rice', 'Toor dal', 'Paneer bhurji', 'Salad'], kcal: 780, protein: 38 },
      { id: 'm-snack', slot: 'snack', time: '16:00', name: 'Sprouts chaat', items: ['Moong sprouts', 'Roasted chana', 'Lemon'], kcal: 280, protein: 16 },
      { id: 'm-post', slot: 'post-training', time: '18:30', name: 'Milk + boiled eggs', items: ['Milk, 400 ml', '2 boiled eggs', 'Dates'], kcal: 420, protein: 30 },
      { id: 'm-dinner', slot: 'dinner', time: '20:30', name: 'Curd rice + rajma', items: ['Rajma', 'Rotis', 'Curd rice'], kcal: 520, protein: 22 },
    ],
    prioritise: ['Dal and rajma', 'Eggs', 'Curd and milk', 'Seasonal fruit', 'Coconut water on hot days'],
    limit: ['Fried snacks before track sessions', 'Sugary drinks', 'Anything with peanuts'],
  },
];

/** The plan for an athlete. Swap SAMPLE_PLANS for the nutrition team's data. */
export const dietPlanFor = (athleteId: string): DietPlan | undefined =>
  SAMPLE_PLANS.find((p) => p.athleteId === athleteId);

/** Meals logged before the demo opens. */
export const INITIAL_MEALS_LOGGED = ['m-bf', 'm-pre', 'm-lunch'];
