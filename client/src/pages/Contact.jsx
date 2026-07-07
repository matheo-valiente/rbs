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
  const [selectOpen, setSelectOpen] = useState(false);

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

      <div className={styles.bgWord} aria-hidden="true">
        CONTACT
      </div>

      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.kicker}>RBS — GET IN TOUCH</div>
          <h1 className={styles.title}>
            CONTACT <span className={styles.titleSlash}>/</span>{' '}
            <span className={styles.titleAlt}>RBS</span>
          </h1>
          <div className={styles.lede}>
            Booking, presse, merch, collaborations.
            Une question, un projet, une scène — écrivez-nous.
          </div>
          <a href="mailto:contact@rbs.fr" className={styles.email}>
            contact@rbs.fr
          </a>
        </div>

        <div className={styles.right}>
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
                    <label className={styles.label}>01 / FIRST NAME</label>
                    <input
                      type="text"
                      placeholder="Prénom"
                      value={form.firstName}
                      onChange={update('firstName')}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>02 / LAST NAME</label>
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
                  <label className={styles.label}>03 / SUBJECT</label>
                  <button
                    type="button"
                    className={`${styles.input} ${styles.select}`}
                    onClick={() => setSelectOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={selectOpen}
                  >
                    <span className={form.subject ? '' : styles.placeholder}>
                      {form.subject || 'Sélectionner un sujet'}
                    </span>
                    <span className={`${styles.chevron} ${selectOpen ? styles.chevronOpen : ''}`}>
                      ▾
                    </span>
                  </button>

                  <AnimatePresence>
                    {selectOpen && (
                      <motion.ul
                        className={styles.dropdown}
                        role="listbox"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        {SUBJECTS.map((s) => (
                          <li
                            key={s}
                            role="option"
                            aria-selected={form.subject === s}
                            className={`${styles.option} ${form.subject === s ? styles.optionActive : ''}`}
                            onClick={() => {
                              setForm((f) => ({ ...f, subject: s }));
                              setSelectOpen(false);
                            }}
                          >
                            {s}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>04 / MESSAGE</label>
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
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className={styles.successCheck}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  ✓
                </motion.div>
                <motion.h2
                  className={styles.successTitle}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  MESSAGE ENVOYÉ ✓
                </motion.h2>
                <motion.div
                  className={styles.successSub}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  Merci, on revient vers vous très vite.
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
