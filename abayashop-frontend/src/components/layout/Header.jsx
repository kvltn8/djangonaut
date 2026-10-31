import { useEffect, useRef, useState } from 'react';
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

  // Menu: Home, Shop, Categories (dropdown, driven by the backend), About
  const [catOpen, setCatOpen] = useState(false);
  const [mobileCats, setMobileCats] = useState(false);
  const catRef = useRef(null);
  const activeCat = pathname === '/shop' ? params.get('category_id') : null;
  const cats = categories.data ?? [];
  const links = {
    home: { label: 'Home', to: '/', active: pathname === '/' },
    shop: { label: 'Shop', to: '/shop', active: pathname === '/shop' && !activeCat },
    about: { label: 'About', to: '/about', active: pathname === '/about' },
  };

  useEffect(() => { setCatOpen(false); }, [pathname, activeCat]);
  useEffect(() => {
    if (!catOpen) return undefined;
    const onDown = (e) => { if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false); };
    const onKey = (e) => e.key === 'Escape' && setCatOpen(false);
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [catOpen]);

  const navLink = (n) => (
    <Link key={n.label} to={n.to} aria-current={n.active ? 'page' : undefined}
      className={`py-1 text-title-md transition-colors border-b-2 ${n.active ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'}`}>{n.label}</Link>
  );

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
              {navLink(links.home)}
              {navLink(links.shop)}
              <div ref={catRef} className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
                <button type="button" aria-haspopup="true" aria-expanded={catOpen} onClick={() => setCatOpen((o) => !o)}
                  className={`py-1 inline-flex items-center gap-1 text-title-md transition-colors border-b-2 ${activeCat ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'}`}>
                  Categories <Icon name="expand_more" size={18} className={`transition-transform duration-300 ${catOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-200 ${catOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible'}`}>
                  <ul className="min-w-[210px] bg-surface rounded-xl shadow-drawer border border-outline-variant/40 py-2">
                    {cats.length === 0 && <li className="px-5 py-2.5 text-on-surface-variant">No categories yet</li>}
                    {cats.map((c) => (
                      <li key={c.id}><Link to={`/shop?category_id=${c.id}`} className={`block px-5 py-2.5 text-body-md hover:bg-surface-container hover:text-secondary transition-colors ${activeCat === String(c.id) ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>{c.title}</Link></li>
                    ))}
                    <li className="border-t border-outline-variant/30 mt-1 pt-1"><Link to="/collections" className="block px-5 py-2.5 text-label-md uppercase text-secondary hover:bg-surface-container">All collections</Link></li>
                  </ul>
                </div>
              </div>
              {navLink(links.about)}
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
            {[links.home, links.shop].map((n) => (
              <Link key={n.label} to={n.to} onClick={() => setMenu(false)} className={`py-3 px-3 text-title-lg rounded-lg ${n.active ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{n.label}</Link>
            ))}
            <button type="button" aria-expanded={mobileCats} onClick={() => setMobileCats((o) => !o)} className={`py-3 px-3 text-title-lg rounded-lg flex items-center justify-between text-left ${activeCat ? 'text-primary' : 'text-on-surface-variant'} hover:bg-surface-container`}>
              Categories <Icon name="expand_more" className={`transition-transform duration-300 ${mobileCats ? 'rotate-180' : ''}`} />
            </button>
            {mobileCats && (
              <div className="ml-3 pl-3 border-l border-outline-variant/50 flex flex-col">
                {cats.map((c) => (
                  <Link key={c.id} to={`/shop?category_id=${c.id}`} onClick={() => setMenu(false)} className={`py-2.5 px-3 rounded-lg ${activeCat === String(c.id) ? 'text-primary bg-surface-container' : 'text-on-surface-variant hover:bg-surface-container'}`}>{c.title}</Link>
                ))}
              </div>
            )}
            <Link to={links.about.to} onClick={() => setMenu(false)} className={`py-3 px-3 text-title-lg rounded-lg ${links.about.active ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{links.about.label}</Link>
            <NavLink to={isAuthed ? '/account' : '/login'} onClick={() => setMenu(false)} className="py-3 px-3 text-title-lg rounded-lg text-on-surface-variant hover:bg-surface-container">{isAuthed ? 'My account' : 'Sign in'}</NavLink>
          </nav>
        </div>
        <p className="pt-6 border-t border-outline-variant/30 text-outline">Elegant modest fashion for every season.</p>
      </aside>
    </>
  );
}
