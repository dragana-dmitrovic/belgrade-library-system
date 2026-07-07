import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/** Dozvoljava pristup samo ulogovanim korisnicima; inače redirect na /login. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
