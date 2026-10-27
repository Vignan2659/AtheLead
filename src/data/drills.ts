/**
 * Sport-specific strength and conditioning library.
 *
 * Each sport lists what the body needs (its key physical qualities) and the exercises that build
 * them. Photos come from free-exercise-db (public domain, github.com/yuhonas/free-exercise-db):
 * frame 0 is the start position and frame 1 the finish. Drills with no photo in that set
 * (breathing, footwork, aim) use a drawn pictogram instead.
 *
 * Doses are starting points for a trained athlete; the coach adjusts them to the age stage and
 * the week's load. A strength and conditioning coach should review this list before launch.
 */

export const PHOTO_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
export const photoUrl = (id: string, frame: 0 | 1) => `${PHOTO_BASE}${id}/${frame}.jpg`;

/** body: bodyweight · light: band, ball or dumbbell · bar: barbell or heavy load (16+, coach present). */
export type Load = 'body' | 'light' | 'bar';
export type Pictogram = 'breath' | 'feet' | 'fist' | 'aim';

export interface Exercise {
  id: string;
  name: string;
  /** free-exercise-db folder; absent for drawn drills. */
  photo?: string;
  icon?: Pictogram;
  load: Load;
  targets: string[];
  cues: [string, string, string];
  safety: string;
}

export const LOAD_LABEL: Record<Load, string> = {
  body: 'Bodyweight',
  light: 'Band, ball or dumbbell',
  bar: 'Barbell · 16+ with coach',
};

export const EXERCISES: Record<string, Exercise> = {
  'wall-drill': {
    id: 'wall-drill', name: 'Wall acceleration drill', photo: 'Linear_Acceleration_Wall_Drill', load: 'body',
    targets: ['Hips', 'Calves', 'Core'],
    cues: ['Lean into a wall at about 45°, body in a straight line.', 'Drive one knee up, toes pulled up.', 'Switch legs fast, keeping the lean.'],
    safety: 'Stay on the balls of your feet and keep your hips from sagging.',
  },
  'hang-clean': {
    id: 'hang-clean', name: 'Hang clean', photo: 'Hang_Clean', load: 'bar',
    targets: ['Glutes', 'Hamstrings', 'Upper back'],
    cues: ['Bar at mid-thigh, back flat, arms long.', 'Jump: drive hips and knees straight, shrug.', 'Pull under and catch on the shoulders.'],
    safety: 'Technique before load. Learn it with an empty bar or a stick first.',
  },
  nordic: {
    id: 'nordic', name: 'Nordic hamstring curl', photo: 'Natural_Glute_Ham_Raise', load: 'body',
    targets: ['Hamstrings'],
    cues: ['Kneel with a partner holding your ankles.', 'Lower your body forward as slowly as you can.', 'Catch with your hands and push back up.'],
    safety: 'Start with 2 sets of 3. Sore hamstrings for two days are normal at first.',
  },
  'hurdle-hops': {
    id: 'hurdle-hops', name: 'Hurdle hops', photo: 'Hurdle_Hops', load: 'body',
    targets: ['Calves', 'Ankles', 'Quads'],
    cues: ['Line up 5 low hurdles a metre apart.', 'Hop over each with both feet together.', 'Spend as little time on the ground as possible.'],
    safety: 'Use low hurdles on grass or track, never on concrete.',
  },
  'calf-raise': {
    id: 'calf-raise', name: 'Standing calf raise', photo: 'Standing_Calf_Raises', load: 'light',
    targets: ['Calves', 'Ankles'],
    cues: ['Stand on a step on the balls of your feet.', 'Rise up as high as you can.', 'Lower slowly below the step.'],
    safety: 'Hold a rail for balance. Slow on the way down.',
  },
  'dead-bug': {
    id: 'dead-bug', name: 'Dead bug', photo: 'Dead_Bug', load: 'body',
    targets: ['Core'],
    cues: ['Lie on your back, arms up, knees over hips.', 'Lower one arm and the opposite leg.', 'Keep your lower back pressed to the floor.'],
    safety: 'If your back lifts, make the movement smaller.',
  },
  'depth-jump': {
    id: 'depth-jump', name: 'Depth jump', photo: 'Depth_Jump_Leap', load: 'body',
    targets: ['Quads', 'Calves', 'Glutes'],
    cues: ['Step off a low box, do not jump off it.', 'Land on both feet.', 'Spring up straight away, as high as you can.'],
    safety: 'Box at knee height or lower. Only when you can land softly.',
  },
  'box-jump': {
    id: 'box-jump', name: 'Box jump', photo: 'Box_Jump_Multiple_Response', load: 'body',
    targets: ['Quads', 'Glutes', 'Calves'],
    cues: ['Stand a foot from a stable box.', 'Swing your arms and jump onto it.', 'Land softly, stand tall, step down.'],
    safety: 'Step down, never jump down, to save your knees.',
  },
  'split-squat': {
    id: 'split-squat', name: 'Split squat', photo: 'Split_Squats', load: 'light',
    targets: ['Quads', 'Glutes'],
    cues: ['Long stride, back heel up.', 'Lower the back knee towards the floor.', 'Push up through the front foot.'],
    safety: 'Front knee follows the toes, not inwards.',
  },
  'lateral-bound': {
    id: 'lateral-bound', name: 'Lateral bound', photo: 'Lateral_Bound', load: 'body',
    targets: ['Glutes', 'Adductors', 'Ankles'],
    cues: ['Stand on one leg.', 'Jump sideways as far as you can.', 'Land on the other leg and hold for two seconds.'],
    safety: 'Land with a soft knee; stick each landing before the next.',
  },
  'leg-raise': {
    id: 'leg-raise', name: 'Hanging leg raise', photo: 'Hanging_Leg_Raise', load: 'body',
    targets: ['Core', 'Hip flexors'],
    cues: ['Hang from a bar, shoulders active.', 'Lift your legs without swinging.', 'Lower slowly.'],
    safety: 'Bend the knees if your lower back arches.',
  },
  'back-squat': {
    id: 'back-squat', name: 'Back squat', photo: 'Barbell_Full_Squat', load: 'bar',
    targets: ['Quads', 'Glutes', 'Lower back'],
    cues: ['Bar on the upper back, feet shoulder width.', 'Sit down between your heels, chest up.', 'Drive up through the whole foot.'],
    safety: 'Use a rack with safety bars, and a spotter for heavy sets.',
  },
  'scoop-throw': {
    id: 'scoop-throw', name: 'Medicine ball scoop throw', photo: 'Medicine_Ball_Scoop_Throw', load: 'light',
    targets: ['Glutes', 'Hamstrings', 'Core'],
    cues: ['Hold a ball between your legs, hips back.', 'Drive hips forward and throw it up and back.', 'Let your body extend fully.'],
    safety: 'Throw in an open space with no one behind you.',
  },
  'ball-twist': {
    id: 'ball-twist', name: 'Medicine ball rotational throw', photo: 'Medicine_Ball_Full_Twist', load: 'light',
    targets: ['Obliques', 'Core', 'Hips'],
    cues: ['Stand side-on, ball at the back hip.', 'Turn from the hips, then the trunk.', 'Release the ball hard, follow through.'],
    safety: 'Do both sides so the trunk stays balanced.',
  },
  'wood-chop': {
    id: 'wood-chop', name: 'Cable wood chop', photo: 'Standing_Cable_Wood_Chop', load: 'light',
    targets: ['Obliques', 'Core', 'Shoulders'],
    cues: ['Hold the handle high beside one shoulder.', 'Pull it diagonally across to the other hip.', 'Turn through the hips, arms long.'],
    safety: 'A resistance band works if there is no cable machine.',
  },
  'push-press': {
    id: 'push-press', name: 'Push press', photo: 'Push_Press', load: 'bar',
    targets: ['Shoulders', 'Triceps', 'Quads'],
    cues: ['Bar on the front of the shoulders.', 'Dip at the knees, then drive up.', 'Press the bar overhead, lock out.'],
    safety: 'Keep the ribs down; do not lean back.',
  },
  'band-er': {
    id: 'band-er', name: 'Band external rotation', photo: 'External_Rotation_with_Band', load: 'light',
    targets: ['Rotator cuff', 'Shoulders'],
    cues: ['Elbow at your side, bent to 90°.', 'Rotate the hand outward against the band.', 'Return slowly.'],
    safety: 'Light band, slow reps. This protects the shoulder, it is not a strength test.',
  },
  'rocking-calf': {
    id: 'rocking-calf', name: 'Rocking calf raise', photo: 'Rocking_Standing_Calf_Raise', load: 'body',
    targets: ['Calves', 'Shins'],
    cues: ['Rise onto your toes.', 'Rock back onto your heels, toes up.', 'Keep a steady rhythm.'],
    safety: 'Good after long runs to keep the lower legs strong.',
  },
  'hop-progression': {
    id: 'hop-progression', name: 'Single-leg hops', photo: 'Single-Leg_Hop_Progression', load: 'body',
    targets: ['Calves', 'Ankles', 'Quads'],
    cues: ['Stand on one leg.', 'Hop forward in small, quick hops.', 'Stay tall with a still upper body.'],
    safety: 'Stop if your knee caves in. Build distance slowly.',
  },
  lunge: {
    id: 'lunge', name: 'Walking lunge', photo: 'Dumbbell_Lunges', load: 'light',
    targets: ['Quads', 'Glutes'],
    cues: ['Step forward into a long stride.', 'Lower the back knee to just above the floor.', 'Push through and step into the next one.'],
    safety: 'Upright trunk; the front knee stays over the foot.',
  },
  'step-up': {
    id: 'step-up', name: 'Step-up', photo: 'Barbell_Step_Ups', load: 'light',
    targets: ['Quads', 'Glutes'],
    cues: ['One foot flat on a knee-height box.', 'Push through that foot to stand on top.', 'Lower slowly on the same leg.'],
    safety: 'Start with bodyweight or dumbbells; the photo shows a barbell.',
  },
  'side-plank': {
    id: 'side-plank', name: 'Side plank', photo: 'Side_Bridge', load: 'body',
    targets: ['Obliques', 'Hips'],
    cues: ['Lie on your side on one forearm.', 'Lift your hips into a straight line.', 'Hold, then swap sides.'],
    safety: 'Hips stay stacked; do not let them roll back.',
  },
  skipping: {
    id: 'skipping', name: 'Fast skipping', photo: 'Fast_Skipping', load: 'body',
    targets: ['Calves', 'Hip flexors'],
    cues: ['Skip with quick, low contacts.', 'Drive the knee up, arms in rhythm.', 'Land under your hips.'],
    safety: 'A good warm-up drill before every run.',
  },
  'front-squat': {
    id: 'front-squat', name: 'Front squat', photo: 'Front_Barbell_Squat', load: 'bar',
    targets: ['Quads', 'Glutes', 'Upper back'],
    cues: ['Bar on the front of the shoulders, elbows high.', 'Sit straight down, chest tall.', 'Stand up, elbows still high.'],
    safety: 'If the elbows drop, the weight is too heavy.',
  },
  'clean-pull': {
    id: 'clean-pull', name: 'Clean pull', photo: 'Clean_Pull', load: 'bar',
    targets: ['Hamstrings', 'Glutes', 'Upper back'],
    cues: ['Start as for a clean, back flat.', 'Push the floor away, bar close.', 'Finish tall on the toes with a shrug.'],
    safety: 'The bar stays close to the body the whole way.',
  },
  rdl: {
    id: 'rdl', name: 'Romanian deadlift', photo: 'Romanian_Deadlift', load: 'bar',
    targets: ['Hamstrings', 'Glutes', 'Lower back'],
    cues: ['Stand tall with the bar, soft knees.', 'Push your hips back, bar slides down the thighs.', 'Stop when your back would round, then stand.'],
    safety: 'A flat back matters more than how low you go.',
  },
  'ohs': {
    id: 'ohs', name: 'Overhead squat', photo: 'Overhead_Squat', load: 'bar',
    targets: ['Shoulders', 'Core', 'Quads'],
    cues: ['Wide grip, bar locked overhead.', 'Squat down with the bar over the middle of your feet.', 'Stand up, arms still locked.'],
    safety: 'Learn it with a stick. Mobility first, then load.',
  },
  'breath-ladder': {
    id: 'breath-ladder', name: 'Breathing ladder on land', icon: 'breath', load: 'body',
    targets: ['Breathing muscles', 'Calm'],
    cues: ['Sit tall. Breathe in through the nose for 3.', 'Breathe out slowly for 6, then 8, then 10.', 'Rest with normal breaths between rounds.'],
    safety: 'Never hyperventilate before a breath hold. Breath holds only on land or with a coach watching.',
  },
  'hypoxic-sets': {
    id: 'hypoxic-sets', name: 'Breathing pattern sets', icon: 'breath', load: 'body',
    targets: ['Breath control', 'Stroke rhythm'],
    cues: ['Swim easy freestyle, breathing every 3 strokes.', 'Build to every 5 strokes, then back to 3.', 'Exhale fully under water each time.'],
    safety: 'In the pool only with the coach on deck. Stop if you feel dizzy.',
  },
  'flutter-kick': {
    id: 'flutter-kick', name: 'Flutter kicks', photo: 'Flutter_Kicks', load: 'body',
    targets: ['Core', 'Hip flexors'],
    cues: ['Lie on your back, hands under the hips.', 'Lift your legs a little off the floor.', 'Kick in small, fast strokes.'],
    safety: 'Lower back stays down. Raise the legs higher if it lifts.',
  },
  superman: {
    id: 'superman', name: 'Superman hold', photo: 'Superman', load: 'body',
    targets: ['Lower back', 'Glutes', 'Shoulders'],
    cues: ['Lie face down, arms stretched forward.', 'Lift arms, chest and legs together.', 'Hold a long, straight streamline.'],
    safety: 'Look at the floor to keep your neck long.',
  },
  'straight-arm': {
    id: 'straight-arm', name: 'Straight-arm pulldown', photo: 'Straight-Arm_Pulldown', load: 'light',
    targets: ['Lats', 'Core'],
    cues: ['Arms straight, holding the bar at eye height.', 'Sweep it down to your thighs.', 'Control it back up.'],
    safety: 'Works with a band tied high if there is no cable.',
  },
  'pull-up': {
    id: 'pull-up', name: 'Pull-up', photo: 'Pullups', load: 'body',
    targets: ['Lats', 'Biceps', 'Upper back'],
    cues: ['Hang from a bar, hands wider than shoulders.', 'Pull your chest towards the bar.', 'Lower all the way down.'],
    safety: 'Use a band or a partner to assist until you can do 5 clean reps.',
  },
  'cone-hops': {
    id: 'cone-hops', name: 'Lateral cone hops', photo: 'Lateral_Cone_Hops', load: 'body',
    targets: ['Calves', 'Adductors', 'Ankles'],
    cues: ['Stand beside a row of cones.', 'Hop sideways over each, both feet together.', 'Stay low and quick.'],
    safety: 'Short sets; quality drops when you tire.',
  },
  'russian-twist': {
    id: 'russian-twist', name: 'Russian twist', photo: 'Russian_Twist', load: 'light',
    targets: ['Obliques', 'Core'],
    cues: ['Sit with knees bent, lean back a little.', 'Turn your shoulders to one side.', 'Then to the other, under control.'],
    safety: 'Turn the shoulders, not just the arms.',
  },
  'wrist-roller': {
    id: 'wrist-roller', name: 'Wrist roller', photo: 'Wrist_Roller', load: 'light',
    targets: ['Forearms', 'Grip'],
    cues: ['Hold the roller with arms in front.', 'Roll the weight up with your wrists.', 'Roll it down slowly.'],
    safety: 'Light weight. A stick, rope and water bottle work too.',
  },
  sprints: {
    id: 'sprints', name: 'Repeated sprints', photo: 'Wind_Sprints', load: 'body',
    targets: ['Hamstrings', 'Glutes', 'Heart and lungs'],
    cues: ['Sprint 20 to 30 m at full speed.', 'Walk back to recover.', 'Repeat while speed stays high.'],
    safety: 'Warm up first. Stop the set when you slow down.',
  },
  'neck-iso': {
    id: 'neck-iso', name: 'Neck isometric hold', photo: 'Isometric_Neck_Exercise_-_Front_And_Back', load: 'body',
    targets: ['Neck'],
    cues: ['Hands on your forehead.', 'Push your head forward, hands stop it.', 'Hold, then do the back of the head.'],
    safety: 'Build slowly with gentle pressure. No bridges on the head without the coach.',
  },
  farmer: {
    id: 'farmer', name: 'Farmer’s walk', photo: 'Farmers_Walk', load: 'light',
    targets: ['Grip', 'Forearms', 'Core'],
    cues: ['Pick up a heavy weight in each hand.', 'Stand tall, shoulders back.', 'Walk with short, quick steps.'],
    safety: 'Lift the weights with your legs, not your back.',
  },
  zercher: {
    id: 'zercher', name: 'Zercher squat', photo: 'Zercher_Squats', load: 'bar',
    targets: ['Quads', 'Upper back', 'Core'],
    cues: ['Bar held in the crook of your elbows.', 'Squat down, chest up.', 'Stand up strong, like lifting an opponent.'],
    safety: 'Wrap the bar in a towel. Start light.',
  },
  'sled-push': {
    id: 'sled-push', name: 'Sled push', photo: 'Sled_Push', load: 'light',
    targets: ['Quads', 'Glutes', 'Calves'],
    cues: ['Hands on the sled, body leaning in.', 'Drive with short, powerful steps.', 'Keep your back flat.'],
    safety: 'A partner pushing back against you is a no-cost option.',
  },
  'spider-crawl': {
    id: 'spider-crawl', name: 'Spider crawl', photo: 'Spider_Crawl', load: 'body',
    targets: ['Shoulders', 'Core', 'Hips'],
    cues: ['Start in a low push-up position.', 'Bring one knee to the same elbow as you move.', 'Crawl forward, staying low.'],
    safety: 'Keep the hips low and the movement controlled.',
  },
  jammer: {
    id: 'jammer', name: 'Single-arm landmine press', photo: 'Single-Arm_Linear_Jammer', load: 'bar',
    targets: ['Shoulders', 'Chest', 'Hips'],
    cues: ['Hold the end of a bar set in a corner.', 'Drive from the back foot and turn the hip.', 'Punch the bar up and out.'],
    safety: 'Power comes from the legs first; the arm finishes it.',
  },
  'chest-pass': {
    id: 'chest-pass', name: 'Medicine ball chest pass', photo: 'Medicine_Ball_Chest_Pass', load: 'light',
    targets: ['Chest', 'Triceps', 'Shoulders'],
    cues: ['Ball at your chest, facing a wall.', 'Step and push the ball hard.', 'Catch and repeat fast.'],
    safety: 'A light ball thrown fast beats a heavy ball thrown slowly.',
  },
  'plyo-push': {
    id: 'plyo-push', name: 'Plyometric push-up', photo: 'Plyo_Push-up', load: 'body',
    targets: ['Chest', 'Triceps', 'Shoulders'],
    cues: ['Start in a push-up.', 'Push up hard so your hands leave the floor.', 'Land soft and go again.'],
    safety: 'Only once 15 good push-ups are easy.',
  },
  pallof: {
    id: 'pallof', name: 'Pallof press', photo: 'Pallof_Press', load: 'light',
    targets: ['Core', 'Obliques'],
    cues: ['Stand side-on to a band, hands at your chest.', 'Press straight out and do not let it turn you.', 'Hold, then bring it back.'],
    safety: 'The trunk stays still; that is the exercise.',
  },
  rope: {
    id: 'rope', name: 'Skipping rope', photo: 'Rope_Jumping', load: 'body',
    targets: ['Calves', 'Heart and lungs'],
    cues: ['Light bounces on the balls of your feet.', 'Turn the rope from the wrists.', 'Mix single and double bounces.'],
    safety: 'A cheap rope and a flat surface are all you need.',
  },
  'shadow-box': {
    id: 'shadow-box', name: 'Shadow boxing rounds', icon: 'fist', load: 'body',
    targets: ['Shoulders', 'Footwork', 'Heart and lungs'],
    cues: ['Guard up, chin down, light on your feet.', 'Throw clean combinations while moving.', 'Three-minute rounds, one-minute rest.'],
    safety: 'Snap the punch back; do not lock the elbow at full extension.',
  },
  'split-jump': {
    id: 'split-jump', name: 'Split jump', photo: 'Split_Jump', load: 'body',
    targets: ['Quads', 'Glutes', 'Calves'],
    cues: ['Start in a lunge.', 'Jump up and switch legs in the air.', 'Land in a lunge and go again.'],
    safety: 'Land softly; stop when the landings get loud.',
  },
  'tuck-jump': {
    id: 'tuck-jump', name: 'Tuck jump', photo: 'Knee_Tuck_Jump', load: 'body',
    targets: ['Quads', 'Calves', 'Core'],
    cues: ['Jump straight up.', 'Bring your knees to your chest.', 'Land softly and rebound.'],
    safety: 'Short sets of 5 to 8. Quality over quantity.',
  },
  'court-footwork': {
    id: 'court-footwork', name: 'Six-corner footwork', icon: 'feet', load: 'body',
    targets: ['Footwork', 'Quads', 'Heart and lungs'],
    cues: ['Start at the base in the middle of the court.', 'Move to each corner the coach points to and lunge.', 'Push back to base every time.'],
    safety: 'Racket in hand; lunge with the knee over the foot.',
  },
  'face-pull': {
    id: 'face-pull', name: 'Face pull', photo: 'Face_Pull', load: 'light',
    targets: ['Rear shoulders', 'Upper back', 'Rotator cuff'],
    cues: ['Hold a rope or band at face height.', 'Pull it towards your face, elbows high.', 'Squeeze the shoulder blades, return slowly.'],
    safety: 'Light and controlled; this keeps the shoulders healthy.',
  },
  'wrist-curl': {
    id: 'wrist-curl', name: 'Wrist curl', photo: 'Palms-Down_Wrist_Curl_Over_A_Bench', load: 'light',
    targets: ['Forearms', 'Wrists'],
    cues: ['Forearms on a bench, hands over the edge.', 'Lift the weight with your wrists only.', 'Lower slowly.'],
    safety: 'Very light weight, high reps.',
  },
  'db-row': {
    id: 'db-row', name: 'One-arm dumbbell row', photo: 'One-Arm_Dumbbell_Row', load: 'light',
    targets: ['Lats', 'Upper back', 'Rear shoulders'],
    cues: ['One hand and knee on a bench.', 'Pull the dumbbell to your hip.', 'Lower it under control.'],
    safety: 'Back flat; do not twist to lift.',
  },
  'pull-apart': {
    id: 'pull-apart', name: 'Band pull-apart', photo: 'Band_Pull_Apart', load: 'light',
    targets: ['Rear shoulders', 'Upper back'],
    cues: ['Hold a band at shoulder height, arms straight.', 'Pull it apart until it touches your chest.', 'Return slowly.'],
    safety: 'Keep the shoulders down, away from the ears.',
  },
  plank: {
    id: 'plank', name: 'Plank', photo: 'Plank', load: 'body',
    targets: ['Core', 'Shoulders'],
    cues: ['Forearms under shoulders.', 'Body in one straight line, heels to head.', 'Breathe normally and hold.'],
    safety: 'Stop when the hips sag.',
  },
  'aim-hold': {
    id: 'aim-hold', name: 'Hold and breathe at full draw', icon: 'aim', load: 'light',
    targets: ['Back', 'Breath control', 'Focus'],
    cues: ['Draw a light band to your anchor point.', 'Breathe out slowly and hold still for 10 seconds.', 'Let down with control.'],
    safety: 'Use a band or a light bow, never dry-fire a real bow.',
  },
  squat: {
    id: 'squat', name: 'Bodyweight squat', photo: 'Bodyweight_Squat', load: 'body',
    targets: ['Quads', 'Glutes'],
    cues: ['Feet shoulder width, arms forward.', 'Sit down and back, chest up.', 'Stand tall.'],
    safety: 'Heels stay on the floor.',
  },
  'band-raise': {
    id: 'band-raise', name: 'Band lateral raise', photo: 'Lateral_Raise_-_With_Bands', load: 'light',
    targets: ['Shoulders'],
    cues: ['Stand on a band, ends in your hands.', 'Raise your arms out to shoulder height.', 'Hold for a moment, lower slowly.'],
    safety: 'Light band; hold steady rather than lifting fast.',
  },
  'shot-breath': {
    id: 'shot-breath', name: 'Breathing for the shot', icon: 'breath', load: 'body',
    targets: ['Breath control', 'Heart rate', 'Focus'],
    cues: ['Two slow breaths as you settle into position.', 'Breathe out halfway and pause naturally.', 'Squeeze the trigger inside that pause.'],
    safety: 'Practise with an unloaded rifle or a dry-fire trainer, as the range rules allow.',
  },
  'single-rdl': {
    id: 'single-rdl', name: 'Single-leg deadlift', photo: 'Kettlebell_One-Legged_Deadlift', load: 'light',
    targets: ['Hamstrings', 'Glutes', 'Balance'],
    cues: ['Stand on one leg, weight in the opposite hand.', 'Hinge forward, back leg reaching back.', 'Stand up tall on the same leg.'],
    safety: 'Hips stay square to the floor.',
  },
  'adductor-band': {
    id: 'adductor-band', name: 'Band hip adduction', photo: 'Band_Hip_Adductions', load: 'light',
    targets: ['Adductors', 'Groin'],
    cues: ['Band around one ankle, tied to the side.', 'Pull the leg across in front of the other.', 'Return slowly.'],
    safety: 'Groin strength protects against strains in kicking sports.',
  },
};

export interface Need {
  id: string;
  name: string;
  /** Body areas this quality depends on. */
  body: string;
}

export interface SportItem {
  ex: string;
  need: string;
  dose: string;
  why: string;
}

export interface SportPlan {
  id: string;
  name: string;
  group?: string;
  needs: Need[];
  items: SportItem[];
}

export const SPORTS: SportPlan[] = [
  {
    id: 'sprint', name: 'Sprints & hurdles', group: 'Athletics',
    needs: [
      { id: 'drive', name: 'Hip power', body: 'Glutes, hamstrings' },
      { id: 'feet', name: 'Springy feet', body: 'Calves, ankles' },
      { id: 'core', name: 'A stiff trunk', body: 'Core' },
    ],
    items: [
      { ex: 'wall-drill', need: 'drive', dose: '3 × 10 s', why: 'Teaches the forward lean and knee drive of the start.' },
      { ex: 'hang-clean', need: 'drive', dose: '4 × 3', why: 'Hips and knees straighten fast together, as they do pushing out of the blocks.' },
      { ex: 'nordic', need: 'drive', dose: '3 × 4', why: 'The best-studied way to cut hamstring injuries in sprinters.' },
      { ex: 'hurdle-hops', need: 'feet', dose: '4 × 5', why: 'Short ground contact, like each sprint stride.' },
      { ex: 'calf-raise', need: 'feet', dose: '3 × 12', why: 'Strong calves keep the ankle stiff at top speed.' },
      { ex: 'dead-bug', need: 'core', dose: '3 × 8 each side', why: 'Arms and legs move while the trunk stays still, as in sprinting.' },
      { ex: 'plank', need: 'core', dose: '3 × 30 s', why: 'A firm trunk passes the push from the legs into the ground.' },
    ],
  },
  {
    id: 'jumps', name: 'Jumps', group: 'Athletics',
    needs: [
      { id: 'reactive', name: 'Reactive legs', body: 'Quads, calves' },
      { id: 'single', name: 'Single-leg strength', body: 'Glutes, quads' },
      { id: 'control', name: 'Hip and core control', body: 'Core, hip flexors' },
    ],
    items: [
      { ex: 'depth-jump', need: 'reactive', dose: '4 × 4', why: 'Trains the fast stretch-and-spring of the take-off.' },
      { ex: 'box-jump', need: 'reactive', dose: '4 × 5', why: 'Jumping power without a hard landing.' },
      { ex: 'split-squat', need: 'single', dose: '3 × 8 each leg', why: 'Take-off is on one leg, so train one leg at a time.' },
      { ex: 'lateral-bound', need: 'single', dose: '3 × 5 each leg', why: 'Builds control landing on one leg.' },
      { ex: 'leg-raise', need: 'control', dose: '3 × 8', why: 'Lifts the free knee and holds the body shape in flight.' },
      { ex: 'dead-bug', need: 'control', dose: '3 × 8 each side', why: 'Keeps the trunk firm through the run-up and take-off.' },
    ],
  },
  {
    id: 'throws', name: 'Throws', group: 'Athletics',
    needs: [
      { id: 'legs', name: 'Leg drive', body: 'Quads, glutes' },
      { id: 'rotation', name: 'Rotational power', body: 'Obliques, hips' },
      { id: 'shoulder', name: 'Strong, stable shoulders', body: 'Shoulders, rotator cuff' },
    ],
    items: [
      { ex: 'back-squat', need: 'legs', dose: '4 × 5', why: 'Every throw starts with the legs pushing the ground.' },
      { ex: 'scoop-throw', need: 'legs', dose: '4 × 4', why: 'Turns leg strength into upward power, like the shot put.' },
      { ex: 'ball-twist', need: 'rotation', dose: '3 × 5 each side', why: 'The hips lead and the trunk follows, as in the discus and hammer.' },
      { ex: 'wood-chop', need: 'rotation', dose: '3 × 8 each side', why: 'Strength through the diagonal line of a throw.' },
      { ex: 'push-press', need: 'shoulder', dose: '4 × 4', why: 'Legs and arms working together to drive upward.' },
      { ex: 'band-er', need: 'shoulder', dose: '2 × 15', why: 'Protects the shoulder of javelin throwers.' },
    ],
  },
  {
    id: 'distance', name: 'Middle & long distance', group: 'Athletics',
    needs: [
      { id: 'economy', name: 'Running economy', body: 'Calves, ankles' },
      { id: 'single', name: 'Single-leg strength', body: 'Quads, glutes' },
      { id: 'posture', name: 'Posture when tired', body: 'Core, hips' },
    ],
    items: [
      { ex: 'rocking-calf', need: 'economy', dose: '3 × 20', why: 'Strong lower legs spend less energy each stride.' },
      { ex: 'hop-progression', need: 'economy', dose: '3 × 10 each leg', why: 'Makes the legs springier, so each stride costs less.' },
      { ex: 'skipping', need: 'economy', dose: '3 × 20 m', why: 'Rhythm and quick contacts.' },
      { ex: 'lunge', need: 'single', dose: '3 × 10 each leg', why: 'Running is a single-leg sport.' },
      { ex: 'step-up', need: 'single', dose: '3 × 8 each leg', why: 'Strength for hills and the final kick.' },
      { ex: 'side-plank', need: 'posture', dose: '3 × 30 s each side', why: 'Stops the hips dropping late in a race.' },
      { ex: 'plank', need: 'posture', dose: '3 × 40 s', why: 'Holds an upright running posture when tired.' },
    ],
  },
  {
    id: 'weightlifting', name: 'Weightlifting',
    needs: [
      { id: 'legs', name: 'Legs and hips', body: 'Quads, glutes' },
      { id: 'pull', name: 'Pulling power', body: 'Hamstrings, upper back' },
      { id: 'overhead', name: 'Overhead stability', body: 'Shoulders, core' },
    ],
    items: [
      { ex: 'front-squat', need: 'legs', dose: '5 × 3', why: 'The exact position you stand up from in the clean.' },
      { ex: 'back-squat', need: 'legs', dose: '4 × 5', why: 'Overall leg strength for both lifts.' },
      { ex: 'clean-pull', need: 'pull', dose: '4 × 3', why: 'Builds the pull from the floor without the catch.' },
      { ex: 'rdl', need: 'pull', dose: '3 × 6', why: 'Strong hamstrings and back hold the start position.' },
      { ex: 'ohs', need: 'overhead', dose: '4 × 3', why: 'The bottom of the snatch, held under control.' },
      { ex: 'push-press', need: 'overhead', dose: '4 × 3', why: 'Builds the drive for the jerk.' },
    ],
  },
  {
    id: 'swimming', name: 'Swimming',
    needs: [
      { id: 'breath', name: 'Breath control', body: 'Breathing muscles, calm' },
      { id: 'body', name: 'Full-body control', body: 'Core, back, hips' },
      { id: 'pull', name: 'Shoulders that pull and last', body: 'Lats, rotator cuff' },
    ],
    items: [
      { ex: 'breath-ladder', need: 'breath', dose: '4 rounds', why: 'A long, calm breath out is what you need between strokes.' },
      { ex: 'hypoxic-sets', need: 'breath', dose: '4 × 50 m', why: 'Breathing on a pattern without losing stroke shape.' },
      { ex: 'flutter-kick', need: 'body', dose: '3 × 30 s', why: 'A steady kick from the hips, not the knees.' },
      { ex: 'superman', need: 'body', dose: '3 × 20 s', why: 'Holds the long, flat streamline that cuts drag.' },
      { ex: 'straight-arm', need: 'pull', dose: '3 × 12', why: 'The same path as the catch and pull of freestyle.' },
      { ex: 'pull-up', need: 'pull', dose: '3 × 5', why: 'Pulling strength for every stroke.' },
      { ex: 'band-er', need: 'pull', dose: '2 × 15', why: 'Protects against swimmer’s shoulder.' },
    ],
  },
  {
    id: 'hockey', name: 'Hockey',
    needs: [
      { id: 'low', name: 'Low, fast legs', body: 'Quads, glutes' },
      { id: 'cod', name: 'Change of direction', body: 'Ankles, adductors' },
      { id: 'stick', name: 'Trunk and wrists for the stick', body: 'Obliques, forearms' },
    ],
    items: [
      { ex: 'lunge', need: 'low', dose: '3 × 10 each leg', why: 'Hockey is played low; lunges build that position.' },
      { ex: 'sprints', need: 'low', dose: '8 × 20 m', why: 'Repeated sprints, as in a match.' },
      { ex: 'lateral-bound', need: 'cod', dose: '3 × 5 each leg', why: 'Pushing off sideways to beat a defender.' },
      { ex: 'cone-hops', need: 'cod', dose: '4 × 10 s', why: 'Quick feet for dodges.' },
      { ex: 'russian-twist', need: 'stick', dose: '3 × 12 each side', why: 'Rotation for drag-flicks and hits.' },
      { ex: 'wrist-roller', need: 'stick', dose: '3 × 2 rolls', why: 'Strong wrists control the stick.' },
    ],
  },
  {
    id: 'wrestling', name: 'Wrestling',
    needs: [
      { id: 'neck', name: 'Neck and grip', body: 'Neck, forearms' },
      { id: 'lift', name: 'Lifting and driving', body: 'Legs, hips, back' },
      { id: 'pull', name: 'Pulling strength', body: 'Lats, upper back' },
    ],
    items: [
      { ex: 'neck-iso', need: 'neck', dose: '3 × 10 s each way', why: 'A strong neck protects you in the clinch and on the mat.' },
      { ex: 'farmer', need: 'neck', dose: '3 × 30 m', why: 'Grip that does not let go of a wrist or leg.' },
      { ex: 'zercher', need: 'lift', dose: '4 × 5', why: 'The same hold as lifting an opponent.' },
      { ex: 'sled-push', need: 'lift', dose: '6 × 15 m', why: 'Driving through with short powerful steps.' },
      { ex: 'pull-up', need: 'pull', dose: '4 × 6', why: 'Pulling an opponent in.' },
      { ex: 'spider-crawl', need: 'pull', dose: '3 × 10 m', why: 'Body control low to the mat.' },
    ],
  },
  {
    id: 'boxing', name: 'Boxing',
    needs: [
      { id: 'power', name: 'Power from the ground', body: 'Legs, hips, core' },
      { id: 'hands', name: 'Fast, lasting hands', body: 'Shoulders, chest, triceps' },
      { id: 'engine', name: 'Footwork and engine', body: 'Calves, heart and lungs' },
    ],
    items: [
      { ex: 'jammer', need: 'power', dose: '3 × 5 each side', why: 'A punch starts at the back foot and turns through the hip.' },
      { ex: 'pallof', need: 'power', dose: '3 × 10 s each side', why: 'A stable trunk passes power to the fist.' },
      { ex: 'chest-pass', need: 'hands', dose: '4 × 8', why: 'Fast pushing power for straight punches.' },
      { ex: 'plyo-push', need: 'hands', dose: '3 × 5', why: 'Speed off the chest.' },
      { ex: 'rope', need: 'engine', dose: '3 × 3 min', why: 'Light, bouncy feet for the whole bout.' },
      { ex: 'shadow-box', need: 'engine', dose: '3 × 3 min', why: 'Technique and conditioning in one.' },
    ],
  },
  {
    id: 'badminton', name: 'Badminton',
    needs: [
      { id: 'lunge', name: 'Explosive lunges and jumps', body: 'Quads, glutes, calves' },
      { id: 'feet', name: 'Fast feet', body: 'Ankles, heart and lungs' },
      { id: 'arm', name: 'Shoulder and wrist for the smash', body: 'Shoulders, forearms' },
    ],
    items: [
      { ex: 'split-jump', need: 'lunge', dose: '3 × 8', why: 'The jump-and-switch of the net lunge and recovery.' },
      { ex: 'lunge', need: 'lunge', dose: '3 × 10 each leg', why: 'Strength for deep lunges to the net.' },
      { ex: 'tuck-jump', need: 'lunge', dose: '3 × 6', why: 'Height for the jump smash.' },
      { ex: 'court-footwork', need: 'feet', dose: '6 × 30 s', why: 'Getting to every corner and back to base.' },
      { ex: 'rope', need: 'feet', dose: '3 × 3 min', why: 'Light, quick feet for the split-step.' },
      { ex: 'face-pull', need: 'arm', dose: '3 × 15', why: 'Keeps the hitting shoulder healthy.' },
      { ex: 'wrist-curl', need: 'arm', dose: '2 × 20', why: 'Wrist snap for smashes and flicks.' },
    ],
  },
  {
    id: 'archery', name: 'Archery',
    needs: [
      { id: 'draw', name: 'Back strength to draw', body: 'Upper back, rear shoulders' },
      { id: 'still', name: 'A still body', body: 'Core, hips' },
      { id: 'aim', name: 'Aim and breath', body: 'Breath, focus' },
    ],
    items: [
      { ex: 'db-row', need: 'draw', dose: '3 × 10 each arm', why: 'The draw comes from the back, not the arm.' },
      { ex: 'pull-apart', need: 'draw', dose: '3 × 15', why: 'Shoulder blades working together at full draw.' },
      { ex: 'face-pull', need: 'draw', dose: '3 × 12', why: 'Balances the shoulders after hours of drawing.' },
      { ex: 'plank', need: 'still', dose: '3 × 40 s', why: 'A still trunk means a still bow.' },
      { ex: 'side-plank', need: 'still', dose: '3 × 30 s each side', why: 'Holds the side-on stance steady.' },
      { ex: 'aim-hold', need: 'aim', dose: '5 × 10 s', why: 'Calm breathing while holding at anchor.' },
      { ex: 'breath-ladder', need: 'aim', dose: '4 rounds', why: 'A long, slow breath out settles the body before the release.' },
    ],
  },
  {
    id: 'shooting', name: 'Shooting',
    needs: [
      { id: 'stance', name: 'A steady stance', body: 'Legs, core' },
      { id: 'hold', name: 'Shoulders that hold', body: 'Shoulders, upper back' },
      { id: 'calm', name: 'Breath and heart rate', body: 'Breath, focus' },
    ],
    items: [
      { ex: 'squat', need: 'stance', dose: '3 × 15', why: 'Legs that do not tire through a long match.' },
      { ex: 'side-plank', need: 'stance', dose: '3 × 30 s each side', why: 'Less sway in the standing position.' },
      { ex: 'superman', need: 'stance', dose: '3 × 20 s', why: 'A strong back for long holds.' },
      { ex: 'band-raise', need: 'hold', dose: '3 × 20 s hold', why: 'Holding the pistol arm still.' },
      { ex: 'pull-apart', need: 'hold', dose: '3 × 15', why: 'Upper back endurance for the rifle hold.' },
      { ex: 'shot-breath', need: 'calm', dose: '10 dry shots', why: 'Shots break in the calm pause between breaths.' },
      { ex: 'breath-ladder', need: 'calm', dose: '4 rounds', why: 'Slows the heart rate before a match.' },
    ],
  },
  {
    id: 'football', name: 'Football',
    needs: [
      { id: 'speed', name: 'Repeated sprints', body: 'Hamstrings, glutes' },
      { id: 'injury', name: 'Hamstrings and groin that hold up', body: 'Hamstrings, adductors' },
      { id: 'balance', name: 'Balance on one leg', body: 'Hips, ankles' },
    ],
    items: [
      { ex: 'sprints', need: 'speed', dose: '8 × 30 m', why: 'A match is dozens of short sprints.' },
      { ex: 'lateral-bound', need: 'speed', dose: '3 × 5 each leg', why: 'Cutting and changing direction.' },
      { ex: 'nordic', need: 'injury', dose: '3 × 5', why: 'Part of the FIFA 11+ injury-prevention warm-up.' },
      { ex: 'adductor-band', need: 'injury', dose: '3 × 12 each leg', why: 'Strong adductors prevent groin strains.' },
      { ex: 'single-rdl', need: 'balance', dose: '3 × 8 each leg', why: 'Balance and hamstring strength for kicking and landing.' },
      { ex: 'side-plank', need: 'balance', dose: '3 × 30 s each side', why: 'Hip control in tackles and turns.' },
    ],
  },
];

export const sportPlan = (id: string) => SPORTS.find((s) => s.id === id) ?? SPORTS[0];

/** Safety rules that apply to every sport. */
export const DRILL_RULES = [
  'Warm up for 10 minutes before strength work.',
  'Technique first; add weight only when the coach signs off the movement.',
  'Under 16: no maximal lifts. Barbell exercises are learned with a stick or an empty bar.',
  'Stop if anything hurts sharply, and log it in the injury log.',
];
