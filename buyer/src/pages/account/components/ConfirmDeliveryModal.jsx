import { useState } from 'react';
import { useDeliveryVideos } from '@/hooks/useDeliveryVideos';
import VideoRecorder from './VideoRecorder';
import { formatPrice } from '@/utils/format';
export default function ConfirmDeliveryModal({ order, onClose, onConfirmed, onOpenDispute }) {
  const { confirmDeliveryWithVideo, uploading } = useDeliveryVideos();
  const [step, setStep] = useState(1);
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [error, setError] = useState(null);
  const [confirmationChoice, setConfirmationChoice] = useState(null); // 'ok' ou 'defective'
  const [defectReason, setDefectReason] = useState('');
  const handleVideoRecorded = (filePath) => {
    setVideoFilePath(filePath);
    setStep(3);
  };
  const handleConfirm = async (isDefective, reason = '') => {
    setError(null);
    try {
      if (isDefective) {
        // Ouvrir un litige avec la vidéo
        onClose();
        onOpenDispute?.(order, videoFilePath, reason);
      } else {
        // Confirmer normalement
        await confirmDeliveryWithVideo({
          orderId: order.id,
          videoFilePath,
          isDefective: false,
        });
        onConfirmed?.();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la confirmation. Réessayez.');
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ border: '1px solid #E5E7EB' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Confirmer la réception</h3>
            <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>Commande #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-close-line text-lg" style={{ color: '#6B7280' }}></i>
          </button>
        </div>
        {error && (
          <div className="mx-5 mt-3 p-3 rounded-lg text-sm font-inter" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            {error}
          </div>
        )}
        {/* Steps */}
        <div className="flex items-center px-5 py-3 gap-2 border-b border-gray-50">
          {['Instructions', 'Vidéo', 'Confirmation'].map((label, idx) => {
            const s = idx + 1;
            const done = step > s;
            const active = step === s;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-green-500 text-white' : active ? 'bg-[#125C8D] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <i className="ri-check-line"></i> : s}
                </div>
                <span className={`text-xs font-poppins ${active ? 'font-semibold text-[#125C8D]' : 'text-gray-400'}`}>{label}</span>
                {idx < 2 && <i className="ri-arrow-right-s-line text-gray-300"></i>}
              </div>
            );
          })}
        </div>
        <div className="p-5">
          {/* Étape 1 : Instructions */}
          {step === 1 && (
            <div>
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#FFF3EC', border: '1px solid #FFD0B0' }}>
                <div className="flex items-start gap-2">
                  <i className="ri-shield-check-line text-sm mt-0.5 flex-shrink-0" style={{ color: '#D97706' }}></i>
                  <div>
                    <p className="text-sm font-poppins font-semibold" style={{ color: '#92400E' }}>Vidéo obligatoire — Core TrustLink</p>
                    <p className="text-xs font-inter mt-1 leading-relaxed" style={{ color: '#92400E' }}>
                      Pour protéger buyers et sellers, vous devez filmer l&apos;ouverture complète et ininterrompue de votre colis.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {[
                  'Filmez du début à la fin sans coupure',
                  'Montrez bien l\'état du produit et l\'emballage',
                  'Assurez-vous que le produit est visible et net',
                  'Cette preuve est obligatoire pour libérer le paiement du vendeur',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-inter" style={{ color: '#6B7280' }}>
                    <i className="ri-check-line flex-shrink-0" style={{ color: '#16A34A' }}></i>
                    {item}
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-3 mb-5" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-exchange-funds-line text-sm" style={{ color: '#125C8D' }}></i>
                  <span className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>{formatPrice(order.total)}</span>
                </div>
                <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>
                  {order.items.length} article{order.items.length > 1 ? 's' : ''} · Livraison effectuée
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 text-white font-poppins font-bold rounded-full transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: '#125C8D' }}
              >
                Démarrer l&apos;enregistrement
              </button>
            </div>
          )}
          {/* Étape 2 : Vidéo */}
          {step === 2 && (
            <div>
              <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                <div className="flex items-start gap-2">
                  <i className="ri-information-line text-sm mt-0.5 flex-shrink-0" style={{ color: '#D97706' }}></i>
                  <p className="text-xs font-inter leading-relaxed" style={{ color: '#92400E' }}>
                  <strong>Important :</strong> filmez l&apos;ouverture complète et ininterrompue du colis.
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <VideoRecorder orderId={order.id} onRecorded={handleVideoRecorded} />
              </div>
              <button
                onClick={() => setStep(1)}
                className="w-full py-2.5 text-sm font-poppins font-medium rounded-full border transition-colors hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
              >
                Retour aux instructions
              </button>
            </div>
          )}
          {/* Étape 3 : Déclaration */}
          {step === 3 && (
            <div>
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div className="flex items-start gap-2">
                  <i className="ri-check-double-line text-sm mt-0.5 flex-shrink-0" style={{ color: '#16A34A' }}></i>
                  <div>
                    <p className="text-sm font-poppins font-semibold" style={{ color: '#166534' }}>Vidéo enregistrée avec succès</p>
                    <p className="text-xs font-inter mt-1" style={{ color: '#166534' }}>
                      Vidéo envoyée et prête pour validation. Veuillez maintenant déclarer l'état du produit.
                    </p>
                  </div>
                </div>
              </div>
              {videoFilePath && (
                <div className="mb-4 rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center" style={{ height: '200px' }}>
                  <p className="text-white text-sm font-inter">Vidéo uploadée vers Supabase Storage ✓</p>
                </div>
              )}
              <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                <p className="text-xs font-inter mb-3" style={{ color: '#374151' }}>
                  <strong>Déclaration :</strong> Le produit reçu est-il conforme à la commande ?
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setConfirmationChoice('ok')}
                    className={`w-full p-3 text-sm font-poppins font-medium rounded-lg border transition-all cursor-pointer ${
                      confirmationChoice === 'ok'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="ri-checkbox-circle-line mr-2"></i> Produit conforme — Tout va bien
                  </button>
                  <button
                    onClick={() => setConfirmationChoice('defective')}
                    className={`w-full p-3 text-sm font-poppins font-medium rounded-lg border transition-all cursor-pointer ${
                      confirmationChoice === 'defective'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="ri-error-warning-line mr-2"></i> Produit défectueux / Problème
                  </button>
                </div>
                {confirmationChoice === 'defective' && (
                  <div className="mt-3">
                    <label className="block text-xs font-poppins font-medium mb-1.5" style={{ color: '#374151' }}>Expliquez le problème :</label>
                    <textarea
                      value={defectReason}
                      onChange={(e) => setDefectReason(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-inter outline-none focus:border-[#125C8D]"
                      rows="3"
                      placeholder="Décrivez le défaut ou le problème rencontré..."
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleConfirm(confirmationChoice !== 'ok', defectReason)}
                  disabled={uploading || !confirmationChoice || (confirmationChoice === 'defective' && !defectReason.trim())}
                  className={`w-full py-3 font-poppins font-bold rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer whitespace-nowrap ${
                    confirmationChoice === 'defective' ? 'text-white' : 'text-white'
                  }`}
                  style={{ backgroundColor: confirmationChoice === 'defective' ? '#DC2626' : '#16A34A' }}
                >
                  {uploading ? 'Envoi en cours...' : confirmationChoice === 'defective' ? 'Ouvrir un litige' : 'Confirmer la réception'}
                </button>
                <button
                  onClick={() => { setVideoFilePath(null); setConfirmationChoice(null); setDefectReason(''); setStep(2); }}
                  disabled={uploading}
                  className="w-full py-2.5 text-sm font-poppins font-medium rounded-full border transition-colors hover:bg-gray-50 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
                >
                  Refaire la vidéo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
