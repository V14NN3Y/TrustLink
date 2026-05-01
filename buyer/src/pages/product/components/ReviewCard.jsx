import StarRating from './StarRating';
export default function ReviewCard({ review }) {
    const name = review.profiles?.full_name || 'Acheteur vérifié';
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    const date = new Date(review.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    return (
        <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-poppins font-bold text-xs text-white overflow-hidden"
                    style={{ backgroundColor: '#125C8D' }}
                >
                    {review.profiles?.avatar_url ? (
                        <img
                            src={review.profiles.avatar_url}
                            alt={name}
                            className="w-9 h-9 rounded-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                            <p className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>
                                {name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <StarRating value={review.rating} readonly size="sm" />
                                <span className="text-xs font-inter" style={{ color: '#9CA3AF' }}>
                                    {date}
                                </span>
                            </div>
                        </div>
                        <span
                            className="text-xs font-poppins font-medium px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                            style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}
                        >
                            <i className="ri-shield-check-line"></i>
                            Achat vérifié
                        </span>
                    </div>
                    {review.comment && (
                        <p
                            className="text-sm font-inter mt-2 leading-relaxed"
                            style={{ color: '#374151' }}
                        >
                            {review.comment}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
