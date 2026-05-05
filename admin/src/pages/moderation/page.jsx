import { useState, useEffect } from 'react';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useSupabaseDisputes } from '@/hooks/useSupabaseDisputes';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import CatalogueInspection from './components/CatalogueInspection';
import DisputeCenter from './components/DisputeCenter';

export default function ModerationPage() {
  const { rate } = useExchangeRate();
  const { products, updateProduct } = useSupabaseProducts(null, rate);
  const { disputes: supabaseDisputes, loading: disputesLoading } = useSupabaseDisputes();
  const [disputes, setDisputes] = useState([]);
  useEffect(() => {
    setDisputes(supabaseDisputes);
  }, [supabaseDisputes]);

  function handleUpdateProduct(updated) {
    updateProduct(updated.id, updated.status);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <CatalogueInspection products={products} onUpdate={handleUpdateProduct} />
      <div className="lg:col-span-2">
        <DisputeCenter disputes={disputes} onUpdate={updated => setDisputes(prev => prev.map(d => d.id === updated.id ? updated : d))} />
      </div>
    </div>
  );
}