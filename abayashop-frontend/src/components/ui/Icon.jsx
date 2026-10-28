export default function Icon({ name, fill = false, className = '', size = 22 }) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${fill ? 'fill' : ''} ${className}`} style={{ fontSize: size }}>{name}</span>;
}
