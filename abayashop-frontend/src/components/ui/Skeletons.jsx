export const ProductCardSkeleton = () => (
  <div className="bg-surface-container-lowest p-3 rounded-xl">
    <div className="skeleton aspect-[4/5] rounded-lg" />
    <div className="skeleton h-3 w-1/3 mt-4" />
    <div className="skeleton h-5 w-3/4 mt-2" />
    <div className="skeleton h-4 w-1/4 mt-2" />
  </div>
);
export const ProductGridSkeleton = ({ n = 8 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter-mobile md:gap-gutter">
    {Array.from({ length: n }).map((_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);
