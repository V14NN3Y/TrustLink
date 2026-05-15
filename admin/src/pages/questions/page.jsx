import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function QuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [answerText, setAnswerText] = useState({});
  const [answering, setAnswering] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('product_questions')
      .select('*, product:product_id(name), buyer:buyer_id(full_name), answered_by_profile:answered_by(full_name)')
      .order('created_at', { ascending: false });
    setQuestions(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAnswer = async (qId) => {
    if (!answerText[qId]?.trim() || !user) return;
    setAnswering(qId);
    await supabase.from('product_questions').update({
      answer: answerText[qId].trim(),
      answered_by: user.id,
      answered_at: new Date().toISOString(),
    }).eq('id', qId);
    setAnswering(null);
    setAnswerText(t => ({ ...t, [qId]: '' }));
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette question ?')) return;
    await supabase.from('product_questions').delete().eq('id', id);
    load();
  };

  const filtered = filter === 'unanswered' ? questions.filter(q => !q.answer) :
    filter === 'answered' ? questions.filter(q => q.answer) : questions;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Questions & Réponses</h1>
          <p className="text-sm text-slate-500 mt-0.5">{questions.filter(q => !q.answer).length} questions sans réponse</p>
        </div>
      </div>
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'unanswered', label: 'Sans réponse' },
          { key: 'answered', label: 'Répondues' },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${filter === t.key ? 'bg-white text-trustblue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.label}</button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400"><i className="ri-question-answer-line text-3xl mb-2 block" /><p className="text-sm">Aucune question trouvée</p></div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(q => (
              <div key={q.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-trustblue">{q.buyer?.full_name?.slice(0, 2)?.toUpperCase() || '??'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-500">{q.buyer?.full_name || 'Anonyme'}</span>
                      <span className="text-[10px] text-slate-400">{new Date(q.created_at).toLocaleDateString('fr-FR')}</span>
                      {!q.answer && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">En attente</span>}
                    </div>
                    <p className="text-sm font-medium text-slate-800 mb-1">Sur <span className="text-trustblue">{q.product?.name || '—'}</span></p>
                    <p className="text-sm text-slate-700 mb-2">{q.question}</p>
                    {q.answer ? (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                        <p className="text-xs font-semibold text-green-700 mb-1">Réponse {q.answered_by_profile?.full_name ? `par ${q.answered_by_profile.full_name}` : ''}</p>
                        <p className="text-sm text-slate-700">{q.answer}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={answerText[q.id] || ''} onChange={e => setAnswerText(t => ({ ...t, [q.id]: e.target.value }))}
                          placeholder="Écrire une réponse..." className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-trustblue"
                          onKeyDown={e => { if (e.key === 'Enter') handleAnswer(q.id); }} />
                        <button onClick={() => handleAnswer(q.id)} disabled={answering === q.id || !answerText[q.id]?.trim()}
                          className="px-4 py-2 text-xs font-semibold text-white bg-trustblue rounded-lg disabled:opacity-50 cursor-pointer">
                          {answering === q.id ? '...' : 'Répondre'}
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDelete(q.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer flex-shrink-0">
                    <i className="ri-delete-bin-line text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
