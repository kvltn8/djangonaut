import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Icon from '../ui/Icon';
import SmoothImage from '../ui/SmoothImage';
import { useCart } from '../../context/CartContext';
import { money } from '../../lib/format';
import { FREE_SHIPPING_THRESHOLD } from '../../config';

export default function CartDrawer() {
  const { open, closeCart, items, count, subtotal, setQuantity, removeItem, loading } = useCart();
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const pct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeCart();
    if (open) { document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, closeCart]);

  return (
    <>
      <div onClick={closeCart} className={`fixed inset-0 z-50 bg-primary-container/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <aside role="dialog" aria-label="Shopping bag" aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-surface shadow-drawer flex flex-col transition-transform duration-500 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <Icon name="local_mall" className="text-primary" />
            <span className="text-title-lg uppercase tracking-wider">Curated Bag</span>
            <span className="text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed">{count} {count === 1 ? 'item' : 'items'}</span>
          </div>
          <button onClick={closeCart} aria-label="Close bag" className="p-2 text-on-surface-variant hover:text-primary"><Icon name="close" /></button>
        </div>

        <div className="bg-surface-container px-6 py-3">
          <div className="flex justify-between text-label-sm text-on-surface-variant mb-1.5">
            <span>COMPLIMENTARY SHIPPING</span>
            <span className="text-secondary">{remaining === 0 ? 'Unlocked' : `${money(remaining)} away`}</span>
          </div>
          <div className="w-full h-0.5 bg-surface-container-highest"><div className="h-full bg-secondary transition-all duration-500" style={{ width: `${pct}%` }} /></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && <div className="skeleton h-32 rounded-xl" />}
          {!loading && items.length === 0 && (
            <div className="text-center py-16">
              <Icon name="local_mall" size={40} className="text-outline" />
              <p className="font-serif text-headline-sm mt-3">Your bag is empty</p>
              <Link to="/shop" onClick={closeCart} className="btn-outline mt-6">Explore the collection</Link>
            </div>
          )}
          {items.map((item) => {
            const p = item.product ?? {};
            const pid = p.id ?? item.product_id;
            return (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-surface-container-lowest shadow-[0_1px_8px_rgba(56,45,40,0.03)]">
                <Link to={`/product/${pid}`} onClick={closeCart} className="relative w-20 h-28 bg-sand rounded-lg overflow-hidden flex-shrink-0">
                  <SmoothImage src={p.image} alt={p.name} iconSize={28} />
                </Link>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <Link to={`/product/${pid}`} onClick={closeCart} className="text-title-md text-primary hover:text-secondary line-clamp-2">{p.name}</Link>
                    <button onClick={() => removeItem(item)} aria-label={`Remove ${p.name}`} className="text-outline hover:text-error"><Icon name="delete" size={18} /></button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-outline-variant rounded-md">
                      <button onClick={() => setQuantity(item, item.quantity - 1)} aria-label="Decrease quantity" className="px-2.5 py-1 hover:text-primary">−</button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button onClick={() => setQuantity(item, item.quantity + 1)} aria-label="Increase quantity" className="px-2.5 py-1 hover:text-primary">+</button>
                    </div>
                    <span className="text-title-md text-primary">{money(Number(p.price) * item.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-surface-container-low flex flex-col gap-4">
            <div className="space-y-2 text-on-surface-variant">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-secondary">{remaining === 0 ? 'Complimentary' : 'Calculated later'}</span></div>
              <div className="pt-2 border-t border-outline-variant/30 flex justify-between text-title-lg text-primary"><span>Total</span><span>{money(subtotal)}</span></div>
            </div>
            <Link to="/checkout" onClick={closeCart} className="btn-primary rounded-lg">Proceed to checkout</Link>
          </div>
        )}
      </aside>
    </>
  );
}
