export default function StarRating({ value = 0, onChange, readonly = false, size = 'md' }) {
    const sizes = {
        sm: 'text-sm',
        md: 'text-xl',
        lg: 'text-2xl',
    };
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onChange && onChange(star)}
                    className={`
              ${sizes[size]}
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
            `}
                    style={{
                        color: star <= Math.round(value) ? '#F59E0B' : '#D1D5DB',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        lineHeight: 1,
                    }}
                    aria-label={readonly ? `${value} étoiles` : `Donner ${star} étoile${star > 1 ? 's' : ''}`}
                >
                    <i className={star <= Math.round(value) ? 'ri-star-fill' : 'ri-star-line'}></i>
                </button>
            ))}
        </div>
    );
}