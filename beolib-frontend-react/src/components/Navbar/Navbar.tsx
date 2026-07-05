import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export function Navbar() {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const admin = isAdmin();

  function handleLogout() {
    logout();
    navigate('/books');
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="brand">
        BeoLib
      </NavLink>

      <div className="links">
        {loggedIn ? (
          <>
            <NavLink to="/books" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Knjige
            </NavLink>
            <NavLink
              to="/reservations"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Rezervacije
            </NavLink>
            <NavLink
              to="/reading-history"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Istorija čitanja
            </NavLink>

            {admin && (
              <>
                <NavLink
                  to="/admin/books"
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  Admin knjige
                </NavLink>
                <NavLink
                  to="/admin/branches"
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  Admin filijale
                </NavLink>
              </>
            )}

            <button type="button" className="link-button" onClick={handleLogout}>
              Odjava
            </button>
          </>
        ) : (
          <>
            <NavLink to="/books" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Knjige
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Prijava
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Registracija
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
