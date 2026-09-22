import { cloneElement, isValidElement, useId } from 'react';

const CONTROLS = new Set(['input', 'select', 'textarea']);

/**
 * Labelled form field.
 *
 * The label is wired with `htmlFor` and the hint with `aria-describedby`
 * whenever the child is a bare form control, which is the case everywhere in
 * this app. A child that is a layout wrapper (an input plus a button in a flex
 * row, say) cannot carry an injected id without breaking the wrapper, so those
 * fall back to an implicit wrapping `<label>` -- same association, just not
 * explicit.
 *
 * Prop shape is unchanged: `label`, `hint`, `children`, plus an optional `id`
 * when the caller needs to know the control's id itself.
 */
export default function Field({ id, label, hint, children }) {
  const reactId = useId();
  const fieldId = id || `field-${reactId}`;
  const hintId = `${fieldId}-hint`;

  const only = isValidElement(children) ? children : null;
  const isControl =
    Boolean(only) && typeof only.type === 'string' && CONTROLS.has(only.type);

  if (!isControl) {
    return (
      <label className="block">
        <span className="form-label">{label}</span>
        {children}
        {hint && (
          <span id={hintId} className="form-hint">
            {hint}
          </span>
        )}
      </label>
    );
  }

  const describedBy = [hint ? hintId : null, only.props['aria-describedby']]
    .filter(Boolean)
    .join(' ');

  const controlId = only.props.id || fieldId;

  return (
    <div className="block">
      <label htmlFor={controlId} className="form-label">
        {label}
      </label>

      {cloneElement(only, {
        id: controlId,
        'aria-describedby': describedBy || undefined,
      })}

      {hint && (
        <span id={hintId} className="form-hint">
          {hint}
        </span>
      )}
    </div>
  );
}
