import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.metaKey || e.ctrlKey) return;
      switch (e.key) {
        case '1': navigate('/'); break;
        case '2': navigate('/orders'); break;
        case '3': navigate('/finance'); break;
        case '4': navigate('/logistics'); break;
        case '5': navigate('/moderation'); break;
        case '6': navigate('/users'); break;
        case '7': navigate('/products'); break;
        case '8': navigate('/messages'); break;
        case 'g': navigate('/admin-logs'); break;
        case 'p': navigate('/profile'); break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);
}
