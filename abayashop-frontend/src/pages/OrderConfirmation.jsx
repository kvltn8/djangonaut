import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '../api/orders';
import { useProductMap } from '../hooks/useProductMap';
import OrderLines from '../components/ui/OrderLines';
import { ErrorState } from '../components/ui/States';
import Icon from '../components/ui/Icon';
import { money, ORDER_STATUS } from '../lib/format';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { state } = useLocation();
  const { data: order, isLoading, error, refetch } = useQuery({ queryKey: ['order', id], queryFn: () => getOrder(id) });
  const { map } = useProductMap(order?.items?.map((i) => i.product_id) ?? []);

  if (isLoading) return <div className="page py-16"><div className="skeleton h-64 rounded-xl max-w-2xl mx-auto" /></div>;
  if (error) return <div className="page"><ErrorState error={error} onRetry={refetch} /></div>;
  const st = ORDER_STATUS[order.status] ?? ORDER_STATUS.P;

  return (
    <div className="page py-12 max-w-2xl">
      {state?.justPlaced && (
        <div className="text-center mb-10">
          <Icon name="check_circle" size={48} className="text-secondary" />
          <h1 className="font-serif italic text-headline-lg-mobile lg:text-headline-lg mt-3">Thank you</h1>
          <p className="text-on-surface-variant mt-2">Your order has been placed. We will be in touch shortly.</p>
        </div>
      )}
      <div className="bg-surface-container-lowest rounded-2xl shadow-soft p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-headline-sm">Order #{order.id}</h2>
          <span className={`px-3 py-1 rounded-full text-label-sm uppercase ${st.tone}`}>{st.label}</span>
        </div>
        <div className="mt-4"><OrderLines items={order.items} productMap={map} /></div>
        <div className="flex justify-between text-title-lg pt-4 border-t border-outline-variant/30"><span>Total</span><span>{money(order.total)}</span></div>
      </div>
      <div className="flex gap-4 mt-8 justify-center"><Link to="/account" className="btn-outline">My orders</Link><Link to="/shop" className="btn-primary">Continue shopping</Link></div>
    </div>
  );
}
