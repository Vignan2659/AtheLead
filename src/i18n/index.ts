/**
 * English / Tamil. Strings are keyed by their English text, so English needs no
 * dictionary and a missing Tamil entry falls back to English. Keys may hold
 * {placeholders}: "{n} days to" matches "14 days to", and each captured value
 * is translated too. Names, places and numbers stay as written.
 *
 * Tamil is a draft for native review (Phase 1 open decision: Tamil language review).
 */
import { create } from 'zustand';
import { useEffect, type ReactNode } from 'react';
import { TA } from './ta';

export type Lang = 'en' | 'ta';
export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'ta', label: 'தமிழ்', short: 'த' },
];

const LANG_KEY = 'athelead.lang';
type Vars = Record<string, string | number>;

function readLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'ta' ? 'ta' : 'en';
  } catch {
    return 'en';
  }
}

export const useLang = create<{ lang: Lang; setLang: (l: Lang) => void }>((set) => ({
  lang: readLang(),
  setLang: (lang) => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* storage blocked — language lives in memory only */
    }
    set({ lang });
  },
}));

const fill = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s);

/** Keys with placeholders, compiled once, longest first so the most specific wins. */
const PATTERNS = Object.keys(TA)
  .filter((k) => k.includes('{'))
  .sort((a, b) => b.length - a.length)
  .map((k) => {
    const names: string[] = [];
    const src = k
      .split(/(\{\w+\})/)
      .map((part) => {
        const m = /^\{(\w+)\}$/.exec(part);
        if (m) {
          names.push(m[1]);
          return '(.+?)';
        }
        return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('');
    return { key: k, names, re: new RegExp(`^${src}$`) };
  });

const missing = new Set<string>();

function toTamil(s: string, depth = 0): string | null {
  const hit = TA[s] ?? TA[s.trim()];
  if (hit !== undefined) return hit;
  if (depth > 2 || s.length > 400) return null;
  for (const p of PATTERNS) {
    const m = p.re.exec(s);
    if (!m) continue;
    const vars: Vars = {};
    p.names.forEach((n, i) => (vars[n] = toTamil(m[i + 1], depth + 1) ?? m[i + 1]));
    return fill(TA[p.key], vars);
  }
  return null;
}

/** Translate one string. Use the hook in components; this is for code outside React. */
export function translate(lang: Lang, s: string, vars?: Vars): string {
  if (lang === 'en' || !s) return fill(s, vars);
  // Already Tamil (a translated string passed through a primitive again).
  if (/[\u0B80-\u0BFF]/.test(s) && !vars) return s;
  const out = toTamil(s) ?? toTamil(fill(s, vars));
  if (out === null) {
    if (import.meta.env.DEV && /[a-z]{3}/i.test(s)) missing.add(s);
    return fill(s, vars);
  }
  return fill(out, vars);
}

export type T = (s: string, vars?: Vars) => string;

/** Plain text of a node made only of strings and numbers; null when it holds elements. */
export function textOf(node: ReactNode): string | null {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node) && node.every((n) => typeof n === 'string' || typeof n === 'number' || n == null || n === false))
    return node.filter((n) => n != null && n !== false).join('');
  return null;
}

/** Translate a node when it is plain text; leave elements alone. */
export const tNode = (t: T, node: ReactNode): ReactNode => {
  const s = textOf(node);
  return s === null ? node : t(s);
};

export function useT(): T {
  const lang = useLang((s) => s.lang);
  return (s, vars) => translate(lang, s, vars);
}

/** Keeps <html lang> in step so screen readers and :lang(ta) styles follow. */
export function useHtmlLang() {
  const lang = useLang((s) => s.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __i18nMissing: () => string[] }).__i18nMissing = () => [...missing];
}
