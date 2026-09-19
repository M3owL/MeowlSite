import { useMemo, useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import SteamImage from '../components/SteamImage';
import { avatarFallback } from '../lib/format';
import { uploadPublicFile } from '../lib/storage';
import { BUCKET_LIMITS } from '../lib/constants';
import {
  parseSteamAppId,
  titleFromSteamUrl,
  bannerCandidatesFor,
  logoCandidatesFor,
} from '../lib/steam';

function initialForm(project) {
  if (!project) {
    return {
      title: '',
      steamLink: '',
      bg_url: '',
      logo_url: '',
      details: '',
      pinnedReviews: [],
      pinned: false,
      sort_order: 0,
      bg_offset_x: 0,
      bg_offset_y: 0,
      logo_offset_x: 0,
      logo_offset_y: 0,
    };
  }

  return {
    ...project,
    pinnedReviews: project.pinnedReviews || [],
    pinned: Boolean(project.pinned),
    sort_order: project.sort_order || 0,
    bg_url: project.bg_url || '',
    logo_url: project.logo_url || '',
    bg_offset_x: project.bg_offset_x || 0,
    bg_offset_y: project.bg_offset_y || 0,
    logo_offset_x: project.logo_offset_x || 0,
    logo_offset_y: project.logo_offset_y || 0,
  };
}

/** One compact nudge field. */
function OffsetInput({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input px-2 py-1 text-xs"
      />
    </label>
  );
}

/** Upload tile with an inline thumbnail, kept short so the form stays compact. */
function ImageSlot({ label, hint, url, busy, onPick, onClear, previewHeight }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-xs font-bold text-accent">{label}</span>
          <p className="truncate text-[10px] text-slate-500">{hint}</p>
        </div>

        {url && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded border border-red-800 bg-red-900/40 px-1.5 py-0.5 text-[10px] font-bold text-red-400"
          >
            Clear
          </button>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(event) => onPick(event.target.files?.[0])}
        className="w-full text-[10px] font-bold text-slate-400 file:mr-2 file:rounded file:border-0 file:bg-slate-700 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-white"
      />

      {busy && <p className="mt-1.5 text-[10px] font-bold text-slate-500">Uploading…</p>}

      {url && !busy && (
        <div
          className={`mt-2 flex items-center justify-center overflow-hidden rounded border border-slate-700 bg-slate-900 ${previewHeight}`}
        >
          <img src={url} alt={`${label} preview`} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}

export default function ProjectFormModal({ project, reviews, onSave, onCancel, onError }) {
  const [form, setForm] = useState(() => initialForm(project));
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [resolvedBanner, setResolvedBanner] = useState('');
  const [resolvedLogo, setResolvedLogo] = useState('');

  const patch = (changes) => setForm((current) => ({ ...current, ...changes }));

  const appId = useMemo(() => parseSteamAppId(form.steamLink), [form.steamLink]);
  const steamLinkTyped = Boolean(String(form.steamLink || '').trim());
  const steamLinkBroken = steamLinkTyped && !appId;
  const titleGuess = titleFromSteamUrl(form.steamLink);

  const bannerCandidates = useMemo(
    () => bannerCandidatesFor({ customUrl: form.bg_url, appId }),
    [form.bg_url, appId],
  );

  const logoCandidates = useMemo(
    () => logoCandidatesFor({ customUrl: form.logo_url, appId }),
    [form.logo_url, appId],
  );

  const uploadImage = async (file, prefix, maxBytes, setBusy, apply) => {
    if (!file) return;
    setBusy(true);
    try {
      apply(await uploadPublicFile(file, prefix, { maxBytes }));
    } catch (error) {
      onError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePinnedReview = (reviewId) => {
    patch({
      pinnedReviews: form.pinnedReviews.includes(reviewId)
        ? form.pinnedReviews.filter((id) => id !== reviewId)
        : [...form.pinnedReviews, reviewId],
    });
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return onError('Title is required.');
    onSave(form);
  };

  const resetAll = () =>
    patch({ bg_offset_x: 0, bg_offset_y: 0, logo_offset_x: 0, logo_offset_y: 0 });

  return (
    <Modal
      title={project ? 'Edit project' : 'New project'}
      subtitle="Paste a Steam store link and the artwork is pulled in automatically."
      onClose={onCancel}
      maxWidth="max-w-5xl"
      footer={
        <div className="flex gap-3">
          <button
            type="submit"
            form="project-form"
            disabled={uploadingBg || uploadingLogo}
            className="btn-primary flex-1"
          >
            {project ? 'Save project' : 'Create project'}
          </button>

          <button type="button" onClick={onCancel} className="btn-ghost flex-1">
            Cancel
          </button>
        </div>
      }
    >
      <form id="project-form" onSubmit={submit}>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* ------------------------------------------------ left column */}
          <div className="space-y-3.5">
            <Field label="Game title">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => patch({ title: event.target.value })}
                  className="form-input"
                  required
                />
                {titleGuess && (
                  <button
                    type="button"
                    onClick={() => patch({ title: titleGuess })}
                    title={`Use "${titleGuess}" from the Steam URL`}
                    className="btn-ghost shrink-0 text-xs"
                  >
                    From URL
                  </button>
                )}
              </div>
            </Field>

            <Field
              label="Steam link"
              hint="Full store URL, bare app id, or an s.team short link."
            >
              <input
                type="text"
                value={form.steamLink}
                onChange={(event) => patch({ steamLink: event.target.value })}
                className="form-input"
                placeholder="https://store.steampowered.com/app/413150/Stardew_Valley/"
              />

              {appId && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                  Steam app {appId} detected — artwork loads automatically
                </span>
              )}

              {steamLinkBroken && (
                <span className="mt-1.5 inline-block rounded border border-amber-600/50 bg-amber-900/30 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                  Could not read an app id from that link — upload images below instead.
                </span>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <ImageSlot
                label="Background"
                hint="Overrides the Steam hero"
                url={form.bg_url}
                busy={uploadingBg}
                previewHeight="h-14"
                onClear={() => patch({ bg_url: '' })}
                onPick={(file) =>
                  uploadImage(file, 'project-bg', BUCKET_LIMITS.background, setUploadingBg, (url) =>
                    patch({ bg_url: url }),
                  )
                }
              />

              <ImageSlot
                label="Logo"
                hint="Overrides the Steam wordmark"
                url={form.logo_url}
                busy={uploadingLogo}
                previewHeight="h-14"
                onClear={() => patch({ logo_url: '' })}
                onPick={(file) =>
                  uploadImage(file, 'project-logo', BUCKET_LIMITS.logo, setUploadingLogo, (url) =>
                    patch({ logo_url: url }),
                  )
                }
              />
            </div>

            <Field label="Translation details">
              <textarea
                value={form.details}
                onChange={(event) => patch({ details: event.target.value })}
                className="form-input h-20 font-medium"
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-white">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(event) => patch({ pinned: event.target.checked })}
                className="h-4 w-4 rounded accent-accent"
              />
              Pin project to the top
            </label>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-slate-400">
                  Pin feedbacks to this project
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {form.pinnedReviews.length} selected
                </span>
              </div>

              <div className="max-h-28 space-y-1 overflow-y-auto rounded border border-slate-700 bg-slate-950/50 p-2">
                {reviews.length === 0 ? (
                  <p className="px-1 py-2 text-xs font-bold text-slate-500">
                    No feedbacks available yet.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <label
                      key={review.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={form.pinnedReviews.includes(review.id)}
                        onChange={() => togglePinnedReview(review.id)}
                        className="h-3.5 w-3.5 shrink-0 accent-accent"
                      />

                      <img
                        src={review.pfp || avatarFallback(review.nickname)}
                        alt=""
                        className="h-5 w-5 shrink-0 rounded-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = avatarFallback(review.nickname);
                        }}
                      />

                      <span className="shrink-0 text-xs font-bold text-white">
                        {review.nickname}
                      </span>

                      <span className="truncate text-[11px] text-slate-500">
                        “{review.text}”
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------- right column */}
          <div className="space-y-3.5">
            <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-accent">Live preview</span>

                {form.bg_url ? (
                  <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                    CUSTOM
                  </span>
                ) : appId ? (
                  <span className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                    FROM STEAM
                  </span>
                ) : (
                  <span className="rounded border border-amber-600/50 bg-amber-900/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                    NO ARTWORK
                  </span>
                )}
              </div>

              <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-700 bg-darker">
                <SteamImage
                  candidates={bannerCandidates}
                  fallback={
                    <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
                  }
                  alt=""
                  eager
                  onResolved={setResolvedBanner}
                  className="h-full w-full object-cover opacity-80"
                  style={{
                    objectPosition: `calc(50% + ${Number(form.bg_offset_x) || 0}px) calc(50% + ${Number(form.bg_offset_y) || 0}px)`,
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/70 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-end p-3">
                  <SteamImage
                    candidates={logoCandidates}
                    fallback={null}
                    alt=""
                    eager
                    onResolved={setResolvedLogo}
                    className="mb-2 max-h-10 w-auto max-w-[55%] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                    style={{
                      transform: `translate(${Number(form.logo_offset_x) || 0}px, ${Number(form.logo_offset_y) || 0}px)`,
                    }}
                  />

                  <h3 className="truncate text-lg font-bold leading-tight text-white">
                    {form.title || 'Project title'}
                  </h3>
                </div>
              </div>

              <div className="mt-2 space-y-0.5 text-[10px] font-bold leading-tight">
                <p className="truncate text-slate-500">
                  Background:{' '}
                  {resolvedBanner ? (
                    <span className="text-green-400">{resolvedBanner.split('/').pop()}</span>
                  ) : (
                    <span className="text-amber-400">none — upload one</span>
                  )}
                </p>
                <p className="truncate text-slate-500">
                  Logo:{' '}
                  {resolvedLogo ? (
                    <span className="text-green-400">{resolvedLogo.split('/').pop()}</span>
                  ) : (
                    <span className="text-amber-400">none — title text is used</span>
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-accent">Image position</span>
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300 hover:text-white"
                >
                  Reset all
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <OffsetInput
                  label="BG X"
                  value={form.bg_offset_x}
                  onChange={(value) => patch({ bg_offset_x: value })}
                />
                <OffsetInput
                  label="BG Y"
                  value={form.bg_offset_y}
                  onChange={(value) => patch({ bg_offset_y: value })}
                />
                <OffsetInput
                  label="Logo X"
                  value={form.logo_offset_x}
                  onChange={(value) => patch({ logo_offset_x: value })}
                />
                <OffsetInput
                  label="Logo Y"
                  value={form.logo_offset_y}
                  onChange={(value) => patch({ logo_offset_y: value })}
                />
              </div>

              <p className="mt-2 text-[10px] text-slate-500">
                Positive X moves right, positive Y moves down.
              </p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
