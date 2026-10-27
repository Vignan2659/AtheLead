/**
 * The mock engine matches English keywords. A Tamil question is mapped onto
 * them here: a translated suggested prompt goes back to its English original,
 * and typed Tamil gets the English keywords for the Tamil words it contains.
 * Draft list for native review.
 */
import type { T } from '../i18n';

const TAMIL_SCRIPT = /[஀-௿]/;

/** Tamil stem → English keyword the engine knows. Stems, so suffixes still match. */
const KEYWORDS: [string, string][] = [
  ['பயிற்சி', 'train'],
  ['நாளை', 'tomorrow'],
  ['காயம்', 'injury'],
  ['வலி', 'sore'],
  ['ஆபத்து', 'risk'],
  ['தேசிய முகாம்', 'national camp'],
  ['முகாம்', 'camp'],
  ['சாப்பிட', 'eat'],
  ['உணவு', 'eat'],
  ['சாப்பாடு', 'eat'],
  ['முன்னேற்ற', 'progress'],
  ['வளர்ச்சி', 'dev index'],
  ['போட்டி', 'meet'],
  ['பந்தயம்', 'race'],
  ['திட்ட', 'plan'],
  ['14 நாள்', '14-day plan'],
  ['பணிச்சுமை', 'workload'],
  ['சுமை', 'load'],
  ['திறமை', 'talent'],
  ['தேர்வு', 'scout'],
  ['வாய்ப்புள்ள', 'prospect'],
  ['ஆதரவு', 'support'],
  ['முதலீடு', 'invest'],
  ['நிதி', 'fund'],
  ['பட்ஜெட்', 'budget'],
  ['கிராம', 'rural'],
  ['மாவட்ட', 'district'],
  ['மாநில', 'state'],
  ['பிராந்திய', 'region'],
  ['மண்டல', 'zone'],
  ['வடகிழக்கு', 'north-east'],
  ['தமிழ்நாடு', 'tamil'],
  ['பெண்', 'women'],
  ['ஆண்', 'men'],
  ['நிகழ்வு', 'event'],
  ['முன்னுரிமை', 'priorit'],
  ['பயிற்சியாளர்', 'coach'],
  ['சிறந்த', 'best'],
  ['குழு', 'event group'],
  ['மருத்துவ', 'medical'],
  ['நோயறிதல்', 'diagnosis'],
  ['சோதனை', 'trials'],
  ['2036', '2036'],
];

export function toEngineQuery(question: string, prompts: string[], t: T): string {
  if (!TAMIL_SCRIPT.test(question)) return question;
  const q = question.trim();
  const prompt = prompts.find((p) => t(p) === q);
  if (prompt) return prompt;
  // Latin words (names like "Yash") pass through so the access rules still see them.
  const latin = q.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  const words = KEYWORDS.filter(([ta]) => q.includes(ta)).map(([, en]) => en);
  return [...latin, ...words].join(' ');
}
