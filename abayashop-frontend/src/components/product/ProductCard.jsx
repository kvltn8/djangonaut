import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import { money } from '../../lib/format';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product, categoryName, compact = false }) {
  const { has, toggle } = useWishlist();
  const { addItem, busy } = useCart();
  const [a, b] = product.images ?? [];
  const soldOut = product.stock_quantity < 1;
  const liked = has(product.id);

  if (compact) {
    return (
      <article className="group">
        <div className="relative aspect-[5/6] overflow-hidden rounded-lg bg-sand">
          <Link to={`/product/${product.id}`} aria-label={product.name} className="absolute inset-0 block">
            {a ? (
              <>
                <img src={a.image} alt={product.name} loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[400ms] ${b ? 'group-hover:opacity-0' : ''}`} />
                {b && <img src={b.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]" />}
              </>
            ) : <div className="absolute inset-0 flex items-center justify-center text-outline"><Icon name="checkroom" size={40} /></div>}
          </Link>
          {soldOut && <span className="absolute top-2 left-2 bg-surface/90 px-2 py-0.5 text-label-sm uppercase">Sold out</span>}
          <button onClick={() => toggle(product.id)} aria-pressed={liked} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute z-10 top-2 right-2 w-7 h-7 rounded-full bg-surface/90 flex items-center justify-center hover:text-secondary transition-colors"><Icon name="favorite" fill={liked} size={16} /></button>
        </div>
        <div className="flex items-start justify-between gap-2 pt-3">
          <div className="min-w-0">
            <Link to={`/product/${product.id}`} className="block text-body-md text-on-surface hover:text-secondary line-clamp-2">{product.name}</Link>
            <p className="text-body-md text-on-surface-variant mt-0.5">{money(product.price)}</p>
          </div>
          <button onClick={() => addItem(product, 1)} disabled={busy || soldOut} aria-label={`Add ${product.name} to bag`}
            className="shrink-0 w-9 h-9 rounded bg-surface-container flex items-center justify-center hover:bg-primary-container hover:text-surface transition-colors disabled:opacity-40"><Icon name="shopping_bag" size={18} /></button>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-surface-container-lowest p-3 rounded-xl shadow-[0_1px_8px_rgba(56,45,40,0.03)] hover:shadow-soft transition-shadow duration-500">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-container">
        <Link to={`/product/${product.id}`} aria-label={product.name} className="absolute inset-0 block">
          {a ? (
            <>
              <img src={a.image} alt={product.name} loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[400ms] ${b ? 'group-hover:opacity-0' : ''}`} />
              {b && <img src={b.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]" />}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-outline"><Icon name="checkroom" size={48} /></div>
          )}
        </Link>
        {soldOut && <span className="absolute top-3 left-3 bg-surface/90 px-2 py-1 text-label-sm uppercase">Sold out</span>}
        {!soldOut && product.stock_quantity <= 3 && <span className="absolute top-3 left-3 bg-surface/90 px-2 py-1 text-label-sm uppercase text-secondary">Only {product.stock_quantity} left</span>}
        <button onClick={() => toggle(product.id)} aria-pressed={liked} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute z-10 top-3 right-3 w-8 h-8 rounded-full bg-surface/90 flex items-center justify-center hover:text-secondary transition-colors">
          <Icon name="favorite" fill={liked} size={18} />
        </button>
        {!soldOut && (
          <button onClick={() => addItem(product, 1)} disabled={busy}
            className="absolute z-10 inset-x-3 bottom-3 py-3 bg-primary-container/95 text-surface text-label-md uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 focus:opacity-100 max-md:hidden transition-all duration-300 hover:bg-secondary">
            Quick add
          </button>
        )}
      </div>
      <div className="px-1 pt-4 pb-1">
        {categoryName && <p className="label">{categoryName}</p>}
        <Link to={`/product/${product.id}`} className="block font-serif text-headline-sm mt-1 hover:text-secondary transition-colors line-clamp-2">{product.name}</Link>
        <p className="text-body-md text-on-surface-variant mt-1">{money(product.price)}</p>
      </div>
    </article>
  );
}
