import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useLocale } from "@/lib/i18n";

export default function QRBordereau({ order, onClose }) {
  const { t } = useLocale();
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!order?.order_id) return;
    QRCode.toDataURL(order.order_id, {
      width: 160,
      margin: 2,
      color: { dark: "#111827", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [order?.order_id]);

  if (!order) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `bordereau-${order.id}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {t('orders.qrModalTitle')}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="flex justify-center mb-3">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR ${order.id}`} className="w-40 h-40 rounded-xl border border-gray-100" />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-[#125C8D] rounded-full animate-spin" />
            </div>
          )}
        </div>

        <p className="font-mono text-sm font-bold text-gray-900 mb-1">{order.id}</p>
        <p className="text-xs text-gray-500 mb-1">{order.items?.[0]?.product || "—"}</p>
        <p className="text-xs text-gray-400 mb-4">{order.buyer || "—"} — {order.buyer_city || "—"}</p>

        <div className="flex gap-2">
          <button
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
            onClick={onClose}
          >
            {t('common.close')}
          </button>
          <button
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors disabled:opacity-40"
            style={{ backgroundColor: "#125C8D" }}
            onClick={handleDownload}
            disabled={!qrDataUrl}
          >
            <i className="ri-download-line mr-1.5"></i>{t('common.download')}
          </button>
        </div>
      </div>
    </div>
  );
}
