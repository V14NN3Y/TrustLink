import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/utils/format';

export default function InvoicePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    supabase.from('orders').select(`
      *, order_items(*), buyer:profiles!buyer_id(full_name, email, phone, default_address_line1, default_city)
    `).eq('id', id).eq('buyer_id', user.id).maybeSingle().then(({ data }) => {
      setOrder(data);
      setLoading(false);
    });
  }, [id, user]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="pt-24 pb-12 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#125C8D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 pb-12 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-poppins font-bold mb-3">Facture introuvable</h2>
        <Link to="/account" className="text-[#125C8D] underline text-sm">Retour à mes commandes</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-[800px] mx-auto px-4">
        <div className="flex justify-between items-center mb-6 no-print">
          <Link to="/account" className="text-sm font-inter text-[#125C8D] hover:underline">&larr; Retour aux commandes</Link>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-poppins font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <i className="ri-printer-line"></i> Imprimer
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 print:p-0" id="invoice">
          <div className="flex items-start justify-between mb-8">
            <div>
              <img src="/TrustLink_Logo_Bleu-125C8D.png" alt="TrustLink" className="h-10 mb-2" />
              <p className="text-xs font-inter text-gray-500">Service Escrow cross-border</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-poppins font-bold" style={{ color: '#111827' }}>FACTURE</h1>
              <p className="text-xs font-inter text-gray-500 mt-1">N° {order.id?.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs font-inter text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Acheteur</p>
              <p className="text-sm font-semibold text-gray-900">{order.buyer?.full_name || '—'}</p>
              <p className="text-xs font-inter text-gray-500">{order.buyer?.email || ''}</p>
              <p className="text-xs font-inter text-gray-500">{order.buyer?.phone || ''}</p>
              <p className="text-xs font-inter text-gray-500">{order.shipping_address_line1 || order.buyer?.default_address_line1 || ''}</p>
              <p className="text-xs font-inter text-gray-500">{order.shipping_city || order.buyer?.default_city || ''}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Paiement</p>
              <p className="text-sm font-semibold text-gray-900">{order.payment_method || '—'}</p>
              <p className="text-xs font-inter text-gray-500">Réf: {order.payment_reference || '—'}</p>
              <p className="text-xs font-inter text-gray-500">Protection Escrow TrustLink</p>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Produit</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-500 uppercase">Qté</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Prix unit.</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map(item => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{item.product_name}</td>
                  <td className="py-3 text-sm text-center text-gray-700">{item.quantity}</td>
                  <td className="py-3 text-sm text-right text-gray-700">{formatPrice(item.product_price)}</td>
                  <td className="py-3 text-sm text-right font-semibold text-gray-900">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm font-inter">
                <span className="text-gray-500">Sous-total</span>
                <span className="text-gray-900">{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-inter">
                <span className="text-gray-500">Livraison</span>
                <span className="text-gray-900">Incluse</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-poppins font-bold text-lg">
                <span style={{ color: '#111827' }}>Total</span>
                <span style={{ color: '#125C8D' }}>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-gray-100">
            <p className="text-xs font-inter text-gray-400">TrustLink — Paiement Escrow sécurisé</p>
            <p className="text-xs font-inter text-gray-400">Facture générée le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
