import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import ProductGrid from '../components/product/ProductGrid';
import CategoryTiles from '../components/product/CategoryTiles';
import { ProductCardSkeleton } from '../components/ui/Skeletons';
import { ErrorState, EmptyState } from '../components/ui/States';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { asList } from '../api/catalog';
import { DESIGN_IMAGES } from '../config';

export default function Home() {
  const categories = useCategories();
  const products = useProducts({ page: 1 });
  const list = asList(products.data).slice(0, 6);

  return (
    <>
      {/* Hero - sits under the translucent header so the colour is continuous */}
      <section className="relative -mt-28 pt-28 bg-sand overflow-hidden">
        <div className="page relative z-10 py-12 md:py-20 lg:py-24 md:min-h-[430px] flex items-center">
          <div className="max-w-xl md:max-w-[46%]">
            <p className="text-label-md uppercase tracking-[0.12em] text-on-surface">Modest Fashion · Abayas · Menswear · Footwear</p>
            <h1 className="font-serif italic text-display-mobile lg:text-display mt-4">Elegance in Every Layer</h1>
            <p className="text-body-lg text-on-surface-variant mt-5 max-w-md">Discover a carefully curated collection of timeless modest fashion for women and men. From beautiful abayas and menswear to the finest footwear, designed for effortless style.</p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-8">
              <Link to="/shop" className="btn-outline">Shop now <Icon name="arrow_right_alt" size={20} /></Link>
              <Link to="/collections" className="inline-flex items-center gap-2 text-label-md uppercase tracking-[0.08em] hover:text-secondary transition-colors">Explore collections <Icon name="arrow_right_alt" size={18} /></Link>
            </div>
          </div>
        </div>
        <img src={DESIGN_IMAGES.hero} alt="Abayas on a rail in a bright, sea-facing boutique"
          className="fade-hero w-full aspect-[16/9] md:aspect-auto object-cover object-[70%_50%] md:absolute md:right-0 md:top-0 md:h-full md:w-[56%] pointer-events-none select-none" />
      </section>

      {/* Shop by category */}
      <section className="page pt-12 lg:pt-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-headline-md">Shop by Category</h2>
          <Link to="/collections" className="inline-flex items-center gap-1.5 text-body-md hover:text-secondary">View All <Icon name="arrow_right_alt" size={18} /></Link>
        </div>
        <CategoryTiles categories={categories.data ?? []} loading={categories.isLoading} error={categories.error} limit={4} />
      </section>

      {/* Featured collection */}
      <section className="page pt-14 lg:pt-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-headline-md">Featured Collection</h2>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-body-md hover:text-secondary">View All <Icon name="arrow_right_alt" size={18} /></Link>
        </div>
        {products.isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8 lg:gap-x-5">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
        ) : products.error ? <ErrorState error={products.error} onRetry={products.refetch} />
          : list.length === 0 ? <EmptyState title="Nothing here yet">New pieces arrive soon.</EmptyState>
          : <ProductGrid products={list} compact />}
      </section>

      {/* Our story */}
      <section className="page pt-14 lg:pt-16">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#f3ebdf] to-[#eadfce] min-h-[220px] flex items-center">
          <img src={DESIGN_IMAGES.story} alt="" loading="lazy" className="fade-left absolute right-0 top-0 h-full w-full md:w-[62%] object-cover object-center opacity-60 md:opacity-100 pointer-events-none" />
          <div className="relative z-10 p-8 lg:p-12 max-w-lg">
            <p className="label !text-on-surface">Our story</p>
            <h2 className="font-serif text-headline-md lg:text-headline-lg mt-2">More Than Just Fashion</h2>
            <p className="text-on-surface-variant mt-3">At Kaltun&apos;s, we believe modest fashion is more than what you wear — it&apos;s a reflection of your values, your confidence and your unique story.</p>
            <Link to="/about" className="btn-primary mt-6 !py-3">Learn more <Icon name="arrow_right_alt" size={18} /></Link>
          </div>
          <p className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 font-serif italic text-headline-sm text-center text-on-surface/80 leading-snug">Timeless styles.<br />Thoughtful details.<br />For you.</p>
        </div>
      </section>
    </>
  );
}
