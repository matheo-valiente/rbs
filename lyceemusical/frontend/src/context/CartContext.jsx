import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useShop } from './ShopContext.jsx';

const CartContext = createContext(null);
const STORAGE_KEY = 'lm-cart-v1';

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const keyOf = (productId, size) => `${productId}:${size || ''}`;

export function CartProvider({ children }) {
  const { shop, getProduct } = useShop();
  const [lines, setLines] = useState(load);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable (private mode) — cart just won't persist */
    }
  }, [lines]);

  // Drop lines whose product no longer exists once the catalogue is known.
  const validLines = useMemo(
    () => (shop ? lines.filter((l) => getProduct(l.productId)) : lines),
    [lines, shop, getProduct]
  );

  const countsOf = useCallback(
    (ls) =>
      ls.reduce(
        (acc, l) => {
          const p = getProduct(l.productId);
          if (p) {
            acc.cd += p.contains.cd * l.qty;
            acc.tshirt += p.contains.tshirt * l.qty;
          }
          return acc;
        },
        { cd: 0, tshirt: 0 }
      ),
    [getProduct]
  );

  const counts = useMemo(() => countsOf(validLines), [validLines, countsOf]);

  // Simulates the change and refuses it if it would break the per-person
  // limits (the server re-checks everything anyway).
  const check = useCallback(
    (next) => {
      if (!shop) return null;
      const c = countsOf(next);
      if (c.cd > shop.limits.cd) return `Maximum ${shop.limits.cd} CD par personne (packs inclus).`;
      if (c.tshirt > shop.limits.tshirt) return `Maximum ${shop.limits.tshirt} t-shirts par personne (packs inclus).`;
      return null;
    },
    [shop, countsOf]
  );

  const add = useCallback(
    (productId, size, qty = 1) => {
      const key = keyOf(productId, size);
      const existing = validLines.find((l) => l.key === key);
      const next = existing
        ? validLines.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
        : [...validLines, { key, productId, size: size || null, qty }];
      const error = check(next);
      if (error) return { ok: false, error };
      setLines(next);
      return { ok: true };
    },
    [validLines, check]
  );

  const setQty = useCallback(
    (key, qty) => {
      if (qty < 1) {
        setLines(validLines.filter((l) => l.key !== key));
        return { ok: true };
      }
      const next = validLines.map((l) => (l.key === key ? { ...l, qty } : l));
      const error = check(next);
      if (error) return { ok: false, error };
      setLines(next);
      return { ok: true };
    },
    [validLines, check]
  );

  const remove = useCallback((key) => setLines((ls) => ls.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const subtotal = validLines.reduce((sum, l) => sum + (getProduct(l.productId)?.price || 0) * l.qty, 0);
  const itemCount = validLines.reduce((n, l) => n + l.qty, 0);

  const value = {
    lines: validLines,
    counts,
    subtotal,
    itemCount,
    add,
    setQty,
    remove,
    clear,
    // Would adding one more of this product break a limit?
    canAdd: (productId, qty = 1) => !check([...validLines, { key: '__probe', productId, qty }]),
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
