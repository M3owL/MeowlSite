import { useEffect, useState } from 'react';
import { BRAND, CONTACT } from '../lib/constants';
import Reveal from '../components/ui/Reveal';

/**
 * Contact tab: the two ways to reach me, what I need from you, and when you
 * will hear back.
 *
 * The email channel carries a real `mailto:` href. The Discord channel has no
 * href, so it is a copy-to-clipboard button -- and the clipboard API is allowed
 * to be missing (insecure context, denied permission), in which case the toast
 * just tells the visitor the handle instead.
 *
 * Structural labels only -- candidates for constants.js.
 */
const COPY = {
  eyebrow: 'Contact',
  responseLabel: 'Response time',
  timezoneLabel: 'Timezone',
  sendHeading: 'What to send me',
  copyLabel: 'Copy handle',
  copiedLabel: 'Copied',
  fallbackPrefix: 'Discord handle:',
  sendList: [
    'The files, or a link to them. .xliff and .po import straight into my CAT tool; a PDF does not.',
    'A word count, even a rough one, so I can price the job.',
    'Your deadline, and whether it is a hard one.',
    'Screenshots or a line of context for anything the text cannot explain on its own.',
  ],
};

/* ------------------------------------------------------------------ icons */

function MailIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function DiscordIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 6.5a14 14 0 0 1 8 0" />
      <path d="M8 6.5C5.5 7.5 4.5 10 4.5 13c0 2 1.5 3.5 3.5 4.5l1-1.5" />
      <path d="M16 6.5c2.5 1 3.5 3.5 3.5 6.5 0 2-1.5 3.5-3.5 4.5l-1-1.5" />
      <path d="M8 17.5c1 .5 2.5.8 4 .8s3-.3 4-.8" />
      <circle cx="9.75" cy="12.75" r="1" />
      <circle cx="14.25" cy="12.75" r="1" />
    </svg>
  );
}

function CopyIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 6.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5" />
    </svg>
  );
}

function CheckIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

function ClockIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function GlobeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.4 3.6 5.4 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.4-3.6-8.5S9.6 5.9 12 3.5Z" />
    </svg>
  );
}

function AvailabilityDot({ open }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {open ? (
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
      ) : null}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          open ? 'bg-emerald-400' : 'bg-faint'
        }`}
      />
    </span>
  );
}

/* ------------------------------------------------------------------- tab */

export default function ContactTab({ onToast }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(timer);
  }, [copied]);

  /**
   * The clipboard API is unavailable in insecure contexts and can be blocked by
   * permission, so this must never throw -- worst case the toast carries the
   * handle so it can still be selected by hand.
   */
  const copyHandle = async (value) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable.');
      }

      await navigator.clipboard.writeText(value);
      setCopied(true);
      onToast?.('Discord handle copied.');
    } catch {
      onToast?.(`${COPY.fallbackPrefix} ${value}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-14 sm:space-y-20">
      {/* ------------------------------------------------------------ header */}
      <header className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-5rem] h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="relative">
          <Reveal as="p" className="eyebrow">
            {COPY.eyebrow}
          </Reveal>
          <Reveal as="h2" index={1} className="mt-4 text-display-2">
            {CONTACT.heading}
          </Reveal>
          <Reveal as="p" index={2} className="lead mt-5 max-w-2xl">
            {CONTACT.intro}
          </Reveal>
        </div>
      </header>

      {/* ---------------------------------------------------------- channels */}
      <section aria-labelledby="contact-channels">
        <h3 id="contact-channels" className="sr-only">
          {COPY.eyebrow}
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          {CONTACT.channels.map((channel, index) => (
            <Reveal
              key={channel.id}
              index={index}
              className="card-interactive lift flex flex-col p-6"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong bg-surface-3/70 text-accent">
                  {channel.id === 'email' ? <MailIcon /> : <DiscordIcon />}
                </span>
                <span className="text-caption font-semibold uppercase tracking-wide text-muted">
                  {channel.label}
                </span>
              </div>

              {channel.href ? (
                <a
                  href={channel.href}
                  className="mt-5 break-all font-display text-h4 font-semibold text-ink transition-colors duration-250 ease-expo hover:text-accent"
                >
                  {channel.value}
                </a>
              ) : (
                <>
                  <span className="mt-5 break-all font-display text-h4 font-semibold text-ink">
                    {channel.value}
                  </span>

                  <button
                    type="button"
                    onClick={() => copyHandle(channel.value)}
                    className="btn-ghost btn-sm mt-4 self-start"
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? COPY.copiedLabel : COPY.copyLabel}
                  </button>
                </>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ send / aside */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12">
        <section aria-labelledby="contact-send">
          <Reveal as="h3" id="contact-send" className="text-h3 font-semibold text-ink">
            {COPY.sendHeading}
          </Reveal>

          <ul className="mt-5 space-y-3.5">
            {COPY.sendList.map((item, index) => (
              <Reveal key={item} as="li" index={index} className="flex gap-3 text-body text-muted">
                <CheckIcon className="mt-1.5 shrink-0 text-accent" />
                <span>{item}</span>
              </Reveal>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <Reveal className="flex gap-3 rounded-xl border border-line bg-surface-2/40 p-5">
            <ClockIcon className="mt-0.5 shrink-0 text-accent" />
            <div>
              <h3 className="text-caption font-semibold text-ink">{COPY.responseLabel}</h3>
              <p className="meta mt-1">{CONTACT.responseTime}</p>
            </div>
          </Reveal>

          <Reveal index={1} className="flex gap-3 rounded-xl border border-line bg-surface-2/40 p-5">
            <GlobeIcon className="mt-0.5 shrink-0 text-accent" />
            <div>
              <h3 className="text-caption font-semibold text-ink">{COPY.timezoneLabel}</h3>
              <p className="meta mt-1">{CONTACT.timezone}</p>
            </div>
          </Reveal>

          <Reveal
            index={2}
            className={`rounded-xl border p-5 ${
              BRAND.availability.open
                ? 'border-emerald-400/25 bg-emerald-400/[0.06]'
                : 'border-line bg-surface-2/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AvailabilityDot open={BRAND.availability.open} />
              <h3 className="text-caption font-semibold text-ink">{BRAND.availability.label}</h3>
            </div>
            <p className="meta mt-2">{BRAND.availability.note}</p>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
