import { useState, useEffect } from 'react';
import { StorageManager } from '@/lib/storage';
import { DISPUTES } from '@/mocks/moderation';
import CatalogueInspection from './components/CatalogueInspection';
import DisputeCenter from './components/DisputeCenter';

export default function ModerationPage() {
  const [products, setProducts] = useState(() => StorageManager.getProducts());
  const [disputes, setDisputes] = useState(DISPUTES);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === StorageManager.getKeys().PRODUCTS && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  function handleUpdateProduct(updated) {
    StorageManager.updateProduct(updated);
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
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