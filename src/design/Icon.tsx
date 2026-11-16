/** Line icons for tabs and step tiles, so a screen can be found without reading its name. */
export type IconName =
  | 'sun' | 'run' | 'food' | 'heart' | 'chart' | 'chat' | 'people' | 'clipboard' | 'search' | 'calendar'
  | 'spark' | 'home' | 'medal' | 'sliders' | 'child' | 'shield' | 'flag' | 'scales' | 'speaker' | 'stop';

const PATHS: Record<IconName, string[]> = {
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8'],
  run: ['M14.5 5.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z', 'M12.8 7.8 9.6 12.6l3.8 2.4-1.4 6', 'M12.8 7.8l3.6 3.2 3.2-.9', 'M9.6 12.6l-4.4 1.2'],
  food: ['M3 12h18a9 9 0 0 1-18 0Z', 'M9 4c0 1.6 1.2 1.6 1.2 3.4M14 4c0 1.6 1.2 1.6 1.2 3.4'],
  heart: ['M12 20.5s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 6.1-8 11-8 11Z'],
  chart: ['M3 21h18', 'M6 21v-8M12 21V5M18 21v-11'],
  chat: ['M4 5h16v11H10l-6 4.5V5Z', 'M8 9h8M8 12.5h5'],
  people: ['M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M2.5 20c0-3.3 2.7-6 6-6s6 2.7 6 6', 'M16.5 11a2.5 2.5 0 1 0 0-5', 'M17 14.2c2.6.5 4.5 2.8 4.5 5.8'],
  clipboard: ['M9 3h6v3.5H9z', 'M9 4.8H6v16h12v-16h-3', 'M9 13.5l2.2 2.2 4-4.4'],
  search: ['M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z', 'M15.3 15.3 21 21'],
  calendar: ['M4 6h16v15H4z', 'M4 10.5h16M8 3v5M16 3v5', 'M8.5 15h3'],
  spark: ['M12 3l2.1 6.4L20.5 12l-6.4 2.6L12 21l-2.1-6.4L3.5 12l6.4-2.6L12 3Z'],
  home: ['M3.5 11.5 12 4l8.5 7.5', 'M6 10v10.5h4.5V15h3v5.5H18V10'],
  medal: ['M12 21a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z', 'M8.5 3l3.5 7 3.5-7', 'M12 13.5v4'],
  sliders: ['M4 7h9M18 7h2M4 17h2M11 17h9', 'M15.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M8.5 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  child: ['M12 9.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z', 'M6 21v-3.5a6 6 0 0 1 12 0V21'],
  shield: ['M12 3l7.5 3v5.2c0 4.6-3.1 8.3-7.5 9.8-4.4-1.5-7.5-5.2-7.5-9.8V6L12 3Z', 'M8.8 12l2.3 2.3 4.2-4.6'],
  flag: ['M6 21.5V3.5', 'M6 4.5h12l-2.5 4 2.5 4H6'],
  scales: ['M12 4v16.5M7 20.5h10M5 7.5h14', 'M5 7.5l-3 6.5h6l-3-6.5ZM19 7.5l-3 6.5h6l-3-6.5Z'],
  speaker: ['M4 9.5v5h3.5l5 4v-13l-5 4H4Z', 'M16 9a4.2 4.2 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11'],
  stop: ['M7 7h10v10H7z'],
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
