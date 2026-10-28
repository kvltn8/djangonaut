export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error('[KaltunsShop] VITE_API_URL was not set at build time - the app is calling http://localhost:8000. Set it in your host\'s environment variables and redeploy.');
}
export const CURRENCY = import.meta.env.VITE_CURRENCY ?? 'USD';
export const FREE_SHIPPING_THRESHOLD = Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD ?? 100);

// Local images (public/images) - replace with your own photos using the same file names.
export const DESIGN_IMAGES = {
  hero: '/images/hero-abaya.jpg',
  story: '/images/story.jpg',
  categories: ['/images/cat1.jpg', '/images/cat2.jpg', '/images/cat3.jpg', '/images/cat4.jpg'],
};

/** Pick a tile photo from the category name; otherwise rotate through the set. */
export function categoryImage(title = '', index = 0) {
  const t = title.toLowerCase();
  const c = DESIGN_IMAGES.categories;
  if (/abaya|dress|kaftan|jilbab/.test(t)) return c[0];
  if (/men|thobe|thawb|kanzu/.test(t)) return c[1];
  if (/foot|shoe|sandal|slipper/.test(t)) return c[2];
  if (/access|scarf|hijab|bag|silk/.test(t)) return c[3];
  return c[index % c.length];
}

// Optional social links - icons only appear when set in .env
export const SOCIAL = {
  instagram: import.meta.env.VITE_INSTAGRAM_URL,
  facebook: import.meta.env.VITE_FACEBOOK_URL,
  tiktok: import.meta.env.VITE_TIKTOK_URL,
};
