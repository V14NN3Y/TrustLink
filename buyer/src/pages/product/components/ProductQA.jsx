import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function ProductQA({ productId }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    supabase.from('product_questions')
      .select('*, buyer:buyer_id(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setQuestions(data || []); setLoading(false); });
  }, [productId]);

  const ask = async () => {
    if (!newQuestion.trim() || !user || submitting) return;
    setSubmitting(true);
    await supabase.from('product_questions').insert({
      product_id: productId,
      buyer_id: user.id,
      question: newQuestion.trim(),
    });
    setNewQuestion('');
    setSubmitting(false);
    const { data } = await supabase.from('product_questions')
      .select('*, buyer:buyer_id(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setQuestions(data || []);
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-poppins font-bold mb-4" style={{ color: '#111827' }}>Questions & Réponses</h3>
      
      {user && (
        <div className="flex gap-2 mb-4">
          <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
            placeholder="Poser une question sur ce produit..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#125C8D]"
            onKeyDown={e => { if (e.key === 'Enter') ask(); }} />
          <button onClick={ask} disabled={!newQuestion.trim() || submitting}
            className="px-4 py-2 text-xs font-poppins font-semibold text-white rounded-lg disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: '#125C8D' }}>
            {submitting ? '...' : 'Demander'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : questions.length === 0 ? (
        <p className="text-sm font-inter text-gray-400 text-center py-6">Aucune question pour le moment. Soyez le premier à poser une question !</p>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.id} className="p-4 rounded-xl" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-start gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                  {q.buyer?.full_name?.slice(0, 2)?.toUpperCase() || '??'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-inter font-medium text-gray-900">{q.question}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(q.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              {q.answer && (
                <div className="ml-9 p-3 rounded-lg bg-[#F0FDF4]">
                  <p className="text-xs font-semibold text-green-700 mb-1">Réponse du vendeur :</p>
                  <p className="text-sm font-inter text-gray-700">{q.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
