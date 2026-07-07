import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/**
 * Dozvoljava pristup samo LIBRARIAN korisnicima.
 * Ulogovan MEMBER ili gost ide na /books.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'LIBRARIAN') {
    return <Navigate to="/books" replace />;
  }

  return children;
}
