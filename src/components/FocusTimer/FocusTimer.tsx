import { useState, useEffect } from 'react';

export const FocusTimer = () => {
  const [seconds, setSeconds] = useState(25 * 60);
  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);
  const format = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;
  return <div className="text-9xl font-mono font-bold text-zinc-800 mb-8 tracking-tighter">{format(seconds)}</div>;
};
