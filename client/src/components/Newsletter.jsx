import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Newsletter.module.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setDone(true);
  };

  return (
    <section className={styles.section}>
      <div className={styles.kicker}>NEWSLETTER — RBS</div>
      <h2 className={styles.title}>
        EARLY ACCESS, DROPS, TICKETS.
        <br />
        <span>SUBSCRIBE.</span>
      </h2>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.form
            key="form"
            className={styles.form}
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.btn}>
              SIGN UP →
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            className={styles.done}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            ✓ MERCI — VOUS ÊTES INSCRIT.
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.fine}>
        En vous inscrivant vous acceptez de recevoir des emails de RBS.
        Pas de spam. Désabonnement en 1 clic.
      </div>
    </section>
  );
}
