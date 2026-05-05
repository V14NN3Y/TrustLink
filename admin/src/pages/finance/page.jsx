import { useState, useEffect } from 'react';
import { useSupabaseFinance } from '@/hooks/useSupabaseFinance';
import EscrowBridge from './components/EscrowBridge';
import PayoutValidation from './components/PayoutValidation';
import AuditTrail from './components/AuditTrail';

export default function FinancePage() {
  const { payouts: supabasePayouts, auditEntries, loading } = useSupabaseFinance();
  const [payouts, setPayouts] = useState([]);
  const [config, setConfig] = useState(() => ({
    spread_pct: 2.5, min_amount_xof: 50000, release_delay_hours: 72, auto_release: true
  }));
  useEffect(() => {
    setPayouts(supabasePayouts);
  }, [supabasePayouts]);
  function handleSaveConfig(newConfig) {
    setConfig(newConfig);
    // TODO: sauvegarder dans Supabase si tu veux persister
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <EscrowBridge config={config} onSave={handleSaveConfig} />
      <PayoutValidation payouts={payouts} onUpdate={updated => setPayouts(prev => prev.map(p => p.id === updated.id ? updated : p))} />
      <AuditTrail entries={auditEntries} />
    </div>
  );
}
