export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="glass fixed bottom-5 right-5 z-[300] rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200 shadow-2xl"
    >
      {message}
    </div>
  );
}
