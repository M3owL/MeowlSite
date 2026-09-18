import SteamImage from './SteamImage';
import PinnedReviews from './PinnedReviews';
import { parseSteamAppId, bannerCandidatesFor, logoCandidatesFor } from '../lib/steam';

/**
 * Project card.
 *
 * The old card painted the Steam art as a CSS background at `opacity-20`,
 * *underneath* a `.glass` panel that was itself 75% opaque, and then laid a
 * near-opaque gradient on top. Net visible contribution was roughly 5% of an
 * already-dark image, which is why the background looked like it never loaded.
 *
 * This version makes the art the card: a real <img> filling the frame at high
 * opacity, with a gradient scrim only where text sits. The scrim does the
 * legibility work so the image does not have to be hidden to be readable.
 */
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
}) {
  const appId = parseSteamAppId(project.steamLink);

  const banners = bannerCandidatesFor({ customUrl: project.bg_url, appId });
  const logos = logoCandidatesFor({ customUrl: project.logo_url, appId });

  const pinnedReviews = project.pinnedReviews
    .map((id) => reviews.find((review) => review.id === id))
    .filter(Boolean);

  const artFallback = (
    <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
  );

  return (
    <article
      className={`group relative flex min-h-[340px] flex-col overflow-hidden rounded-xl border shadow-xl transition-shadow ${
        project.pinned
          ? 'border-accent/70 shadow-[0_0_24px_rgba(6,182,212,0.18)]'
          : 'border-slate-700/80 hover:border-slate-600'
      }`}
    >
      {/* ---- artwork layer ---- */}
      <div className="absolute inset-0" aria-hidden="true">
        <SteamImage
          candidates={banners}
          fallback={artFallback}
          alt=""
          className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-95"
          style={{
            objectPosition: `calc(50% + ${project.bg_offset_x}px) calc(50% + ${project.bg_offset_y}px)`,
          }}
        />
        {/* scrim: light at the top so art shows, heavy at the bottom for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/85 to-darker/25" />
      </div>

      {/* ---- content ---- */}
      <div className="relative z-10 flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-col items-start gap-4">
          <SteamImage
            candidates={logos}
            fallback={null}
            alt={`${project.title} logo`}
            className="max-h-20 w-auto max-w-[220px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
            style={{
              transform: `translate(${project.logo_offset_x}px, ${project.logo_offset_y}px)`,
            }}
          />

          <div className="w-full">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-2xl font-bold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {project.title}
              </h3>

              {project.pinned && (
                <span className="mt-1 shrink-0 rounded border border-accent/40 bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                  Pinned
                </span>
              )}
            </div>

            {project.steamLink && (
              <a
                href={project.steamLink}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
              >
                Steam Page ↗
              </a>
            )}
          </div>
        </div>

        {project.details && (
          <p className="mb-6 flex-grow whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-200">
            {project.details}
          </p>
        )}

        {isAdmin && (
          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => onTogglePin(project)}
              className={`rounded border px-2 py-1 text-[10px] font-bold ${
                project.pinned
                  ? 'border-accent bg-accent text-darker'
                  : 'border-slate-600 bg-slate-800 text-slate-300'
              }`}
            >
              {project.pinned ? 'Unpin' : 'Pin'}
            </button>

            <button
              type="button"
              disabled={busy || index === 0}
              onClick={() => onMove(index, -1)}
              title="Move earlier"
              aria-label="Move project earlier"
              className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-30"
            >
              ←
            </button>

            <button
              type="button"
              disabled={busy || index === total - 1}
              onClick={() => onMove(index, 1)}
              title="Move later"
              aria-label="Move project later"
              className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-30"
            >
              →
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => onEdit(project)}
              className="ml-auto rounded border border-blue-800 bg-blue-900/50 px-2 py-1 text-[10px] font-bold text-blue-300"
            >
              Edit
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(project)}
              className="rounded border border-red-800 bg-red-900/50 px-2 py-1 text-[10px] font-bold text-red-300"
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
