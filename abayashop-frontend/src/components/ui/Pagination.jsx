import Icon from './Icon';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return (
    <nav className="flex items-center justify-center gap-1 mt-12" aria-label="Pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="p-2 disabled:opacity-30" aria-label="Previous page"><Icon name="chevron_left" /></button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-outline">…</span>}
          <button onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
            className={`w-9 h-9 text-label-md ${p === page ? 'bg-primary-container text-surface' : 'hover:bg-surface-container'}`}>{p}</button>
        </span>
      ))}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="p-2 disabled:opacity-30" aria-label="Next page"><Icon name="chevron_right" /></button>
    </nav>
  );
}
