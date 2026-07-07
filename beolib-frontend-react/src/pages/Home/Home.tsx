import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getAllBranches } from '../../api/branchApi';
import { ScrollReveal } from '../../components/ScrollReveal/ScrollReveal';
import type { Branch } from '../../models/branch.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import './Home.css';

const NEWS_ITEMS = [
  {
    id: 1,
    title: 'Izložba „Beograd kroz stranice“ u Biblioteci grada',
    date: '28.06.2026.',
    text: 'Od 5. jula posetioci mogu da vide izbor fotografija i rukopisa iz fondova gradske biblioteke.',
    isNew: true,
  },
  {
    id: 2,
    title: 'Produženo radno vreme tokom ispitnog roka',
    date: '01.07.2026.',
    text: 'Filijale u centru i na Novom Beogradu rade do 22 sata radnim danima do 15. jula.',
    isNew: false,
  },
  {
    id: 3,
    title: 'Nova kolekcija savremene srpske proze',
    date: '15.06.2026.',
    text: 'U katalog su unete knjige domaćih autora iz poslednjih pet godina.',
    isNew: false,
  },
];

export function HomePage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBranches() {
      setBranchesLoading(true);
      setBranchesError(null);

      try {
        const data = await getAllBranches();
        setBranches(data);
      } catch (error) {
        setBranches([]);
        setBranchesError(getApiErrorMessage(error));
      } finally {
        setBranchesLoading(false);
      }
    }

    void loadBranches();
  }, []);

  return (
    <div className="home">
      <section className="home-hero">
        <ScrollReveal className="home-hero-inner">
          <div className="home-hero-content">
            <div className="home-hero-text">
              <h1>Dobrodošli na digitalni katalog Biblioteke grada Beograda</h1>
              <p className="home-hero-lead">
                Pretražite knjige, rezervišite primerke i pronađite filijale u blizini.
              </p>
              <Link to="/books" className="hero-cta-light">
                Pretraži knjige
              </Link>
            </div>
            <img src="/images/logo.png" alt="BeoLib" className="home-hero-logo" />
          </div>
        </ScrollReveal>
      </section>

      <section className="home-section">
        <ScrollReveal>
          <h2 className="section-heading">Vesti i obaveštenja</h2>
        </ScrollReveal>
        <div className="home-news-grid">
          {NEWS_ITEMS.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 70}>
              <article className="home-news-card luxury-card">
                <div className="home-news-card-head">
                  {item.isNew && <span className="library-stamp">Novo</span>}
                  <time className="mono home-news-date">{item.date}</time>
                </div>
                <h3>{item.title}</h3>
                <p className="muted-text">{item.text}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="home-section">
        <ScrollReveal>
          <h2 className="section-heading">Filijale</h2>
        </ScrollReveal>
        {branchesError && <p className="message error page-feedback">{branchesError}</p>}

        {branchesLoading ? (
          <p className="loading-state">Učitavanje filijala...</p>
        ) : branches.length === 0 ? (
          <div className="empty-state">Trenutno nema podataka o filijalama.</div>
        ) : (
          <div className="home-branches-grid">
            {branches.map((branch, index) => (
              <ScrollReveal key={branch.id} delay={index * 60}>
                <article className="home-branch-card luxury-card">
                  <h3>{branch.name}</h3>
                  <p className="muted-text">{branch.address}</p>
                  <p className="muted-text">
                    <strong>Radno vreme:</strong> {branch.workingHours}
                  </p>
                  <p className="mono home-branch-phone">{branch.phone}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
