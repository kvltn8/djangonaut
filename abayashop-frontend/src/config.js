export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error('[KaltunsShop] VITE_API_URL was not set at build time - the app is calling http://localhost:8000. Set it in your host\'s environment variables and redeploy.');
}
export const CURRENCY = 'KES'; // Kenyan Shillings - prices from the backend are shown as-is in KES
export const FREE_SHIPPING_THRESHOLD = Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD ?? 10000);

// Local images (public/images) - replace with your own photos using the same file names.
export const DESIGN_IMAGES = {
  hero: '/images/hero-abaya.jpg',
  story: '/images/story.jpg',
  categories: ['/images/cat1.jpg', '/images/cat2.jpg', '/images/cat3.jpg', '/images/cat4.jpg'],
};

/**
 * Pick a tile photo from the category name (the labels come from your backend categories).
 * Order matters: "women" contains "men", so women/abaya is tested before men.
 */
export function categoryImage(title = '', index = 0) {
  const t = title.toLowerCase().replace(/['’]/g, '');
  const c = DESIGN_IMAGES.categories;
  if (/women|ladies|lady|abaya|dress|kaftan|jilbab|hijab/.test(t)) return c[0];
  if (/\b(men|mens|man|gents?|boys?|thobe|thawb|kanzu|menswear)\b/.test(t)) return c[1];
  if (/foot|shoe|sandal|slipper|sneaker|heel|loafer/.test(t)) return c[2];
  if (/access|scarf|bag|silk|shawl/.test(t)) return c[3];
  return c[index % c.length];
}

// Optional social links - icons only appear when set in .env
export const SOCIAL = {
  instagram: import.meta.env.VITE_INSTAGRAM_URL,
  facebook: import.meta.env.VITE_FACEBOOK_URL,
  tiktok: import.meta.env.VITE_TIKTOK_URL,
};
