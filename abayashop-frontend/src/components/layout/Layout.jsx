import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ChatWidget from '../chat/ChatWidget';

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return (
    <>
      <Header />
      <main className="pt-28 min-h-[70vh]"><Outlet /></main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </>
  );
}
