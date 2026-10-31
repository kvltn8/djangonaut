import { api, tokens } from './client';

export async function login({ username, password }) {
  const t = await api('/auth/jwt/create/', { method: 'POST', body: { username, password }, auth: false });
  tokens.set(t);
}
export const register = (data) => api('/auth/users/', { method: 'POST', body: data, auth: false });
export const getMe = () => api('/auth/users/me/');
export const getCustomer = async () => {
  const d = await api('/customers/');
  return (Array.isArray(d) ? d : d?.results ?? [])[0] ?? null;
};
export const updateCustomer = (id, data) => api(`/customers/${id}/`, { method: 'PATCH', body: data });
