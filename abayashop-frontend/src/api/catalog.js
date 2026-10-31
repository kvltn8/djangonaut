import { api } from './client';

export const PAGE_SIZE = 10; // matches storefront.pagination.defaultPagination

/** GET /products/?page&category_id&price__gte&price__lte&ordering&search */
export const getProducts = (params) => api('/products/', { params, auth: false });
export const getProduct = (id) => api(`/products/${id}/`, { auth: false });
export const getCategories = () => api('/category/', { auth: false });
export const getReviews = (productId) => api(`/products/${productId}/review/`, { auth: false });
export const addReview = (productId, data) => api(`/products/${productId}/review/`, { method: 'POST', body: data, auth: false });

/** DRF may return a plain array or a paginated envelope; normalise both. */
export const asList = (d) => (Array.isArray(d) ? d : d?.results ?? []);
export const firstImage = (p) => p?.images?.[0]?.image ?? p?.image ?? null;
