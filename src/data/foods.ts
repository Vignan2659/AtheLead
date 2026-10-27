/**
 * Food suggester, hostel mess menu and the age-aware calculator (Phase 1 doc,
 * section 11). Food data should come from the Indian Food Composition Tables
 * and ICMR-NIN guidance, and every template is signed off by a registered
 * sports nutritionist before launch. These entries are drafts.
 */

export type FoodType = 'veg' | 'egg' | 'non-veg';
export type Budget = 'low' | 'medium' | 'high';
export type When = 'before' | 'after' | 'competition';
export type Allergen = 'Peanut' | 'Milk' | 'Gluten' | 'Fish';

export interface Food {
  name: string;
  type: FoodType;
  budget: Budget;
  when: When[];
  allergens: Allergen[];
  note: string;
}

export const FOODS: Food[] = [
  { name: 'Idli with sambar', type: 'veg', budget: 'low', when: ['before', 'competition'], allergens: [], note: 'Light and easy to digest, 2–3 hours before' },
  { name: 'Ragi koozh', type: 'veg', budget: 'low', when: ['before'], allergens: ['Milk'], note: 'Millet porridge with buttermilk; good on hot mornings' },
  { name: 'Banana', type: 'veg', budget: 'low', when: ['before', 'competition'], allergens: [], note: 'Quick energy 30–60 minutes before' },
  { name: 'Dates', type: 'veg', budget: 'medium', when: ['before', 'competition'], allergens: [], note: 'Two or three between rounds' },
  { name: 'Curd rice', type: 'veg', budget: 'low', when: ['after'], allergens: ['Milk'], note: 'Cooling, with protein and carbohydrate' },
  { name: 'Chana sundal', type: 'veg', budget: 'low', when: ['after'], allergens: [], note: 'Chickpeas with coconut; protein for recovery' },
  { name: 'Groundnut sundal', type: 'veg', budget: 'low', when: ['after'], allergens: ['Peanut'], note: 'Cheap protein and energy' },
  { name: 'Mor (buttermilk)', type: 'veg', budget: 'low', when: ['after', 'competition'], allergens: ['Milk'], note: 'Fluids and salt on hot days' },
  { name: 'Coconut water', type: 'veg', budget: 'medium', when: ['after', 'competition'], allergens: [], note: 'Fluids and potassium' },
  { name: 'Kambu dosa', type: 'veg', budget: 'low', when: ['before'], allergens: [], note: 'Pearl millet; slower energy for long sessions' },
  { name: 'Lemon rice', type: 'veg', budget: 'low', when: ['competition'], allergens: ['Peanut'], note: 'Packs well for meet days' },
  { name: 'Upma with vegetables', type: 'veg', budget: 'low', when: ['before'], allergens: ['Gluten'], note: 'Semolina; eat 2–3 hours before' },
  { name: 'Paneer with chapati', type: 'veg', budget: 'high', when: ['after'], allergens: ['Milk', 'Gluten'], note: 'Protein for strength days' },
  { name: 'Boiled eggs', type: 'egg', budget: 'low', when: ['after'], allergens: [], note: 'Two or three after training' },
  { name: 'Egg dosa', type: 'egg', budget: 'low', when: ['after'], allergens: [], note: 'Protein and carbohydrate together' },
  { name: 'Milk with banana', type: 'veg', budget: 'low', when: ['after'], allergens: ['Milk'], note: 'Simple recovery drink' },
  { name: 'Chicken curry with rice', type: 'non-veg', budget: 'medium', when: ['after'], allergens: [], note: 'Main meal after hard sessions' },
  { name: 'Fish kuzhambu with rice', type: 'non-veg', budget: 'medium', when: ['after'], allergens: ['Fish'], note: 'Protein and healthy fats' },
];

/** Hostel mess menu, uploaded weekly by a site admin, with what to add. */
export const MESS_MENU = [
  { day: 'Mon', meals: 'Pongal · sambar rice · chapati, kurma', add: 'Add an egg or sundal at dinner' },
  { day: 'Tue', meals: 'Idli · curd rice, poriyal · rice, rasam', add: 'Add dal or paneer at lunch' },
  { day: 'Wed', meals: 'Upma · rice, kootu · chicken curry or paneer', add: 'Add fruit after training' },
  { day: 'Thu', meals: 'Dosa · lemon rice · chapati, dal', add: 'Add milk at bedtime' },
  { day: 'Fri', meals: 'Kambu koozh · sambar rice · fish or egg curry', add: 'Add a banana before training' },
  { day: 'Sat', meals: 'Idiyappam · vegetable biryani · rice, rasam', add: 'Add curd and sundal' },
  { day: 'Sun', meals: 'Poori · rice, sambar · light dinner', add: 'Add an egg or paneer at dinner' },
];
export const MESS_SITE = 'Madurai sports hostel';

/* ---------- Calculator ---------- */

/** Ages 18–24: energy and protein as ranges, never a single number. */
export function adultRanges(weightKg: number, heightCm: number, ageYears: number, male: boolean, load: 'moderate' | 'high') {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + (male ? 5 : -161);
  const [lo, hi] = load === 'high' ? [1.7, 2.0] : [1.5, 1.7];
  const r50 = (n: number) => Math.round(n / 50) * 50;
  return {
    kcal: [r50(bmr * lo), r50(bmr * hi)] as const,
    protein: [Math.round(weightKg * 1.4), Math.round(weightKg * 1.8)] as const,
  };
}

/** Ages 10–17: a balanced plate, not numbers. Shares of the plate. */
export const BALANCED_PLATE = [
  { part: 'Rice, millets or chapati', share: 0.35 },
  { part: 'Dal, egg, fish or meat', share: 0.25 },
  { part: 'Vegetables and greens', share: 0.25 },
  { part: 'Curd, milk and fruit', share: 0.15 },
];
