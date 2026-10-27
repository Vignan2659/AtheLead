/**
 * Fitness-band data, normalised. Every provider (Fitbit, WHOOP, Noise, Garmin…)
 * is mapped into DailyReading so the athlete, coach and board screens never
 * care which band an athlete wears.
 */

export type ProviderId = 'fitbit' | 'whoop' | 'garmin' | 'noise' | 'amazfit' | 'boat' | 'apple';

/**
 * How the data reaches AtheLead.
 * - cloud-api: OAuth to the vendor's web API, pulled by the AtheLead backend.
 * - health-connect: Android Health Connect, read by the AtheLead Android app.
 * - healthkit: Apple Health, read by the AtheLead iOS app (on-device only).
 */
export type Route = 'cloud-api' | 'health-connect' | 'healthkit';

export type MetricId = 'restingHr' | 'hrv' | 'sleepHrs' | 'recovery' | 'strain' | 'steps' | 'topSpeedKmh' | 'spo2';

export interface Provider {
  id: ProviderId;
  name: string;
  maker: string;
  route: Route;
  /** What we expect to read through that route. Confirm at integration time. */
  metrics: MetricId[];
  note: string;
  status: 'planned' | 'pilot' | 'live';
}

/** One athlete-day of readings. Missing metrics are undefined, never zero. */
export interface DailyReading {
  athleteId: string;
  date: string;
  provider: ProviderId;
  restingHr?: number;
  /** RMSSD, ms. */
  hrv?: number;
  sleepHrs?: number;
  /** Vendor recovery score 0–100 where the band has one (e.g. WHOOP). */
  recovery?: number;
  /** Day strain or training load from the band, 0–21 scale as WHOOP uses it. */
  strain?: number;
  steps?: number;
  /** Fastest GPS speed in a session. */
  topSpeedKmh?: number;
  spo2?: number;
}

/** Per-athlete baselines the readiness maths compares against (rolling 28 days). */
export interface Baseline {
  restingHr: number;
  hrv: number;
  sleepHrs: number;
}

/** The seam a real integration implements; the preview source implements it today. */
export interface WearableSource {
  provider: ProviderId;
  /** Starts the consent / OAuth flow. */
  connect(athleteId: string): Promise<void>;
  daily(athleteId: string, days: number): Promise<DailyReading[]>;
}

export const METRIC_LABEL: Record<MetricId, { label: string; unit: string }> = {
  restingHr: { label: 'Resting HR', unit: 'bpm' },
  hrv: { label: 'HRV', unit: 'ms' },
  sleepHrs: { label: 'Sleep', unit: 'h' },
  recovery: { label: 'Recovery', unit: '%' },
  strain: { label: 'Strain', unit: '' },
  steps: { label: 'Steps', unit: '' },
  topSpeedKmh: { label: 'Top speed', unit: 'km/h' },
  spo2: { label: 'SpO₂', unit: '%' },
};
