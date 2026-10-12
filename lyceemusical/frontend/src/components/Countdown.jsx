import { useEffect, useState } from 'react';
import styles from './Countdown.module.css';

// `offset` = serverTime - clientTime, so a visitor with a wrong clock still
// sees the real time left.
const getRemaining = (target, offset) => {
  const diff = Math.max(0, new Date(target).getTime() - (Date.now() + offset));
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    done: diff <= 0
  };
};

export default function Countdown({ target, offset = 0, size = 'default' }) {
  const [time, setTime] = useState(() => getRemaining(target, offset));

  useEffect(() => {
    setTime(getRemaining(target, offset));
    const id = setInterval(() => setTime(getRemaining(target, offset)), 1000);
    return () => clearInterval(id);
  }, [target, offset]);

  if (time.done) return null;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className={`${styles.countdown} ${size === 'lg' ? styles.lg : ''}`} role="timer">
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
