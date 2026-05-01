import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
// Mapping slug → icône Remix Icon
const CATEGORY_ICONS = {
  mode: 'ri-t-shirt-line',
  beaute: 'ri-sparkling-line',
  hightech: 'ri-smartphone-line',
  auto: 'ri-car-line',
  maison: 'ri-home-3-line',
  sport: 'ri-run-line',
};
export default function CategoryBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const active = searchParams.get('category') || '';
  const { data: categories = [], isLoading } = useCategories();
  const handleClick = (slug) => {
    if (active === slug) navigate('/');
    else navigate('/?category=' + slug);
  };
  return (
    <nav className="bg-white border-b border-gray-100 z-40" style={{ position: 'sticky', top: '80px' }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
          <button
            onClick={() => navigate('/')}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-poppins font-medium transition-all duration-200"
            style={
              active === ''
                ? { backgroundColor: '#125C8D', color: '#fff' }
                : { color: '#6B7280', backgroundColor: 'transparent' }
            }
          >
            <i className="ri-apps-line text-sm"></i>
            Tous
          </button>
          {isLoading && (
            // Skeleton loading
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 h-9 w-24 rounded-full animate-pulse"
                style={{ backgroundColor: '#F1F5F9' }}
              />
            ))
          )}
          {!isLoading && categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.slug)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-poppins font-medium transition-all duration-200"
              style={
                active === cat.slug
                  ? { backgroundColor: '#125C8D', color: '#fff' }
                  : { color: '#6B7280', backgroundColor: 'transparent' }
              }
            >
              <i className={`${CATEGORY_ICONS[cat.slug] || 'ri-price-tag-3-line'} text-sm`}></i>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
