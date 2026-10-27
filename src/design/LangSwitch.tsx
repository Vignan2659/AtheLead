import { LANGS, useLang, useT } from '../i18n';
import { cx } from './primitives';

/** English | தமிழ். Each option is labelled in its own language and script. */
export function LangSwitch({ className }: { className?: string }) {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  const t = useT();
  return (
    <div className={cx('lang', className)} role="group" aria-label={t('Language')}>
      {LANGS.map((l) => (
        <button key={l.id} type="button" lang={l.id} className="lang__opt" aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
