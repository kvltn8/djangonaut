import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import SmoothImage from '../ui/SmoothImage';
import { categoryImage } from '../../config';
import { ErrorState } from '../ui/States';

// Static class names so Tailwind keeps them: 1-3 tiles sit on one row, more wrap into thirds.
const COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
};
const MANY = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
const GRID = 'grid gap-4 md:gap-6 lg:gap-8';
const TILE = 'aspect-[16/9] rounded-2xl';

export default function CategoryTiles({ categories, loading, error, limit }) {
  if (error) return <ErrorState error={error} />;
  if (loading) return <div className={`${GRID} ${COLS[3]}`}>{[0, 1, 2].map((i) => <div key={i} className={`skeleton ${TILE}`} />)}</div>;
  if (!categories.length) return <p className="text-on-surface-variant">Categories will appear here once they are added in the admin.</p>;
  const list = limit ? categories.slice(0, limit) : categories;
  return (
    <div className={`${GRID} ${COLS[list.length] ?? MANY}`}>
      {list.map((c, i) => (
        <Link key={c.id} to={`/shop?category_id=${c.id}`} aria-label={`Shop ${c.title}`}
          className={`group relative block ${TILE} overflow-hidden shadow-soft bg-sand`}>
          <SmoothImage src={categoryImage(c.title, i)} position="object-center" className="group-hover:scale-105 !transition-[transform,opacity] !duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container/25 via-transparent to-transparent" />
          <span className="absolute inset-x-4 bottom-[13%] flex items-center justify-center gap-2.5 text-white text-[13px] sm:text-[14px] lg:text-[16px] font-semibold uppercase tracking-[0.14em] text-center [text-shadow:0_1px_10px_rgba(34,25,20,0.45)]">
            <span className="truncate">{c.title}</span>
            <Icon name="arrow_right_alt" size={22} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}
