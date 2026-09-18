import { useMemo, useState } from 'react';
import Modal from '../components/ui/Modal';
import Field from '../components/ui/Field';
import SteamImage from '../components/SteamImage';
import { avatarFallback } from '../lib/format';
import { uploadPublicFile } from '../lib/storage';
import { BUCKET_LIMITS } from '../lib/constants';
import { getSupabase } from '../lib/supabase';
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
      const url = await uploadPublicFile(file, prefix, { maxBytes });
      apply(url);
    } catch (error) {
      onError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePinnedReview = (reviewId) => {
    const next = form.pinnedReviews.includes(reviewId)
      ? form.pinnedReviews.filter((id) => id !== reviewId)
      : [...form.pinnedReviews, reviewId];
    patch({ pinnedReviews: next });
  };

  const useTitleFromUrl = () => {
    const guess = titleFromSteamUrl(form.steamLink);
    if (guess) patch({ title: guess });
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return onError('Title is required.');
    onSave(form);
  };

  const offsetInput = (key, label) => (
    <Field label={label}>
      <input
        type="number"
        value={form[key]}
        onChange={(event) => patch({ [key]: event.target.value })}
        className="form-input"
      />
    </Field>
  );

  return (
    <Modal
      title={project ? 'Edit project' : 'New project'}
      subtitle="Paste a Steam store link and the artwork is pulled in automatically."
      onClose={onCancel}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Game title">
          <div className="flex gap-2">
            <input
              type="text"
              value={form.title}
              onChange={(event) => patch({ title: event.target.value })}
              className="form-input"
              required
            />
            {titleFromSteamUrl(form.steamLink) && (
              <button
                type="button"
                onClick={useTitleFromUrl}
                title="Use the name from the Steam URL"
                className="btn-ghost shrink-0 text-xs"
              >
                From URL
              </button>
            )}
          </div>
        </Field>

        <Field
          label="Steam link"
          hint="Accepts a full store URL, a bare app id, or an s.team short link."
        >
          <input
            type="text"
            value={form.steamLink}
            onChange={(event) => patch({ steamLink: event.target.value })}
            className="form-input"
            placeholder="https://store.steampowered.com/app/413150/Stardew_Valley/"
          />

          {appId && (
            <span className="mt-2 inline-flex items-center gap-1 rounded border border-accent/40 bg-accent/10 px-2 py-1 text-[11px] font-bold text-accent">
              Steam app {appId} detected — artwork loads automatically
            </span>
          )}

          {steamLinkBroken && (
            <span className="mt-2 inline-block rounded border border-amber-600/50 bg-amber-900/30 px-2 py-1 text-[11px] font-bold text-amber-300">
              Could not read an app id from that link. Artwork will not be fetched —
              upload images below instead.
            </span>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* background */}
          <div className="rounded border border-slate-700 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <span className="text-sm font-bold text-accent">Custom background</span>
                <p className="mt-1 text-xs text-slate-500">Overrides the Steam hero image.</p>
              </div>

              {form.bg_url && (
                <button
                  type="button"
                  onClick={() => patch({ bg_url: '' })}
                  className="shrink-0 rounded border border-red-800 bg-red-900/40 px-2 py-1 text-xs font-bold text-red-400"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              disabled={uploadingBg}
              onChange={(event) =>
                uploadImage(
                  event.target.files?.[0],
                  'project-bg',
                  BUCKET_LIMITS.background,
                  setUploadingBg,
                  (url) => patch({ bg_url: url }),
                )
              }
              className="w-full rounded border border-slate-700 bg-slate-900 p-1 text-sm font-bold text-white"
            />

            {uploadingBg && <p className="mt-2 text-xs font-bold text-slate-500">Uploading…</p>}

            {form.bg_url && (
              <img
                src={form.bg_url}
                alt="Background preview"
                className="mt-3 h-24 w-full rounded border border-slate-700 object-cover"
              />
            )}
          </div>

          {/* logo */}
          <div className="rounded border border-slate-700 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <span className="text-sm font-bold text-accent">Custom logo</span>
                <p className="mt-1 text-xs text-slate-500">Overrides the Steam wordmark.</p>
              </div>

              {form.logo_url && (
                <button
                  type="button"
                  onClick={() => patch({ logo_url: '' })}
                  className="shrink-0 rounded border border-red-800 bg-red-900/40 px-2 py-1 text-xs font-bold text-red-400"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              disabled={uploadingLogo}
              onChange={(event) =>
                uploadImage(
                  event.target.files?.[0],
                  'project-logo',
                  BUCKET_LIMITS.logo,
                  setUploadingLogo,
                  (url) => patch({ logo_url: url }),
                )
              }
              className="w-full rounded border border-slate-700 bg-slate-900 p-1 text-sm font-bold text-white"
            />

            {uploadingLogo && <p className="mt-2 text-xs font-bold text-slate-500">Uploading…</p>}

            {form.logo_url && (
              <div className="mt-3 flex h-24 items-center justify-center rounded border border-slate-700 bg-slate-900 p-3">
                <img src={form.logo_url} alt="Logo preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* live preview */}
        <div className="rounded border border-slate-700 bg-slate-950/60 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-bold text-accent">Live preview</span>

            <div className="flex flex-wrap gap-2">
              {form.bg_url ? (
                <span className="rounded border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-bold text-accent">
                  CUSTOM BACKGROUND
                </span>
              ) : appId ? (
                <span className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300">
                  FROM STEAM
                </span>
              ) : (
                <span className="rounded border border-amber-600/50 bg-amber-900/30 px-2 py-1 text-[10px] font-bold text-amber-300">
                  NO ARTWORK SOURCE
                </span>
              )}
            </div>
          </div>

          <div className="relative h-48 overflow-hidden rounded-xl border border-slate-700 bg-darker">
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

            <div className="relative z-10 flex h-full flex-col justify-end p-5">
              <SteamImage
                candidates={logoCandidates}
                fallback={null}
                alt=""
                eager
                onResolved={setResolvedLogo}
                className="mb-3 max-h-16 w-auto max-w-[200px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                style={{
                  transform: `translate(${Number(form.logo_offset_x) || 0}px, ${Number(form.logo_offset_y) || 0}px)`,
                }}
              />

              <h3 className="text-2xl font-bold text-white">
                {form.title || 'Project title'}
              </h3>
            </div>
          </div>

          {/* tells you exactly which file won, so failures stop being silent */}
          <div className="mt-3 space-y-1 text-[10px] font-bold">
            <p className="text-slate-500">
              Background:{' '}
              {resolvedBanner ? (
                <span className="text-green-400">{resolvedBanner.split('/').pop()}</span>
              ) : (
                <span className="text-amber-400">no image resolved — upload one</span>
              )}
            </p>
            <p className="text-slate-500">
              Logo:{' '}
              {resolvedLogo ? (
                <span className="text-green-400">{resolvedLogo.split('/').pop()}</span>
              ) : (
                <span className="text-amber-400">
                  no wordmark available — the title text is used instead
                </span>
              )}
            </p>
          </div>
        </div>

        {/* offsets */}
        <div className="rounded border border-slate-700 bg-slate-950/60 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-accent">Image position</span>
              <p className="mt-1 text-xs text-slate-500">
                Positive X moves right, positive Y moves down.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                patch({ bg_offset_x: 0, bg_offset_y: 0, logo_offset_x: 0, logo_offset_y: 0 })
              }
              className="btn-ghost shrink-0 text-xs"
            >
              Reset all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {offsetInput('bg_offset_x', 'Background X')}
            {offsetInput('bg_offset_y', 'Background Y')}
            {offsetInput('logo_offset_x', 'Logo X')}
            {offsetInput('logo_offset_y', 'Logo Y')}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => patch({ bg_offset_x: 0, bg_offset_y: 0 })}
              className="btn-ghost flex-1 text-xs"
            >
              Reset background
            </button>
            <button
              type="button"
              onClick={() => patch({ logo_offset_x: 0, logo_offset_y: 0 })}
              className="btn-ghost flex-1 text-xs"
            >
              Reset logo
            </button>
          </div>
        </div>

        <Field label="Translation details">
          <textarea
            value={form.details}
            onChange={(event) => patch({ details: event.target.value })}
            className="form-input h-32 font-medium"
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
          <span className="mb-2 block text-sm font-bold text-accent">
            Pin feedbacks to this project
          </span>

          <div className="max-h-48 space-y-2 overflow-y-auto rounded border border-slate-700 bg-slate-950/60 p-4">
            {reviews.length === 0 ? (
              <p className="text-xs font-bold text-slate-500">No feedbacks available.</p>
            ) : (
              reviews.map((review) => (
                <label
                  key={review.id}
                  className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={form.pinnedReviews.includes(review.id)}
                    onChange={() => togglePinnedReview(review.id)}
                    className="h-4 w-4 accent-accent"
                  />

                  <img
                    src={review.pfp || avatarFallback(review.nickname)}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = avatarFallback(review.nickname);
                    }}
                  />

                  <span className="text-sm font-bold text-white">{review.nickname}</span>

                  <span className="max-w-[200px] truncate text-xs font-medium text-slate-500">
                    “{review.text}”
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-4 border-t border-slate-700 pt-4">
          <button
            type="submit"
            disabled={uploadingBg || uploadingLogo}
            className="btn-primary flex-1"
          >
            {project ? 'Save project' : 'Create project'}
          </button>

          <button type="button" onClick={onCancel} className="btn-ghost flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
