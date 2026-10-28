import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCategories } from '../../hooks/useCatalog';
import { FREE_SHIPPING_THRESHOLD } from '../../config';
import { moneyShort } from '../../lib/format';

function Logo() {
  return (
    <Link to="/" className="flex flex-col items-start leading-none group" aria-label="Kaltun's Abaya Shop - home">
      <span className="font-serif text-[26px] tracking-[0.06em] text-primary uppercase group-hover:text-secondary transition-colors">Kaltun&apos;s</span>
      <span className="text-label-sm tracking-[0.3em] text-on-surface-variant mt-1 uppercase">Abaya Shop</span>
    </Link>
  );
}

export default function Header() {
  const { count, openCart } = useCart();
  const { isAuthed } = useAuth();
  const { ids } = useWishlist();
  const categories = useCategories();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState(params.get('search') ?? '');

  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);

  // Nav is driven by the backend: Home, Shop, first three categories, About
  const activeCat = pathname === '/shop' ? params.get('category_id') : null;
  const items = [
    { label: 'Home', to: '/', active: pathname === '/' },
    { label: 'Shop', to: '/shop', active: pathname === '/shop' && !activeCat },
    ...(categories.data ?? []).slice(0, 3).map((c) => ({ label: c.title, to: `/shop?category_id=${c.id}`, active: activeCat === String(c.id) })),
    { label: 'About', to: '/about', active: pathname === '/about' },
  ];

  const submit = (e) => {
    e.preventDefault();
    setMenu(false);
    navigate(q.trim() ? `/shop?search=${encodeURIComponent(q.trim())}` : '/shop');
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="bg-primary-container text-surface-container-high py-2 px-4 text-center">
          <p className="text-label-sm tracking-widest uppercase">
            Free shipping on orders over {moneyShort(FREE_SHIPPING_THRESHOLD)}<span className="mx-3 opacity-50 max-sm:hidden">|</span><span className="max-sm:hidden">Elegant modest fashion for every season</span>
          </p>
        </div>
        <div className="bg-sand/90 backdrop-blur-md">
          <div className="page h-20 flex items-center justify-between gap-6">
            <button className="lg:hidden p-2 -ml-2" aria-label="Open menu" onClick={() => setMenu(true)}><Icon name="menu" size={24} /></button>
            <div className="max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2"><Logo /></div>
            <nav className="hidden lg:flex items-center gap-9" aria-label="Main">
              {items.map((n) => (
                <Link key={n.label} to={n.to} aria-current={n.active ? 'page' : undefined}
                  className={`py-1 text-title-md transition-colors border-b-2 ${n.active ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'}`}>{n.label}</Link>
              ))}
            </nav>
            <div className="flex items-center gap-1 sm:gap-3">
              <form onSubmit={submit} className="hidden md:flex items-center border border-outline-variant/70 bg-surface/40 rounded px-3 py-2 w-56" role="search">
                <Icon name="search" size={18} className="text-on-surface-variant mr-2" />
                <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" placeholder="Search products..." className="bg-transparent outline-none text-body-md placeholder:text-on-surface-variant/60 w-full" />
              </form>
              <Link to="/wishlist" aria-label="Wishlist" className="relative p-2 hover:text-secondary transition-colors">
                <Icon name="favorite" />
                {ids.length > 0 && <span className="absolute top-1 right-0 min-w-4 h-4 px-1 bg-secondary text-on-secondary rounded-full text-[9px] flex items-center justify-center">{ids.length}</span>}
              </Link>
              <button onClick={openCart} aria-label={`Open bag, ${count} items`} className="relative p-2 hover:text-secondary transition-colors">
                <Icon name="shopping_bag" />
                {count > 0 && <span className="absolute top-1 right-0 min-w-4 h-4 px-1 bg-primary text-on-primary rounded-full text-[9px] flex items-center justify-center">{count}</span>}
              </button>
              <Link to={isAuthed ? '/account' : '/login'} aria-label={isAuthed ? 'Account' : 'Sign in'} className="p-2 hover:text-secondary transition-colors max-sm:hidden"><Icon name="person" /></Link>
            </div>
          </div>
        </div>
      </header>

      {/* mobile navigation */}
      <div onClick={() => setMenu(false)} className={`fixed inset-0 z-50 bg-primary-container/30 backdrop-blur-sm transition-opacity ${menu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <aside aria-hidden={!menu} className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-surface shadow-drawer p-6 flex flex-col justify-between transition-transform duration-500 ${menu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
            <Logo />
            <button onClick={() => setMenu(false)} aria-label="Close menu"><Icon name="close" /></button>
          </div>
          <form onSubmit={submit} className="flex items-center border border-outline-variant rounded px-3 py-2">
            <Icon name="search" size={18} className="text-on-surface-variant mr-2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" placeholder="Search products..." className="bg-transparent outline-none flex-1" />
          </form>
          <nav className="flex flex-col gap-1">
            {items.map((n) => (
              <Link key={n.label} to={n.to} onClick={() => setMenu(false)} className={`py-3 px-3 text-title-lg rounded-lg ${n.active ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{n.label}</Link>
            ))}
            <NavLink to={isAuthed ? '/account' : '/login'} onClick={() => setMenu(false)} className="py-3 px-3 text-title-lg rounded-lg text-on-surface-variant hover:bg-surface-container">{isAuthed ? 'My account' : 'Sign in'}</NavLink>
          </nav>
        </div>
        <p className="pt-6 border-t border-outline-variant/30 text-outline">Elegant modest fashion for every season.</p>
      </aside>
    </>
  );
}
