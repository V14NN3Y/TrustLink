import { useRef, useEffect } from 'react';

export function useMounted() {
  const ref = useRef(true);
  useEffect(() => { ref.current = true; return () => { ref.current = false; }; }, []);
  return ref;
}
