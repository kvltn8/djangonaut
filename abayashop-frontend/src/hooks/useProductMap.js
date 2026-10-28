import { useQueries } from '@tanstack/react-query';
import { getProduct } from '../api/catalog';

/** Resolves product ids -> product objects (order items only carry product_id). Shares the ['product', id] cache. */
export function useProductMap(ids) {
  const unique = [...new Set(ids.filter(Boolean))];
  const results = useQueries({
    queries: unique.map((id) => ({ queryKey: ['product', String(id)], queryFn: () => getProduct(id), staleTime: 5 * 60_000 })),
  });
  const map = {};
  unique.forEach((id, i) => { if (results[i].data) map[id] = results[i].data; });
  return { map, loading: results.some((r) => r.isLoading), results };
}
