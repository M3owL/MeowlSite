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
    note: 'Replies usually within 10 hours, weekends included.',
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
  heading: 'I localize games into Polish.',
  intro:
    'English to Polish game localization and proofreading. Nothing should read like a translation.',
  focus: 'Indie & mid-size games',
  body: [
    'I am a Polish game translator working from English into Polish. I started taking on projects in 2026 and I work with indie and mid-size studios.',
    'My work covers in-game text, UI strings, dialogue and subtitles, plus proofreading of Polish text that already exists. I keep a glossary for every project so terminology stays consistent across patches and DLC, and I flag anything in the English source that will not survive a literal translation.',
    'Send me the files, the word count and the deadline, and you get a fixed price and a delivery date back. The portfolio shows what the work looks like in practice.',
  ],
  /**
   * English into Polish only. Polish into English was on this list and was
   * never confirmed by the owner -- it is also a much stronger claim, since
   * translating into a non-native language is what agencies screen for first.
   */
  languagePairs: [{ from: 'English', to: 'Polish', primary: true }],
};

/** `live: 'projects'` is filled in from the database at runtime. */
export const STATS = [
  { id: 'projects', label: 'Projects delivered', value: 0, suffix: '+', live: 'projects' },
  // PLACEHOLDER -- replace with a real number or remove the tile.
  { id: 'words', label: 'Words translated', value: 50000, suffix: '+', live: null },
  // Started in 2026. Keep this honest and specific -- do not inflate it.
  { id: 'experience', label: 'Experience', value: 6, suffix: ' months+', live: null },
];

// --------------------------------------------------------------- services

/**
 * Two services, because those are the two the owner actually offers. An
 * earlier version listed six -- LQA, voice-over scripts, store copy, glossary
 * setup -- which were plausible for a localizer but not things he does, and
 * every extra one is a claim to defend in the first client call.
 */
export const SERVICES = [
  {
    id: 'localization',
    title: 'Game localization',
    summary: 'English to Polish, for everything the player reads.',
    detail:
      'In-game text, UI strings, dialogue, item descriptions, quest logs and subtitles. Written so a Polish player reads it as Polish rather than as a translation, with variables and markup left untouched.',
  },
  {
    id: 'proofreading',
    title: 'Proofreading',
    summary: 'A second pass over Polish text that already exists.',
    detail:
      'Checking a translation for accuracy, consistency and natural phrasing — whether it came from another translator, from a machine, or from an earlier patch. You get the corrected text back, plus a note on anything that needed a judgement call.',
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
 * Only the localization rate is confirmed. Proofreading has no agreed figure,
 * so it says "On request" rather than carrying a number the owner never set.
 */
export const RATES = [
  { service: 'Localization, English to Polish', unit: 'per word', from: '$0.015' },
  { service: 'Proofreading', unit: 'per word', from: 'On request' },
];

export const RATE_NOTES = {
  model: [
    'Per word for localization — the number you get is the number you pay.',
    'Fixed price per project for anything that is not straight text.',
  ],
  payment:
    'Payment by PayPal or bank transfer. If you need something else, ask — I am happy to work it out.',
  drivers: [
    'Source quality — clean strings are faster than a spreadsheet of fragments.',
  ],
  /**
   * There is no rush tier on purpose. The owner already turns work around
   * inside a day, so a surcharge for speed would be selling a problem the
   * client does not have -- and the old "under 72 hours: +30%" line contradicted
   * it outright.
   */
  turnaround: 'Delivery within one day on most projects, so there is no rush tier.',
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
  // The 10 hours is a promise the owner makes, not an estimate -- keep it.
  responseTime: 'Within 10 hours of your message, weekends included.',
  timezone: 'CET (UTC+1)',
  payment: 'PayPal or bank transfer. Need something else? Ask — I am happy to work it out.',
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
