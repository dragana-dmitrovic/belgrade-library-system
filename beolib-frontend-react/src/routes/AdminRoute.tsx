import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/**
 * Dozvoljava pristup samo ADMIN korisnicima.
 * Ulogovan USER ili gost ide na /books.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return <Navigate to="/books" replace />;
  }

  return children;
}
