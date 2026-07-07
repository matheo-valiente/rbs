import { useEffect, useRef, useState } from 'react';
import styles from './DragCarousel.module.css';

export default function DragCarousel({
  children,
  ariaLabel = 'Carousel',
  showHint = true,
  hintLabel = 'DRAG TO MOVE',
  className = ''
}) {
  const ref = useRef(null);
  const stateRef = useRef({ down: false, startX: 0, startScroll: 0, moved: false });
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(0);

  const updateProgress = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    setProgress(Math.min(1, Math.max(0, p)));
    const cards = el.querySelectorAll('[data-card]');
    if (cards.length) {
      const center = el.scrollLeft + el.clientWidth / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const cx = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cx - center);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      setActive(bestIdx);
      setCount(cards.length);
    }
  };

  useEffect(() => {
    updateProgress();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      el.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const onPointerDown = (e) => {
    const el = ref.current;
    if (!el) return;
    stateRef.current.down = true;
    stateRef.current.moved = false;
    stateRef.current.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    stateRef.current.startScroll = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.scrollBehavior = 'auto';
  };

  const onPointerMove = (e) => {
    const s = stateRef.current;
    if (!s.down) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const dx = s.startX - x;
    if (Math.abs(dx) > 4) s.moved = true;
    if (ref.current) ref.current.scrollLeft = s.startScroll + dx;
  };

  const onPointerUp = () => {
    stateRef.current.down = false;
    if (ref.current) {
      ref.current.style.cursor = 'grab';
      ref.current.style.scrollBehavior = '';
    }
    setTimeout(() => (stateRef.current.moved = false), 50);
  };

  const goTo = (idx) => {
    const el = ref.current;
    if (!el) return;
    const cards = el.querySelectorAll('[data-card]');
    const c = cards[idx];
    if (!c) return;
    const target = c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div
        ref={ref}
        className={styles.track}
        role="region"
        aria-label={ariaLabel}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        onClickCapture={(e) => {
          if (stateRef.current.moved) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <div className={styles.row}>{children}</div>
      </div>

      <div className={styles.controls}>
        <div className={styles.left}>
          {showHint && (
            <span className={styles.hint}>
              <span aria-hidden>←</span> {hintLabel} <span aria-hidden>→</span>
            </span>
          )}
        </div>

        <div className={styles.center}>
          <div className={styles.bar} role="presentation">
            <span
              className={styles.barFill}
              style={{ transform: `translateX(${progress * 100}%)` }}
            />
          </div>
        </div>

        <div className={styles.right}>
          <button
            className={styles.arrow}
            onClick={() => goTo(Math.max(0, active - 1))}
            aria-label="Previous"
          >
            ←
          </button>
          <span className={styles.count}>
            {String(active + 1).padStart(2, '0')}
            <span className={styles.countSep}>/</span>
            {String(count).padStart(2, '0')}
          </span>
          <button
            className={styles.arrow}
            onClick={() => goTo(Math.min(count - 1, active + 1))}
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
