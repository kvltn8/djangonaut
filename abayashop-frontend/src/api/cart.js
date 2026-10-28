import { api } from './client';

export const createCart = () => api('/carts/', { method: 'POST', body: {}, auth: false });
export const getCart = (id) => api(`/carts/${id}/`, { auth: false });
export const addCartItem = (cartId, productId, quantity) =>
  api(`/carts/${cartId}/cartitems/`, { method: 'POST', auth: false, body: { cart_id: cartId, product_id: productId, quantity } });
export const updateCartItem = (cartId, itemId, quantity) =>
  api(`/carts/${cartId}/cartitems/${itemId}/`, { method: 'PATCH', auth: false, body: { quantity } });
export const removeCartItem = (cartId, itemId) =>
  api(`/carts/${cartId}/cartitems/${itemId}/`, { method: 'DELETE', auth: false });
