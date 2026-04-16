import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Mode & Beauté',
    seller_id: '',
    base_price: 0,
    discount_percent: 0,
    is_active: true
  });

  useEffect(() => {
    async function fetchSellers() {
      const { data } = await supabase.from('profiles').select('id, store_name').eq('role', 'SELLER');
      setSellers(data || []);
      if (data && data.length > 0) setFormData(prev => ({ ...prev, seller_id: data[0].id }));
    }
    fetchSellers();
  }, []);

  const finalPrice = Math.round(formData.base_price * (1 - formData.discount_percent / 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('products').insert([{
      name: formData.name,
      description: formData.description,
      category: formData.category,
      seller_id: formData.seller_id,
      base_price_cfa: formData.base_price,
      discount_percent: formData.discount_percent,
      final_price_cfa: finalPrice,
      is_active: formData.is_active
    }]);

    if (error) {
      alert('Erreur lors de la création : ' + error.message);
    } else {
      router.push('/products');
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="mb-10 flex items-center gap-6">
        <Link href="/products" className="w-12 h-12 bg-white border border-border rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm group">
          <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Ajouter un produit</h1>
          <p className="text-gray-500 mt-1 font-medium">Définissez les variantes et les promotions pour le catalogue.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-border p-8">
            <h2 className="text-lg font-extrabold text-foreground mb-6 flex items-center gap-2">
               <span className="w-2 h-6 bg-primary rounded-full" />
               Informations Générales
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nom du produit</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-border rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-foreground bg-gray-50/30" 
                    placeholder="Ex: Sneakers Streetwear YZ V2" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    rows={4} 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-border rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-foreground bg-gray-50/30" 
                    placeholder="Détails du produit, matériaux, conseils d'entretien..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Prix de base (CFA)</label>
                  <div className="relative">
                    <input 
                      required
                      type="number" 
                      value={formData.base_price}
                      onChange={(e) => setFormData({...formData, base_price: Number(e.target.value)})}
                      className="w-full border border-border rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-foreground bg-gray-50/30" 
                      placeholder="9500" 
                    />
                    <span className="absolute right-5 top-4.5 text-gray-400 font-bold">CFA</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Réduction (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({...formData, discount_percent: Number(e.target.value)})}
                      className="w-full border border-border rounded-2xl px-5 py-4 focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-accent bg-accent/5" 
                      placeholder="11" 
                    />
                    <span className="absolute right-5 top-4.5 text-accent font-bold">%</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
                     <p className="text-sm font-bold text-primary">Prix final (CFA) :</p>
                     <p className="text-xl font-black text-primary tracking-tighter">{finalPrice.toLocaleString('fr-FR')} CFA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variants & Colors Placeholder */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-border p-8 opacity-60">
            <h2 className="text-lg font-extrabold text-gray-400 mb-6 flex items-center gap-2">
               <span className="w-2 h-6 bg-gray-300 rounded-full" />
               Variantes & Couleurs (Prochainement)
            </h2>
            <p className="text-xs italic text-gray-400">Les variantes multisize seront disponibles dans la v1.1</p>
          </div>
        </div>

        <div className="space-y-8">
           {/* Seller & Category Card */}
           <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-border p-8">
              <div className="mb-6">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Attribuer au Vendeur</label>
                <select 
                  required
                  value={formData.seller_id}
                  onChange={(e) => setFormData({...formData, seller_id: e.target.value})}
                  className="w-full border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary bg-gray-50/30 font-bold text-foreground transition-all"
                >
                   {sellers.map((s) => <option key={s.id} value={s.id}>{s.store_name}</option>)}
                   {sellers.length === 0 && <option disabled>Aucun vendeur trouvé</option>}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Statut</label>
                <select 
                  value={formData.is_active ? 'online' : 'draft'}
                  onChange={(e) => setFormData({...formData, is_active: e.target.value === 'online'})}
                  className="w-full border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary bg-gray-50/30 font-bold text-foreground transition-all"
                >
                   <option value="online">En ligne</option>
                   <option value="draft">Brouillon</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Catégorie</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary bg-gray-50/30 font-bold text-foreground transition-all"
                >
                  <option>Automobile</option>
                  <option>Électronique</option>
                  <option>Équipement industriel</option>
                  <option>Mode & Beauté</option>
                  <option>Sport</option>
                </select>
              </div>
           </div>

           {/* Actions */}
           <div className="flex gap-4">
              <Link href="/products" className="flex-1 py-4 bg-white border border-border rounded-2xl text-center font-black text-gray-500 hover:bg-gray-50 transition-all shadow-sm">ANNULER</Link>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 bg-accent text-white rounded-2xl font-black shadow-lg shadow-accent/30 hover:bg-accent/90 hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {loading ? 'PUBLICATION...' : 'PUBLIER'}
              </button>
           </div>
        </div>
      </form>
    </AdminLayout>
  );
}
