# Fitness bands in AtheLead

**Status:** planned. The MVP shows labelled *preview* data from `src/wearables/preview.ts`; no
device is connected yet.

## Why
A morning check-in is how an athlete *feels*. A band measures how they actually recovered. Together
they give coaches and selectors far more precise numbers than training logs alone.

| Role | What the band adds |
|---|---|
| Athlete | Real recovery and sleep beside the check-in; GPS speeds in sessions; streaks. |
| Coach | Objective recovery and load for every athlete, so plan changes rest on measured data; early warning when HRV drops or resting HR rises. |
| Board | Device-verified readiness behind selections. **No heart or sleep data**: readiness only (RBAC). |

## Metrics (normalised)
Every provider maps into `DailyReading` (`src/wearables/types.ts`): resting HR, HRV (RMSSD),
sleep hours, vendor recovery score, strain/load, steps, GPS top speed, SpO₂. A missing metric is
`undefined`, never zero.

**Readiness** (`wearableReadiness`): HRV against the athlete's 28-day baseline (50%), sleep (30%),
resting HR (20%); a vendor recovery score is used when the band has one. **Blended readiness**
(`blendedReadiness`): band 60% + check-in 40%, because pain and mood don't show on a wrist.

## Integration routes
AtheLead is a web app today. Two kinds of routes:

1. **Cloud APIs**, pulled by the AtheLead backend (FastAPI) after the athlete grants OAuth consent:
   - **WHOOP:** developer API; recovery, strain, sleep, HRV.
   - **Fitbit (Google):** web API; Google is moving Fitbit data to newer health APIs, so confirm
     the current route at build time.
   - **Garmin:** Connect Developer Program (needs approval); includes GPS speeds.
2. **Phone health stores**, which need a small **AtheLead companion app** (Android first):
   - **Android Health Connect:** covers **Noise, boAt, Amazfit** and most budget bands popular in
     India, which sync to it through their own apps. Confirm each vendor's sync.
   - **Apple Health:** on-device only; needs the iOS app.

Implement `WearableSource` (`connect`, `daily`) per route. The UI already reads only
`DailyReading`, so screens don't change when a real band replaces the preview.

**Recommended order:** Health Connect (reaches the most rural athletes through budget bands) →
WHOOP → Fitbit → Garmin → Apple Health.

## Privacy and consent
- India's **Digital Personal Data Protection Act 2023**: explicit, purpose-specific consent; easy
  withdrawal; data minimisation. Most pathway athletes are **under 18**, so **verifiable parental
  consent** is required before any band data is collected.
- Heart, sleep and SpO₂ data are visible to the **athlete and their coach only**. The board sees
  readiness status. This matches the existing rule that medical and diet details are locked for
  the board.
- Store raw readings in India; keep only what the readiness maths and coaching need.

## Open questions for the team
- Which bands do our pilot districts' athletes actually own? Survey before choosing the first integration.
- Should the union buy budget bands for rural athletes in the pilot? A band costs far less than a
  missed selection.
- Who owns the data if an athlete leaves the union?
