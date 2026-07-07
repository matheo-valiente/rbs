import { useEffect, useState } from 'react';
import styles from './Countdown.module.css';

const getRemaining = (target) => {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    done: diff <= 0
  };
};

export default function Countdown({ target }) {
  const [time, setTime] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.done) return null;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className={styles.countdown}>
      <span>{pad(time.d)}J</span>
      <span className={styles.sep}>:</span>
      <span>{pad(time.h)}H</span>
      <span className={styles.sep}>:</span>
      <span>{pad(time.m)}M</span>
      <span className={styles.sep}>:</span>
      <span>{pad(time.s)}S</span>
    </div>
  );
}
