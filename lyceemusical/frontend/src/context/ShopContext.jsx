import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Catalogue, prices, limits and the preorder window all come from the server
// (/api/shop) so there is one source of truth — the front never hardcodes them.
const ShopContext = createContext(null);

const phaseAt = (shop, t) => {
  if (!shop) return 'loading';
  if (shop.preorder.paused) return 'paused';
  if (t < new Date(shop.preorder.opensAt).getTime()) return 'upcoming';
  if (t > new Date(shop.preorder.closesAt).getTime()) return 'closed';
  return 'open';
};

export function ShopProvider({ children }) {
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(false);
  const [offset, setOffset] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let retry;
    const load = () =>
      fetch('/api/shop')
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((data) => {
          if (cancelled) return;
          setOffset(new Date(data.now).getTime() - Date.now());
          setShop(data);
          setError(false);
        })
        .catch(() => {
          if (cancelled) return;
          setError(true);
          retry = setTimeout(load, 4000);
        });
    load();
    return () => {
      cancelled = true;
      clearTimeout(retry);
    };
  }, []);

  const phase = phaseAt(shop, Date.now() + offset);

  // Re-render exactly when the window opens/closes so buttons flip live.
  useEffect(() => {
    if (!shop || phase === 'closed' || phase === 'paused') return;
    const boundary = new Date(phase === 'upcoming' ? shop.preorder.opensAt : shop.preorder.closesAt).getTime();
    const wait = boundary - (Date.now() + offset) + 500;
    // setTimeout overflows past ~24.8 days; re-check daily in that case.
    const id = setTimeout(() => setTick((n) => n + 1), Math.min(Math.max(wait, 0), 86400000));
    return () => clearTimeout(id);
  }, [shop, phase, offset]);

  const value = useMemo(
    () => ({
      shop,
      error,
      offset,
      phase,
      products: shop?.products || [],
      getProduct: (id) => shop?.products.find((p) => p.id === id) || null
    }),
    [shop, error, offset, phase]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
