import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { getAllBooks } from '../../api/bookApi';
import type { Book, BookSearchParams } from '../../models/book.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { formatGenre, getGenreOptions } from '../../utils/genre.util';
import './Books.css';

const EMPTY_PARAMS: BookSearchParams = {};

function buildSearchParams(
  search: string,
  genre: string,
  availableOnly: boolean,
): BookSearchParams {
  const params: BookSearchParams = {};

  if (search.trim()) {
    params.search = search.trim();
  }
  if (genre) {
    params.genre = genre;
  }
  if (availableOnly) {
    params.available = true;
  }

  return params;
}

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedParams, setAppliedParams] = useState<BookSearchParams>(EMPTY_PARAMS);

  const [searchInput, setSearchInput] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [availableOnlyInput, setAvailableOnlyInput] = useState(false);

  const loadBooks = useCallback(async (params: BookSearchParams) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await getAllBooks(params);
      setBooks(data);
    } catch (error) {
      setBooks([]);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBooks(appliedParams);
  }, [appliedParams, loadBooks]);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedParams(buildSearchParams(searchInput, genreInput, availableOnlyInput));
  }

  function handleResetFilters() {
    setSearchInput('');
    setGenreInput('');
    setAvailableOnlyInput(false);
    setAppliedParams(EMPTY_PARAMS);
  }

  const hasActiveFilters =
    !!appliedParams.search || !!appliedParams.genre || appliedParams.available === true;

  return (
    <div className="page">
      <h1>Knjige</h1>

      <form className="books-filters" onSubmit={handleFilterSubmit}>
        <label>
          Pretraga
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Naslov ili autor..."
          />
        </label>

        <label>
          Žanr
          <select value={genreInput} onChange={(event) => setGenreInput(event.target.value)}>
            <option value="">Svi žanrovi</option>
            {getGenreOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={availableOnlyInput}
            onChange={(event) => setAvailableOnlyInput(event.target.checked)}
          />
          Samo dostupne
        </label>

        <div className="filter-actions">
          <button type="submit">Pretraži</button>
          <button type="button" className="secondary" onClick={handleResetFilters}>
            Resetuj
          </button>
        </div>
      </form>

      {errorMessage && <p className="message error">{errorMessage}</p>}

      {loading ? (
        <p className="loading-state">Učitavanje knjiga...</p>
      ) : books.length === 0 ? (
        <div className="empty-state">
          {hasActiveFilters
            ? 'Nema knjiga koje odgovaraju filterima.'
            : 'Trenutno nema knjiga u katalogu.'}
        </div>
      ) : (
        <div className="books-table-wrap">
          <table className="books-table">
            <thead>
              <tr>
                <th>Naslov</th>
                <th>Autor</th>
                <th>Žanr</th>
                <th>Dostupnost</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <Link to={`/books/${book.id}`} className="book-link">
                      {book.title}
                    </Link>
                  </td>
                  <td>{book.author}</td>
                  <td>{formatGenre(book.genre)}</td>
                  <td>
                    <span
                      className={
                        book.availableCopies > 0 ? 'status-pill' : 'status-pill unavailable'
                      }
                    >
                      {book.availableCopies} / {book.totalCopies} dostupno
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
