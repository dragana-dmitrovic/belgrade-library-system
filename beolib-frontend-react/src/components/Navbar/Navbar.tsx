import { NavLink, useNavigate } from 'react-router-dom';



import { useAuth } from '../../context/AuthContext';

import './Navbar.css';



export function Navbar() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const loggedIn = user != null;

  const member = user?.role === 'MEMBER';

  const librarian = user?.role === 'LIBRARIAN';



  function handleLogout() {

    logout();

    navigate('/books');

  }



  return (

    <nav className="navbar">

      <NavLink to="/" className="brand">

        <img src="/images/logo.png" alt="" className="brand-logo" aria-hidden="true" />

        BeoLib

      </NavLink>



      <div className="links">

        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>

          Početna stranica

        </NavLink>



        {loggedIn ? (

          <>

            <NavLink to="/books" className={({ isActive }) => (isActive ? 'active' : undefined)}>

              Knjige

            </NavLink>



            {member && (

              <>

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

              </>

            )}



            {librarian && (

              <>

                <NavLink

                  to="/admin/books"

                  className={({ isActive }) => (isActive ? 'active' : undefined)}

                >

                  Upravljanje knjigama

                </NavLink>

                <NavLink

                  to="/admin/branches"

                  className={({ isActive }) => (isActive ? 'active' : undefined)}

                >

                  Filijale

                </NavLink>

                <NavLink

                  to="/librarian/circulation"

                  className={({ isActive }) => (isActive ? 'active' : undefined)}

                >

                  Upravljanje pozajmicama

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

