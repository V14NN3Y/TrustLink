export default function ToggleSwitch({ enabled, onClick, label, size = 'md' }) {
  const sizes = {
    sm: { track: 'w-8 h-4', circle: 'w-3 h-3', on: 'translate-x-[18px]', off: 'translate-x-0.5' },
    md: { track: 'w-11 h-6', circle: 'w-5 h-5', on: 'translate-x-[22px]', off: 'translate-x-0.5' },
    lg: { track: 'w-14 h-7', circle: 'w-6 h-6', on: 'translate-x-[30px]', off: 'translate-x-0.5' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <button type="button" onClick={onClick}
      className={`relative ${s.track} rounded-full flex-shrink-0 transition-colors cursor-pointer ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
      aria-label={label || 'Toggle'}>
      <span className={`absolute left-0 top-0.5 ${s.circle} bg-white rounded-full shadow transition-transform ${enabled ? s.on : s.off}`} />
    </button>
  );
}
