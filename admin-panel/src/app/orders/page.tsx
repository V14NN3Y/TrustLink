import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:profiles!orders_client_id_fkey (
            first_name,
            last_name,
            city
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  const handleNotifySeller = async (orderId: string) => {
    // 1. Update vendor_orders status to PREPARING
    const { error: updateError } = await supabase
      .from('vendor_orders')
      .update({ status: 'PREPARING' })
      .eq('original_order_id', orderId);

    if (updateError) {
      alert('Erreur: ' + updateError.message);
      return;
    }

    // 2. Send automated message to sellers involved
    const { data: vendorOrders } = await supabase
      .from('vendor_orders')
      .select('seller_id')
      .eq('original_order_id', orderId);

    if (vendorOrders && vendorOrders.length > 0) {
      const messages = vendorOrders.map(vo => ({
        seller_id: vo.seller_id,
        text: `🛎 La commande #${orderId.slice(0,8)} a été validée par TrustLink et doit être préparée au plus vite !`,
        sender: 'admin'
      }));
      await supabase.from('vendor_messages').insert(messages);
    }

    alert('Vendeurs notifiés avec succès ! Mises à jour envoyées via chat.');
  };

  return (
    <AdminLayout>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Escrow & Logistique</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Arbitrage des litiges et suivi des fonds bloqués.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-2.5 bg-white border border-border rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all">Règlement du Contentieux</button>
           <button className="px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all">Contacter Transporteur</button>
        </div>
      </div>

      {/* TrustLink Escrow Status Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-border overflow-hidden mb-12">
        <div className="p-8 border-b border-border flex justify-between items-center bg-gray-50/30">
           <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Flux de Trésorerie Sécurisé</h2>
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Temps Réel</span>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-border text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Commande No.</th>
                <th className="px-8 py-5">Client / Destination</th>
                <th className="px-8 py-5">Montant Escrow</th>
                <th className="px-8 py-5">Statut Fonds</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-400 italic">Chargement...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-400 italic">Aucune commande active.</td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-black text-foreground group-hover:text-primary transition-colors">{order.id.slice(0, 8)}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-700 text-sm">{order.client?.first_name} {order.client?.last_name} ({order.client?.city})</p>
                    <p className="text-xs text-gray-400">Nigeria Hub → Bénin Express</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-lg font-black text-foreground tracking-tighter">{order.total_cfa.toLocaleString()} CFA</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 ${order.escrow_locked ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700'} rounded-lg text-[10px] font-black uppercase tracking-wider`}>
                      {order.escrow_locked ? 'Bloqué (Escrow)' : 'Libéré'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right flex justify-end gap-3">
                    <button 
                      onClick={() => handleNotifySeller(order.id)}
                      className="text-xs font-black text-accent hover:border-accent border border-transparent px-3 py-1.5 rounded-lg transition-all uppercase tracking-tighter"
                    >
                      🔔 Notifier Vendeur
                    </button>
                    <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Gérer →</button>
                    {order.lat && order.lng && (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${order.lat},${order.lng}`} 
                        target="_blank" 
                        className="text-xs font-black text-green-600 hover:text-green-700 flex items-center gap-1 uppercase tracking-tighter"
                      >
                        📍 Itinéraire
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Active Dispute Resolution Interface */}
      <div className="mb-6">
         <h2 className="text-xl font-extrabold text-foreground mb-4 flex items-center gap-2">
            Disputes Requérant Arbitrage
            <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-black animate-bounce shadow-lg shadow-rose-200">1</span>
         </h2>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl shadow-rose-200/40 border border-rose-100 overflow-hidden mb-20 animate-in fade-in zoom-in duration-700">
        <div className="bg-rose-50/80 backdrop-blur-md p-8 border-b border-rose-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-xl font-black text-rose-800 tracking-tight flex items-center gap-2">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                   LITIGE CRITIQUE #L-4509
                </h2>
                <p className="text-sm text-rose-600 font-medium mt-1">Client: John Doe • Produit: Sneakers Streetwear YZ V2 • Valeur: 35,000 CFA</p>
            </div>
            <span className="bg-rose-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-200">ARBITRAGE IMMÉDIAT</span>
        </div>

        <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Agent Video */}
                <div className="border border-border rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-inner">
                    <div className="px-6 py-4 bg-white border-b border-border text-[10px] font-black text-gray-500 flex justify-between items-center uppercase tracking-widest">
                        <span>1. Vidéo Inspection Lagos (Agent #04)</span>
                        <span className="text-primary">12 Avr 2026 - 14:32</span>
                    </div>
                    <div className="aspect-video bg-slate-900 group flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="text-slate-500 text-sm font-black uppercase tracking-widest z-10">Inspection Replay</span>
                        <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/20">📍 Lagos, NG</div>
                        <button className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/30 text-white shadow-2xl transition-all hover:scale-110 z-10">
                           <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5v13L16 10 4.5 3.5z"></path></svg>
                        </button>
                    </div>
                    <div className="p-5 bg-white text-xs font-bold leading-relaxed">
                        <span className="text-green-600 uppercase tracking-widest border-b-2 border-green-100 pb-0.5 inline-block mb-3 italic">Conclusion Agent</span>
                        <p className="text-gray-500 italic">"Produit conforme, pas de défaut visuel sur la semelle. Boîte d'origine intacte au départ du hub Nigeria."</p>
                    </div>
                </div>

                {/* Client Video */}
                <div className="border border-rose-200 rounded-[2.5rem] overflow-hidden bg-rose-100 shadow-inner ring-4 ring-rose-50/50">
                    <div className="px-6 py-4 bg-white border-b border-rose-100 text-[10px] font-black text-rose-500 flex justify-between items-center uppercase tracking-widest">
                        <span>2. Vidéo Réception Cotonou (Client App)</span>
                        <span className="text-rose-600">14 Avr 2026 - 09:15</span>
                    </div>
                    <div className="aspect-video bg-slate-900 group flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="text-slate-500 text-sm font-black uppercase tracking-widest z-10">Client Evidence</span>
                        <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/20">📍 Cotonou, BJ</div>
                        <button className="w-16 h-16 bg-rose-500/20 hover:bg-rose-500/30 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/30 text-white shadow-2xl transition-all hover:scale-110 z-10">
                           <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5v13L16 10 4.5 3.5z"></path></svg>
                        </button>
                    </div>
                    <div className="p-5 bg-white text-xs font-bold leading-relaxed">
                        <span className="text-rose-600 uppercase tracking-widest border-b-2 border-rose-100 pb-0.5 inline-block mb-3 italic">Plante Client</span>
                        <p className="text-gray-500 italic">"Le colis est arrivé mouillé. Une basket présente des taches d'humidité sur le tissu supérieur."</p>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap justify-end gap-5">
                <button className="px-8 py-3.5 border border-border rounded-2xl text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                    Inscrire une note locale
                </button>
                <div className="h-12 w-px bg-border mx-2 hidden md:block" />
                <button className="px-8 py-3.5 bg-white border border-accent text-accent rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent/5 transition-all shadow-sm">
                    Notifier Vendeur
                </button>
                <button className="px-8 py-3.5 bg-white border-2 border-rose-600 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all shadow-lg shadow-rose-100">
                    Rembourser via Escrow
                </button>
                <button className="px-10 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1 transition-all">
                    Rejeter & Payer Vendeur
                </button>
            </div>
        </div>
      </div>
    </AdminLayout>
  );
}
