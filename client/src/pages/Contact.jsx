import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Contact.module.css';

const SUBJECTS = ['Booking', 'Press', 'Merch', 'Collaboration', 'Autre'];

export default function Contact() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    subject: '',
    message: ''
  });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.subject || !form.message) {
      setError('Tous les champs sont requis.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setError('Erreur lors de l’envoi.');
    } catch {
      setError('Connexion impossible au serveur.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div className={styles.headLeft}>
          <span className={styles.headLabel}>CONTACT</span>
          <span className={styles.headSep}>—</span>
          <span>RBS</span>
        </div>
        <div className={styles.headRight}>BOOKING · PRESS · COLLAB</div>
      </header>

      <div className={styles.inner}>
        <div className={styles.intro}>
          <h1 className={styles.title}>Contactez-nous</h1>
          <p className={styles.lede}>
            Booking, presse, merch, collaborations — une question, un
            projet, une scène : écrivez-nous.
          </p>
          <a href="mailto:contact@rbs.fr" className={styles.email}>
            contact@rbs.fr
          </a>
        </div>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.form
              key="form"
              className={styles.form}
              onSubmit={submit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Prénom</label>
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={form.firstName}
                    onChange={update('firstName')}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Nom</label>
                  <input
                    type="text"
                    placeholder="Nom"
                    value={form.lastName}
                    onChange={update('lastName')}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Sujet</label>
                <select
                  value={form.subject}
                  onChange={update('subject')}
                  className={`${styles.input} ${styles.select}`}
                >
                  <option value="" disabled>
                    Sélectionner un sujet
                  </option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Message</label>
                <textarea
                  placeholder="Votre message..."
                  rows={5}
                  value={form.message}
                  onChange={update('message')}
                  className={styles.textarea}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type="submit"
                className={styles.submit}
                disabled={submitting}
              >
                {submitting ? 'ENVOI...' : 'ENVOYER →'}
              </button>

              <div className={styles.bottomMail}>
                Ou directement par mail :{' '}
                <a href="mailto:contact@rbs.fr">contact@rbs.fr</a>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              className={styles.success}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className={styles.successCheck}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                ✓
              </motion.div>
              <motion.h2
                className={styles.successTitle}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Message envoyé
              </motion.h2>
              <motion.div
                className={styles.successSub}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
              >
                Merci, on revient vers vous très vite.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
