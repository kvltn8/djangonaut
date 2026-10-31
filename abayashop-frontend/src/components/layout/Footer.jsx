import { Link } from 'react-router-dom';
import { useState } from 'react';
import Icon from '../ui/Icon';
import { useToast } from '../../context/ToastContext';
import { SOCIAL } from '../../config';

// Hook for a real newsletter service: set VITE_NEWSLETTER_URL (a POST endpoint taking {email}).
const NEWSLETTER_URL = import.meta.env.VITE_NEWSLETTER_URL;

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault();
    if (!NEWSLETTER_URL) return toast.info('Newsletter sign-up is not connected to a mailing service yet.');
    try {
      const r = await fetch(NEWSLETTER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!r.ok) throw new Error();
      setDone(true);
    } catch { toast.error('Could not subscribe right now. Please try again.'); }
  };
  if (done) return <p className="text-surface">Thank you for joining.</p>;
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" aria-label="Email address"
        className="flex-1 min-w-0 px-3 py-2.5 bg-transparent border border-surface/25 text-surface placeholder:text-surface/50 rounded focus:outline-none focus:border-surface/70" />
      <button aria-label="Subscribe" className="w-11 shrink-0 bg-surface text-primary rounded flex items-center justify-center hover:bg-secondary-container transition-colors"><Icon name="arrow_right_alt" size={20} /></button>
    </form>
  );
}

const SOCIAL_ICONS = {
  instagram: 'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5.5A4.5 4.5 0 1012 16.5 4.5 4.5 0 0012 7.5zm0 2A2.5 2.5 0 1112 14.5 2.5 2.5 0 0112 9.5zM17.2 6a1 1 0 100 2 1 1 0 000-2z',
  facebook: 'M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.4-1.7 1.8-1.7h1.6V3.8S15.6 3.5 14.3 3.5c-2.6 0-4.3 1.6-4.3 4.4v2.6H7.2v3.3H10V22h3.5z',
  tiktok: 'M16.6 2h-3.2v13.2a2.7 2.7 0 11-2.7-2.7c.3 0 .5 0 .8.1V9.3a6 6 0 105.1 5.9V8.6a7.3 7.3 0 004.2 1.3V6.7A4.3 4.3 0 0116.6 2z',
};

export default function Footer() {
  const socials = Object.entries(SOCIAL).filter(([, url]) => url);
  return (
    <footer className="bg-primary-container text-surface mt-16">
      <div className="page py-10 grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <Link to="/" className="flex flex-col leading-none w-fit" aria-label="Kaltun's Abaya Shop - home">
          <span className="font-serif text-[24px] tracking-[0.06em] uppercase">Kaltun&apos;s</span>
          <span className="text-label-sm tracking-[0.3em] mt-1 uppercase text-surface/70">Abaya Shop</span>
        </Link>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-2 text-body-md text-surface/80">
          {[['Shop', '/shop'], ['Collections', '/collections'], ['About', '/about'], ['Wishlist', '/wishlist'], ['My account', '/account']].map(([l, to]) => (
            <Link key={l} to={to} className="hover:text-surface transition-colors">{l}</Link>
          ))}
        </nav>

        <div className="md:justify-self-end w-full md:max-w-xs">
          {socials.length > 0 && (
            <div className="flex gap-4 mb-4 md:justify-end">
              {socials.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name} className="text-surface/80 hover:text-surface">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d={SOCIAL_ICONS[name]} /></svg>
                </a>
              ))}
            </div>
          )}
          <p className="text-label-md mb-2 text-surface/80">Join our newsletter</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-surface/10">
        <div className="page py-4 text-label-md text-surface/60">© {new Date().getFullYear()} Kaltun&apos;s Abaya Shop. All rights reserved.</div>
      </div>
    </footer>
  );
}
