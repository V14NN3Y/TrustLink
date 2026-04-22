import { useState } from 'react';
import { PRODUCTS, DISPUTES } from '@/mocks/moderation';
import CatalogueInspection from './components/CatalogueInspection';
import DisputeCenter from './components/DisputeCenter';

export default function ModerationPage() {
  const [products, setProducts] = useState(PRODUCTS);
  const [disputes, setDisputes] = useState(DISPUTES);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <CatalogueInspection products={products} onUpdate={updated => setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))} />
      <div className="lg:col-span-2">
        <DisputeCenter disputes={disputes} onUpdate={updated => setDisputes(prev => prev.map(d => d.id === updated.id ? updated : d))} />
      </div>
    </div>
  );
}