import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import DashboardLayout from '@/components/feature/DashboardLayout';

export default function QuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('products').select('id').eq('seller_id', user.id).then(({ data: products }) => {
      if (!products?.length) { setLoading(false); return; }
      const ids = products.map(p => p.id);
      supabase.from('product_questions')
        .select('*, product:product_id(name), buyer:buyer_id(full_name)')
        .in('product_id', ids)
        .order('created_at', { ascending: false })
        .then(({ data }) => { setQuestions(data || []); setLoading(false); });
    });
  }, [user]);

  const handleAnswer = async (qId) => {
    if (!answers[qId]?.trim() || !user) return;
    setSaving(qId);
    await supabase.from('product_questions').update({
      answer: answers[qId].trim(),
      answered_by: user.id,
      answered_at: new Date().toISOString(),
    }).eq('id', qId);
    setSaving(null);
    setQuestions(q => q.map(x => x.id === qId ? { ...x, answer: answers[qId].trim(), answered_by: user.id } : x));
    setAnswers(a => ({ ...a, [qId]: '' }));
  };

  const unanswered = questions.filter(q => !q.answer);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Questions clients</h2>
        <p className="text-sm text-gray-400">{unanswered.length} question(s) sans réponse</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-[#125C8D] rounded-full animate-spin" /></div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><i className="ri-question-answer-line text-3xl mb-2 block" /><p className="text-sm">Aucune question pour le moment</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {questions.map(q => (
              <div key={q.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#125C8D]">{q.buyer?.full_name?.slice(0,2)?.toUpperCase() || '??'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500">{q.buyer?.full_name || 'Anonyme'}</span>
                      <span className="text-[10px] text-gray-400">{new Date(q.created_at).toLocaleDateString('fr-FR')}</span>
                      {!q.answer && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">En attente</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">Sur <span className="font-medium text-gray-600">{q.product?.name || '—'}</span></p>
                    <p className="text-sm font-medium text-gray-800 mb-2">{q.question}</p>
                    {q.answer ? (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                        <p className="text-xs font-semibold text-green-700 mb-1">Votre réponse</p>
                        <p className="text-sm text-gray-700">{q.answer}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                          placeholder="Écrire une réponse..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#125C8D]"
                          onKeyDown={e => { if (e.key === 'Enter') handleAnswer(q.id); }} />
                        <button onClick={() => handleAnswer(q.id)} disabled={saving === q.id || !answers[q.id]?.trim()}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#125C8D] rounded-lg disabled:opacity-50 cursor-pointer">
                          {saving === q.id ? '...' : 'Répondre'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
