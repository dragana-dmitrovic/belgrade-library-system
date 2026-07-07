import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/**
 * Dozvoljava pristup samo MEMBER korisnicima.
 * Gost ide na /login, bibliotekar na /books.
 */
export function MemberRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'MEMBER') {
    return <Navigate to="/books" replace />;
  }

  return children;
}
