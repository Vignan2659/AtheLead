import { useState } from 'react';
import { Band, Bar, Label, RowNum, ScreenHeader, Segmented, Title, cx } from '../../design/primitives';
import { EVENTS } from '../../data/union';
import { useCurrentUser } from '../../state/store';
import { useT } from '../../i18n';
import './boardtabs.css';

type View = 'priority' | 'date';
const VIEWS = [
  { value: 'priority', label: 'SLM priority' },
  { value: 'date', label: 'By date' },
] as const;

type Who = 'all' | 'men' | 'women';
const WHO = [
  { value: 'all', label: 'All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
] as const;

const startKey = (dates: string) => {
  const [d, m] = dates.slice(0, 5).split('.').map(Number);
  return m * 100 + d;
};
const MONTHS: Record<number, string> = { 11: 'November', 12: 'December' };

export function BoardEvents() {
  const user = useCurrentUser();
  const [view, setView] = useState<View>('priority');
  const [who, setWho] = useState<Who>('all');
  const t = useT();
  const list = EVENTS.filter((e) => who === 'all' || e.gender === who || e.gender === 'mixed').sort((a, b) =>
    view === 'priority' ? b.priority - a.priority : startKey(a.dates) - startKey(b.dates),
  );

  let lastMonth = 0;
  return (
    <>
      <ScreenHeader label="Velora Sports Union — Events" initials={user?.initials ?? 'MI'}>
        <Title lines={['Event', 'Plan.']} />
      </ScreenHeader>

      <Band rule="ink" i={2} className="be__controls">
        <Segmented label="Order" options={VIEWS} value={view} onChange={setView} />
        <Segmented label="Section" options={WHO} value={who} onChange={setWho} />
      </Band>

      <Band i={3} flush aria-label="Events">
        <ul className="rows" key={`${view}-${who}`}>
          {list.map((e, i) => {
            const m = Math.floor(startKey(e.dates) / 100);
            const head = view === 'date' && m !== lastMonth;
            lastMonth = m;
            return (
              <li key={e.id} className="cascade" style={{ ['--i' as string]: i }}>
                {head && <p className="M be__month">{t(MONTHS[m])}</p>}
                <div className="row be__event">
                  <RowNum n={i + 1} />
                  <span className="row__main">
                    <span className="row__name">{t(e.name)}</span>
                    <span className="M">
                      {t(e.sport)} · {e.city} · {e.dates} · {t(e.gender === 'mixed' ? 'Men & women' : e.gender === 'men' ? 'Men' : 'Women')}
                    </span>
                    <span className="be__reason">{t(e.reason)}</span>
                  </span>
                  <span className="be__pri">
                    <span className={cx('D', e.priority < 50 && 'tone-warn')}>{e.priority}</span>
                    <span className="M">{t(e.level)}</span>
                  </span>
                  <div className="bt__bar">
                    <Bar value={e.priority / 100} thin tone={e.priority >= 80 ? 'coral' : 'cobalt'} i={i} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Band>

      <Band tone="panel" i={4}>
        <Label>How priority is scored</Label>
        <p className="body" style={{ marginTop: 8 }}>
          {t('Selection value for the 2036 pathway, athletes close to a gate, workload risk, and cost. The SLM ranks; the board decides which events to enter.')}
        </p>
      </Band>
    </>
  );
}
