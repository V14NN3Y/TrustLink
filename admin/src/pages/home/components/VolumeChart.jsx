import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VOLUME_DATA } from '@/mocks/dashboard';
import { formatMillions } from '@/components/base/DataTransformer';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3" style={{ borderRadius: 12, border: '1px solid #E2E8F0', fontFamily: 'Inter, sans-serif' }}>
        <p className="font-semibold text-slate-700 mb-2 text-sm">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.fill }} className="text-xs">
            {p.dataKey === 'xof' ? 'XOF' : 'NGN'} : {formatMillions(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function VolumeChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Volume d'échanges</h3>
          <p className="text-xs text-slate-500 mt-0.5">6 derniers mois — XOF & NGN</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-sm bg-trustblue inline-block" />XOF
          </span>
          <span className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" />NGN
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={VOLUME_DATA} barGap={4} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontFamily: 'Inter', fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatMillions} tick={{ fontFamily: 'Inter', fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="xof" fill="#125C8D" radius={[6, 6, 0, 0]} />
          <Bar dataKey="ngn" fill="#FF6A00" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
