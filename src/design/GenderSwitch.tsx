import { GENDERS } from '../data/inclusion';
import { useStore } from '../state/store';
import { Label, Segmented } from './primitives';

/**
 * Men's and women's sections are analysed separately. One shared switch,
 * so the section in view carries between screens.
 */
export function GenderSwitch({ note = 'Separate sections' }: { note?: string }) {
  const value = useStore((s) => s.genderView);
  const set = useStore((s) => s.setGenderView);
  return (
    <div className="gsw">
      <div className="labelrow gsw__head">
        <Label>Analyse · gender section</Label>
        <Label>{note}</Label>
      </div>
      <Segmented label="Gender section" options={GENDERS} value={value} onChange={set} />
    </div>
  );
}
