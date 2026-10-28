import Icon from './Icon';

export function ErrorState({ error, onRetry }) {
  return (
    <div className="text-center py-20">
      <Icon name="cloud_off" size={40} className="text-outline" />
      <p className="mt-4 text-on-surface-variant max-w-md mx-auto">{error?.message ?? 'Something went wrong.'}</p>
      {onRetry && <button onClick={onRetry} className="btn-outline mt-6">Try again</button>}
    </div>
  );
}
export function EmptyState({ icon = 'checkroom', title, children }) {
  return (
    <div className="text-center py-20">
      <Icon name={icon} size={40} className="text-outline" />
      <h3 className="font-serif text-headline-sm mt-4">{title}</h3>
      {children && <div className="mt-2 text-on-surface-variant">{children}</div>}
    </div>
  );
}
