import { useState, useCallback } from 'react';
import { useSupabaseDispatch } from '@/hooks/useSupabaseDispatch';
import { useAuth } from '@/lib/AuthContext';
import DispatchQueueTable from './components/DispatchQueueTable';

export default function DispatchPage() {
  const { items, loading, error, dispatchItems, refresh } = useSupabaseDispatch();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [dispatching, setDispatching] = useState(false);
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

  const handleDispatch = useCallback(async (itemIds) => {
    if (!itemIds.length || !user?.id) return;
    setDispatching(true);
    try {
      await dispatchItems(itemIds, user.id);
      setSelectedItems(prev => {
        const next = new Set(prev);
        itemIds.forEach(id => next.delete(id));
        return next;
      });
      showToast(`${itemIds.length} article(s) marqué(s) comme en traitement`);
      refresh();
    } catch (err) {
      showToast(err.message || 'Erreur lors du traitement', 'error');
    } finally {
      setDispatching(false);
    }
  }, [dispatchItems, user, refresh]);

  const pendingCount = items.length;

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
            Commandes à traiter
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pendingCount} article(s) en attente de traitement
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              const allIds = items.map(i => i.id);
              setSelectedItems(prev =>
                prev.size === allIds.length ? new Set() : new Set(allIds)
              );
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-trustblue border border-trustblue/30 hover:bg-trustblue/5 cursor-pointer transition-all"
          >
            <i className="ri-checkbox-multiple-line text-sm" />
            {selectedItems.size === items.length
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

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100">
            <i className="ri-check-line text-2xl text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Tout est à jour</h2>
          <p className="text-sm text-slate-400">Aucun article en attente de traitement.</p>
        </div>
      )}

      {items.length > 0 && (
        <DispatchQueueTable
          items={items}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          onSelectAll={toggleSelectAll}
          onDispatch={handleDispatch}
          dispatching={dispatching}
        />
      )}
    </div>
  );
}
