import { Link } from 'react-router-dom';
import { DESIGN_IMAGES } from '../config';

export default function About() {
  return (
    <div className="page py-12 grid lg:grid-cols-2 gap-12 items-center">
      <img src={DESIGN_IMAGES.story} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl shadow-soft" />
      <div>
        <p className="label">Our story</p>
        <h1 className="font-serif italic text-display-mobile lg:text-headline-lg mt-3">More Than Just Fashion</h1>
        <p className="text-body-lg text-on-surface-variant mt-6">At Kaltun&apos;s, we believe modest fashion is more than what you wear — it&apos;s a reflection of your values, your confidence and your unique story.</p>
        <p className="text-body-lg text-on-surface-variant mt-4">From beautiful abayas and menswear to the finest footwear, every piece is chosen for timeless style, thoughtful details and everyday comfort.</p>
        <Link to="/shop" className="btn-primary mt-8">Shop the collection</Link>
      </div>
    </div>
  );
}
