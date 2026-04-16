"use client";

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles!products_seller_id_fkey (
            store_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Catalogue Produits</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Gérez l'inventaire soumis par les vendeurs certifiés.</p>
        </div>
        <Link href="/products/new" className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-accent/20 transition-all flex items-center gap-2 group">
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Ajouter un produit
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-border text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Produit</th>
                <th className="px-8 py-5">Vendeur</th>
                <th className="px-8 py-5">Catégorie</th>
                <th className="px-8 py-5">Prix & Promo</th>
                <th className="px-8 py-5">Statut</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center font-bold text-gray-400 italic animate-pulse">Chargement du catalogue...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center font-bold text-gray-400 italic">Aucun produit trouvé dans le catalogue.</td>
                </tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-gray-100 rounded-xl border border-border flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">📦</div>
                       <p className="font-bold text-foreground group-hover:text-primary transition-colors max-w-[180px] truncate">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {(() => {
                      const seller = Array.isArray(p.seller) ? p.seller[0] : p.seller;
                      return <p className="text-sm font-bold text-gray-600">{seller?.store_name || "Vendeur Inconnu"}</p>;
                    })()}
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">{p.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <p className="text-lg font-black text-foreground">{p.final_price_cfa.toLocaleString('fr-FR')} CFA</p>
                       {p.discount_percent > 0 && (
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 line-through font-medium">{p.base_price_cfa.toLocaleString('fr-FR')}</span>
                            <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-black">-{p.discount_percent}%</span>
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {p.is_active ? 
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                         <span className="text-xs font-bold text-green-700 uppercase tracking-tighter">En ligne</span>
                      </div>
                      :
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-gray-300" />
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Brouillon</span>
                      </div>
                    }
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 hover:bg-blue-50 text-primary rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                       </button>
                       <button className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder for premium feel */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-border flex items-center justify-between">
           <p className="text-sm text-gray-500 font-medium">Affichage de <span className="font-bold text-foreground">1-{products.length}</span> sur <span className="font-bold text-foreground">{products.length}</span> produits</p>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold disabled:opacity-50" disabled>Précédent</button>
              <button className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold disabled:opacity-50" disabled>Suivant</button>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
