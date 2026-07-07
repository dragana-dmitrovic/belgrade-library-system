import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { ScrollReveal } from '../ScrollReveal/ScrollReveal';
import './SiteFooter.css';

export function SiteFooter() {
  const { user } = useAuth();
  const member = user?.role === 'MEMBER';
  const librarian = user?.role === 'LIBRARIAN';

  return (
    <footer className="site-footer">
      <div className="site-footer-bg" aria-hidden="true" />
      <ScrollReveal className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link to="/" className="site-footer-logo">
              BeoLib
            </Link>
            <p className="muted-text">
              Digitalna biblioteka za rezervacije, pozajmice i istoriju čitanja.
            </p>
          </div>

          <nav className="site-footer-nav" aria-label="Navigacija">
            <h3 className="site-footer-heading">Navigacija</h3>
            <ul>
              <li>
                <Link to="/">Početna stranica</Link>
              </li>
              <li>
                <Link to="/books">Katalog knjiga</Link>
              </li>
              {member && (
                <>
                  <li>
                    <Link to="/reservations">Rezervacije</Link>
                  </li>
                  <li>
                    <Link to="/reading-history">Istorija čitanja</Link>
                  </li>
                </>
              )}
              {librarian && (
                <>
                  <li>
                    <Link to="/admin/books">Upravljanje knjigama</Link>
                  </li>
                  <li>
                    <Link to="/admin/branches">Filijale</Link>
                  </li>
                  <li>
                    <Link to="/librarian/circulation">Upravljanje pozajmicama</Link>
                  </li>
                </>
              )}
              {!user && (
                <>
                  <li>
                    <Link to="/login">Prijava</Link>
                  </li>
                  <li>
                    <Link to="/register">Registracija</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="site-footer-nav">
            <h3 className="site-footer-heading">Za članove</h3>
            <ul>
              <li>
                <Link to="/books">Rezerviši knjigu</Link>
              </li>
              {member ? (
                <>
                  <li>
                    <Link to="/reading-history">Prati vraćene knjige</Link>
                  </li>
                  <li>
                    <Link to="/reading-history">Ostavi recenziju</Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login">Prijavi se kao član</Link>
                </li>
              )}
            </ul>
          </div>

          <div className="site-footer-nav">
            <h3 className="site-footer-heading">Za bibliotekare</h3>
            <ul>
              {librarian ? (
                <>
                  <li>
                    <Link to="/librarian/circulation">Obrada rezervacija</Link>
                  </li>
                  <li>
                    <Link to="/librarian/circulation">Direktne pozajmice</Link>
                  </li>
                  <li>
                    <Link to="/librarian/circulation">Povrat knjiga</Link>
                  </li>
                </>
              ) : (
                <li className="muted-text">Dostupno nalogu bibliotekara.</li>
              )}
            </ul>
          </div>
        </div>

        <blockquote className="site-footer-quote">
          „Svaka knjiga ima svoj trag. BeoLib čuva putanju čitanja.“
        </blockquote>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} BeoLib</span>
          <span className="muted-text">Studentski projekat · bibliotečki sistem</span>
        </div>
      </ScrollReveal>
    </footer>
  );
}
