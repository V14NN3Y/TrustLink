import { useState, useCallback } from 'react';
import { useSupabaseDispatch } from '@/hooks/useSupabaseDispatch';
import { useAuth } from '@/lib/AuthContext';
import DispatchSellerCard from './components/DispatchSellerCard';

export default function DispatchPage() {
  const { sellers, loading, error, dispatchItems, refresh } = useSupabaseDispatch();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [dispatching, setDispatching] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleItem = useCallback((itemId) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((itemIds, select) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      itemIds.forEach(id => {
        if (select) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }, []);

  const handleDispatch = useCallback(async (sellerId, itemIds) => {
    if (!itemIds.length || !user?.id) return;
    setDispatching(sellerId);
    try {
      await dispatchItems(itemIds, sellerId, user.id);
      // Remove dispatched items from selection
      setSelectedItems(prev => {
        const next = new Set(prev);
        itemIds.forEach(id => next.delete(id));
        return next;
      });
      showToast(`${itemIds.length} article(s) envoyé(s) au vendeur avec succès`);
      refresh();
    } catch (err) {
      showToast(err.message || 'Erreur lors de l\'envoi', 'error');
    } finally {
      setDispatching(null);
    }
  }, [dispatchItems, user, refresh]);

  const pendingCount = sellers.reduce((sum, s) => sum + s.items.length, 0);
  const sellerCount = sellers.length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-trustblue/20 border-t-trustblue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-800 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Envoyer aux vendeurs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pendingCount} article(s) en attente chez {sellerCount} vendeur(s)
          </p>
        </div>
        {sellers.length > 0 && (
          <button
            onClick={() => {
              // Select all items across all sellers
              const allIds = sellers.flatMap(s => s.items.map(i => i.id));
              setSelectedItems(prev =>
                prev.size === allIds.length ? new Set() : new Set(allIds)
              );
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-trustblue border border-trustblue/30 hover:bg-trustblue/5 cursor-pointer transition-all"
          >
            <i className="ri-checkbox-multiple-line text-sm" />
            {selectedItems.size === sellers.flatMap(s => s.items.map(i => i.id)).length
              ? 'Tout désélectionner'
              : 'Tout sélectionner'
            }
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && sellers.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100">
            <i className="ri-check-line text-2xl text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Tout est à jour</h2>
          <p className="text-sm text-slate-400">Aucun article en attente d'envoi aux vendeurs.</p>
        </div>
      )}

      <div className="space-y-4">
        {sellers.map(sellerGroup => (
          <DispatchSellerCard
            key={sellerGroup.seller.id}
            sellerGroup={sellerGroup}
            selectedItems={selectedItems}
            onToggleItem={toggleItem}
            onSelectAll={toggleSelectAll}
            onDispatch={handleDispatch}
            dispatching={dispatching === sellerGroup.seller.id}
          />
        ))}
      </div>
    </div>
  );
}
