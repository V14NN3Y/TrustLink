"use client";

import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    escrowTotal: 0,
    activeOrders: 0,
    openDisputes: 0,
    loading: true,
    recentActivities: [] as any[]
  });

  useEffect(() => {
    async function fetchMetrics() {
      // 1. Escrow Total (Sum of total_cfa for PENDING, FUNDED, INSPECTED, SHIPPED)
      const { data: escrowData } = await supabase
        .from('orders')
        .select('total_cfa')
        .in('status', ['PENDING', 'FUNDED', 'INSPECTED', 'SHIPPED']);
      
      const escrowTotal = escrowData?.reduce((sum, o) => sum + Number(o.total_cfa), 0) || 0;

      // 2. Active Orders (Count)
      const { count: activeOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['PENDING', 'FUNDED', 'INSPECTED']);

      // 3. Open Disputes (Count)
      const { count: openDisputes } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'OPEN');

      // 4. Recent Activities (Combine Orders and Messages)
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_cfa,
          client:profiles!orders_client_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentMessages } = await supabase
        .from('vendor_messages')
        .select(`
          id,
          created_at,
          text,
          sender,
          seller:profiles!vendor_messages_seller_id_fkey(store_name)
        `)
        .order('created_at', { ascending: false })
        .limit(2);

      const combinedActivities = [
        ...(recentOrders?.map(o => {
          const client = Array.isArray(o.client) ? o.client[0] : o.client;
          return {
            id: o.id,
            time: o.created_at,
            title: `Commande #${o.id.slice(0,8)} reçue`,
            subtitle: `${client ? `${client.first_name} ${client.last_name?.[0] || ''}.` : 'Client inconnu'} • ${Number(o.total_cfa || 0).toLocaleString()} CFA`,
            icon: '📦',
            type: 'order'
          };
        }) || []),
        ...(recentMessages?.map(m => {
          const seller = Array.isArray(m.seller) ? m.seller[0] : m.seller;
          return {
            id: m.id,
            time: m.created_at,
            title: m.sender === 'seller' ? `Message de ${seller?.store_name || 'Vendeur'}` : 'Réponse admin envoyée',
            subtitle: (m.text || '').length > 40 ? (m.text || '').slice(0, 40) + '...' : (m.text || ''),
            icon: '💬',
            type: 'message'
          };
        }) || [])
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setMetrics({
        escrowTotal,
        activeOrders: activeOrders || 0,
        openDisputes: openDisputes || 0,
        loading: false,
        recentActivities: combinedActivities
      });
    }

    fetchMetrics();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Tableau de Bord</h1>
          <p className="text-gray-500 mt-1 font-medium">Suivi en temps réel de l'activité TrustLink (Bénin ↔ Nigeria).</p>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-2.5 bg-white border border-border rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all">Exporter PDF</button>
           <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">Nouvelle Campagne</button>
        </div>
      </div>

      {/* Hero Stats - Escrow Focus */}
      <div className="bg-primary-dark rounded-3xl p-8 text-white shadow-2xl mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-accent/30 transition-all duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <h2 className="text-accent text-sm font-bold uppercase tracking-widest">Fonds Sécurisés (Escrow)</h2>
            </div>
            <p className="text-5xl font-black tracking-tighter">
              {metrics.loading ? '...' : metrics.escrowTotal.toLocaleString('fr-FR')} <span className="text-2xl font-medium opacity-60">FCFA</span>
            </p>
            <p className="text-white/60 text-sm mt-3 font-medium italic">En attente de libération après inspection à Lagos</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full md:w-auto">
             <div className="flex items-center gap-4 mb-4 font-bold text-sm">
                <span className="px-3 py-1 bg-accent rounded-lg">LIVE</span>
                <span className="opacity-80">1 NGN ≈ 0.45 CFA</span>
             </div>
             <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">Mise à jour automatique basée sur le marché parallèle.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Stat Card 1 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Commandes Actives</h3>
          <p className="text-4xl font-extrabold text-foreground mt-2">{metrics.loading ? '...' : metrics.activeOrders}</p>
          <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-xs bg-green-50 w-max px-2 py-1 rounded-md">
             <span>En cours</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-inner">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Litiges Ouverts</h3>
          <p className="text-4xl font-extrabold text-foreground mt-2">{metrics.loading ? '...' : metrics.openDisputes}</p>
          <div className="mt-4 flex items-center gap-2 text-rose-500 font-bold text-xs bg-rose-50 w-max px-2 py-1 rounded-md">
             <span>Requiert action</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-inner">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Transporteurs Actifs</h3>
          <p className="text-4xl font-extrabold text-foreground mt-2">28</p>
          <div className="mt-4 flex items-center gap-1 text-gray-400 font-bold text-[10px] uppercase">
             <span>Dernière synchro: 2 min ago</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Mini-List */}
      <div className="mt-12">
         <h2 className="text-xl font-extrabold text-foreground mb-6">Activités Récentes</h2>
         <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
            {metrics.loading ? (
              <div className="p-8 text-center text-gray-400 italic">Chargement des activités...</div>
            ) : metrics.recentActivities.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic">Aucune activité récente.</div>
            ) : metrics.recentActivities.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="p-5 border-b border-border flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">{activity.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{activity.title}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(activity.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • {activity.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {activity.type === 'order' ? 'Voir Commande' : 'Répondre'} →
                </span>
              </div>
            ))}
         </div>
      </div>
    </AdminLayout>
  );
}
