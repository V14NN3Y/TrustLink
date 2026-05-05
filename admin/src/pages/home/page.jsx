import HeroStats from './components/HeroStats';
import VolumeChart from './components/VolumeChart';
import RecentActivity from './components/RecentActivity';
import { useSupabaseDashboard } from '@/hooks/useSupabaseDashboard';

export default function HomePage() {
  const { stats } = useSupabaseDashboard();
  return (
    <div className="space-y-6">
      <HeroStats />
      <VolumeChart data={stats?.volumeData || []} />
      <RecentActivity />
    </div>
  );
}
