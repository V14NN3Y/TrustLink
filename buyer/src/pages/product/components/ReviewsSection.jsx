import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/lib/AuthContext';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
export default function ReviewsSection({ productId }) {
    const { user } = useAuth();
    const { reviews, stats, myReview, canReview, loading, submitting, submit } = useReviews(productId);
    const [showForm, setShowForm] = useState(false);
    const handleSubmit = async (data) => {
        await submit(data);
        setShowForm(false);
    };
    return (
        <section className="mt-10">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-poppins font-bold" style={{ color: '#111827' }}>
                        Avis clients
                    </h2>
                    <p className="text-xs font-inter mt-0.5" style={{ color: '#9CA3AF' }}>
                        {stats.count} avis · Note moyenne {stats.average}/5
                    </p>
                </div>
                {canReview && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                        style={{ backgroundColor: '#125C8D' }}
                    >
                        <i className="ri-edit-line"></i>
                        {myReview ? 'Modifier mon avis' : 'Laisser un avis'}
                    </button>
                )}
            </div>
            {/* Résumé des notes */}
            {stats.count > 0 && (
                <div className="flex items-center gap-6 p-5 rounded-xl mb-6" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                    <div className="text-center">
                        <p className="text-4xl font-poppins font-bold" style={{ color: '#111827' }}>{stats.average}</p>
                        <StarRating value={stats.average} readonly size="sm" onChange={() => {}} />
                        <p className="text-xs font-inter mt-1" style={{ color: '#9CA3AF' }}>{stats.count} avis</p>
                    </div>
                    <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviews.filter((r) => r.rating === star).length;
                            const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-inter w-4 text-right" style={{ color: '#6B7280' }}>{star}</span>
                                    <i className="ri-star-fill text-xs" style={{ color: '#F59E0B' }}></i>
                                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
                                        <div
                                            className="h-1.5 rounded-full transition-all"
                                            style={{ width: `${pct}%`, backgroundColor: '#F59E0B' }}
                                        />
                                    </div>
                                    <span className="text-xs font-inter w-4" style={{ color: '#9CA3AF' }}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {/* Formulaire */}
            {showForm && (
                <ReviewForm
                    existing={myReview}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}
            {/* Message si pas connecté */}
            {!user && (
                <div className="p-4 rounded-xl text-center mb-4" style={{ backgroundColor: '#EBF4FB', border: '1px solid #BFDBFE' }}>
                    <p className="text-sm font-inter" style={{ color: '#125C8D' }}>
                        <a href="/login" className="font-semibold underline">Connectez-vous</a> pour laisser un avis.
                    </p>
                </div>
            )}
            {/* Message si connecté mais pas encore acheté */}
            {user && !canReview && !loading && (
                <div className="p-4 rounded-xl text-center mb-4" style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
                    <p className="text-xs font-inter" style={{ color: '#92400E' }}>
                        Vous devez avoir acheté et reçu ce produit pour laisser un avis.
                    </p>
                </div>
            )}
            {/* Liste des reviews */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl animate-pulse"
              style={{ backgroundColor: '#F1F5F9' }}
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <div
            className="w-12 h-12 flex items-center justify-center mx-auto mb-3 rounded-full"
            style={{ backgroundColor: '#F1F5F9' }}
          >
            <i className="ri-chat-3-line text-xl" style={{ color: '#9CA3AF' }}></i>
          </div>
          <p className="text-sm font-poppins font-medium" style={{ color: '#6B7280' }}>
            Aucun avis pour l&apos;instant
          </p>
          <p className="text-xs font-inter mt-1" style={{ color: '#9CA3AF' }}>
            Soyez le premier à donner votre avis !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
