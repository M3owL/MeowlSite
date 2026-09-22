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

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ErrorNote({ children }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-caption text-red-200"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mt-px h-4 w-4 shrink-0 text-red-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5" />
        <path d="M12 16h.01" />
      </svg>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
        <h3 className="font-display text-caption font-semibold uppercase tracking-[0.14em] text-accent">
          {title}
        </h3>
        {hint && <span className="shrink-0 text-caption text-faint">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

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
      <span className="w-14 shrink-0 text-caption font-medium text-muted">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input px-2.5 py-1.5 text-caption"
      />
    </label>
  );
}

/** Upload tile with an inline thumbnail, kept short so the form stays compact. */
function ImageSlot({ label, hint, url, busy, onPick, onClear }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2/50 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="block text-caption font-semibold text-accent">{label}</span>
          <p className="truncate text-caption text-faint">{hint}</p>
        </div>

        {url && (
          <button type="button" onClick={onClear} className="btn-danger shrink-0">
            Clear
          </button>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(event) => onPick(event.target.files?.[0])}
        className="block w-full cursor-pointer text-caption text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-3 file:px-3 file:py-1.5 file:text-caption file:font-semibold file:text-ink hover:file:bg-surface-3/80 disabled:cursor-not-allowed disabled:opacity-50"
      />

      {busy && <p className="mt-1.5 text-caption text-faint">Uploading...</p>}

      {url && !busy && (
        <div className="mt-2 flex h-16 items-center justify-center overflow-hidden rounded-md border border-line bg-void">
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    try {
      apply(await uploadPublicFile(file, prefix, { maxBytes }));
    } catch (uploadError) {
      setError(uploadError.message);
      onError(uploadError.message);
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

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      const message = 'Title is required.';
      setError(message);
      return onError(message);
    }
    setError('');
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () =>
    patch({ bg_offset_x: 0, bg_offset_y: 0, logo_offset_x: 0, logo_offset_y: 0 });

  const uploading = uploadingBg || uploadingLogo;
  const busy = saving || uploading;

  return (
    <Modal
      title={project ? 'Edit project' : 'New project'}
      subtitle="Paste a Steam store link and the artwork is pulled in automatically."
      onClose={onCancel}
      maxWidth="max-w-5xl"
      footer={
        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="submit"
            form="project-form"
            disabled={busy}
            className="btn-primary flex-1"
          >
            {busy && <Spinner />}
            {saving
              ? project
                ? 'Saving...'
                : 'Creating...'
              : project
                ? 'Save project'
                : 'Create project'}
          </button>

          <button type="button" onClick={onCancel} className="btn-ghost flex-1">
            Cancel
          </button>
        </div>
      }
    >
      <form id="project-form" onSubmit={submit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* ------------------------------------------------ left column */}
          <div className="space-y-5">
            <Section title="Project">
              <div className="space-y-4">
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
                        className="btn-ghost shrink-0 px-3 py-2 text-caption"
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
                    <span className="mt-2 inline-flex items-start gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-caption font-medium text-accent">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="mt-px h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M8 12.5l2.5 2.5L16 9.5" />
                      </svg>
                      <span>Steam app {appId} detected - artwork loads automatically</span>
                    </span>
                  )}

                  {steamLinkBroken && (
                    <span className="mt-2 inline-flex items-start gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-caption font-medium text-amber-200">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="mt-px h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 4.5L21 19.5H3L12 4.5z" />
                        <path d="M12 10v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      <span>Could not read an app id from that link. Upload images below instead.</span>
                    </span>
                  )}
                </Field>
              </div>
            </Section>

            <Section title="Artwork" hint="Optional overrides">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ImageSlot
                  label="Background"
                  hint="Overrides the Steam hero"
                  url={form.bg_url}
                  busy={uploadingBg}
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
                  onClear={() => patch({ logo_url: '' })}
                  onPick={(file) =>
                    uploadImage(file, 'project-logo', BUCKET_LIMITS.logo, setUploadingLogo, (url) =>
                      patch({ logo_url: url }),
                    )
                  }
                />
              </div>
            </Section>

            <Section title="Details">
              <div className="space-y-4">
                <Field label="Translation details">
                  <textarea
                    value={form.details}
                    onChange={(event) => patch({ details: event.target.value })}
                    className="form-input h-20"
                  />
                </Field>

                <label className="flex cursor-pointer select-none items-center gap-3 rounded-lg border border-line bg-surface-2/40 px-3 py-2.5 text-caption font-medium text-muted transition-colors duration-250 ease-expo hover:border-line-strong hover:text-ink">
                  <input
                    type="checkbox"
                    checked={form.pinned}
                    onChange={(event) => patch({ pinned: event.target.checked })}
                    className="h-4 w-4 shrink-0 rounded accent-accent"
                  />
                  Pin project to the top
                </label>
              </div>
            </Section>

            <Section title="Pinned feedback" hint={`${form.pinnedReviews.length} selected`}>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-line bg-void/40 p-2">
                {reviews.length === 0 ? (
                  <p className="px-2 py-2 text-caption text-faint">No feedbacks available yet.</p>
                ) : (
                  reviews.map((review) => (
                    <label
                      key={review.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors duration-250 ease-expo hover:bg-white/[0.05]"
                    >
                      <input
                        type="checkbox"
                        checked={form.pinnedReviews.includes(review.id)}
                        onChange={() => togglePinnedReview(review.id)}
                        className="h-4 w-4 shrink-0 accent-accent"
                      />

                      <img
                        src={review.pfp || avatarFallback(review.nickname)}
                        alt=""
                        className="h-6 w-6 shrink-0 rounded-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = avatarFallback(review.nickname);
                        }}
                      />

                      <span className="shrink-0 text-caption font-semibold text-ink">
                        {review.nickname}
                      </span>

                      <span className="truncate text-caption text-faint">"{review.text}"</span>
                    </label>
                  ))
                )}
              </div>
            </Section>
          </div>

          {/* ----------------------------------------------- right column */}
          <div className="space-y-5">
            <div className="rounded-xl border border-line bg-surface-2/50 p-3.5 shadow-e1">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-accent">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Live preview
                </span>

                {form.bg_url ? (
                  <span className="chip-accent">CUSTOM</span>
                ) : appId ? (
                  <span className="chip">FROM STEAM</span>
                ) : (
                  <span className="chip border-amber-500/40 bg-amber-500/10 text-amber-300">
                    NO ARTWORK
                  </span>
                )}
              </div>

              <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-void">
                <SteamImage
                  candidates={bannerCandidates}
                  fallback={
                    <div className="h-full w-full bg-gradient-to-br from-surface-2 via-surface to-void" />
                  }
                  alt=""
                  eager
                  onResolved={setResolvedBanner}
                  className="h-full w-full object-cover opacity-90"
                  style={{
                    objectPosition: `calc(50% + ${Number(form.bg_offset_x) || 0}px) calc(50% + ${Number(form.bg_offset_y) || 0}px)`,
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-transparent" />

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

                  <h3 className="truncate font-display text-body-lg font-semibold leading-tight text-ink">
                    {form.title || 'Project title'}
                  </h3>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                <li className="flex items-start gap-2 text-caption">
                  <span className="w-24 shrink-0 text-faint">Background</span>
                  {resolvedBanner ? (
                    <span className="min-w-0 truncate font-mono text-accent-2">
                      {resolvedBanner.split('/').pop()}
                    </span>
                  ) : (
                    <span className="text-amber-300">none - upload one</span>
                  )}
                </li>

                <li className="flex items-start gap-2 text-caption">
                  <span className="w-24 shrink-0 text-faint">Logo</span>
                  {resolvedLogo ? (
                    <span className="min-w-0 truncate font-mono text-accent-2">
                      {resolvedLogo.split('/').pop()}
                    </span>
                  ) : (
                    <span className="text-amber-300">none - title text is used</span>
                  )}
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/50 p-3.5 shadow-e1">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-accent">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v18" />
                    <path d="M3 12h18" />
                    <path d="M8 7l4-4 4 4" />
                    <path d="M8 17l4 4 4-4" />
                  </svg>
                  Image position
                </span>

                <button type="button" onClick={resetAll} className="btn-quiet">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 5v5h5" />
                    <path d="M4.5 13a8 8 0 1 0 2-6" />
                  </svg>
                  Reset all
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
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

              <p className="mt-2.5 text-caption text-faint">
                Positive X moves right, positive Y moves down.
              </p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
