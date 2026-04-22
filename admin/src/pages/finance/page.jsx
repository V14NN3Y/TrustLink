import { useState } from 'react';
import { PAYOUTS, AUDIT_ENTRIES, ESCROW_CONFIG } from '@/mocks/finance';
import EscrowBridge from './components/EscrowBridge';
import PayoutValidation from './components/PayoutValidation';
import AuditTrail from './components/AuditTrail';

export default function FinancePage() {
  const [payouts, setPayouts] = useState(PAYOUTS);
  const [config, setConfig] = useState(ESCROW_CONFIG);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <EscrowBridge config={config} onSave={setConfig} />
      <PayoutValidation payouts={payouts} onUpdate={updated => setPayouts(prev => prev.map(p => p.id === updated.id ? updated : p))} />
      <AuditTrail entries={AUDIT_ENTRIES} />
    </div>
  );
}
