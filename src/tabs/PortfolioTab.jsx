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
    <div className="relative animate-fade-in">
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Game Translation History
        </h2>

        {isAdmin && (
          <button type="button" onClick={() => openProjectModal(null)} className="btn-primary">
            <span className="text-xl leading-none">+</span>
            Add Project
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="mt-12 text-center text-xl font-bold text-slate-500">
          No projects added yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {sorted.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              reviews={reviews}
              isAdmin={isAdmin}
              index={index}
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
