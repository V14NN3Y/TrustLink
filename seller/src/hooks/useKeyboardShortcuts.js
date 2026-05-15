import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.metaKey || e.ctrlKey) return;
      const map = { '1': '/', '2': '/orders', '3': '/catalog', '4': '/reviews', '5': '/stats', '6': '/payouts', '7': '/support', '8': '/messages', '9': '/settings', '0': '/notifications' };
      if (map[e.key]) navigate(map[e.key]);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);
}
