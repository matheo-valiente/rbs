import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TicketOffice.module.css';

const QR_GRID = 25;

const generateQRPattern = (seed = 1) => {
  const grid = [];
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let y = 0; y < QR_GRID; y++) {
    const row = [];
    for (let x = 0; x < QR_GRID; x++) {
      row.push(rand() > 0.5 ? 1 : 0);
    }
    grid.push(row);
  }
  // place finder patterns at three corners
  const drawFinder = (ox, oy) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isBorder = x === 0 || x === 6 || y === 0 || y === 6;
        const isInner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = isBorder || isInner ? 1 : 0;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(QR_GRID - 7, 0);
  drawFinder(0, QR_GRID - 7);
  return grid;
};

const FakeQR = ({ seed }) => {
  const grid = useMemo(() => generateQRPattern(seed), [seed]);
  const cell = 10;
  const size = QR_GRID * cell;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="240"
      height="240"
      style={{ background: '#fff', display: 'block' }}
      aria-hidden="true"
    >
      {grid.flatMap((row, y) =>
        row.map((v, x) =>
          v ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill="#000"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export default function TicketOffice() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});
  }, []);

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div className={styles.headLeft}>
          <span className={styles.headLabel}>TICKETS</span>
          <span className={styles.headSep}>—</span>
          <span>RBS</span>
        </div>
        <div className={styles.headRight}>
          BILLETTERIE OFFICIELLE · {events.length} EVENTS
        </div>
      </header>

      <section className={styles.heroBlock}>
        <h1 className={styles.title}>
          TICKETS <span className={styles.titleSlash}>/</span>{' '}
          <span className={styles.titleAlt}>OFFICE</span>
        </h1>
        <div className={styles.intro}>
          Toutes les nuits RBS. Réservation sécurisée, paiement instantané,
          QR code envoyé par email.
        </div>
      </section>

      <div className={styles.list}>
        {events.map((ev, i) => (
          <motion.article
            key={ev.id}
            className={styles.row}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <div className={styles.num}>{String(i + 1).padStart(2, '0')}</div>

            <div className={styles.center}>
              <h2 className={styles.evName}>{ev.name}</h2>
              <div className={styles.evMeta}>
                <span>{ev.location}</span>
                <span className={styles.dot}>·</span>
                <span>{ev.date}</span>
              </div>
            </div>

            <div className={styles.right}>
              <div className={styles.price}>{ev.price}</div>
              <button
                className={styles.btn}
                onClick={() => setOpen(ev)}
              >
                GET TICKET <span aria-hidden="true">→</span>
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.modalBackdrop}
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className={styles.modalClose}
                onClick={close}
                aria-label="Close"
              >
                ✕
              </button>

              <div className={styles.modalLabel}>YOUR TICKET</div>
              <h2 className={styles.modalName}>{open.name}</h2>
              <div className={styles.modalMeta}>
                {open.location} · {open.date}
              </div>

              <div className={styles.qrWrap}>
                <FakeQR seed={open.id} />
              </div>

              <div className={styles.modalScan}>
                Scannez pour finaliser le paiement
              </div>

              <div className={styles.modalCode}>
                CODE — RBS-{String(open.id).padStart(4, '0')}-{open.price.replace(/[^0-9]/g, '')}
              </div>

              <button className={styles.modalCloseBtn} onClick={close}>
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
