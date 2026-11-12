import { useState, useEffect } from 'react';

// Retourne le temps restant en ms (null si pas d'échéance), mis à jour chaque seconde.
export function useCountdown(deadlineMs) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!deadlineMs) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadlineMs]);
  if (!deadlineMs) return null;
  return Math.max(0, deadlineMs - now);
}
