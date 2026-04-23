import { useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '@/mocks/products';

export default function CategoryBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const active = searchParams.get('category') || '';

  const handleClick = (id) => {
    if (active === id) navigate('/');
    else navigate('/?category=' + id);
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
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-poppins font-medium transition-all duration-200"
              style={
                active === cat.id
                  ? { backgroundColor: '#125C8D', color: '#fff' }
                  : { color: '#6B7280', backgroundColor: 'transparent' }
              }
            >
              <i className={`${cat.icon} text-sm`}></i>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
