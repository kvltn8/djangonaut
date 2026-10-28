import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as cartApi from '../api/cart';
import { ApiError } from '../api/client';
import { useToast } from './ToastContext';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);
const KEY = 'abaya.cartId';

const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* noop */ } };

export function CartProvider({ children }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [cartId, setCartId] = useState(read);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const cartQuery = useQuery({
    queryKey: ['cart', cartId],
    queryFn: () => cartApi.getCart(cartId),
    enabled: !!cartId,
    retry: (n, e) => !(e instanceof ApiError && e.status === 404) && n < 2,
  });

  // cart was deleted server-side (e.g. after checkout) -> forget it
  useEffect(() => {
    if (cartQuery.error instanceof ApiError && cartQuery.error.status === 404) {
      write(null); setCartId(null);
    }
  }, [cartQuery.error]);

  const items = cartQuery.data?.items ?? [];
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + Number(i.product?.price ?? 0) * i.quantity, 0);
  const key = useMemo(() => ['cart', cartId], [cartId]);

  const ensureCart = useCallback(async () => {
    if (cartId) return cartId;
    const c = await cartApi.createCart();
    write(c.id); setCartId(c.id);
    qc.setQueryData(['cart', c.id], c);
    return c.id;
  }, [cartId, qc]);

  const refetch = (id = cartId) => qc.invalidateQueries({ queryKey: ['cart', id] });

  const addItem = useCallback(async (product, quantity = 1) => {
    if (product.stock_quantity < 1) return toast.error('This piece is currently sold out.');
    setBusy(true);
    try {
      const id = await ensureCart();
      const existing = (qc.getQueryData(['cart', id])?.items ?? []).find((i) => (i.product?.id ?? i.product_id) === product.id);
      const nextQty = (existing?.quantity ?? 0) + quantity;
      if (nextQty > product.stock_quantity) {
        toast.error(`Only ${product.stock_quantity} left in stock.`);
        return;
      }
      if (existing) await cartApi.updateCartItem(id, existing.id, nextQty);
      else await cartApi.addCartItem(id, product.id, quantity);
      await refetch(id);
      setOpen(true);
    } catch (e) {
      toast.error(e.message);
    } finally { setBusy(false); }
  }, [ensureCart, qc, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Optimistic quantity change with rollback. */
  const setQuantity = useCallback(async (item, quantity) => {
    if (quantity < 1) return removeItem(item);
    const prev = qc.getQueryData(key);
    qc.setQueryData(key, (c) => c && { ...c, items: c.items.map((i) => (i.id === item.id ? { ...i, quantity } : i)) });
    try { await cartApi.updateCartItem(cartId, item.id, quantity); }
    catch (e) { qc.setQueryData(key, prev); toast.error(e.message); }
    finally { refetch(); }
  }, [cartId, key, qc, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeItem = useCallback(async (item) => {
    const prev = qc.getQueryData(key);
    qc.setQueryData(key, (c) => c && { ...c, items: c.items.filter((i) => i.id !== item.id) });
    try { await cartApi.removeCartItem(cartId, item.id); }
    catch (e) { qc.setQueryData(key, prev); toast.error(e.message); }
    finally { refetch(); }
  }, [cartId, key, qc, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Called after checkout: backend deletes the cart when the order is created. */
  const forgetCart = useCallback(() => {
    qc.removeQueries({ queryKey: key });
    write(null); setCartId(null);
  }, [qc, key]);

  const value = {
    cartId, items, count, subtotal,
    loading: !!cartId && cartQuery.isLoading,
    busy, open, openCart: () => setOpen(true), closeCart: () => setOpen(false),
    addItem, setQuantity, removeItem, forgetCart,
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
