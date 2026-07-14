import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export function useDarkMode() {
  const themeMode = useStore(s => s.themeMode);
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (themeMode === 'system') return systemDark;
  return themeMode === 'dark';
}
