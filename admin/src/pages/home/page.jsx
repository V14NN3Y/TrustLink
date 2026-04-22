import HeroStats from './components/HeroStats';
import VolumeChart from './components/VolumeChart';
import RecentActivity from './components/RecentActivity';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <HeroStats />
      <VolumeChart />
      <RecentActivity />
    </div>
  );
}
