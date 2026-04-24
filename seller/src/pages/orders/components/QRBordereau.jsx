const MiniQR = ({ code, size = 5 }) => {
  const grid = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      const hash = (r * 7 + c + code.charCodeAt(r % code.length)) % 3;
      return hash !== 2;
    })
  );

  const cellSize = size;
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-200 inline-block">
      <div className="flex flex-col gap-0.5">
        {grid.map((row, r) => (
          <div key={r} className="flex gap-0.5">
            {row.map((filled, c) => (
              <div
                key={c}
                className={`rounded-sm ${filled ? "bg-gray-900" : "bg-white border border-gray-100"}`}
                style={{ width: `${cellSize * 4}px`, height: `${cellSize * 4}px` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function QRBordereau({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Bordereau QR
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="flex justify-center mb-3">
          <MiniQR code={order.qr_code} size={5} />
        </div>

        <p className="font-mono text-sm font-bold text-gray-900 mb-1">{order.id}</p>
        <p className="text-xs text-gray-500 mb-1">{order.product}</p>
        <p className="text-xs text-gray-400 mb-4">{order.buyer} — {order.buyer_city}</p>

        <div className="flex gap-2">
          <button
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
            onClick={onClose}
          >
            Fermer
          </button>
          <button
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors"
            style={{ backgroundColor: "#125C8D" }}
          >
            <i className="ri-download-line mr-1.5"></i>Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}
