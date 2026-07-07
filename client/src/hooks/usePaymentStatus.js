import { useEffect, useState } from 'react';

// Polls a checkout status endpoint until Stripe's webhook has marked
// the order/ticket as paid (webhook delivery is async, usually <2s).
export default function usePaymentStatus(endpoint, sessionId, { maxAttempts = 20, intervalMs = 1500 } = {}) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | paid | timeout | error

  useEffect(() => {
    if (!sessionId) {
      setState('error');
      return;
    }

    let attempts = 0;
    let cancelled = false;
    let timer;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`${endpoint}/${sessionId}`);
        if (!res.ok) throw new Error('not found');
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        if (json.status === 'paid') {
          setState('paid');
          return;
        }
        if (attempts >= maxAttempts) {
          setState('timeout');
          return;
        }
        timer = setTimeout(poll, intervalMs);
      } catch (err) {
        if (cancelled) return;
        if (attempts >= maxAttempts) {
          setState('error');
          return;
        }
        timer = setTimeout(poll, intervalMs);
      }
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [endpoint, sessionId, maxAttempts, intervalMs]);

  return { data, state };
}
