# AbayaShop Seoul — storefront

React 18 · Vite · React Router 6 · TanStack Query · Tailwind (design tokens from *Warm Editorial Minimalism*).
Talks to the Django/DRF backend (`djangonaut`) over JWT.

## Run
```bash
cp .env.example .env      # set VITE_API_URL (default http://localhost:8000)
npm install
npm run dev               # http://localhost:5173  (the port your CORS default allows)
npm run build             # production bundle in dist/
```

## Backend fixes required
See the separate `backend-fixed-files` bundle (serializers.py, views.py, settings.py). Without them the cart, orders and CORS fail.

## Not fixed (worth doing next)
- `ProductsViewSet`, `CategoryViewSet`, `ReviewViewSet`, `CustomersViewSet`, cart-item and order-item viewsets have no permissions: anyone can create/edit/delete products. Use `IsAdminOrReadOnly`.
- No payment endpoint yet (Paystack). Checkout creates the order as **Pending**; hook payment in `pages/Checkout.jsx` after `createOrder`.
- `Customers.phone_number` is `max_length=10`.

## Structure
```
src/api/        fetch client (JWT header, auto-refresh), catalog / cart / orders / auth modules
src/context/    Auth, Cart (server cart id in localStorage, optimistic updates), Wishlist, Toast
src/hooks/      react-query hooks
src/components/ layout (Header, Footer, CartDrawer), product, ui
src/pages/      Home, Shop, ProductDetail, Collections, Wishlist, About, Auth, Checkout, OrderConfirmation, Account
```
URL-driven filters on `/shop` (`category_id`, `price__gte`, `price__lte`, `ordering`, `search`, `page`). Pages are lazy-loaded.

## Backend ↔ UI map
| UI | Endpoint |
|---|---|
| Shop, home grid | `GET /products/` (+filters, pagination) |
| Product page | `GET /products/{id}/`, reviews `GET/POST /products/{id}/review/` |
| Categories | `GET /category/` |
| Bag | `POST /carts/`, `…/cartitems/` (POST/PATCH/DELETE) |
| Sign in / up | `/auth/jwt/create/`, `/auth/users/`, `/auth/users/me/` (header `JWT <token>`) |
| Checkout | `PATCH /customers/{id}/`, `POST /orders/ {cart_id}` |
| Account | `GET /customers/`, `GET /orders/` |

Wishlist is stored per device (no backend endpoint). Newsletter form needs `VITE_NEWSLETTER_URL`. Colour/size swatches and badges from the design are omitted because the backend has no such fields.
