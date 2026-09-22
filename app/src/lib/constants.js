/**
 * Single source of truth for navigation and every piece of editorial content.
 *
 * Anything the site owner is expected to edit lives here, not in JSX. Every
 * invented value is marked `PLACEHOLDER` -- confirm those before publishing.
 */

// ------------------------------------------------------------------ brand

export const BRAND = {
  name: 'Jakub Kłapot',
  /** Discord display handle. Kept as-is: it is a real account, not a brand. */
  handle: 'M3owL',
  discord: '_m3owl',
  email: 'jacob@polishforgames.com',
  role: 'Polish Game Translator',
  /** Shown under the name in the hero. */
  tagline: 'English → Polish localization for games.',
  location: 'Poland',
  availability: {
    open: true, // PLACEHOLDER -- flip to false when you stop taking work
    label: 'Taking on new projects',
    note: 'Typical reply within 24 hours, Mon–Fri.',
  },
};

// ------------------------------------------------------------ navigation

export const NAV_TABS = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
];

/** Tab the visitor lands on. */
export const DEFAULT_TAB = 'about';

// ------------------------------------------------------------------ about

export const ABOUT = {
  heading: 'I translate games into Polish.',
  intro:
    'English to Polish localization for in-game text, UI, subtitles and store pages. Nothing should read like a translation.',
  focus: 'Indie & mid-size games',
  body: [
    'I am a Polish game translator working from English into Polish. I started taking on projects in 2026 and I work with indie and mid-size studios.',
    'My work covers UI strings, in-game dialogue, subtitles and store copy. I keep a glossary for every project so terminology stays consistent across patches and DLC, and I flag anything in the English source that will not survive a literal translation.',
    'Send me the files, the word count and the deadline, and you get a fixed price and a delivery date back. The portfolio shows what the work looks like in practice.',
  ],
  languagePairs: [
    { from: 'English', to: 'Polish', primary: true },
    { from: 'Polish', to: 'English', primary: false },
  ],
};

/** `live: 'projects'` is filled in from the database at runtime. */
export const STATS = [
  { id: 'projects', label: 'Projects delivered', value: 0, suffix: '+', live: 'projects' },
  // PLACEHOLDER -- replace with real numbers or remove the tile.
  { id: 'words', label: 'Words translated', value: 50000, suffix: '+', live: null },
  { id: 'pairs', label: 'Language pairs', value: 2, suffix: '', live: null },
  // Started in 2026. Keep this honest and specific -- do not inflate it.
  { id: 'experience', label: 'Experience', value: 6, suffix: ' months+', live: null },
];

export const TOOLS = [
  'memoQ',
  'SDL Trados',
  'Crowdin',
  'Lokalise',
  'Passolo',
];

export const FORMATS = ['.xliff', '.po', '.csv', '.json', '.docx', '.srt'];

export const ENGINES = ['Unity', 'Unreal Engine', 'Godot', 'GameMaker'];

// --------------------------------------------------------------- services

export const SERVICES = [
  {
    id: 'ingame',
    title: 'In-game text & UI',
    summary: 'Menus, tooltips, item descriptions, quest logs, dialogue.',
    detail:
      'Length matters more than you think. I keep UI strings inside their button, flag the ones that will overflow, and leave variables and markup untouched.',
  },
  {
    id: 'subtitles',
    title: 'Subtitles',
    summary: 'Timed subtitles that stay readable at speed.',
    detail:
      'Split for reading speed, not for grammar. I respect character-per-line limits and keep line breaks where they belong.',
  },
  {
    id: 'store',
    title: 'Store page & marketing copy',
    summary: 'Steam pages, descriptions, tags, patch notes.',
    detail:
      'This is the copy that sells the game. It gets written for a Polish reader, not translated word for word from the English pitch.',
  },
  {
    id: 'lqa',
    title: 'LQA / linguistic testing',
    summary: 'Playing the build and reporting what is actually broken.',
    detail:
      'Overflow, truncation, wrong context, text that contradicts what is on screen. Delivered as a structured bug report you can act on.',
  },
  {
    id: 'vo',
    title: 'Voice-over scripts',
    summary: 'Scripts that fit the mouth of the actor.',
    detail:
      'Adjusted for syllable count and breath so the line lands in the same time window as the original.',
  },
  {
    id: 'glossary',
    title: 'Glossary & TM setup',
    summary: 'Terminology that survives patches, DLC and sequels.',
    detail:
      'A shared glossary and translation memory so the second project costs you less than the first.',
  },
];

export const PROCESS = [
  {
    step: '01',
    title: 'Brief',
    detail: 'You send the files, the context and the deadline. Screenshots help more than anything.',
  },
  {
    step: '02',
    title: 'Quote',
    detail: 'I come back with a fixed price and a delivery date. No hourly surprises.',
  },
  {
    step: '03',
    title: 'Glossary & TM',
    detail: 'We lock down the terms that must stay consistent before a single line is translated.',
  },
  {
    step: '04',
    title: 'Translation',
    detail: 'Written for the target language first, checked against the source second.',
  },
  {
    step: '05',
    title: 'QA pass',
    detail: 'Second read for consistency, placeholders, variables and overflow.',
  },
  {
    step: '06',
    title: 'Delivery & revisions',
    detail: 'Same format you sent, plus a note on anything I had to make a call on.',
  },
];

// ------------------------------------------------------------ rates

/**
 * PLACEHOLDER -- these are indicative EN→PL game-localization ranges, not a
 * quote. Confirm every figure before publishing, or delete the `from` values
 * and keep the model only.
 */
export const RATES = [
  { service: 'In-game text & UI', unit: 'per word', from: '€0.07' },
  { service: 'Store page & marketing copy', unit: 'per word', from: '€0.09' },
  { service: 'Subtitles', unit: 'per video minute', from: '€3.00' },
  { service: 'LQA / linguistic testing', unit: 'per hour', from: '€25' },
  { service: 'Voice-over scripts', unit: 'per line', from: '€1.20' },
  { service: 'Glossary & TM setup', unit: 'per project', from: '€40' },
];

export const RATE_NOTES = {
  model: [
    'Per word for text — the number you get is the number you pay.',
    'Per hour for LQA, because the build decides how long it takes.',
    'Fixed price per project if you would rather have one number upfront.',
  ],
  // PLACEHOLDER -- confirm.
  minimum: '€40 minimum order.',
  drivers: [
    'Volume — larger batches cost less per word.',
    'Source quality — clean strings are faster than a spreadsheet of fragments.',
    'Format — .xliff and .po import straight into my CAT tool; a PDF does not.',
    'Deadline — anything under 72 hours carries a rush fee.',
  ],
  rush: 'Rush delivery (under 72 hours): +30%.',
  revisions:
    'Two rounds of revisions included within 14 days. If I got something wrong, I fix it free — no argument.',
};

// ------------------------------------------------------------- samples

/**
 * PLACEHOLDER -- the source lines below are written for the demo and are not
 * taken from any client project, so there is nothing here under NDA. Replace
 * with real excerpts (or keep invented ones) as you prefer.
 */
export const SAMPLES = [
  {
    id: 'ui',
    label: 'UI string',
    source: 'The forge is cold. Light it before you leave.',
    target: 'Kuźnia wygasła. Rozpal ją, zanim wyruszysz.',
    note: 'Literal Polish would be "Kowadło jest zimne" — but a forge is not a person, and "wygasła" is what a Polish player actually says about a dead fire. "Before you leave" became "before you set out", which is how the game talks everywhere else.',
  },
  {
    id: 'dialogue',
    label: 'Dialogue',
    source: "You're not from around here, are you? Don't answer that.",
    target: 'Nie jesteś stąd, prawda? Nie, nie odpowiadaj.',
    note: 'The English beats around the bush with a question and then retracts it. Polish handles that beat with a flat "prawda?" and a repeated "nie" — the hesitation survives, and it still fits in the subtitle line.',
  },
  {
    id: 'store',
    label: 'Store copy',
    source: 'Build, survive, and carve out a life in the ruins of the old world.',
    target: 'Buduj, przetrwaj i wyrąb sobie miejsce w ruinach starego świata.',
    note: 'Store copy has to sell, not inform. "Carve out a life" is the verb doing the work, so it had to become a Polish verb with the same physical weight — "wyrąb" — rather than the flat "znajdź sobie życie".',
  },
];

// ------------------------------------------------------------- contact

export const CONTACT = {
  heading: 'Got a build that needs Polish?',
  intro:
    'Send me the files, the deadline and a rough word count. You will get a fixed quote and a date, not a request for a call.',
  channels: [
    { id: 'email', label: 'Email', value: 'jacob@polishforgames.com', href: 'mailto:jacob@polishforgames.com' },
    { id: 'discord', label: 'Discord', value: '_m3owl', href: null },
  ],
  // PLACEHOLDER -- confirm.
  responseTime: 'Usually within 24 hours, Monday to Friday.',
  timezone: 'CET (UTC+1)',
};

// -------------------------------------------------- unchanged primitives

export const DEFAULT_CATEGORIES = [
  { category: 'Speed', value: 5 },
  { category: 'Communication', value: 5 },
  { category: 'Professionalism', value: 5 },
  { category: 'Reliability', value: 5 },
];

export const BUCKET_LIMITS = {
  avatar: 6 * 1024 * 1024,
  logo: 6 * 1024 * 1024,
  background: 12 * 1024 * 1024,
};

export const TOAST_MS = 2800;
