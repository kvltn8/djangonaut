import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getCustomer, updateCustomer } from '../api/auth';
import { createOrder } from '../api/orders';
import { money } from '../lib/format';
import { FREE_SHIPPING_THRESHOLD } from '../config';
import Icon from '../components/ui/Icon';

export default function Checkout() {
  const { cartId, items, subtotal, loading, forgetCart } = useCart();
  const nav = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const customer = useQuery({ queryKey: ['customer'], queryFn: getCustomer });
  const [form, setForm] = useState({ phone_number: '', city: '', country: '', delivery_address: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customer.data) setForm({
      phone_number: customer.data.phone_number ?? '', city: customer.data.city ?? '',
      country: customer.data.country ?? '', delivery_address: customer.data.delivery_address ?? '',
    });
  }, [customer.data]);

  if (loading || customer.isLoading) return <div className="page py-16"><div className="skeleton h-96 rounded-xl" /></div>;
  if (!cartId || items.length === 0) return <Navigate to="/shop" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const outOfStock = items.find((i) => i.quantity > (i.product?.stock_quantity ?? Infinity));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      if (!customer.data) throw new Error('We could not load your customer profile. Please sign in again.');
      await updateCustomer(customer.data.id, form);          // save delivery details
      const order = await createOrder(cartId);               // server turns the cart into an order
      forgetCart();
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });      // stock changed
      nav(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } });
    } catch (ex) {
      setError(ex);
      toast.error(ex.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="page py-10 lg:py-14">
      <p className="label">Secure checkout</p>
      <h1 className="font-serif text-headline-lg-mobile lg:text-headline-lg mt-2 mb-10">Delivery details</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">
        <div className="space-y-5">
          <div>
            <label className="field-label" htmlFor="addr">Delivery address</label>
            <textarea id="addr" required rows={3} value={form.delivery_address} onChange={set('delivery_address')} autoComplete="street-address" className="field" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label className="field-label" htmlFor="city">City</label><input id="city" required value={form.city} onChange={set('city')} autoComplete="address-level2" className="field" /></div>
            <div><label className="field-label" htmlFor="country">Country</label><input id="country" required value={form.country} onChange={set('country')} autoComplete="country-name" className="field" /></div>
          </div>
          <div>
            <label className="field-label" htmlFor="phone">Phone number</label>
            <input id="phone" required inputMode="tel" maxLength={10} value={form.phone_number} onChange={set('phone_number')} autoComplete="tel-national" className="field" />
            <p className="text-label-md normal-case tracking-normal text-outline mt-1">Up to 10 digits.</p>
          </div>
          <div className="bg-surface-container-low p-5 rounded-xl flex gap-3">
            <Icon name="payments" className="text-secondary" />
            <p className="text-on-surface-variant">Payment is confirmed after your order is placed. Your order is created as <strong className="font-medium text-primary">Pending</strong> until payment is received.</p>
          </div>
        </div>

        <aside className="bg-surface-container-low p-6 rounded-2xl lg:sticky lg:top-36">
          <h2 className="font-serif text-headline-sm mb-4">Your bag</h2>
          <ul className="divide-y divide-outline-variant/30">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                <div className="w-14 h-[72px] bg-surface-container rounded overflow-hidden shrink-0">{i.product?.image && <img src={i.product.image} alt="" className="w-full h-full object-cover" />}</div>
                <div className="flex-1 min-w-0"><p className="text-title-md line-clamp-2">{i.product?.name}</p><p className="text-on-surface-variant">Qty {i.quantity}</p></div>
                <span>{money(Number(i.product?.price) * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-2 text-on-surface-variant">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-secondary">{subtotal >= FREE_SHIPPING_THRESHOLD ? 'Complimentary' : 'Calculated on dispatch'}</span></div>
            <div className="flex justify-between text-title-lg text-primary pt-2"><span>Total</span><span>{money(subtotal)}</span></div>
          </div>
          {error && <p role="alert" className="mt-4 bg-error-container text-on-error-container px-4 py-3">{error.message}</p>}
          {outOfStock && <p className="mt-4 text-error">Some items exceed available stock — adjust your bag.</p>}
          <button disabled={busy || !!outOfStock} className="btn-primary w-full mt-5 rounded-lg">{busy ? 'Placing order…' : 'Place order'}</button>
          <Link to="/shop" className="block text-center mt-4 text-on-surface-variant underline underline-offset-4">Continue shopping</Link>
        </aside>
      </form>
    </div>
  );
}
