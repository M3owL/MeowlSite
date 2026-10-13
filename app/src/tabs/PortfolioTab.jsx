import { useEffect, useMemo, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import ProjectIndexItem from '../components/ProjectIndexItem';
import { getSupabase } from '../lib/supabase';
import { moveItem } from '../lib/format';

function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return 0;
  });
}

function PlusIcon() {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

const VIEW_MODES = [
  { id: 'overview', label: 'Overview' },
  { id: 'cards', label: 'Cards' },
  { id: 'list', label: 'List' },
];

function ViewIcon({ mode }) {
  return (
    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {mode === 'overview' && <><rect x="2" y="2" width="7" height="7" rx="1" /><rect x="11" y="2" width="7" height="7" rx="1" /><rect x="2" y="11" width="7" height="7" rx="1" /><rect x="11" y="11" width="7" height="7" rx="1" /></>}
      {mode === 'cards' && <><rect x="2" y="3" width="16" height="6" rx="1" /><rect x="2" y="11" width="16" height="6" rx="1" /><path d="M8 3v6M8 11v6" /></>}
      {mode === 'list' && <><path d="M3 4h2m3 0h9M3 10h2m3 0h9M3 16h2m3 0h9" /></>}
    </svg>
  );
}

/**
 * Portfolio.
 *
 * The initial overview favors scanning every project; visitors can switch to
 * full cards or a compact list. Pinned projects sort first in every mode.
 *
 * The cards are also deliberately not wrapped in a scroll-reveal. They start at
 * `opacity: 0` and only fade in once they intersect the viewport, which is
 * exactly the "I can only see one project" behaviour this replaces. The tab
 * transition still animates the whole panel in.
 *
 * Sorting is unchanged: pinned first, then `sort_order`.
 */
export default function PortfolioTab({
  projects,
  reviews,
  isAdmin,
  onChanged,
  onError,
  onToast,
  openProjectModal,
}) {
  const [busy, setBusy] = useState(false);
  const [viewMode, setViewMode] = useState('overview');
  const [focusProjectId, setFocusProjectId] = useState(null);
  const sorted = useMemo(() => sortProjects(projects), [projects]);

  useEffect(() => {
    if (viewMode !== 'cards' || focusProjectId === null) return undefined;
    const frame = requestAnimationFrame(() => {
      const projectNode = document.getElementById(`portfolio-project-${focusProjectId}`);
      projectNode?.focus({ preventScroll: true });
      projectNode?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth',
      });
      setFocusProjectId(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [viewMode, focusProjectId]);

  const showDetails = (id) => {
    setFocusProjectId(id);
    setViewMode('cards');
  };

  /**
   * `index` is the position in the *full* sorted list -- it is what the reorder
   * buttons write back to `sort_order`, so it must not be re-based.
   */
  const rows = useMemo(
    () => sorted.map((project, index) => ({ project, index })),
    [sorted],
  );

  const client = getSupabase();

  const runMutation = async (action, successMessage) => {
    if (!client) return;
    setBusy(true);
    try {
      await action();
      await onChanged();
      if (successMessage) onToast(successMessage);
    } catch (error) {
      onError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteProject = (project) => {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;

    return runMutation(async () => {
      const { error } = await client.from('projects').delete().eq('id', project.id);
      if (error) throw new Error(error.message);
    }, 'Project deleted.');
  };

  const togglePin = (project) =>
    runMutation(async () => {
      const { error } = await client
        .from('projects')
        .update({ pinned: !project.pinned })
        .eq('id', project.id);
      if (error) throw new Error(error.message);
    });

  /**
   * Reorder by writing the full index back as sort_order.
   * The old version awaited each update in a for-loop (N round trips, and a
   * half-applied order if one failed midway). Promise.all at least fires them
   * together; a single upsert RPC would be better still if you add one.
   */
  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;

    const reordered = moveItem(sorted, index, target);

    return runMutation(async () => {
      const results = await Promise.all(
        reordered.map((project, position) =>
          client.from('projects').update({ sort_order: position }).eq('id', project.id),
        ),
      );

      const failure = results.find((result) => result.error);
      if (failure) throw new Error(failure.error.message);
    });
  };

  return (
    <div className="relative">
      <header className="mb-5 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Portfolio / {sorted.length} {sorted.length === 1 ? 'project' : 'projects'}</p>
          <h2 className="mt-2 text-h1">Game translation projects</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {sorted.length > 0 && (
            <div role="group" aria-label="Portfolio display" className="inline-flex items-center gap-1 rounded-lg border border-line-strong bg-surface-2/60 p-1">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  title={`${mode.label} view`}
                  aria-label={`${mode.label} view`}
                  aria-pressed={viewMode === mode.id}
                  onClick={() => { setFocusProjectId(null); setViewMode(mode.id); }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-caption font-semibold transition-colors ${viewMode === mode.id ? 'bg-accent/15 text-accent' : 'text-muted hover:bg-white/[0.05] hover:text-ink'}`}
                >
                  <ViewIcon mode={mode.id} />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>
          )}
          {isAdmin && (
            <button type="button" onClick={() => openProjectModal(null)} className="btn-primary shrink-0">
              <PlusIcon /> Add Project
            </button>
          )}
        </div>
      </header>

      {sorted.length === 0 ? (
        <p className="py-16 text-center text-body-lg text-muted">No projects added yet.</p>
      ) : (
        viewMode === 'cards' ? (
          <div className="space-y-6">
            {rows.map((row) => (
              <div key={row.project.id} id={`portfolio-project-${row.project.id}`} tabIndex={-1} className="scroll-mt-28">
                <ProjectCard
                  project={row.project}
                  reviews={reviews}
                  isAdmin={isAdmin}
                  index={row.index}
                  total={sorted.length}
                  busy={busy}
                  onEdit={openProjectModal}
                  onDelete={deleteProject}
                  onTogglePin={togglePin}
                  onMove={move}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'space-y-2.5' : 'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}>
            {rows.map((row) => (
              <ProjectIndexItem
                key={row.project.id}
                project={row.project}
                view={viewMode}
                isAdmin={isAdmin}
                onEdit={openProjectModal}
                onExpand={showDetails}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
