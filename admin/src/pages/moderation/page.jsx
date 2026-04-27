import { useState, useEffect } from 'react';
import { StorageManager } from '@/lib/storage';
import { DISPUTES } from '@/mocks/moderation';
import { approveCatalogItem, rejectCatalogItem, getCatalogPending, getCatalogApproved } from '@/lib/sharedStorage';
import CatalogueInspection from './components/CatalogueInspection';
import DisputeCenter from './components/DisputeCenter';

export default function ModerationPage() {
  const [products, setProducts] = useState(() => {
    const pending = getCatalogPending();
    const approved = getCatalogApproved();
    return [...pending, ...approved].map(p => ({
      ...p,
      status: p.status === 'pending' ? 'PENDING_REVIEW' : p.status.toUpperCase()
    }));
  });
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

  function handleApprove(product, comment) {
    approveCatalogItem(product.id, comment || 'Approved');
    const approvedProduct = { ...product, status: 'approved', approved_at: new Date().toISOString() };
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'APPROVED' } : p));
    window.dispatchEvent(new CustomEvent('tl_storage_update', { detail: { key: 'tl_catalog_approved' } }));
  }

  function handleReject(product, comment) {
    rejectCatalogItem(product.id, comment || 'Rejected');
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'REJECTED' } : p));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <CatalogueInspection products={products} onUpdate={handleUpdateProduct} onApprove={handleApprove} onReject={handleReject} />
      <div className="lg:col-span-2">
        <DisputeCenter disputes={disputes} onUpdate={updated => setDisputes(prev => prev.map(d => d.id === updated.id ? updated : d))} />
      </div>
    </div>
  );
}