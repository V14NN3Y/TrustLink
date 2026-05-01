import { useState } from 'react';
import { useDisputes } from '@/hooks/useDisputes';
import VideoRecorder from './VideoRecorder';
import { formatPrice } from '@/utils/format';
const REASONS = [
  'Produit non conforme à la description',
  'Produit défectueux / endommagé',
  'Produit counterfeit / faux',
  'Quantité incorrecte',
  'Article manquant dans le colis',
  'Autre',
];
export default function DisputeModal({ order, onClose, onSuccess }) {
  const { openDispute, submitting } = useDisputes();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [videoBlob, setVideoBlob] = useState(null);
  const [error, setError] = useState(null);
  const handleSubmit = async () => {
    setError(null);
    const fullReason = reason === 'Autre' ? customReason.trim() : reason;
    if (!fullReason) { setError('Veuillez sélectionner un motif.'); return; }
    if (!videoBlob) { setError('La vidéo de déballage est obligatoire.'); return; }
    try {
      await openDispute({ orderId: order.id, reason: fullReason, videoBlob });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ouverture du litige.');
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ border: '1px solid #E5E7EB' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Ouvrir un litige</h3>
            <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>Commande #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-close-line text-lg" style={{ color: '#6B7280' }}></i>
          </button>
        </div>
        {/* Steps */}
        <div className="flex items-center px-5 py-3 gap-2 border-b border-gray-50">
          {['Motif', 'Vidéo', 'Confirmation'].map((label, idx) => {
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
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-inter" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              {error}
            </div>
          )}
          {/* Étape 1 : Motif */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); if (reason) setStep(2); }}>
              <p className="text-sm font-inter mb-3" style={{ color: '#6B7280' }}>Pourquoi ouvrez-vous un litige ?</p>
              <div className="space-y-2 mb-4">
                {REASONS.map((r) => (
                  <label key={r} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50"
                    style={{ borderColor: reason === r ? '#125C8D' : '#E5E7EB', backgroundColor: reason === r ? '#E1F0F9' : '#fff' }}>
                    <input type="radio" name="reason" value={r} checked={reason === r} onChange={(e) => setReason(e.target.value)} className="sr-only" />
                    <span className="text-sm font-inter" style={{ color: '#374151' }}>{r}</span>
                    {reason === r && <i className="ri-check-line ml-auto" style={{ color: '#125C8D' }}></i>}
                  </label>
                ))}
              </div>
              {reason === 'Autre' && (
                <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Décrivez le problème..." rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none mb-4 resize-none"
                  style={{ color: '#111827' }} />
              )}
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-poppins font-medium rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer" style={{ color: '#374151' }}>Annuler</button>
                <button type="submit" disabled={!reason} className="flex-1 py-2.5 text-sm font-poppins font-semibold rounded-lg text-white disabled:opacity-50 cursor-pointer" style={{ backgroundColor: '#125C8D' }}>Continuer →</button>
              </div>
            </form>
          )}
          {/* Étape 2 : Vidéo */}
          {step === 2 && (
            <div>
              <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                <div className="flex items-start gap-2">
                  <i className="ri-information-line text-sm mt-0.5 flex-shrink-0" style={{ color: '#D97706' }}></i>
                  <p className="text-xs font-inter leading-relaxed" style={{ color: '#92400E' }}>
                    <strong>Vidéo obligatoire :</strong> filmez l'ouverture complète du colis <strong>sans coupure</strong>. Sans cette preuve, le litige sera rejeté.
                  </p>
                </div>
              </div>
              <VideoRecorder onVideoRecorded={setVideoBlob} />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 text-sm font-poppins font-medium rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer" style={{ color: '#374151' }}>← Retour</button>
                <button onClick={() => setStep(3)} disabled={!videoBlob} className="flex-1 py-2.5 text-sm font-poppins font-semibold rounded-lg text-white disabled:opacity-50 cursor-pointer" style={{ backgroundColor: '#125C8D' }}>Continuer →</button>
              </div>
            </div>
          )}
          {/* Étape 3 : Confirmation */}
          {step === 3 && (
            <div>
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                <p className="text-xs font-poppins font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Récapitulatif</p>
                <div className="space-y-2 text-sm font-inter">
                  <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Commande</span><span className="font-semibold" style={{ color: '#111827' }}>#{order.id.slice(0,8)}</span></div>
                  <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Motif</span><span className="font-semibold" style={{ color: '#111827' }}>{reason === 'Autre' ? customReason : reason}</span></div>
                  <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Vidéo</span><span className="flex items-center gap-1" style={{ color: '#15803D' }}><i className="ri-check-line"></i> Enregistrée</span></div>
                  <div className="flex justify-between"><span style={{ color: '#6B7280' }}>Montant</span><span className="font-semibold" style={{ color: '#125C8D' }}>{formatPrice(order.total)}</span></div>
                </div>
              </div>
              <p className="text-xs font-inter mb-4 leading-relaxed" style={{ color: '#6B7280' }}>
                En confirmant, vous attestez que les informations sont exactes. Notre équipe examine le dossier sous <strong>48–72h</strong>.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 text-sm font-poppins font-medium rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer" style={{ color: '#374151' }}>← Retour</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-poppins font-semibold rounded-lg text-white disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: '#DC2626' }}>
                  {submitting ? 'Envoi en cours...' : 'Confirmer le litige'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
