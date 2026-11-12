import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createSourcingRequest, previewSourcingLink, isPreviewSupported } from '@/lib/supabase/sourcing';
import { useCurrencyContext } from '@/lib/CurrencyContext';
import { PriceDetails } from '@/components/feature/PriceBreakdown';

const isValidUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function SourcingPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ url: '', title: '', quantity: 1, budget: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const { rate } = useCurrencyContext();
  const [preview, setPreview] = useState(null);
  const [previewState, setPreviewState] = useState('idle'); // idle | loading | ok | error | unsupported
  const lastPreviewUrl = useRef('');
  const previewSeq = useRef(0);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Aperçu automatique au moment où le champ « lien » perd le focus
  const loadPreview = async () => {
    const url = form.url.trim();
    if (!isValidUrl(url) || url === lastPreviewUrl.current) return;
    lastPreviewUrl.current = url;
    if (!isPreviewSupported(url)) { setPreview(null); setPreviewState('unsupported'); return; }
    const seq = ++previewSeq.current;
    setPreviewState('loading');
    try {
      const data = await previewSourcingLink(url);
      if (seq !== previewSeq.current) return; // un lien plus récent a été saisi
      setPreview(data);
      setPreviewState('ok');
      setForm((f) => (f.title.trim() ? f : { ...f, title: data.title || '' }));
    } catch {
      if (seq !== previewSeq.current) return;
      setPreview(null);
      setPreviewState('error');
    }
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, url: value }));
    if (value.trim() !== lastPreviewUrl.current) { previewSeq.current++; lastPreviewUrl.current = ''; setPreview(null); setPreviewState('idle'); }
  };

  const priceXof = preview?.price && preview.currency === 'NGN' && rate ? Math.round(preview.price * rate) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!isValidUrl(form.url.trim())) { setError("Collez un lien valide commençant par http:// ou https://."); return; }
    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || qty < 1) { setError('La quantité doit être un entier supérieur ou égal à 1.'); return; }
    setSubmitting(true);
    try {
      await createSourcingRequest({
        buyerId: user?.id,
        productUrl: form.url.trim(),
        title: form.title.trim(),
        quantity: qty,
        budgetXof: form.budget ? Number(form.budget) : null,
        notes: form.notes.trim(),
        sourcePriceNgn: preview?.currency === 'NGN' ? preview.price : null,
        sourceImageUrl: preview?.image_url || null,
      });
      setDone(true);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi de la demande.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-3 text-base md:text-sm md:py-2.5 font-inter outline-none focus:border-[#125C8D]';
  const labelCls = 'block text-xs font-poppins font-semibold text-gray-600 mb-1';

  if (done) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-32 md:pt-28 pb-16 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-line text-2xl" />
        </div>
        <h1 className="text-xl font-poppins font-bold text-gray-900 mb-2">Demande envoyée</h1>
        <p className="text-sm font-inter text-gray-600 mb-6">
          Notre équipe vérifie le produit et vous répond avec un prix tout compris (article + transport/douane + séquestre).
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => { setForm({ url: '', title: '', quantity: 1, budget: '', notes: '' }); setDone(false); }}
            className="px-4 py-2 text-sm font-poppins font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">Nouvelle demande</button>
          <Link to="/catalog" className="px-4 py-2 text-sm font-poppins font-semibold rounded-lg text-white" style={{ backgroundColor: '#125C8D' }}>Retour au catalogue</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 pt-32 md:pt-28 pb-12">
      <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-1">Sourcing par lien</h1>
      <p className="text-sm font-inter text-gray-600 mb-6">
        Vous avez trouvé un produit sur un site nigérian ? Collez le lien, nous le sourçons pour vous.
        Le paiement reste protégé par le séquestre TrustLink.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        {error && <div className="p-3 rounded-lg text-sm font-inter" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>{error}</div>}

        <div>
          <label className={labelCls} htmlFor="src-url">Lien du produit *</label>
          <input id="src-url" type="url" required value={form.url} onChange={handleUrlChange} onBlur={loadPreview} placeholder="https://www.konga.com/product/..." className={inputCls} />
          {previewState === 'loading' && <p className="mt-1.5 text-xs font-inter text-gray-500">Lecture du produit…</p>}
          {previewState === 'unsupported' && <p className="mt-1.5 text-xs font-inter text-gray-500">Aperçu automatique disponible pour Konga et Jumia. Remplissez les champs ci-dessous.</p>}
          {previewState === 'error' && <p className="mt-1.5 text-xs font-inter text-gray-500">Aperçu indisponible pour ce lien. Vous pouvez remplir les champs à la main.</p>}
        </div>

        {previewState === 'ok' && preview && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex gap-3 mb-3">
              {preview.image_url && (
                <img src={preview.image_url} alt="" referrerPolicy="no-referrer" loading="lazy"
                  className="w-16 h-16 rounded-lg object-cover bg-white flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-poppins font-semibold text-gray-900 line-clamp-2">{preview.title || 'Produit trouvé'}</p>
                {preview.price && (
                  <p className="text-xs font-inter text-gray-500 mt-0.5">
                    Prix sur le site : {preview.currency === 'NGN' ? '₦' : ''}{Number(preview.price).toLocaleString('fr-FR')}{preview.currency && preview.currency !== 'NGN' ? ` ${preview.currency}` : ''}
                  </p>
                )}
              </div>
            </div>
            {priceXof ? (
              <>
                <p className="text-xs font-poppins font-semibold text-gray-700 mb-1.5">Estimation tout compris, par article</p>
                <PriceDetails price={priceXof} />
                <p className="text-[11px] font-inter text-gray-400 -mt-1">Indicatif : le prix final est confirmé par notre équipe.</p>
              </>
            ) : (
              <p className="text-[11px] font-inter text-gray-400">Le prix final tout compris vous sera confirmé par notre équipe.</p>
            )}
          </div>
        )}
        <div>
          <label className={labelCls} htmlFor="src-title">Nom du produit</label>
          <input id="src-title" type="text" value={form.title} onChange={set('title')} placeholder="Ex. Samsung Galaxy A56 128 Go" className={inputCls} />
        </div>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="src-qty">Quantité *</label>
            <input id="src-qty" type="number" min="1" step="1" required value={form.quantity} onChange={set('quantity')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="src-budget">Budget max (FCFA)</label>
            <input id="src-budget" type="number" min="0" step="1" value={form.budget} onChange={set('budget')} placeholder="Optionnel" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="src-notes">Précisions (taille, couleur, variante…)</label>
          <textarea id="src-notes" rows={3} value={form.notes} onChange={set('notes')} className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-2.5 text-sm font-poppins font-semibold rounded-lg text-white disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: '#125C8D' }}>
          {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
        </button>
      </form>
    </main>
  );
}
