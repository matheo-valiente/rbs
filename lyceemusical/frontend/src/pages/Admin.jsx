import { useCallback, useEffect, useState } from 'react';
import { euros } from '../lib/format.js';
import styles from './Admin.module.css';

const TOKEN_KEY = 'lm-admin';

const readToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'short' }) : '—';

const addressLines = (a) => {
  if (!a) return [];
  const ad = a.address || {};
  return [a.name, ad.line1, ad.line2, [ad.postal_code, ad.city].filter(Boolean).join(' '), ad.country].filter(Boolean);
};

export default function Admin() {
  const [token, setToken] = useState(readToken);
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('todo'); // todo | done | refunded | all
  const [openRow, setOpenRow] = useState(null);

  const api = useCallback(
    async (path, opts = {}) => {
      const res = await fetch(`/api/admin${path}`, {
        ...opts,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
      });
      if (res.status === 401) {
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch {
          /* ignore */
        }
        setToken('');
        throw new Error('Mot de passe incorrect');
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erreur');
      return res;
    },
    [token]
  );

  const load = useCallback(async () => {
    try {
      const res = await api('/orders');
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [api]);

  useEffect(() => {
    if (!token) return;
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [token, load]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const login = (e) => {
    e.preventDefault();
    try {
      sessionStorage.setItem(TOKEN_KEY, password);
    } catch {
      /* ignore */
    }
    setToken(password);
    setPassword('');
  };

  const toggleFulfilled = async (order) => {
    let tracking = '';
    if (!order.fulfilled_at) {
      const answer = window.prompt(
        `Expédier ${order.number} — numéro ou lien de suivi (optionnel).\nLe client recevra un email « commande expédiée ».`,
        ''
      );
      if (answer === null) return; // cancelled
      tracking = answer;
    } else if (!window.confirm(`Annuler le statut « expédiée » de ${order.number} ?`)) {
      return;
    }
    try {
      await api(`/orders/${order.number}/fulfilled`, {
        method: 'POST',
        body: JSON.stringify({ fulfilled: !order.fulfilled_at, tracking })
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const saveNote = async (order, note) => {
    if (note === (order.note || '')) return;
    try {
      await api(`/orders/${order.number}/note`, { method: 'POST', body: JSON.stringify({ note }) });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const downloadCsv = async () => {
    try {
      const res = await api('/orders.csv');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commandes-lycee-musical-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  };

  if (!token) {
    return (
      <div className={styles.loginPage}>
        <form className={styles.login} onSubmit={login}>
          <div className={styles.kicker}>LYCÉE MUSICAL — ADMIN</div>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={!password}>
            ENTRER
          </button>
        </form>
      </div>
    );
  }

  const orders = (data?.orders || []).filter((o) => {
    if (filter === 'refunded') return o.status === 'refunded';
    if (o.status !== 'paid') return false;
    return filter === 'todo' ? !o.fulfilled_at : filter === 'done' ? !!o.fulfilled_at : true;
  });
  const flagged = (data?.orders || []).filter((o) => o.status === 'paid' && o.flags?.length);
  const s = data?.summary;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.kicker}>LYCÉE MUSICAL — COMMANDES</div>
        <div className={styles.headActions}>
          <button type="button" onClick={load}>ACTUALISER</button>
          <button type="button" onClick={downloadCsv}>EXPORT CSV</button>
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem(TOKEN_KEY);
              } catch {
                /* ignore */
              }
              setToken('');
              setData(null);
            }}
          >
            DÉCONNEXION
          </button>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {data?.testMode && <p className={styles.alert}>MODE TEST STRIPE — ces commandes ne sont pas de vrais paiements.</p>}
      {flagged.map((o) => (
        <p key={o.number} className={styles.alert}>
          ⚠ {o.number} : {o.flags.join(' · ')}
        </p>
      ))}

      {s && (
        <section className={styles.stats}>
          <div>
            <span>COMMANDES PAYÉES</span>
            <strong>{s.orders}</strong>
          </div>
          <div>
            <span>À EXPÉDIER</span>
            <strong className={s.toShip ? styles.red : ''}>{s.toShip}</strong>
          </div>
          <div>
            <span>CHIFFRE D’AFFAIRES</span>
            <strong>{euros(s.revenue)}</strong>
          </div>
          <div>
            <span>CD À PRÉPARER</span>
            <strong>{s.cd}</strong>
          </div>
          <div className={styles.sizesStat}>
            <span>T-SHIRTS ({s.tshirts})</span>
            <div>
              {Object.entries(s.tshirtSizes).map(([size, n]) => (
                <em key={size}>
                  {size} <b>{n}</b>
                </em>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className={styles.filters}>
        {[
          ['todo', 'À EXPÉDIER'],
          ['done', 'EXPÉDIÉES'],
          ['all', 'TOUTES PAYÉES'],
          ['refunded', 'REMBOURSÉES']
        ].map(([k, label]) => (
          <button key={k} type="button" className={filter === k ? styles.active : ''} onClick={() => setFilter(k)}>
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>N°</th>
              <th>PAYÉE LE</th>
              <th>CLIENT</th>
              <th>ARTICLES</th>
              <th>TOTAL</th>
              <th>STATUT</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  [ AUCUNE COMMANDE ]
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <FragmentRow
                key={o.number}
                order={o}
                testMode={!!data?.testMode}
                open={openRow === o.number}
                onToggle={() => setOpenRow(openRow === o.number ? null : o.number)}
                onFulfil={() => toggleFulfilled(o)}
                onNote={(note) => saveNote(o, note)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({ order: o, testMode, open, onToggle, onFulfil, onNote }) {
  const [note, setNote] = useState(o.note || '');
  useEffect(() => setNote(o.note || ''), [o.note]);

  return (
    <>
      <tr className={styles.row} onClick={onToggle}>
        <td className={styles.num}>
          {o.number}
          {o.flags?.length > 0 && <span className={styles.flagDot} title={o.flags.join('\n')}> ⚠</span>}
        </td>
        <td>{fmtDate(o.paid_at)}</td>
        <td>
          <div>{o.shipping_address?.name || o.customer_name || '—'}</div>
          <small>{o.email}</small>
        </td>
        <td>
          {o.items.map((i) => (
            <div key={`${i.productId}-${i.size}`}>
              {i.qty} × {i.name}
              {i.size && <b> {i.size}</b>}
            </div>
          ))}
        </td>
        <td>{euros(o.total || 0)}</td>
        <td>
          {o.status === 'refunded' ? (
            <span className={styles.done}>REMBOURSÉE</span>
          ) : (
          <button
            type="button"
            className={o.fulfilled_at ? styles.done : styles.todo}
            onClick={(e) => {
              e.stopPropagation();
              onFulfil();
            }}
          >
            {o.fulfilled_at ? 'EXPÉDIÉE ✓' : 'MARQUER EXPÉDIÉE'}
          </button>
          )}
        </td>
      </tr>
      {open && (
        <tr className={styles.detail}>
          <td colSpan={6}>
            <div className={styles.detailGrid}>
              <div>
                <span>ADRESSE DE LIVRAISON</span>
                <p>
                  {addressLines(o.shipping_address).map((l) => (
                    <span key={l}>
                      {l}
                      <br />
                    </span>
                  ))}
                </p>
                <p>{o.phone || ''}</p>
              </div>
              <div>
                <span>SUIVI</span>
                <p>
                  Payée : {fmtDate(o.paid_at)}
                  <br />
                  Équipe notifiée : {fmtDate(o.notified_at)}
                  <br />
                  Expédiée : {fmtDate(o.fulfilled_at)}
                  {o.tracking && (
                    <>
                      <br />
                      Suivi : {o.tracking}
                    </>
                  )}
                  {o.refunded_at && (
                    <>
                      <br />
                      Remboursée : {fmtDate(o.refunded_at)}
                    </>
                  )}
                </p>
                {o.flags?.map((f) => (
                  <p key={f} className={styles.flagText}>
                    ⚠ {f}
                  </p>
                ))}
                {o.payment_intent && (
                  <a
                    href={`https://dashboard.stripe.com/${testMode ? 'test/' : ''}payments/${o.payment_intent}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    VOIR / REMBOURSER DANS STRIPE ↗
                  </a>
                )}
              </div>
              <div>
                <span>NOTE INTERNE (N° DE SUIVI…)</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => onNote(note)} rows={3} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
