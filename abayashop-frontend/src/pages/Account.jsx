import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCustomer, updateCustomer } from '../api/auth';
import { getOrders } from '../api/orders';
import { useProductMap } from '../hooks/useProductMap';
import OrderLines from '../components/ui/OrderLines';
import { EmptyState, ErrorState } from '../components/ui/States';
import { money, ORDER_STATUS } from '../lib/format';

function Profile() {
  const toast = useToast();
  const qc = useQueryClient();
  const customer = useQuery({ queryKey: ['customer'], queryFn: getCustomer });
  const [form, setForm] = useState({ phone_number: '', city: '', country: '', delivery_address: '' });
  useEffect(() => {
    if (customer.data) setForm({ phone_number: customer.data.phone_number ?? '', city: customer.data.city ?? '', country: customer.data.country ?? '', delivery_address: customer.data.delivery_address ?? '' });
  }, [customer.data]);
  const save = useMutation({
    mutationFn: () => updateCustomer(customer.data.id, form),
    onSuccess: (d) => { qc.setQueryData(['customer'], d); toast.success('Details saved.'); },
    onError: (e) => toast.error(e.message),
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="bg-surface-container-low p-6 rounded-2xl space-y-4">
      <h2 className="font-serif text-headline-sm">Delivery details</h2>
      {customer.data?.loyalty_points != null && <p className="text-secondary text-label-md uppercase">{customer.data.loyalty_points} loyalty points</p>}
      <div><label className="field-label" htmlFor="a-addr">Address</label><textarea id="a-addr" rows={2} className="field" value={form.delivery_address} onChange={set('delivery_address')} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="field-label" htmlFor="a-city">City</label><input id="a-city" className="field" value={form.city} onChange={set('city')} /></div>
        <div><label className="field-label" htmlFor="a-country">Country</label><input id="a-country" className="field" value={form.country} onChange={set('country')} /></div>
      </div>
      <div><label className="field-label" htmlFor="a-phone">Phone</label><input id="a-phone" maxLength={10} className="field" value={form.phone_number} onChange={set('phone_number')} /></div>
      <button disabled={save.isPending || !customer.data} className="btn-primary">{save.isPending ? 'Saving…' : 'Save details'}</button>
    </form>
  );
}

function Orders() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['orders'], queryFn: getOrders });
  const orders = [...(data ?? [])].reverse(); // API orders oldest-first
  const { map } = useProductMap(orders.flatMap((o) => o.items.map((i) => i.product_id)));
  if (isLoading) return <div className="skeleton h-40 rounded-xl" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!orders.length) return <EmptyState icon="inventory_2" title="No orders yet"><Link to="/shop" className="btn-outline mt-4">Start shopping</Link></EmptyState>;
  return (
    <div className="space-y-6">
      {orders.map((o) => {
        const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.P;
        return (
          <article key={o.id} className="bg-surface-container-lowest rounded-xl shadow-[0_1px_8px_rgba(56,45,40,0.04)] p-5">
            <div className="flex items-center justify-between">
              <Link to={`/orders/${o.id}`} className="text-title-md hover:text-secondary">Order #{o.id}</Link>
              <span className={`px-3 py-1 rounded-full text-label-sm uppercase ${st.tone}`}>{st.label}</span>
            </div>
            <OrderLines items={o.items} productMap={map} />
            <div className="flex justify-between pt-3 border-t border-outline-variant/30 text-title-md"><span>Total</span><span>{money(o.total)}</span></div>
          </article>
        );
      })}
    </div>
  );
}

export default function Account() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="label">My account</p>
          <h1 className="font-serif text-headline-lg-mobile lg:text-headline-lg mt-2">Hello, {user?.first_name || user?.username}</h1>
          <p className="text-on-surface-variant">{user?.email}</p>
        </div>
        <button onClick={() => { logout(); nav('/'); }} className="btn-outline">Sign out</button>
      </div>
      <div className="grid lg:grid-cols-[360px_1fr] gap-10 items-start">
        <Profile />
        <section><h2 className="font-serif text-headline-md mb-5">Order history</h2><Orders /></section>
      </div>
    </div>
  );
}
