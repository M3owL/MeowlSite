import { useCallback, useEffect, useRef, useState } from 'react';
import Ambient from './components/Ambient';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBanner from './components/ui/ErrorBanner';
import Toast from './components/ui/Toast';
import AboutTab from './tabs/AboutTab';
import ServicesTab from './tabs/ServicesTab';
import PortfolioTab from './tabs/PortfolioTab';
import ReviewsTab from './tabs/ReviewsTab';
import ContactTab from './tabs/ContactTab';
import AdminTab from './tabs/AdminTab';
import LoginModal from './modals/LoginModal';
import InviteCodeModal from './modals/InviteCodeModal';
import GenerateCodeModal from './modals/GenerateCodeModal';
import ReviewFormModal from './modals/ReviewFormModal';
import ProjectFormModal from './modals/ProjectFormModal';
import { getSupabase, describeError } from './lib/supabase';
import { normalizeProject, normalizeReview, normalizeCode } from './lib/normalize';
import { DEFAULT_TAB, TOAST_MS } from './lib/constants';
import { useScrollProgress, useTabTransition } from './lib/motion';

const EMPTY_MODAL = { type: null, data: null };

export default function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [modal, setModal] = useState(EMPTY_MODAL);

  /**
   * Keeps the outgoing tab mounted while it animates away, then swaps in the
   * incoming one. `renderedTab` lags `activeTab` by the exit duration.
   */
  const { rendered: renderedTab, phase } = useTabTransition(activeTab);

  const scrollProgress = useScrollProgress();

  /**
   * Realtime callbacks are registered once and live outside the render cycle,
   * so they would otherwise capture the isAdmin value from the first render.
   * A ref keeps them reading the current value.
   */
  const isAdminRef = useRef(false);
  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  const closeModal = useCallback(() => setModal(EMPTY_MODAL), []);
  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);

  // ---------------------------------------------------------------- loaders

  const loadReviews = useCallback(async (adminView = isAdminRef.current) => {
    const client = getSupabase();
    if (!client) return;

    let query = client.from('reviews').select('*').order('created_at', { ascending: false });
    if (!adminView) query = query.eq('published', true);

    const { data, error: queryError } = await query;
    if (queryError) return setError(describeError(queryError));

    setReviews((data ?? []).map(normalizeReview));
  }, []);

  const loadProjects = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;

    const { data, error: queryError } = await client
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (queryError) return setError(describeError(queryError));

    setProjects((data ?? []).map(normalizeProject));
  }, []);

  const loadInviteCodes = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;

    const { data, error: queryError } = await client
      .from('invite_codes')
      .select('*')
      .eq('used', false)
      .order('created_at', { ascending: false });

    if (queryError) return setError(describeError(queryError));

    setInviteCodes((data ?? []).map(normalizeCode));
  }, []);

  const checkAdmin = useCallback(async (currentSession) => {
    const client = getSupabase();

    if (!client || !currentSession?.user) {
      setIsAdmin(false);
      isAdminRef.current = false;
      return false;
    }

    const { data, error: queryError } = await client
      .from('admin_users')
      .select('user_id')
      .eq('user_id', currentSession.user.id)
      .maybeSingle();

    // A missing admin_users table should not be reported as a hard error --
    // it just means nobody is an admin yet.
    const ok = !queryError && Boolean(data);
    setIsAdmin(ok);
    isAdminRef.current = ok;
    return ok;
  }, []);

  // ------------------------------------------------------------------ boot

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const client = getSupabase();
        if (!client) throw new Error('Could not initialise the Supabase client.');

        const {
          data: { session: current },
        } = await client.auth.getSession();

        if (cancelled) return;
        setSession(current);

        const admin = await checkAdmin(current);
        if (cancelled) return;

        await Promise.all([loadReviews(admin), loadProjects()]);

        if (admin && !cancelled) await loadInviteCodes();
      } catch (bootError) {
        if (!cancelled) setError(describeError(bootError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkAdmin, loadInviteCodes, loadProjects, loadReviews]);

  // --------------------------------------------------------------- realtime

  useEffect(() => {
    const client = getSupabase();
    if (!client) return undefined;

    const channel = client
      .channel('m3owl-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => loadReviews(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => loadProjects(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invite_codes' },
        () => {
          if (isAdminRef.current) loadInviteCodes();
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [loadInviteCodes, loadProjects, loadReviews]);

  /** Keeps the UI in sync when Supabase refreshes or drops the session. */
  useEffect(() => {
    const client = getSupabase();
    if (!client) return undefined;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        isAdminRef.current = false;
        setInviteCodes([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ----------------------------------------------------------------- toast

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  /**
   * A tab switch should start at the top. Reset as soon as the request comes in
   * rather than after the exit animation, so the jump is never visible.
   */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  // --------------------------------------------------------------- actions

  const handleLoginSuccess = async (nextSession) => {
    const client = getSupabase();

    setSession(nextSession);

    const admin = await checkAdmin(nextSession);

    if (!admin) {
      await client?.auth.signOut();
      setError('This account does not have admin privileges.');
      return;
    }

    await Promise.all([loadReviews(true), loadProjects(), loadInviteCodes()]);

    closeModal();
    setActiveTab('admin');
    setToast('Logged in successfully.');
  };

  const logout = async () => {
    await getSupabase()?.auth.signOut();

    setSession(null);
    setIsAdmin(false);
    isAdminRef.current = false;
    setInviteCodes([]);
    setActiveTab(DEFAULT_TAB);
    setToast('Logged out.');
  };

  const saveProject = async (form) => {
    const client = getSupabase();
    if (!client) return;

    const editing = modal.data;

    const payload = {
      title: form.title.trim(),
      steam_url: form.steamLink?.trim() || null,
      bg_url: form.bg_url?.trim() || null,
      logo_url: form.logo_url?.trim() || null,
      details: form.details || '',
      pinned_reviews: form.pinnedReviews || [],
      pinned: Boolean(form.pinned),
      sort_order: Number(form.sort_order) || 0,
      bg_offset_x: Number(form.bg_offset_x) || 0,
      bg_offset_y: Number(form.bg_offset_y) || 0,
      logo_offset_x: Number(form.logo_offset_x) || 0,
      logo_offset_y: Number(form.logo_offset_y) || 0,
    };

    const result = editing
      ? await client.from('projects').update(payload).eq('id', editing.id)
      : await client.from('projects').insert(payload);

    if (result.error) return setError(describeError(result.error));

    await loadProjects();
    closeModal();
    setToast(editing ? 'Project updated.' : 'Project created.');
  };

  // Hidden admin entry: three quick clicks on the bottom-left corner.
  const secretClicks = useRef([]);
  const handleSecretClick = () => {
    const now = Date.now();
    secretClicks.current = secretClicks.current.filter((time) => now - time < 900);
    secretClicks.current.push(now);

    if (secretClicks.current.length >= 3) {
      secretClicks.current = [];
      openModal('login');
    }
  };

  // ------------------------------------------------------------------ view

  return (
    <div className="grain relative flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300]
                   focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-void"
      >
        Skip to content
      </a>

      <Ambient />

      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-accent-3 via-accent to-accent-2"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        onLogout={logout}
      />

      <main id="main" className="relative z-10 flex-grow pb-16 pt-8 sm:pt-12">
        <div className="container-page">
          <ErrorBanner message={error} onDismiss={() => setError('')} />

          {loading ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border border-line-strong" />
                <div className="absolute inset-0 animate-spin-slow rounded-full border-t-2 border-accent" />
              </div>
              <p className="meta">Loading portfolio...</p>
            </div>
          ) : (
            <div
              key={renderedTab}
              id="tab-panel"
              role="tabpanel"
              /*
               * Labelled by the SELECTED tab, not by the mounted one. A tabpanel
               * belongs to the tab that is selected, and assistive tech checks
               * `aria-labelledby` against `aria-selected` -- keeping them in
               * lockstep matters more than the 150ms window where the outgoing
               * content is still painted.
               */
              aria-labelledby={`tab-${activeTab}`}
              tabIndex={-1}
              className={phase === 'exit' ? 'animate-tab-out' : 'animate-tab-in'}
            >
              {renderedTab === 'about' && (
                <AboutTab projects={projects} reviews={reviews} onNavigate={setActiveTab} />
              )}

              {renderedTab === 'services' && <ServicesTab onNavigate={setActiveTab} />}

              {renderedTab === 'portfolio' && (
                <PortfolioTab
                  projects={projects}
                  reviews={reviews}
                  isAdmin={isAdmin}
                  onChanged={loadProjects}
                  onError={setError}
                  onToast={setToast}
                  openProjectModal={(project) => openModal('projectForm', project)}
                />
              )}

              {renderedTab === 'reviews' && (
                <ReviewsTab
                  reviews={reviews}
                  isAdmin={isAdmin}
                  openCodeModal={() => openModal('inviteCode')}
                />
              )}

              {renderedTab === 'contact' && <ContactTab onToast={setToast} />}

              {renderedTab === 'admin' && isAdmin && (
                <AdminTab
                  reviews={reviews}
                  inviteCodes={inviteCodes}
                  reloadReviews={() => loadReviews(true)}
                  reloadCodes={loadInviteCodes}
                  onError={setError}
                  onToast={setToast}
                  openReviewModal={(review) => openModal('reviewForm', review)}
                  openGenerateModal={() => openModal('generateCode')}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={setActiveTab} />

      <div
        aria-hidden="true"
        onClick={handleSecretClick}
        className="fixed bottom-0 left-0 z-[9999] h-7 w-7 cursor-default opacity-0"
      />

      {modal.type === 'login' && (
        <LoginModal onSuccess={handleLoginSuccess} onCancel={closeModal} />
      )}

      {modal.type === 'inviteCode' && (
        <InviteCodeModal
          onClose={closeModal}
          onError={setError}
          onSubmitted={async () => {
            closeModal();
            await loadReviews();
            setToast('Review submitted. Awaiting approval.');
          }}
        />
      )}

      {modal.type === 'generateCode' && (
        <GenerateCodeModal
          onClose={closeModal}
          onError={setError}
          onToast={setToast}
          onCreated={async () => {
            closeModal();
            await loadInviteCodes();
          }}
        />
      )}

      {modal.type === 'reviewForm' && (
        <ReviewFormModal
          review={modal.data}
          onCancel={closeModal}
          onError={setError}
          onSave={async () => {
            const wasEditing = Boolean(modal.data);
            closeModal();
            await loadReviews(true);
            setToast(wasEditing ? 'Review updated.' : 'Review added.');
          }}
        />
      )}

      {modal.type === 'projectForm' && (
        <ProjectFormModal
          project={modal.data}
          reviews={reviews}
          onCancel={closeModal}
          onError={setError}
          onSave={saveProject}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
