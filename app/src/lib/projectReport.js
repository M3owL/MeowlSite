export const WORK_AREAS = [
  { id: 'game_text', label: 'In-game text & narrative' },
  { id: 'ui', label: 'UI, menus & system messages' },
  { id: 'dialogue', label: 'Dialogue & subtitles' },
  { id: 'content', label: 'Items, quests & descriptions' },
  { id: 'proofreading', label: 'Proofreading existing Polish' },
  { id: 'terminology', label: 'Terminology & glossary' },
  { id: 'lqa', label: 'Linguistic QA' },
  { id: 'technical', label: 'Variables, tags & formatting' },
];

const AREA_COPY = {
  game_text: ['core in-game text and narrative', 'player-facing text and narrative'],
  ui: ['interface labels, menus, and system messages', 'UI copy and system messages'],
  dialogue: ['character dialogue and subtitles', 'dialogue and subtitle text'],
  content: ['item, quest, and gameplay descriptions', 'item and quest text'],
  proofreading: [
    'proofreading and polishing existing Polish copy',
    'a language edit of the existing Polish text',
  ],
  terminology: ['terminology research and a project glossary', 'consistent terminology across the project'],
  lqa: ['linguistic QA for consistency and context', 'a linguistic quality check in context'],
  technical: ['preservation of tags, variables, and formatting', 'checks for tags, variables, and formatting'],
};

const LEADS = [
  'The Polish localization covered {areas}.',
  'Work on the Polish version focused on {areas}.',
  'The project included {areas} for the Polish release.',
  'The localization scope brought together {areas}.',
  'For this title, the Polish work covered {areas}.',
  'The Polish adaptation included {areas}.',
];

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function formatList(items) {
  if (items.length < 2) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/** Build a short, stable report with phrasing varied by project and scope. */
export function createProjectReport({ title = '', steamLink = '', workScope = [], seed = '' }) {
  const scope = Array.isArray(workScope) ? workScope : [];
  const selected = WORK_AREAS.filter((area) => scope.includes(area.id));
  if (selected.length === 0) return '';

  const identity = [
    String(title).trim().toLowerCase(),
    String(steamLink).trim().toLowerCase(),
    seed,
    selected.map((area) => area.id).join(','),
  ].join('|');
  const base = hash(identity);
  const areas = selected.map((area, index) => {
    const variants = AREA_COPY[area.id];
    return variants[(base + index) % variants.length];
  });
  const lead = LEADS[base % LEADS.length].replace('{areas}', formatList(areas));

  let close;
  if (scope.includes('technical')) {
    close = [
      'The copy was prepared for clear reading in Polish while respecting the selected technical constraints.',
      'The final pass balanced natural Polish phrasing with the project’s formatting requirements.',
      'Player-facing clarity was checked alongside the project’s technical text requirements.',
    ][(base >>> 3) % 3];
  } else if (scope.includes('proofreading')) {
    close = [
      'The review focused on accuracy, consistency, and natural Polish phrasing.',
      'The final pass checked meaning, consistency, and how naturally the Polish reads.',
      'The Polish text was reviewed for accuracy and a consistent player-facing voice.',
    ][(base >>> 3) % 3];
  } else {
    close = [
      'The selected content was adapted for clarity and a consistent Polish player experience.',
      'The Polish text was shaped to read naturally in the context of the game.',
      'The result keeps the Polish copy clear, consistent, and grounded in the game’s context.',
    ][(base >>> 3) % 3];
  }

  return `${lead} ${close}`;
}
