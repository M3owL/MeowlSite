import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Shared motion primitives.
 *
 * Deliberately dependency-free: no framer-motion, no GSAP, no
 * react-transition-group. The bundle budget is a feature of this project, and
 * CSS transitions plus IntersectionObserver cover everything the design needs.
 *
 * Every hook here respects `prefers-reduced-motion` -- either by skipping the
 * animation outright or by settling on the final value immediately.
 */

/** True when the visitor asked the OS to reduce motion. SSR-safe. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Observes a node and reports when it enters the viewport.
 * Returns `[ref, inView]`. Falls back to "always in view" where
 * IntersectionObserver is unavailable, so content is never hidden.
 *
 * The threshold is deliberately low. At 0.15 a tall section had to be a sixth
 * of the way on screen before it faded in, which reads as content missing
 * rather than content arriving.
 */
export function useInView({ threshold = 0.05, rootMargin = '0px 0px -4% 0px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/**
 * Cross-fades tab content.
 *
 * Returns the key that should currently be *rendered* plus the phase to render
 * it in. During `exit` the outgoing key is still returned, so React keeps the
 * old subtree mounted while it animates away; only then does the key flip and
 * the incoming content mount with the `enter` animation.
 */
export function useTabTransition(activeKey, { exitMs = 150 } = {}) {
  const reduced = usePrefersReducedMotion();
  const [rendered, setRendered] = useState(activeKey);
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    if (activeKey === rendered) return undefined;

    if (reduced) {
      setRendered(activeKey);
      setPhase('enter');
      return undefined;
    }

    setPhase('exit');
    const timer = setTimeout(() => {
      setRendered(activeKey);
      setPhase('enter');
    }, exitMs);

    return () => clearTimeout(timer);
  }, [activeKey, rendered, exitMs, reduced]);

  return { rendered, phase };
}

/** Counts from 0 to `target` once `active` flips true. */
export function useCountUp(target, active, { duration = 1400, decimals = 0 } = {}) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (!active) return undefined;

    const to = Number(target) || 0;

    if (reduced || duration <= 0 || typeof requestAnimationFrame === 'undefined') {
      setValue(to);
      return undefined;
    }

    const started = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart

      if (progress < 1) {
        setValue(to * eased);
        frame.current = requestAnimationFrame(tick);
      } else {
        setValue(to);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, active, duration, reduced]);

  return decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value);
}

/** Document scroll progress, 0 -> 1. rAF-throttled. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

/** True once the page has scrolled past `threshold` px. rAF-throttled. */
export function useScrolledPast(threshold = 12) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      setPast(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return past;
}

/**
 * Feeds cursor position into `--mx` / `--my` for the `.spotlight` utility.
 * Spread the returned handlers onto the element.
 */
export function useSpotlight() {
  const onMouseMove = useCallback((event) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    element.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }, []);

  return { onMouseMove };
}

/**
 * `style` object that staggers a `.reveal` element inside a group.
 * The per-step delay (70ms) is defined in index.css, not here.
 */
export function stagger(index) {
  return { '--i': Math.max(0, Number(index) || 0) };
}
