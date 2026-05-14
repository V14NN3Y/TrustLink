import { useSupabaseFinance } from '@/hooks/useSupabaseFinance';
import EscrowBridge from './components/EscrowBridge';
import PayoutValidation from './components/PayoutValidation';
import AuditTrail from './components/AuditTrail';

export default function FinancePage() {
  const { payouts: supabasePayouts, auditEntries, loading, refresh } = useSupabaseFinance();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <EscrowBridge />
      <PayoutValidation payouts={supabasePayouts} onRefresh={refresh} />
      <AuditTrail entries={auditEntries} />
    </div>
  );
}
