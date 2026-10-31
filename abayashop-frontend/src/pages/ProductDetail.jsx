import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '../components/ui/Icon';
import SmoothImage from '../components/ui/SmoothImage';
import { ErrorState } from '../components/ui/States';
import { useCategories, useProduct, useReviews } from '../hooks/useCatalog';
import { addReview } from '../api/catalog';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { money } from '../lib/format';

function Reviews({ productId }) {
  const { data = [], isLoading } = useReviews(productId);
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', comment: '' });
  useEffect(() => { if (user && !form.name) setForm((f) => ({ ...f, name: user.first_name || user.username })); }, [user]); // eslint-disable-line
  const m = useMutation({
    mutationFn: () => addReview(productId, form),
    onSuccess: () => { setForm((f) => ({ ...f, comment: '' })); qc.invalidateQueries({ queryKey: ['reviews', String(productId)] }); toast.success('Thank you for your review.'); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <section className="mt-20 grid lg:grid-cols-2 gap-12">
      <div>
        <h2 className="font-serif text-headline-md">Reviews</h2>
        <div className="mt-6 space-y-6">
          {isLoading && <div className="skeleton h-20 rounded-xl" />}
          {!isLoading && data.length === 0 && <p className="text-on-surface-variant">No reviews yet — be the first to share your thoughts.</p>}
          {data.map((r) => (
            <div key={r.id} className="border-b border-outline-variant/40 pb-5">
              <p className="text-title-md">{r.name}</p>
              <p className="text-on-surface-variant mt-1">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="bg-surface-container-low p-6 rounded-xl self-start space-y-4">
        <h3 className="font-serif text-headline-sm">Write a review</h3>
        <div><label className="field-label" htmlFor="rv-name">Name</label><input id="rv-name" required maxLength={50} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" /></div>
        <div><label className="field-label" htmlFor="rv-comment">Your thoughts</label><textarea id="rv-comment" required rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="field" /></div>
        <button disabled={m.isPending} className="btn-primary">{m.isPending ? 'Sending…' : 'Submit review'}</button>
      </form>
    </section>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { data: p, isLoading, error, refetch } = useProduct(id);
  const categories = useCategories();
  const { addItem, busy } = useCart();
  const { has, toggle } = useWishlist();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  useEffect(() => { setActive(0); setQty(1); }, [id]);

  if (isLoading) return <div className="page py-12 grid lg:grid-cols-2 gap-12"><div className="skeleton aspect-[4/5] rounded-2xl" /><div className="space-y-4"><div className="skeleton h-10 w-2/3" /><div className="skeleton h-6 w-1/4" /><div className="skeleton h-32" /></div></div>;
  if (error) return <div className="page"><ErrorState error={error.status === 404 ? { message: 'We could not find that piece.' } : error} onRetry={error.status === 404 ? undefined : refetch} /></div>;

  const images = p.images ?? [];
  const category = categories.data?.find((c) => c.id === p.category_id);
  const soldOut = p.stock_quantity < 1;
  const liked = has(p.id);

  return (
    <div className="page py-8 lg:py-12">
      <nav className="text-label-md uppercase text-on-surface-variant mb-6 flex gap-2" aria-label="Breadcrumb">
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        {category && <><span>/</span><Link to={`/shop?category_id=${category.id}`} className="hover:text-primary">{category.title}</Link></>}
      </nav>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="grid grid-cols-[72px_1fr] gap-4 max-sm:grid-cols-1">
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 max-sm:order-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`} className={`relative w-[72px] aspect-[4/5] shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? 'border-primary-container' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <SmoothImage src={img.image} iconSize={18} />
                </button>
              ))}
            </div>
          )}
          <div className={`relative aspect-[4/5] bg-sand rounded-2xl overflow-hidden ${images.length <= 1 ? 'sm:col-span-2' : ''}`}>
            <SmoothImage key={images[active]?.id ?? 'none'} src={images[active]?.image} alt={p.name} iconSize={64} />
          </div>
        </div>

        <div className="lg:py-6">
          {category && <p className="label">{category.title}</p>}
          <h1 className="font-serif text-headline-lg-mobile lg:text-headline-lg mt-2">{p.name}</h1>
          <p className="text-title-lg mt-3">{money(p.price)}</p>
          <p className="text-body-lg text-on-surface-variant mt-6 whitespace-pre-line">{p.descprition}</p>

          <p className={`mt-6 text-label-md uppercase ${soldOut ? 'text-error' : p.stock_quantity <= 5 ? 'text-secondary' : 'text-on-surface-variant'}`}>
            {soldOut ? 'Sold out' : p.stock_quantity <= 5 ? `Only ${p.stock_quantity} left` : 'In stock'}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="flex items-center border border-outline-variant">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="px-4 py-3 hover:text-secondary">−</button>
              <span className="w-8 text-center" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock_quantity, q + 1))} disabled={qty >= p.stock_quantity} aria-label="Increase quantity" className="px-4 py-3 hover:text-secondary disabled:opacity-30">+</button>
            </div>
            <button onClick={() => addItem(p, qty)} disabled={soldOut || busy} className="btn-primary flex-1 sm:flex-none sm:min-w-[260px]">{soldOut ? 'Sold out' : busy ? 'Adding…' : 'Add to bag'}</button>
            <button onClick={() => toggle(p.id)} aria-pressed={liked} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'} className="w-12 h-12 border border-outline-variant flex items-center justify-center hover:border-primary"><Icon name="favorite" fill={liked} /></button>
          </div>

          <ul className="mt-10 space-y-3 text-on-surface-variant border-t border-outline-variant/40 pt-6">
            <li className="flex gap-3"><Icon name="redeem" size={20} className="text-secondary" />Complimentary gift packaging</li>
            <li className="flex gap-3"><Icon name="local_shipping" size={20} className="text-secondary" />Worldwide delivery</li>
          </ul>
        </div>
      </div>
      <Reviews productId={p.id} />
    </div>
  );
}
