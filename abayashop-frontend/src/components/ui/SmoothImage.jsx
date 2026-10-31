import { useEffect, useState } from 'react';
import Icon from './Icon';

/**
 * Image that always fills its (relatively positioned) parent cleanly:
 * object-cover, shimmer while loading, soft fade-in, and a tidy placeholder
 * if the URL is missing or fails to load.
 */
export default function SmoothImage({ src, alt = '', className = '', position = 'object-[50%_25%]', iconSize = 40, ...rest }) {
  const [state, setState] = useState(src ? 'loading' : 'error');
  useEffect(() => { setState(src ? 'loading' : 'error'); }, [src]);

  if (state === 'error') {
    return <div className="absolute inset-0 flex items-center justify-center text-outline bg-sand"><Icon name="checkroom" size={iconSize} /></div>;
  }
  return (
    <>
      {state === 'loading' && <div className="absolute inset-0 skeleton" />}
      <img
        src={src} alt={alt} loading="lazy" decoding="async"
        onLoad={() => setState('ready')} onError={() => setState('error')}
        className={`absolute inset-0 w-full h-full object-cover ${position} transition-opacity duration-500 ${state === 'ready' ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
    </>
  );
}
