import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Pagination from '../components/ui/Pagination';
import ProductGrid from '../components/product/ProductGrid';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { PAGE_SIZE } from '../api/catalog';

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const f = {
    category_id: sp.get('category_id') ?? '',
    price__gte: sp.get('price__gte') ?? '',
    price__lte: sp.get('price__lte') ?? '',
    ordering: sp.get('ordering') ?? '',
    search: sp.get('search') ?? '',
    page: Number(sp.get('page') ?? 1),
  };
  const [price, setPrice] = useState({ min: f.price__gte, max: f.price__lte });
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => setPrice({ min: f.price__gte, max: f.price__lte }), [f.price__gte, f.price__lte]);

  const categories = useCategories();
  const { data, isLoading, isFetching, error, refetch } = useProducts({ ...f, page: f.page > 1 ? f.page : undefined });
  const byId = Object.fromEntries((categories.data ?? []).map((c) => [c.id, c.title]));

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setSp(next);
  };
  const activeTitle = byId[f.category_id];
  const total = data?.count ?? 0;
  const hasFilters = f.category_id || f.price__gte || f.price__lte || f.search;

  const Filters = (
    <div className="space-y-8">
      <div>
        <h3 className="label mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          {[{ id: '', title: 'All' }, ...(categories.data ?? [])].map((c) => (
            <button key={c.id} onClick={() => update({ category_id: String(c.id) })} aria-pressed={String(c.id) === f.category_id || (!c.id && !f.category_id)}
              className={`px-3 py-1.5 border text-label-md uppercase transition-colors ${String(c.id) === f.category_id || (!c.id && !f.category_id) ? 'bg-primary-container text-surface border-primary-container' : 'border-outline-variant/60 hover:border-primary'}`}>{c.title}</button>
          ))}
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); update({ price__gte: price.min, price__lte: price.max }); }}>
        <h3 className="label mb-3">Price</h3>
        <div className="flex items-center gap-2">
          <input type="number" min="0" inputMode="decimal" placeholder="Min" aria-label="Minimum price" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} className="field" />
          <span className="text-outline">–</span>
          <input type="number" min="0" inputMode="decimal" placeholder="Max" aria-label="Maximum price" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} className="field" />
        </div>
        <button className="btn-outline w-full mt-3 !py-2.5">Apply</button>
      </form>
      {hasFilters && <button onClick={() => setSp(new URLSearchParams())} className="text-secondary underline underline-offset-4">Clear all filters</button>}
    </div>
  );

  return (
    <div className="page py-10 lg:py-14">
      <p className="label">The collection</p>
      <h1 className="font-serif text-headline-lg-mobile lg:text-headline-lg mt-2">{f.search ? `Results for “${f.search}”` : activeTitle ?? 'All Garments'}</h1>

      <div className="flex items-center justify-between gap-4 mt-8 pb-4 border-b border-outline-variant/40">
        <p className="text-on-surface-variant">{isLoading ? 'Loading…' : `${total} ${total === 1 ? 'piece' : 'pieces'}`}{isFetching && !isLoading && ' · updating'}</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters((s) => !s)} className="lg:hidden inline-flex items-center gap-1.5 text-label-md uppercase"><Icon name="tune" size={18} />Filters</button>
          <label className="flex items-center gap-2 text-label-md uppercase">
            <span className="max-sm:hidden text-on-surface-variant">Sort</span>
            <select value={f.ordering} onChange={(e) => update({ ordering: e.target.value })} className="bg-transparent border border-outline-variant px-3 py-2 normal-case tracking-normal text-body-md focus:outline-none focus:border-primary-container">
              <option value="">Featured</option>
              <option value="price">Price: low to high</option>
              <option value="-price">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10 mt-8">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:sticky lg:top-36 self-start`}>{Filters}</aside>
        <section>
          {isLoading ? <ProductGridSkeleton n={PAGE_SIZE} />
            : error ? <ErrorState error={error} onRetry={refetch} />
            : !data?.results?.length ? <EmptyState title="No pieces match your filters">Try widening the price range or clearing filters.</EmptyState>
            : <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}><ProductGrid products={data.results} categoriesById={byId} /></div>}
          <Pagination page={f.page} totalPages={Math.ceil(total / PAGE_SIZE)} onChange={(p) => { update({ page: p > 1 ? String(p) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </section>
      </div>
    </div>
  );
}
