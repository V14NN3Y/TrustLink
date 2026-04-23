import { useState, useEffect } from 'react';
import { StorageManager } from '@/lib/storage';
import { PAYOUTS, AUDIT_ENTRIES } from '@/mocks/finance';
import EscrowBridge from './components/EscrowBridge';
import PayoutValidation from './components/PayoutValidation';
import AuditTrail from './components/AuditTrail';

export default function FinancePage() {
  const [payouts, setPayouts] = useState(PAYOUTS);
  const [config, setConfig] = useState(() => StorageManager.getEscrowConfig());

  useEffect(() => {
    const handler = (e) => {
      if (e.key === StorageManager.getKeys().ESCROW_CONFIG && e.newValue) {
        setConfig(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  function handleSaveConfig(newConfig) {
    StorageManager.setEscrowConfig(newConfig);
    setConfig(newConfig);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <EscrowBridge config={config} onSave={handleSaveConfig} />
      <PayoutValidation payouts={payouts} onUpdate={updated => setPayouts(prev => prev.map(p => p.id === updated.id ? updated : p))} />
      <AuditTrail entries={AUDIT_ENTRIES} />
    </div>
  );
}
