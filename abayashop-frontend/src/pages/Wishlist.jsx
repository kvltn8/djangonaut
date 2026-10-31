import { Link } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { EmptyState } from '../components/ui/States';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { useWishlist } from '../context/WishlistContext';
import { useProductMap } from '../hooks/useProductMap';

export default function Wishlist() {
  const { ids } = useWishlist();
  const { map, loading, results } = useProductMap(ids);
  // products that were deleted on the server simply drop out of the grid
  const products = ids.map((i) => map[i]).filter(Boolean);
  return (
    <div className="page py-12">
      <p className="label">Saved for later</p>
      <h1 className="font-serif text-headline-lg-mobile lg:text-headline-lg mt-2 mb-10">Your Wishlist</h1>
      {ids.length === 0 ? <EmptyState icon="favorite" title="Nothing saved yet"><Link to="/shop" className="btn-outline mt-4">Discover the collection</Link></EmptyState>
        : loading && !products.length ? <ProductGridSkeleton n={Math.min(ids.length, 4)} />
        : products.length === 0 && results.every((r) => !r.isLoading) ? <EmptyState icon="favorite" title="Those pieces are no longer available" />
        : <ProductGrid products={products} />}
    </div>
  );
}
