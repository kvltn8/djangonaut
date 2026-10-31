import ProductCard from './ProductCard';

export default function ProductGrid({ products, categoriesById = {}, compact = false }) {
  return (
    <div className={compact ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8 lg:gap-x-5' : 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'}>
      {products.map((p) => <ProductCard key={p.id} product={p} categoryName={categoriesById[p.category_id]} compact={compact} />)}
    </div>
  );
}
