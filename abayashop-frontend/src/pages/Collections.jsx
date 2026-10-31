import CategoryTiles from '../components/product/CategoryTiles';
import { useCategories } from '../hooks/useCatalog';

export default function Collections() {
  const { data, isLoading, error } = useCategories();
  return (
    <div className="page py-12">
      <p className="label">Curation archive</p>
      <h1 className="font-serif text-headline-lg-mobile lg:text-headline-lg mt-2">Collections</h1>
      <p className="text-on-surface-variant mt-2 mb-10 max-w-xl">Distinct cuts tailored for uninhibited movement, understated grace, and modest living.</p>
      <CategoryTiles categories={data ?? []} loading={isLoading} error={error} />
    </div>
  );
}
