import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as catalog from '../api/catalog';

export const useProducts = (params) =>
  useQuery({ queryKey: ['products', params], queryFn: () => catalog.getProducts(params), placeholderData: keepPreviousData, staleTime: 60_000 });

export const useProduct = (id) =>
  useQuery({ queryKey: ['product', String(id)], queryFn: () => catalog.getProduct(id), enabled: !!id, staleTime: 60_000 });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: async () => catalog.asList(await catalog.getCategories()), staleTime: 5 * 60_000 });

export const useReviews = (productId) =>
  useQuery({ queryKey: ['reviews', String(productId)], queryFn: async () => catalog.asList(await catalog.getReviews(productId)) });
