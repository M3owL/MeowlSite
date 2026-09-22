/**
 * Plain-Node suite for the pure logic behind the redesign's motion layer.
 * Run: node app/scripts/test-motion.mjs
 *
 * SCOPE -- read this before adding a case.
 *
 * What is genuinely covered here: `stagger()` (a pure function), the exported
 * surface of `lib/motion.js` (every hook is a function with the documented
 * arity), and the pure helpers in `lib/format.js` that the new cards rely on.
 *
 * What is NOT covered, and cannot be, without a DOM:
 *   - `useInView`       needs IntersectionObserver to fire an entry.
 *   - `useTabTransition` needs a timer to advance `rendered` after `exitMs`.
 *   - `useCountUp`      needs requestAnimationFrame + performance.now().
 *   - `useScrollProgress` / `useScrolledPast` need window + document metrics.
 *   - `useSpotlight`    needs a real element with getBoundingClientRect().
 *   - `usePrefersReducedMotion` needs matchMedia to emit a change event.
 * Asserting their arity is the honest maximum here; the behavioural half is
 * covered by the render suite's class assertions and by hand in a browser.
 */
import {
  usePrefersReducedMotion,
  useInView,
  useTabTransition,
  useCountUp,
  useScrollProgress,
  useScrolledPast,
  useSpotlight,
  stagger,
} from '../src/lib/motion.js';

import {
  formatDate,
  calculateAverageRating,
  avatarFallback,
  moveItem,
} from '../src/lib/format.js';

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
  } else {
    failed += 1;
    console.error(
      `FAIL  ${label}\n      expected ${JSON.stringify(expected)}\n      got      ${JSON.stringify(actual)}`,
    );
  }
}

function ok(label, condition, detail = '') {
  if (condition) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL  ${label}${detail ? `\n      ${detail}` : ''}`);
  }
}

// ------------------------------------------------------- exported surface

const HOOKS = [
  ['usePrefersReducedMotion', usePrefersReducedMotion, 0],
  ['useInView', useInView, 0],
  ['useTabTransition', useTabTransition, 1],
  ['useCountUp', useCountUp, 2],
  ['useScrollProgress', useScrollProgress, 0],
  ['useScrolledPast', useScrolledPast, 0],
  ['useSpotlight', useSpotlight, 0],
];

HOOKS.forEach(([name, fn, arity]) => {
  ok(`${name} is exported as a function`, typeof fn === 'function', `got ${typeof fn}`);
  if (typeof fn === 'function') {
    // `.length` counts parameters before the first default/rest, which is the
    // documented signature: the options bag is always optional.
    check(`${name} keeps its documented arity`, fn.length, arity);
  }
});

ok('stagger is exported as a function', typeof stagger === 'function');

// -------------------------------------------------------------- stagger()

check('stagger(0)', stagger(0), { '--i': 0 });
check('stagger(3)', stagger(3), { '--i': 3 });
check('stagger(11)', stagger(11), { '--i': 11 });

// Negative indices would put a negative delay on the first card in a group,
// which reads as the group already having started. Clamped at 0 on purpose.
check('stagger clamps negatives to 0', stagger(-1), { '--i': 0 });
check('stagger clamps -99 to 0', stagger(-99), { '--i': 0 });

// A string index is what a `map` callback hands you if the caller forgets to
// convert; it must still become a number, not `--i: "2"`.
check('stagger coerces a numeric string', stagger('2'), { '--i': 2 });

// Anything unusable degrades to 0 rather than emitting NaN into a CSS custom
// property, which would invalidate the whole declaration.
check('stagger(undefined)', stagger(undefined), { '--i': 0 });
check('stagger(null)', stagger(null), { '--i': 0 });
check('stagger("abc")', stagger('abc'), { '--i': 0 });
check('stagger(NaN)', stagger(NaN), { '--i': 0 });
check('stagger({})', stagger({}), { '--i': 0 });

// Every call must be a fresh object: React only re-applies an inline style when
// the object identity changes.
const first = stagger(1);
const second = stagger(1);
ok('stagger returns a new object each call', first !== second);
ok('stagger values are equal across calls', first['--i'] === second['--i']);

// ------------------------------------------------------- format helpers

// `formatDate` is timezone-sensitive by nature, so the assertion is on shape
// rather than on a fixed string. A fixed string would only pass in one zone.
ok('formatDate(null) is empty', formatDate(null) === '');
ok('formatDate("") is empty', formatDate('') === '');
ok('formatDate(garbage) is empty', formatDate('not-a-date') === '');
ok(
  'formatDate renders a US short date',
  /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(formatDate('2026-08-01T12:00:00Z')),
  `got ${JSON.stringify(formatDate('2026-08-01T12:00:00Z'))}`,
);

check('average of 5 and 4.5', calculateAverageRating([{ value: 5 }, { value: 4.5 }]), 4.75);
check('average of a single 5', calculateAverageRating([{ value: 5 }]), 5);
check('average of []', calculateAverageRating([]), 0);
check('average of null', calculateAverageRating(null), 0);
check('average of a non-array', calculateAverageRating('nope'), 0);
// `Number('abc')` is NaN, so non-finite entries are dropped rather than
// poisoning the mean.
check('non-numeric values are dropped', calculateAverageRating([{ value: 'abc' }]), 0);
check(
  'non-numeric values do not skew a mean',
  calculateAverageRating([{ value: 4 }, { value: 'abc' }, { value: 5 }]),
  4.5,
);

const avatar = avatarFallback('Studio Dev');
ok(
  'avatarFallback is a local data URI',
  avatar.startsWith('data:image/svg+xml;charset=utf-8,'),
  `got ${avatar.slice(0, 48)}`,
);
ok(
  'avatarFallback uses the initials',
  decodeURIComponent(avatar).includes('>SD</text>'),
  `got ${decodeURIComponent(avatar)}`,
);
ok(
  'avatarFallback falls back to U for an empty name',
  decodeURIComponent(avatarFallback('')).includes('>U</text>'),
);
// The old build called ui-avatars.com for every review without a photo.
ok(
  'avatarFallback makes no third-party request',
  !avatar.includes('ui-avatars.com') && !/https?:\/\//.test(avatar.replace('http://www.w3.org/2000/svg', '')),
);

const list = [1, 2, 3, 4];
check('moveItem forward', moveItem(list, 0, 2), [2, 3, 1, 4]);
check('moveItem backward', moveItem(list, 3, 1), [1, 4, 2, 3]);
ok('moveItem is pure', JSON.stringify(list) === JSON.stringify([1, 2, 3, 4]));
ok('moveItem returns the same array when nothing moves', moveItem(list, 1, 1) === list);
ok('moveItem rejects a negative target', moveItem(list, 0, -1) === list);
ok('moveItem rejects a target past the end', moveItem(list, 0, 4) === list);
check('moveItem handles a single item', moveItem([9], 0, 0), [9]);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
