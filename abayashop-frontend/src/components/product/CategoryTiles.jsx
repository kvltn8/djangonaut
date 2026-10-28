import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import { categoryImage } from '../../config';
import { ErrorState } from '../ui/States';

export default function CategoryTiles({ categories, loading, error, limit }) {
  if (error) return <ErrorState error={error} />;
  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton aspect-[16/9] lg:aspect-[2.2/1] rounded-lg" />)}</div>;
  if (!categories.length) return <p className="text-on-surface-variant">Categories will appear here once they are added in the admin.</p>;
  const list = limit ? categories.slice(0, limit) : categories;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {list.map((c, i) => (
        <Link key={c.id} to={`/shop?category_id=${c.id}`} className="group relative block aspect-[16/9] lg:aspect-[2.2/1] overflow-hidden rounded-lg shadow-soft bg-sand">
          <img src={categoryImage(c.title, i)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container/70 via-primary-container/10 to-transparent" />
          <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 text-surface text-label-md uppercase tracking-[0.12em] text-center">
            {c.title}<Icon name="arrow_right_alt" size={18} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}
