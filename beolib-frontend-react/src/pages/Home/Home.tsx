import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getAllBranches } from '../../api/branchApi';
import type { Branch } from '../../models/branch.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import './Home.css';

// TODO: zameniti stvarnim sadržajem / povezati sa backend-om kasnije
const NEWS_ITEMS = [
  {
    id: 1,
    title: 'Izložba „Beograd kroz stranice“ u Biblioteci grada',
    date: '28.06.2026.',
    text: 'Od 5. jula posetioci mogu da vide izbor fotografija i rukopisa iz fondova gradske biblioteke. Ulaz je slobodan, a program prati i radionice za decu svake subote u 11 časova.',
    isNew: true,
  },
  {
    id: 2,
    title: 'Produženo radno vreme tokom ispitnog roka',
    date: '01.07.2026.',
    text: 'Filijale u centru i na Novom Beogradu rade do 22 sata radnim danima do 15. jula. Molimo studente da unapred rezervišu udžbenike preko BeoLib portala.',
    isNew: false,
  },
  {
    id: 3,
    title: 'Nova kolekcija savremene srpske proze',
    date: '15.06.2026.',
    text: 'U katalog su unete knjige domaćih autora iz poslednjih pet godina, uključujući i titule koje su dobile nagrade na Beogradskom book festivalu. Pretraga po žanru „Fikcija“.',
    isNew: false,
  },
];

// TODO: placeholder tekst — zameniti stvarnim sadržajem kasnije
const ABOUT_PARAGRAPHS = [
  'Gradska biblioteka Beograda već decenijama čuva i neguje književnu baštinu prestonice — od retkih izdanja do savremenih naslova koji prate duh grada.',
  'BeoLib objedinjuje katalog, rezervacije i informacije o filijalama na jednom mestu, kako biste lakše pronašli knjigu, proverili radno vreme i ostali u toku sa programima biblioteke.',
  'Naš cilj je da biblioteka ostane otvoren, pouzdan i blizak saveznik u svakodnevnom učenju, istraživanju i uživanju u čitanju.',
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
        <div className="home-hero-inner">
          <p className="home-hero-kicker">Biblioteke grada Beograda</p>
          <h1>BeoLib — gradska biblioteka na jednom mestu</h1>
          <p className="home-hero-lead">
            Pretražite fond, rezervišite naslove i pronađite filijalu u blizini — jednostavno,
            jasno i dostojanstveno, u službi čitalaca.
          </p>
          <Link to="/books" className="home-hero-cta">
            Pretraži knjige
          </Link>
        </div>
      </section>

      <section className="home-section">
        <h2>Vesti i obaveštenja</h2>
        <div className="home-news-grid">
          {NEWS_ITEMS.map((item) => (
            <article key={item.id} className="home-news-card">
              <div className="home-news-card-head">
                {item.isNew && <span className="library-stamp">Novo</span>}
                <time className="mono home-news-date">{item.date}</time>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-about">
        <h2>O biblioteci</h2>
        {ABOUT_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </section>

      <section className="home-section">
        <h2>Filijale</h2>
        {branchesError && <p className="message error page-feedback">{branchesError}</p>}

        {branchesLoading ? (
          <p className="loading-state">Učitavanje filijala...</p>
        ) : branches.length === 0 ? (
          <div className="empty-state">Trenutno nema podataka o filijalama.</div>
        ) : (
          <div className="home-branches-grid">
            {branches.map((branch) => (
              <article key={branch.id} className="home-branch-card">
                <h3>{branch.name}</h3>
                <p>{branch.address}</p>
                <p>
                  <strong>Radno vreme:</strong> {branch.workingHours}
                </p>
                <p className="mono home-branch-phone">{branch.phone}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
