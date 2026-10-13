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
    'I am a Polish game translator working from English into Polish. I started working as a translator in late 2025 and I work with indie and mid-size studios.',
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

/** Public impact figures are edited from the admin panel and stored in Supabase. */
export const STATS = [
  { id: 'completedProjects', label: 'Projects completed', suffix: '+' },
  { id: 'translatedWords', label: 'Words translated', suffix: '+' },
];

// --------------------------------------------------------------- services

/** The supported work, split into the kinds of text a client may need help with. */
export const SERVICES = [
  {
    id: 'narrative',
    title: 'Narrative & world text',
    summary: 'Quest logs, item descriptions and story text.',
    detail:
      'English to Polish text that gives the game its voice. Terminology stays consistent across the world, with the meaning and tone intact.',
  },
  {
    id: 'dialogue',
    title: 'Dialogue & subtitles',
    summary: 'Lines that sound natural when a character says them.',
    detail:
      'Character dialogue and subtitles adapted for Polish rhythm, register and context while keeping each speaker recognizable.',
  },
  {
    id: 'interface',
    title: 'UI & gameplay text',
    summary: 'Menus, prompts and the small words players rely on.',
    detail:
      'Clear Polish for interface strings and in-game instructions, with variables and markup preserved and terms kept consistent.',
  },
  {
    id: 'proofreading',
    title: 'Polish proofreading',
    summary: 'A second pass over text you already have.',
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
    label: 'Quest hint',
    source: 'The trail goes cold at the river. Look for another way across.',
    target: 'Nad rzeką ślad się urywa. Poszukaj innej przeprawy.',
    note: 'A literal rendering of "the trail goes cold" would sound unnatural in Polish. "Ślad się urywa" conveys that it can no longer be followed, while "przeprawa" keeps the objective short and clear.',
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
  alternateEmail: 'meowl.translation@gmail.com',
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
