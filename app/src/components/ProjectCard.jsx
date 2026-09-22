import { useEffect, useRef, useState } from 'react';
import SteamImage from './SteamImage';
import PinnedReviews from './PinnedReviews';
import { parseSteamAppId, bannerCandidatesFor, logoCandidatesFor } from '../lib/steam';

/**
 * Project card.
 *
 * Two variants, both driven by the same data:
 *
 *   featured  a pinned project -- full grid width, art beside the copy from
 *             `sm:` up, h2 title
 *   standard  everything else -- one grid cell, stacked 16:9 art, h3 title
 *
 * The art frame has a *fixed* aspect ratio on purpose. Steam's fallback chain
 * can land on library_hero.jpg (~3.10:1), header.jpg (~2.14:1) or
 * capsule_616x353.jpg (~1.75:1), and with an arbitrary frame the winner
 * silently changed the crop. A fixed frame means the crop is a decision, not an
 * accident.
 *
 * The old card painted the art as a CSS background at `opacity-20`, underneath
 * a `.glass` panel that was itself 75% opaque, and then laid a near-opaque
 * gradient on top. Net visible contribution was roughly 5% of an already-dark
 * image, which is why the background looked like it never loaded.
 */

/** Logo inset in px. Must match the `bottom-4 left-4` anchor in the markup. */
const LOGO_INSET = 16;

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

export default function ProjectCard({
  project,
  reviews,
  isAdmin,
  index,
  total,
  onEdit,
  onDelete,
  onTogglePin,
  onMove,
  busy = false,
  featured,
}) {
  const appId = parseSteamAppId(project.steamLink);

  const banners = bannerCandidatesFor({ customUrl: project.bg_url, appId });
  const logos = logoCandidatesFor({ customUrl: project.logo_url, appId });

  const pinnedReviews = project.pinnedReviews
    .map((id) => reviews.find((review) => review.id === id))
    .filter(Boolean);

  const isFeatured = featured ?? Boolean(project.pinned);

  const [artLoading, setArtLoading] = useState(banners.length > 0);
  const [expanded, setExpanded] = useState(false);
  const [detailsOverflowing, setDetailsOverflowing] = useState(false);
  const [logoBounds, setLogoBounds] = useState(null);

  const artRef = useRef(null);
  const logoRef = useRef(null);
  const detailsRef = useRef(null);

  /**
   * Clamp the admin's logo nudge so the wordmark can never be pushed out of the
   * art frame. The logo is anchored `bottom-4 left-4`, so the travel available
   * is the frame box minus the logo box minus the inset on both sides -- all of
   * which is layout, not paint, so ResizeObserver keeps it honest when the
   * frame changes ratio at a breakpoint.
   */
  useEffect(() => {
    const frame = artRef.current;
    const logo = logoRef.current;

    if (!frame || !logo) {
      setLogoBounds(null);
      return undefined;
    }

    const measure = () => {
      const frameWidth = frame.clientWidth;
      const frameHeight = frame.clientHeight;
      const logoWidth = logo.offsetWidth;
      const logoHeight = logo.offsetHeight;

      if (!frameWidth || !frameHeight || !logoWidth || !logoHeight) return;

      setLogoBounds({
        minX: -LOGO_INSET,
        maxX: Math.max(-LOGO_INSET, frameWidth - LOGO_INSET * 2 - logoWidth),
        minY: -Math.max(0, frameHeight - LOGO_INSET * 2 - logoHeight),
        maxY: LOGO_INSET,
      });
    };

    measure();

    if (typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(logo);
    return () => observer.disconnect();
  }, [project.logo_url, appId, isFeatured]);

  /** Long details get clamped, but only offer the toggle when they really clip. */
  useEffect(() => {
    if (expanded) return undefined;

    const node = detailsRef.current;
    if (!node) return undefined;

    const measure = () => setDetailsOverflowing(node.scrollHeight > node.clientHeight + 2);

    measure();

    if (typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [expanded, project.details]);

  const rawLogoX = Number(project.logo_offset_x) || 0;
  const rawLogoY = Number(project.logo_offset_y) || 0;

  const logoX = logoBounds ? clampNumber(rawLogoX, logoBounds.minX, logoBounds.maxX) : rawLogoX;
  const logoY = logoBounds ? clampNumber(rawLogoY, logoBounds.minY, logoBounds.maxY) : rawLogoY;

  const artFallback = (
    <div className="h-full w-full bg-gradient-to-br from-surface-3 via-surface-2 to-void" />
  );

  const artSizes = isFeatured
    ? '(min-width: 640px) 55vw, 100vw'
    : '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw';

  return (
    <article
      className={`group lift card-interactive relative flex w-full flex-col overflow-hidden ${
        isFeatured
          ? 'border-accent/40 shadow-glow-sm sm:min-h-[300px] sm:flex-row sm:flex-wrap'
          : ''
      }`}
    >
      {/*
       * Featured cards set the art and the copy side by side from `sm:` up.
       * Stacked, a full-width 21:9 frame plus its copy measured ~765px tall at
       * 1440px -- taller than the viewport, which made the tab read as though it
       * held a single project. `flex-wrap` keeps `PinnedReviews` (which is
       * `w-full`) on its own row underneath without needing another wrapper.
       */}
      <div
        ref={artRef}
        className={`relative overflow-hidden bg-surface-2 ${
          isFeatured
            ? 'aspect-[16/9] w-full sm:aspect-auto sm:w-[55%] sm:shrink-0'
            : 'aspect-[16/9] w-full'
        }`}
      >
        {artLoading && <div className="skeleton absolute inset-0 rounded-none" aria-hidden="true" />}

        <SteamImage
          candidates={banners}
          fallback={artFallback}
          alt=""
          sizes={artSizes}
          onLoadingChange={setArtLoading}
          className="h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.06]"
          style={{
            objectPosition: `calc(50% + ${project.bg_offset_x}px) calc(50% + ${project.bg_offset_y}px)`,
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-void/25 to-transparent"
          aria-hidden="true"
        />

        {project.pinned && (
          <span className="chip-accent absolute right-3 top-3 z-10 bg-void/70 font-semibold">
            Pinned
          </span>
        )}

        {logos.length > 0 && (
          <span
            ref={logoRef}
            className="absolute bottom-4 left-4 z-10 block max-w-[55%]"
            style={{ transform: `translate(${logoX}px, ${logoY}px)` }}
          >
            <SteamImage
              candidates={logos}
              fallback={null}
              alt={`${project.title} logo`}
              className={`w-auto max-w-full object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] ${
                isFeatured ? 'max-h-14 sm:max-h-20' : 'max-h-10 sm:max-h-12'
              }`}
            />
          </span>
        )}
      </div>

      {/* ---- content ---- */}
      <div
        className={`flex min-w-0 flex-1 flex-col gap-3 ${
          isFeatured ? 'justify-center p-6 sm:p-7' : 'p-5'
        }`}
      >
        <h3 className={`font-display font-semibold text-ink ${isFeatured ? 'text-h2' : 'text-h3'}`}>
          {project.title}
        </h3>

        {project.steamLink && (
          <a
            href={project.steamLink}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex w-fit items-center gap-1.5 text-caption font-semibold text-accent transition-colors duration-250 ease-expo hover:text-accent-2"
          >
            Steam Page
            <ExternalLinkIcon />
          </a>
        )}

        {project.details && (
          <div className="min-w-0">
            <p
              ref={detailsRef}
              className={`whitespace-pre-wrap text-body text-muted ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {project.details}
            </p>

            {detailsOverflowing && (
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                aria-expanded={expanded}
                className="btn-quiet -ml-3 mt-1"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {isAdmin && (
          <div
            /*
             * `mt-auto` is what pins the admin row to the bottom of a
             * content-sized card. The featured variant centres its whole column
             * beside the art instead, so the auto margin would fight that.
             */
            className={`flex flex-wrap items-center gap-2 border-t border-line pt-4 ${
              isFeatured ? '' : 'mt-auto'
            }`}
          >
            <button
              type="button"
              disabled={busy}
              onClick={() => onTogglePin(project)}
              className={project.pinned ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
            >
              {project.pinned ? 'Unpin' : 'Pin'}
            </button>

            <button
              type="button"
              disabled={busy || index === 0}
              onClick={() => onMove(index, -1)}
              title="Move earlier"
              aria-label="Move project earlier"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line-strong bg-white/[0.03] text-muted transition-colors duration-250 ease-expo hover:border-accent/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon />
            </button>

            <button
              type="button"
              disabled={busy || index === total - 1}
              onClick={() => onMove(index, 1)}
              title="Move later"
              aria-label="Move project later"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line-strong bg-white/[0.03] text-muted transition-colors duration-250 ease-expo hover:border-accent/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRightIcon />
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => onEdit(project)}
              className="btn-ghost btn-sm ml-auto"
            >
              Edit
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(project)}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {pinnedReviews.length > 0 && <PinnedReviews reviews={pinnedReviews} />}
    </article>
  );
}
