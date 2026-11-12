import { TRACKING_STEPS, trackingIndex } from '@/lib/tracking';

export default function TrackingBar({ order }) {
  const current = trackingIndex(order.status);
  const terminal = ['disputed', 'cancelled', 'refunded'].includes(order.status);
  if (terminal) return null;

  return (
    <div className="mb-4">
      <ol className="flex items-start">
        {TRACKING_STEPS.map((step, idx) => {
          const done = idx <= current;
          const active = idx === current;
          return (
            <li key={step.key} className="flex-1 relative flex flex-col items-center text-center">
              {idx > 0 && (
                <span className="absolute top-4 right-1/2 w-full h-0.5" style={{ backgroundColor: idx <= current ? '#10B981' : '#E5E7EB' }} />
              )}
              <span
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm ${done ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                style={done ? { backgroundColor: active ? '#FF6A00' : '#10B981' } : {}}
              >
                <i className={step.icon} />
              </span>
              <span className={`mt-1.5 text-[11px] font-poppins font-semibold leading-tight ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
              {active && <span className="text-[10px] font-inter text-[#FF6A00]">En cours</span>}
            </li>
          );
        })}
      </ol>

      {current >= 1 && (
        <div className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
          {order.inspectionPhotoUrl ? (
            <>
              <a href={order.inspectionPhotoUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <img src={order.inspectionPhotoUrl} alt="Photo d'inspection à Lagos" className="w-14 h-14 rounded-lg object-cover" />
              </a>
              <div>
                <p className="text-xs font-poppins font-semibold text-gray-800">Photo d'inspection à Lagos</p>
                <p className="text-[11px] font-inter text-gray-500">
                  {order.inspectedAt ? `Prise le ${new Date(order.inspectedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : 'Contrôle effectué avant expédition'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs font-inter text-gray-500 flex items-center gap-2">
              <i className="ri-camera-lens-line" /> La photo d'inspection à Lagos sera disponible ici dès le contrôle effectué.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
