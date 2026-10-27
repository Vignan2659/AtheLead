# AtheLead — product brief

## The problem
A boy or girl in a village can be a genuinely gifted athlete and still never be seen. They have no
recognition, no coach who tracks them, no data, and no route to the people who pick Olympic squads.
India loses that talent before anyone knows it existed.

## The mission
**AtheLead is the bridge between rural talent and the sports board that selects India's Olympians,
so India wins the most medals it can at the 2036 Olympic Games, held at home.**

We train athletes, track their work, and get results from them for 2036.

| Role | What AtheLead does for them |
|---|---|
| **Athlete** (often rural, first-generation) | Gets discovered, gets a coach, sees their own progress and where they stand on the road to 2036. |
| **Coach** | Tracks every athlete's training, movement and load; makes them stronger; **changes their plan based on their actual progress**. |
| **Board** (selectors) | Sees verified, data-backed talent from every district, not just the cities, and selects for national camps and the Olympic core. |

The Sports SLM suggests; coaches and board members decide. Every suggestion explains itself.

## MVP sport: athletics
The MVP shows **one Olympic sport end to end: athletics (track and field)**, so officials can see
step by step how AtheLead works before it scales to other sports.

Why athletics:
- A core Olympic sport with the most medal events (about 48 at a Games), each held for men and
  women. That fits the separate gender sections.
- The cheapest sport to start: running, jumping and throwing need little equipment, so it is where
  village talent shows up first. India has won Olympic gold in javelin.
- Every result is a time or a distance. Progress is objective and easy for officials to read, and
  fitness bands add heart rate, recovery and sleep on top.
- The app's signature visual is already a 400 m running track.

Demo cast: Arjun Reddy (men's 400 m, Nandigama, NTR district), Coach Ravi Menon (Velora Track
Squad U-20, men's and women's sections), Meera Iyer (board, athletics programme across districts).
The board's "teams" are event groups: sprints, hurdles, middle distance, long distance and
steeplechase, jumps, throws, race walk.
Cricket and other sports return after the pilot. Cricket is in LA28 but isn't a permanent Olympic
sport, so it's a weaker lead for a 2036 pitch.

## Fitness bands (next)
Wearables (Fitbit, WHOOP, Noise, Garmin, Amazfit, Apple Watch) will feed heart rate, HRV, resting
HR, sleep, recovery/strain, steps and GPS speed into AtheLead, giving more precise stats:
- Athlete: real recovery and sleep in the morning check-in, not just a feeling.
- Coach: objective load and recovery for every athlete, so plan changes rest on measured data.
- Board: verified, device-backed numbers behind selections.
The MVP shows them as "Preview" data. See `docs/WEARABLES.md` and `src/wearables/`.

## Athlete passport and talent map
- **Athlete passport (`/passport/:id`):** a one-page, shareable record of verified performance:
  PB, development index, pathway stage, results marked meet-timed, video- or coach-verified,
  PB progression and the coach's sign-off. Selectors scan its QR code at trials. Performance
  data only: health, wellbeing, band and diet data never appear. The board can invite from it.
  Data: `src/data/passport.ts`.
- **Talent map (board home):** every state and UT as a tile, shaded by athletes, rural share or
  athletes per district, for the gender section in view. A coral dot marks a mostly rural state
  (70%+) with fewer athletes per district than the median: talent being missed. Tapping a state
  shows its numbers and its village athletes, each linked to a passport.

## The pathway
Every athlete sits on one ladder: **Grassroots → District → State → National camp → Olympic core**.
A development index (0–100) and named gates (trials, camps) move them up. All three roles see it.

## Separate gender sections
Men's and women's athletes are analysed **separately** everywhere numbers are compared: squads,
rankings, pathway funnels, talent lists, readiness and benchmarks. Olympic events are gender-split,
so the selectors' analysis must be too. Each data screen has a **Men / Women** switch (with an
"All" overview where totals help), and every athlete record carries `gender`.

## Rural reach
Every athlete record carries `origin` (rural / urban), village or town, district and state. The
board can filter to **rural talent** and track the rural share at each stage of the pathway, so the
gap between villages and selectors becomes something they can measure and close.

## Phases
- **Phase 1 — MVP for government presentation (now).** Show what the app can do for India and its
  athletes: discovery → coach tracking and plan changes → board selection, plus **diet plans**, with
  Mission 2036, gender sections and rural reach visible on every role's home screen. Public explainer
  at `/mission`.
- **Diet plans are in the MVP.** Sport- and position-specific plans built on Indian food (dal, roti,
  idli, curd rice, paneer, eggs, sprouts), veg/eggetarian options, allergies respected. The real data
  comes from the nutrition teammate. Until then `src/data/diet.ts` holds a sample plan (labelled
  "Sample plan" in the UI). Its header documents the shape to deliver.
- **All of India.** Data covers all 36 states and UTs (`src/data/states.ts`), not one region.
  Tamil Nadu is the Phase 1 pilot state.
- **Tamil Nadu pilot (Phase 1 architecture doc).** Athletics and weightlifting, ages 10 to 24, in
  Madurai district (`src/data/pilot.ts`). Five roles: athlete, coach, guardian (under-18s: child
  summary and consent by purpose), district officer (flag queue and trial invitations, performance
  data only, never health) and board. Age stages: foundation 10–12, development 13–15,
  specialisation 16–18, performance 19–24. Every result is self-entered, coach-verified or
  video-verified; only verified results, with guardian consent for minors, reach review. Three flag
  types (performance, progress, potential); a coach and the district officer each confirm or
  reject. A flag opens a trial; it never labels a child. Stage rules are proposed defaults for the
  coaching experts to set.
- **Pilot modules (rest of the Phase 1 doc and the sports research doc).**
  - *Sign-in:* phone OTP (demo code 246810) or email; a 15-minute idle sign-out for shared phones.
  - *Offline-first entry:* coaches enter one test for the whole group (`/coach/tests`). Results are
    saved on the phone and sync when the network returns. A clash on the same athlete, test and day
    goes to the coach. Athletes can self-enter; their coach verifies.
  - *Plans by sport and age stage:* the coach approves them, and guardians of minors are told.
  - *Wellbeing (`/athlete/wellbeing`):* a weekly four-question check-in that only the athlete sees.
    If it crosses the referral line, the coach is alerted without the answers. Also short exercises,
    Tele-MANAS 14416 (verify before launch) and an injury log that reaches the coach.
  - *Food:* a finder by diet, budget, timing and allergy (Indian and Tamil Nadu foods), and the
    hostel mess menu. Under-18s see a balanced plate; only the guardian sees numbers. Adults see
    ranges, not targets. Data is in `src/data/foods.ts` and `src/data/wellness.ts`.
  - *Train for your sport (`/athlete/drills`, `/coach/drills`, linked from both Train tabs):* 13 sports
    (four athletics event groups, weightlifting, swimming, hockey, wrestling, boxing, badminton, archery,
    shooting, football). Each sport first lists what the body needs (swimming: breath control,
    full-body control, shoulders), then 6–7 exercises under those needs. Every exercise has
    start and finish photos from free-exercise-db (public domain); breathing, footwork and aim drills
    use a pictogram. Each shows how to do it, why it helps that sport, target muscles and a safety
    line. An Under 16 switch turns barbell work into "stick or empty bar, coach present". Data is in
    `src/data/drills.ts`; a strength coach should review the doses before launch. The photos load from
    GitHub, so they need a connection; offline, a pictogram shows instead.
  - *Sport beside every name:* wherever an athlete is named (squad, scouting, talent, board home,
    talent map, district flags and trials, tests and bulk entry, fixtures, passport, account sheet), a
    small tag beside the name shows their sport and event, e.g. "Athletics · 400 m" or
    "Weightlifting · 55 kg youth". Where the next line already gives the event, the tag shows the sport
    only. The lookup is `src/data/roster.ts` (by id or name); the tag is `src/design/SportTag.tsx`.
  - *Bands:* permission per data type, with "disconnect all" and manual entry. Band data never
    counts toward flags.
  - *Trial outcomes:* the district officer records selected, trial again or did not come, which
    gives flag precision.
  - *State admin (`/board/admin`):* pilot success measures and versioned flag rules (expert-set
    drafts). Also a pseudonymised CSV export of performance results only (health and wellness are
    never exported), data classes, and an audit log of who opened what.
- **English and Tamil (தமிழ்).** Switch on sign-in, the Account sheet and `/mission`. Strings are
  keyed by their English text (`src/i18n/`), and a missing entry falls back to English. Names and
  places stay in Latin script. The Tamil is a **draft pending native-speaker review**.
- Later: more languages (Hindi, Telugu, Bengali, Marathi), low-bandwidth / offline logging for
  villages, real Sports SLM backend.

## India-first
- Fictional body: Velora Sports Union, India. Don't use real federations' names or branding.
- Indian names, villages, districts and states, IST. Numbers in en-IN grouping; dates DD.MM; metric.
- Sports weighted towards India's Olympic events: athletics, hockey, wrestling, boxing, shooting,
  archery, badminton, weightlifting, cricket (Olympic from LA28), football.

Build spec: `~/Downloads/pitchline-claude-code-prompt.md`. Mission data: `src/data/mission2036.ts`,
`src/data/inclusion.ts`, `src/data/squad.ts`, `src/data/diet.ts`.
