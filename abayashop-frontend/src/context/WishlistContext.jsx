import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// The backend has no wishlist endpoint yet, so this is kept per-device in localStorage.
const Ctx = createContext(null);
export const useWishlist = () => useContext(Ctx);
const KEY = 'abaya.wishlist';

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY)) ?? []; } catch { return []; } });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* noop */ } }, [ids]);
  const toggle = useCallback((id) => setIds((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id])), []);
  return <Ctx.Provider value={{ ids, has: (id) => ids.includes(id), toggle }}>{children}</Ctx.Provider>;
}
