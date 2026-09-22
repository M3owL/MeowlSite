import { useMemo, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
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

/**
 * Portfolio.
 *
 * Every project renders in one uniform grid, pinned first. An earlier pass
 * hoisted pinned projects into full-width featured cards; that card was taller
 * than the viewport at 1440px, so the tab looked like it held a single project
 * and everything else only appeared after scrolling. Pinning now only changes
 * the order and the card's accent border.
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
  const sorted = useMemo(() => sortProjects(projects), [projects]);

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
      <header className="section-head">
        <div className="min-w-0">
          <p className="eyebrow mb-2">Selected work</p>
          <h2 className="text-h1">Game Translation History</h2>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => openProjectModal(null)}
            className="btn-primary shrink-0"
          >
            <PlusIcon />
            Add Project
          </button>
        )}
      </header>

      {sorted.length === 0 ? (
        <p className="py-16 text-center text-body-lg text-muted">No projects added yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <ProjectCard
              key={row.project.id}
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
          ))}
        </div>
      )}
    </div>
  );
}
