import { useState } from 'react';
import StarRating from './StarRating';
export default function ReviewForm({ existing, submitting, onSubmit, onCancel }) {
    const [rating, setRating] = useState(existing?.rating || 0);
    const [comment, setComment] = useState(existing?.comment || '');
    const [ratingError, setRatingError] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setRatingError(true);
            return;
        }
        setRatingError(false);
        try {
            await onSubmit({ rating, comment });
            setSuccess(true);
        } catch (err) {
            console.error('Erreur soumission review:', err);
        }
    };
    if (success) {
        return (
            <div
                className="p-5 rounded-xl mb-6 text-center"
                style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
            >
                <div
                    className="w-10 h-10 flex items-center justify-center mx-auto mb-3 rounded-full"
                    style={{ backgroundColor: '#DCFCE7' }}
                >
                    <i className="ri-check-line text-lg" style={{ color: '#15803D' }}></i>
                </div>
                <p className="text-sm font-poppins font-semibold" style={{ color: '#15803D' }}>
                    Avis publié avec succès !
                </p>
                <p className="text-xs font-inter mt-1" style={{ color: '#166534' }}>
                    Merci pour votre retour.
                </p>
            </div>
        );
    }
    return (
        <form
            onSubmit={handleSubmit}
            className="p-5 rounded-xl mb-6"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}
        >
            <h3 className="text-sm font-poppins font-semibold mb-4" style={{ color: '#111827' }}>
                {existing ? 'Modifier votre avis' : 'Laisser un avis'}
            </h3>
            {/* Note */}
            <div className="mb-4">
                <label
                    className="text-xs font-poppins font-medium block mb-2"
                    style={{ color: '#374151' }}
                >
                    Votre note <span className="text-red-500">*</span>
                </label>
                <StarRating
                    value={rating}
                    onChange={(v) => {
                        setRating(v);
                        setRatingError(false);
                    }}
                    size="lg"
                />
                {ratingError && (
                    <p className="text-xs font-inter mt-1 text-red-500">
                        Veuillez sélectionner une note.
                    </p>
                )}
            </div>
            {/* Commentaire */}
            <div className="mb-4">
                <label
                    className="text-xs font-poppins font-medium block mb-2"
                    style={{ color: '#374151' }}
                >
                    Votre commentaire{' '}
                    <span className="font-normal" style={{ color: '#9CA3AF' }}>
                        (optionnel)
                    </span>
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Partagez votre expérience avec ce produit..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none resize-none focus:border-[#125C8D] transition-colors"
                    style={{ color: '#111827', backgroundColor: '#FFFFFF' }}
                />
                <p className="text-xs font-inter text-right mt-1" style={{ color: '#9CA3AF' }}>
                    {comment.length}/500
                </p>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 text-white text-xs font-poppins font-semibold rounded-lg disabled:opacity-50 cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#125C8D' }}
                >
                    <i className="ri-send-plane-line"></i>
                    {submitting ? 'Envoi...' : existing ? 'Mettre à jour' : "Publier l'avis"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="px-4 py-2.5 text-xs font-poppins font-medium rounded-lg cursor-pointer whitespace-nowrap transition-colors hover:bg-gray-50"
                    style={{
                        color: '#6B7280',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FFFFFF',
                    }}
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}
