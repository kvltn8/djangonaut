import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/Home';

// Route-level code splitting keeps the first load small as the app grows.
const Shop = lazy(() => import('./pages/Shop'));
const Collections = lazy(() => import('./pages/Collections'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const About = lazy(() => import('./pages/About'));
const Auth = lazy(() => import('./pages/Auth'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Account = lazy(() => import('./pages/Account'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={<div className="page py-40"><div className="skeleton h-64 rounded-xl" /></div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="collections" element={<Collections />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Auth mode="login" />} />
          <Route path="register" element={<Auth mode="register" />} />
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders/:id" element={<OrderConfirmation />} />
            <Route path="account" element={<Account />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
