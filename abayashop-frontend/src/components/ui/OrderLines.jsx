import { Link } from 'react-router-dom';
import SmoothImage from './SmoothImage';
import { money } from '../../lib/format';
import { firstImage } from '../../api/catalog';

/** Order items only carry product_id, so names/images come from a product map. */
export default function OrderLines({ items, productMap }) {
  return (
    <ul className="divide-y divide-outline-variant/30">
      {items.map((it) => {
        const p = productMap[it.product_id];
        const img = firstImage(p);
        return (
          <li key={it.id} className="flex gap-4 py-4">
            <div className="relative w-16 h-20 bg-sand rounded-lg overflow-hidden shrink-0">
              <SmoothImage src={img} iconSize={24} />
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${it.product_id}`} className="text-title-md hover:text-secondary">{p?.name ?? `Item #${it.product_id}`}</Link>
              <p className="text-on-surface-variant">Qty {it.quantity} · {money(it.unitprice)}</p>
            </div>
            <span className="text-title-md">{money(it.totalAmount ?? it.quantity * it.unitprice)}</span>
          </li>
        );
      })}
    </ul>
  );
}
