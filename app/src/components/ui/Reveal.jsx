import { stagger, useInView } from '../../lib/motion';

/**
 * Literal class names on purpose.
 *
 * Tailwind scans source text, so a template string like `reveal-${variant}`
 * would never match and every variant class would be tree-shaken away. Keeping
 * the full names here is what makes them survive the build.
 */
const VARIANTS = {
  up: '',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
  blur: 'reveal-blur',
};

/**
 * Scroll-triggered reveal.
 *
 * Renders as `as` (default `div`) and adds the `.reveal` utilities, flipping to
 * `is-visible` the first time it enters the viewport. Use `index` inside a group
 * to stagger siblings, or `delay` for a one-off offset.
 *
 *   <Reveal index={i} as="article" className="card">...</Reveal>
 *
 * Because it renders the element itself, it can be the grid/flex child -- it
 * does not add an extra wrapper level.
 */
export default function Reveal({
  as: Tag = 'div',
  variant = 'up',
  index,
  delay,
  className = '',
  style,
  children,
  ...rest
}) {
  const [ref, inView] = useInView();

  const variantClass = VARIANTS[variant] ?? '';

  const composed = { ...style };

  if (index !== undefined && index !== null) {
    Object.assign(composed, stagger(index));
  } else if (delay) {
    composed.transitionDelay = `${delay}ms`;
  }

  return (
    <Tag
      ref={ref}
      className={['reveal', variantClass, inView ? 'is-visible' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={composed}
      {...rest}
    >
      {children}
    </Tag>
  );
}
