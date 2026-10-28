import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="page py-32 text-center">
      <p className="label">404</p>
      <h1 className="font-serif text-headline-lg mt-2">This page has drifted away</h1>
      <Link to="/" className="btn-primary mt-8">Back home</Link>
    </div>
  );
}
