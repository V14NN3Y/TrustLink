import { useState } from 'react';
import ProfileInfo from './components/ProfileInfo';
import SecuritySettings from './components/SecuritySettings';
import NotificationSettings from './components/NotificationSettings';
import TeamManagement from './components/TeamManagement';
import SystemPreferences from './components/SystemPreferences';

const TABS = [
  { key: 'profile', label: 'Profil', icon: 'ri-user-3-line' },
  { key: 'security', label: 'Sécurité', icon: 'ri-shield-keyhole-line' },
  { key: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
  { key: 'team', label: 'Équipe', icon: 'ri-team-line' },
  { key: 'system', label: 'Système', icon: 'ri-settings-3-line' },
];

export default function ProfilePage() {
  const [tab, setTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-1.5 flex gap-1 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${tab === t.key ? 'bg-trustblue text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <i className={t.icon} />{t.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">
        {tab === 'profile' && <ProfileInfo />}
        {tab === 'security' && <SecuritySettings />}
        {tab === 'notifications' && <NotificationSettings />}
        {tab === 'team' && <TeamManagement />}
        {tab === 'system' && <SystemPreferences />}
      </div>
    </div>
  );
}
