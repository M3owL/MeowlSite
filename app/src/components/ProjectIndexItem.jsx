import SteamImage from './SteamImage';
import { bannerCandidatesFor, parseSteamAppId } from '../lib/steam';
import { calculateAverageRating } from '../lib/format';

/** Short public summary used by the overview and list display modes. */
export default function ProjectIndexItem({ project, reviews = [], view, onExpand, isAdmin, onEdit }) {
  const appId = parseSteamAppId(project.steamLink);
  const banners = bannerCandidatesFor({ customUrl: project.bg_url, appId });
  const isList = view === 'list';
  const reviewsById = new Map(reviews.map((review) => [String(review.id), review]));
  const pinnedReviews = (project.pinnedReviews || [])
    .map((id) => reviewsById.get(String(id)))
    .filter((review) => review && (isAdmin || review.published !== false));
  const fallback = (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-3 to-void font-display text-3xl text-accent/70" aria-hidden="true">
      {project.title?.charAt(0) || '•'}
    </div>
  );

  return (
    <article className={`card-interactive overflow-hidden ${project.pinned ? 'border-accent/40' : ''} ${isList ? 'flex items-center gap-4 p-3 sm:gap-5' : 'flex flex-col'}`}>
      <div className={`relative shrink-0 overflow-hidden bg-surface-2 ${isList ? 'h-16 w-20 rounded-md sm:h-[72px] sm:w-32' : 'aspect-[2.3/1] w-full'}`}>
        <SteamImage
          candidates={banners}
          fallback={fallback}
          alt=""
          sizes={isList ? '128px' : '(min-width: 1024px) 280px, (min-width: 768px) 240px, 45vw'}
          className="h-full w-full object-cover"
          style={{ objectPosition: `calc(50% + ${project.bg_offset_x}px) calc(50% + ${project.bg_offset_y}px)` }}
        />
        {!isList && project.pinned && (
          <span className="chip-accent absolute right-2 top-2 bg-void/80 px-2 py-0.5 text-xs">Pinned</span>
        )}
      </div>

      <div className={`min-w-0 flex-1 ${isList ? 'flex flex-wrap items-center justify-between gap-x-4 gap-y-2' : 'flex flex-col p-3.5'}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-h4 font-semibold text-ink">{project.title}</h3>
            {isList && project.pinned && <span className="shrink-0 text-xs font-semibold text-accent">Pinned</span>}
          </div>
          {project.details && (
            <p className={`mt-1 text-caption text-muted ${isList ? 'line-clamp-1' : 'line-clamp-2 min-h-[2.5rem]'}`}>{project.details}</p>
          )}
        </div>

        <div className={`flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-caption ${isList ? '' : 'mt-auto border-t border-line pt-3'}`}>
          <button type="button" onClick={() => onExpand(project.id)} className="font-semibold text-accent transition-colors hover:text-accent-2">
            Details <span aria-hidden="true">→</span>
          </button>
          {project.steamLink && (
            <a href={project.steamLink} target="_blank" rel="noreferrer noopener" className="text-muted transition-colors hover:text-accent">
              Steam <span aria-hidden="true">↗</span>
            </a>
          )}
          {isAdmin && <button type="button" onClick={() => onEdit(project)} className="text-muted transition-colors hover:text-accent">Edit</button>}
        </div>

        {pinnedReviews.length > 0 && (
          <div className="mt-3 w-full border-t border-line pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">Pinned reviews</p>
            <ul className="mt-2 space-y-2.5">
              {pinnedReviews.map((review) => {
                const rating = calculateAverageRating(review.ratings);
                return (
                  <li key={review.id} className="min-w-0 border-l-2 border-accent/50 pl-2.5">
                    <p className="line-clamp-2 text-caption italic leading-snug text-ink/90">“{review.text}”</p>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate font-medium text-muted">{review.nickname}</span>
                      {rating > 0 && <span className="shrink-0 font-semibold text-amber-300" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>★ {rating.toFixed(1)}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
