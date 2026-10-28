import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthed, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="page py-32"><div className="skeleton h-40 max-w-xl mx-auto rounded-xl" /></div>;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  return <Outlet />;
}
