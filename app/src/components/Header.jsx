import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BRAND, NAV_TABS } from '../lib/constants';
import { useScrolledPast } from '../lib/motion';

/**
 * The id of the element every tab controls. `App.jsx` owns that element.
 */
const PANEL_ID = 'tab-panel';

/**
 * `useLayoutEffect` measures the active indicator before the browser paints, so
 * the pill never flashes at its previous position. The render smoke test uses
 * `renderToStaticMarkup`, where layout effects are a no-op and React warns --
 * hence the isomorphic alias.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Smooth scrolling is opt-out for visitors who asked for less motion. */
function scrollBehavior() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'auto';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/**
 * Site header: brand, availability, tablist, admin actions.
 *
 * The nav is a real tablist (roving tabindex + arrow keys) whose active pill is
 * a single absolutely-positioned element measured from the DOM. On narrow
 * screens the strip scrolls horizontally instead of wrapping, and a gradient
 * fade appears on whichever edge still has content behind it.
 */
export default function Header({ activeTab, onTabChange, isAdmin, onLogout }) {
  const scrolled = useScrolledPast(8);

  const navRef = useRef(null);
  const tabRefs = useRef(new Map());

  const tabs = useMemo(() => {
    const list = NAV_TABS.map((tab) => ({ id: tab.id, label: tab.label }));
    if (isAdmin) list.push({ id: 'admin', label: 'Admin Panel' });
    return list;
  }, [isAdmin]);

  /**
   * A stale `activeTab` (an `admin` that survives a logout) would leave every
   * tab at tabIndex -1, which takes the whole tablist out of the tab order.
   */
  const activeId = tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0]?.id;

  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });
  const [fades, setFades] = useState({ start: false, end: false });

  const measureIndicator = useCallback(() => {
    const nav = navRef.current;
    const node = activeId ? tabRefs.current.get(activeId) : null;
    if (!nav || !node) return;

    const navRect = nav.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    // Content coordinates, not viewport ones: the pill lives inside the strip,
    // so it has to scroll with it.
    const next = {
      left: nodeRect.left - navRect.left + nav.scrollLeft,
      top: nodeRect.top - navRect.top + nav.scrollTop,
      width: nodeRect.width,
      height: nodeRect.height,
      ready: true,
    };

    setIndicator((prev) =>
      prev.ready &&
      prev.left === next.left &&
      prev.top === next.top &&
      prev.width === next.width &&
      prev.height === next.height
        ? prev
        : next,
    );
  }, [activeId]);

  const measureFades = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    const max = nav.scrollWidth - nav.clientWidth;
    const start = nav.scrollLeft > 4;
    const end = max > 4 && nav.scrollLeft < max - 4;

    setFades((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  const measureAll = useCallback(() => {
    measureIndicator();
    measureFades();
  }, [measureIndicator, measureFades]);

  useIsomorphicLayoutEffect(() => {
    measureAll();

    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return undefined;

    // Observing the buttons as well as the strip is what makes this survive a
    // late webfont: the swap changes each label's width without resizing the nav.
    const observer = new ResizeObserver(measureAll);
    observer.observe(nav);
    tabRefs.current.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [measureAll, tabs]);

  /** Webfonts settle after first paint; re-measure once they have. */
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts?.ready) return undefined;

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) measureAll();
    });

    return () => {
      cancelled = true;
    };
  }, [measureAll]);

  /** Keep the active tab inside the visible part of the strip. */
  useEffect(() => {
    const nav = navRef.current;
    const node = activeId ? tabRefs.current.get(activeId) : null;
    if (!nav || !node) return;

    const left = node.offsetLeft;
    const right = left + node.offsetWidth;

    if (left < nav.scrollLeft) {
      nav.scrollTo({ left: left - 8, behavior: scrollBehavior() });
    } else if (right > nav.scrollLeft + nav.clientWidth) {
      nav.scrollTo({ left: right - nav.clientWidth + 8, behavior: scrollBehavior() });
    }
  }, [activeId]);

  /** Arrow keys move between tabs, Home/End jump to the ends. */
  const handleKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === activeId);
    if (index === -1) return;

    let next = index;

    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;

    event.preventDefault();

    const id = tabs[next].id;
    onTabChange?.(id);
    tabRefs.current.get(id)?.focus();
  };

  const { open, label } = BRAND.availability;

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-void/80 backdrop-blur-xl transition-all duration-400 ease-expo ${
        scrolled ? 'border-line-strong shadow-e2' : 'border-line'
      }`}
    >
      <div
        className={`container-page flex flex-wrap items-center gap-x-4 gap-y-1.5 transition-all duration-400 ease-expo ${
          scrolled ? 'py-1.5' : 'py-2.5 lg:py-3.5'
        }`}
      >
        {/* ------------------------------------------------------------ brand */}
        <div className="order-1 flex min-w-0 items-center">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="relative flex h-2.5 w-2.5 shrink-0"
                title={label}
              >
                {open && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-accent animate-pulse-ring"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative h-2.5 w-2.5 rounded-full ${open ? 'bg-accent' : 'bg-faint'}`}
                />
                <span className="sr-only">{label}</span>
              </span>

              <h1 className="truncate font-display text-h3 leading-tight text-ink">{BRAND.name}</h1>
            </div>

            <p className="hidden truncate text-caption text-faint sm:block">{BRAND.role}</p>
          </div>
        </div>

        {/* ----------------------------------------------------------- actions */}
        <div className="order-2 ml-auto flex shrink-0 items-center gap-2 lg:order-3 lg:ml-0">
          {isAdmin && (
            <button type="button" onClick={onLogout} className="btn-danger">
              Logout
            </button>
          )}
        </div>

        {/* --------------------------------------------------------------- nav */}
        <div className="order-3 w-full min-w-0 lg:order-2 lg:w-auto lg:flex-1">
          <div className="relative">
            <nav
              ref={navRef}
              role="tablist"
              aria-label="Sections"
              aria-orientation="horizontal"
              onKeyDown={handleKeyDown}
              onScroll={measureFades}
              className="tab-strip relative"
            >
              {/*
                Sits behind the buttons (they are `relative`, so they paint on
                top) and slides between them.
              */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 rounded-lg border border-accent/30 bg-accent/10 transition-[transform,width] duration-400 ease-expo"
                style={{
                  width: `${indicator.width}px`,
                  height: `${indicator.height}px`,
                  transform: `translate(${indicator.left}px, ${indicator.top}px)`,
                  opacity: indicator.ready ? 1 : 0,
                }}
              />

              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  ref={(node) => {
                    if (node) tabRefs.current.set(tab.id, node);
                    else tabRefs.current.delete(tab.id);
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={tab.id === activeId}
                  aria-controls={PANEL_ID}
                  tabIndex={tab.id === activeId ? 0 : -1}
                  onClick={() => onTabChange?.(tab.id)}
                  className="tab-item"
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {fades.start && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-void to-transparent"
              />
            )}

            {fades.end && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-void to-transparent"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
