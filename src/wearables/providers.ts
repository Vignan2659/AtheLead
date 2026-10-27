import type { Provider } from './types';

/**
 * Bands we plan to support, in rough order of integration effort. Routes are
 * our current understanding and must be confirmed with each vendor before
 * building. Indian budget bands (Noise, boAt, Amazfit) usually sync to the
 * phone's health store rather than offering a public API.
 */
export const PROVIDERS: Provider[] = [
  {
    id: 'whoop',
    name: 'WHOOP',
    maker: 'WHOOP',
    route: 'cloud-api',
    metrics: ['recovery', 'strain', 'hrv', 'restingHr', 'sleepHrs'],
    note: 'Developer API with OAuth. Recovery and strain map straight onto readiness and load.',
    status: 'planned',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    maker: 'Google',
    route: 'cloud-api',
    metrics: ['restingHr', 'hrv', 'sleepHrs', 'steps', 'spo2'],
    note: 'Web API with OAuth; Google is moving Fitbit data to its newer health APIs, so confirm the current route at build time.',
    status: 'planned',
  },
  {
    id: 'garmin',
    name: 'Garmin',
    maker: 'Garmin',
    route: 'cloud-api',
    metrics: ['restingHr', 'hrv', 'sleepHrs', 'steps', 'topSpeedKmh'],
    note: 'Connect Developer Program (approval needed). GPS gives sprint and run speeds.',
    status: 'planned',
  },
  {
    id: 'noise',
    name: 'Noise',
    maker: 'Noise',
    route: 'health-connect',
    metrics: ['restingHr', 'sleepHrs', 'steps', 'spo2'],
    note: 'Most affordable for rural athletes. Read through Android Health Connect once the NoiseFit app syncs there.',
    status: 'planned',
  },
  {
    id: 'boat',
    name: 'boAt',
    maker: 'boAt',
    route: 'health-connect',
    metrics: ['restingHr', 'sleepHrs', 'steps', 'spo2'],
    note: 'Same route as Noise: Android Health Connect.',
    status: 'planned',
  },
  {
    id: 'amazfit',
    name: 'Amazfit',
    maker: 'Zepp Health',
    route: 'health-connect',
    metrics: ['restingHr', 'hrv', 'sleepHrs', 'steps'],
    note: 'Via the Zepp app syncing to Health Connect or Apple Health.',
    status: 'planned',
  },
  {
    id: 'apple',
    name: 'Apple Watch',
    maker: 'Apple',
    route: 'healthkit',
    metrics: ['restingHr', 'hrv', 'sleepHrs', 'steps', 'spo2'],
    note: 'Apple Health is on-device only, so it needs the AtheLead iOS app.',
    status: 'planned',
  },
];

export const ROUTE_LABEL = {
  'cloud-api': 'Cloud API',
  'health-connect': 'Health Connect',
  healthkit: 'Apple Health',
} as const;
