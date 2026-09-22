/**
 * Server-render smoke test.
 *
 * The Vite build proves imports resolve; it does not prove components render.
 * This renders every screen with mock data and asserts on the output, which is
 * how we catch things like the old `onEdit is not a function` crash.
 *
 * Run: npm run test:render
 */
import { renderToStaticMarkup } from 'react-dom/server';

import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import Modal from '../src/components/ui/Modal';
import ProjectCard from '../src/components/ProjectCard';
import ReviewCard from '../src/components/ReviewCard';
import PinnedReviews from '../src/components/PinnedReviews';
import AboutTab from '../src/tabs/AboutTab';
import ServicesTab from '../src/tabs/ServicesTab';
import PortfolioTab from '../src/tabs/PortfolioTab';
import ReviewsTab from '../src/tabs/ReviewsTab';
import ContactTab from '../src/tabs/ContactTab';
import AdminTab from '../src/tabs/AdminTab';
import Ambient from '../src/components/Ambient';
import Reveal from '../src/components/ui/Reveal';
import ProjectFormModal from '../src/modals/ProjectFormModal';
import InviteCodeModal from '../src/modals/InviteCodeModal';
import ReviewFormModal from '../src/modals/ReviewFormModal';
import GenerateCodeModal from '../src/modals/GenerateCodeModal';
import LoginModal from '../src/modals/LoginModal';

let passed = 0;
let failed = 0;

function render(label, element) {
  try {
    return renderToStaticMarkup(element);
  } catch (error) {
    failed += 1;
    console.error(`RENDER FAIL  ${label}: ${error.message}`);
    return '';
  }
}

function expect(label, html, ...needles) {
  const missing = needles.filter((needle) => !html.includes(needle));
  if (missing.length === 0) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL  ${label}\n      missing: ${missing.map((m) => JSON.stringify(m)).join(', ')}`);
  }
}

function expectNot(label, html, ...needles) {
  const present = needles.filter((needle) => html.includes(needle));
  if (present.length === 0) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL  ${label}\n      should not contain: ${present.map((m) => JSON.stringify(m)).join(', ')}`);
  }
}

// ---------------------------------------------------------------- fixtures

const review = {
  id: 'r1',
  nickname: 'Studio Dev',
  role: 'Developer',
  game_title: 'Some Game',
  discord: 'dev#0001',
  pfp: '',
  text: 'Great work on the Polish localization.',
  date: '2026-08-01T10:00:00Z',
  ratings: [
    { category: 'Speed', value: 5 },
    { category: 'Communication', value: 4.5 },
  ],
  published: true,
};

const project = {
  id: 'p1',
  title: 'Stardew Valley',
  steamLink: 'https://store.steampowered.com/app/413150/Stardew_Valley/',
  details: 'Full Polish localization.',
  bg_url: '',
  logo_url: '',
  pinned: false,
  sort_order: 0,
  pinnedReviews: ['r1'],
  bg_offset_x: 0,
  bg_offset_y: 0,
  logo_offset_x: 0,
  logo_offset_y: 0,
};

const noop = () => {};

// ------------------------------------------------------- ProjectCard: Steam

const steamCard = render(
  'ProjectCard with Steam link',
  <ProjectCard project={project} reviews={[review]} isAdmin={false} index={0} total={1} />,
);

expect(
  'steam card pulls real Steam assets',
  steamCard,
  'cdn.cloudflare.steamstatic.com/steam/apps/413150/library_hero.jpg',
  'cdn.cloudflare.steamstatic.com/steam/apps/413150/logo.png',
  'Stardew Valley',
  'Full Polish localization.',
);
expectNot('steam card no longer hides art behind glass', steamCard, 'opacity-20');

// custom upload must take priority over Steam art
const customCard = render(
  'ProjectCard with custom background',
  <ProjectCard
    project={{ ...project, bg_url: 'https://cdn.example.com/mine.png' }}
    reviews={[]}
    isAdmin={false}
    index={0}
    total={1}
  />,
);
expect('custom background wins', customCard, 'https://cdn.example.com/mine.png');

// a link that cannot be parsed must not emit bogus Steam URLs
const brokenCard = render(
  'ProjectCard with unusable link',
  <ProjectCard
    project={{ ...project, steamLink: 'not a link' }}
    reviews={[]}
    isAdmin={false}
    index={0}
    total={1}
  />,
);
expectNot('unusable link emits no Steam URL', brokenCard, 'steamstatic.com');

// admin controls render and are wired to real handlers
const adminCard = render(
  'ProjectCard admin controls',
  <ProjectCard
    project={project}
    reviews={[review]}
    isAdmin
    index={0}
    total={2}
    onEdit={noop}
    onDelete={noop}
    onTogglePin={noop}
    onMove={noop}
  />,
);
expect('admin controls present', adminCard, 'Edit', 'Delete', 'Pin', 'Pinned reviews');
expectNot('first card cannot move earlier', adminCard, 'aria-label="Move project earlier" disabled=""');
expect('first card can move later', adminCard, 'aria-label="Move project later"');

// ------------------------------------------------------------- ReviewCard

expect(
  'public review card',
  render('ReviewCard public', <ReviewCard review={review} />),
  'Studio Dev',
  'Great work on the Polish localization.',
  '4.8 / 5',
);
expectNot(
  'public card has no admin buttons',
  render('ReviewCard public', <ReviewCard review={review} />),
  '>Edit<',
);

const hiddenReview = { ...review, id: 'r2', published: false };
expect(
  'admin card shows hidden state',
  render(
    'ReviewCard admin',
    <ReviewCard
      review={hiddenReview}
      admin
      onEdit={noop}
      onDelete={noop}
      onTogglePublish={noop}
    />,
  ),
  'Hidden',
  'Edit',
  'Delete',
);

expect(
  'unpublished review is visually de-emphasised',
  render('ReviewCard hidden', <ReviewCard review={hiddenReview} admin onEdit={noop} onDelete={noop} onTogglePublish={noop} />),
  'grayscale',
);

// ------------------------------------------------------------ ReviewsTab

// This is the regression: admin viewing the public tab used to render Edit
// buttons wired to null handlers.
expectNot(
  'admin on public tab gets no broken Edit buttons',
  render('ReviewsTab admin', <ReviewsTab reviews={[review]} isAdmin openCodeModal={noop} />),
  '>Edit<',
);
expectNot(
  'public tab hides unpublished reviews',
  render('ReviewsTab public', <ReviewsTab reviews={[hiddenReview]} isAdmin={false} openCodeModal={noop} />),
  'Great work on the Polish localization.',
);

// ------------------------------------------------------------ PortfolioTab

expect(
  'empty portfolio state',
  render(
    'PortfolioTab empty',
    <PortfolioTab
      projects={[]}
      reviews={[]}
      isAdmin={false}
      onChanged={noop}
      onError={noop}
      onToast={noop}
      openProjectModal={noop}
    />,
  ),
  'No projects added yet.',
);

const portfolio = render(
  'PortfolioTab populated',
  <PortfolioTab
    projects={[
      { ...project, id: 'p2', title: 'Second', pinned: true, sort_order: 5 },
      project,
    ]}
    reviews={[review]}
    isAdmin
    onChanged={noop}
    onError={noop}
    onToast={noop}
    openProjectModal={noop}
  />,
);
expect('portfolio lists projects', portfolio, 'Stardew Valley', 'Second', 'Add Project');
// pinned project must sort first regardless of sort_order
if (portfolio.indexOf('Second') < portfolio.indexOf('Stardew Valley')) {
  passed += 1;
} else {
  failed += 1;
  console.error('FAIL  pinned project sorts to the top');
}

// ----------------------------------------------------------------- modals

const formValid = render(
  'ProjectFormModal valid link',
  <ProjectFormModal project={null} reviews={[review]} onSave={noop} onCancel={noop} onError={noop} />,
);
expect('project form renders', formValid, 'New project', 'Steam link', 'Live preview');

// A form seeded with a Steam link should confirm detection and show art.
const formSeeded = render(
  'ProjectFormModal seeded',
  <ProjectFormModal
    project={{ ...project, title: 'Stardew Valley' }}
    reviews={[review]}
    onSave={noop}
    onCancel={noop}
    onError={noop}
  />,
);
expect(
  'project form confirms Steam detection',
  formSeeded,
  'Steam app 413150 detected',
  'FROM STEAM',
  'library_hero.jpg',
);

// A link that cannot be parsed must warn instead of silently showing nothing.
const formBroken = render(
  'ProjectFormModal broken link',
  <ProjectFormModal
    project={{ ...project, steamLink: 'https://example.com/whatever' }}
    reviews={[]}
    onSave={noop}
    onCancel={noop}
    onError={noop}
  />,
);
expect(
  'project form warns on unparseable link',
  formBroken,
  'Could not read an app id from that link',
  'NO ARTWORK',
);

// --- modal shell: the scroll/centring regression ---------------------------
// The old shell put `overflow-y-auto` and `items-center` on the same element,
// which pushed the top of a tall panel above the scroll origin where it could
// not be reached. Centring must happen on an inner `min-h-full` wrapper, and
// the panel must be capped to the viewport.
const modalHtml = render(
  'Modal shell',
  <Modal title="Test" onClose={noop}>
    <p>body</p>
  </Modal>,
);
expect('modal centres inside a min-h-full wrapper', modalHtml, 'min-h-full');
expect('modal panel is capped to the viewport', modalHtml, 'max-h-[calc(100dvh');
expectNot(
  'modal never centres the scroll container itself',
  modalHtml,
  'overflow-y-auto bg-black/80 flex items-center',
);

// The project form must lay out in two columns on wide screens, otherwise it
// runs past the bottom of the viewport.
expect(
  'project form is two-column on desktop',
  formSeeded,
  'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]',
  'aspect-video',
);
expect('project form footer is outside the scroll body', formSeeded, 'form="project-form"');

expect(
  'invite code modal',
  render('InviteCodeModal', <InviteCodeModal onClose={noop} onSubmitted={noop} onError={noop} />),
  'Use invite code',
  'ABC123',
);
expect(
  'generate code modal',
  render('GenerateCodeModal', <GenerateCodeModal onClose={noop} onCreated={noop} onError={noop} onToast={noop} />),
  'Generate invite code',
  'Nickname',
);
expect(
  'review form modal',
  render('ReviewFormModal', <ReviewFormModal review={null} onSave={noop} onCancel={noop} onError={noop} />),
  'Add feedback',
  'Ratings',
  'Publish immediately',
);
expect(
  'login modal',
  render('LoginModal', <LoginModal onSuccess={noop} onCancel={noop} />),
  'Admin Login',
  'Remember me',
);

// -------------------------------------------------------------- chrome

// The brand moved from the old M3owL handle to the owner's real name, and the
// nav grew from three tabs to five. Assert the brand, every public tab, and the
// tablist semantics the header now provides.
const guestHeader = render(
  'Header guest',
  <Header activeTab="reviews" onTabChange={noop} isAdmin={false} onLogout={noop} />,
);
expect(
  'header shows the brand and every public tab',
  guestHeader,
  'Jakub Kłapot',
  'About',
  'Services',
  'Portfolio',
  'Reviews',
  'Contact',
);
expect(
  'header exposes real tablist semantics',
  guestHeader,
  'role="tablist"',
  'role="tab"',
  'aria-selected="true"',
  'aria-controls="tab-panel"',
  'id="tab-reviews"',
);
expectNot('guest header has no admin link', guestHeader, 'Admin Panel');
expect(
  'admin header shows admin tab',
  render('Header admin', <Header activeTab="admin" onTabChange={noop} isAdmin onLogout={noop} />),
  'Admin Panel',
  'Logout',
);

expect('footer', render('Footer', <Footer />), '_m3owl');
expect(
  'footer links navigate',
  render('Footer', <Footer onNavigate={noop} />),
  '_m3owl',
  'About',
  'Contact',
);

expect('about tab', render('AboutTab', <AboutTab />), 'Polish Game Translator');
expect(
  'pinned reviews strip',
  render('PinnedReviews', <PinnedReviews reviews={[review]} />),
  'Pinned reviews',
  'Studio Dev',
);
expect(
  'admin tab',
  render('AdminTab', <AdminTab reviews={[review]} inviteCodes={[]} reloadReviews={noop} reloadCodes={noop} onError={noop} onToast={noop} openReviewModal={noop} openGenerateModal={noop} />),
  'Admin Panel',
  'Manage reviews',
);

// --------------------------------------------------- new in the redesign

expect(
  'services tab covers services, process and rates',
  render('ServicesTab', <ServicesTab onNavigate={noop} />),
  'Proofreading',
  'Brief',
  'Request a quote',
);
expect(
  'contact tab exposes the real channels',
  render('ContactTab', <ContactTab onToast={noop} />),
  'jacob@polishforgames.com',
  '_m3owl',
);
expect('ambient background layer renders', render('Ambient', <Ambient />), 'ambient');
expect('reveal renders its children', render('Reveal', <Reveal>hello</Reveal>), 'reveal', 'hello');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
