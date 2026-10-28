import { api } from './client';
import { asList } from './catalog';

/** Requires a logged-in user. Server converts the cart into an order (and deletes the cart). */
export const createOrder = (cartId) => api('/orders/', { method: 'POST', body: { cart_id: cartId } });
export const getOrders = async () => asList(await api('/orders/'));
export const getOrder = (id) => api(`/orders/${id}/`);
