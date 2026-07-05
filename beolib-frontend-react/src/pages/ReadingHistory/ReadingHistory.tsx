import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { getAllBooks } from '../../api/bookApi';
import { createReadingHistory, getMyReadingHistory } from '../../api/readingHistoryApi';
import type { Book } from '../../models/book.model';
import type { ReadingHistory } from '../../models/reading-history.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { formatDate, todayIsoDate } from '../../utils/date.util';
import './ReadingHistory.css';

export function ReadingHistoryPage() {
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [bookId, setBookId] = useState('');
  const [finishedAt, setFinishedAt] = useState('');
  const [rating, setRating] = useState('5');
  const [review, setReview] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await getMyReadingHistory();
      setHistory(data);
    } catch (error) {
      setHistory([]);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBooks = useCallback(async () => {
    setBooksLoading(true);

    try {
      const data = await getAllBooks();
      setBooks(data);
      if (data.length > 0) {
        setBookId((current) => current || String(data[0].id));
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBooksLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
    void loadBooks();
  }, [loadHistory, loadBooks]);

  function resetForm() {
    setFinishedAt('');
    setRating('5');
    setReview('');
    if (books.length > 0) {
      setBookId(String(books[0].id));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bookId || !finishedAt) {
      setErrorMessage('Izaberi knjigu i datum završetka čitanja.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createReadingHistory({
        bookId: Number(bookId),
        finishedAt,
        rating: Number(rating),
        review: review.trim() || undefined,
      });
      setSuccessMessage('Unos u istoriju čitanja je uspešno dodat.');
      resetForm();
      await loadHistory();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Istorija čitanja</h1>

      <form className="history-form" onSubmit={handleSubmit}>
        <h2>Dodaj ocenu / recenziju</h2>

        <label>
          Knjiga
          <select
            value={bookId}
            onChange={(event) => setBookId(event.target.value)}
            disabled={booksLoading || books.length === 0}
            required
          >
            {books.length === 0 ? (
              <option value="">Nema knjiga</option>
            ) : (
              books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} — {book.author}
                </option>
              ))
            )}
          </select>
        </label>

        <label>
          Datum završetka
          <input
            type="date"
            value={finishedAt}
            max={todayIsoDate()}
            onChange={(event) => setFinishedAt(event.target.value)}
            required
          />
        </label>

        <fieldset className="rating-options">
          <legend>Ocena (1–5)</legend>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="rating"
                value={String(value)}
                checked={rating === String(value)}
                onChange={(event) => setRating(event.target.value)}
              />
              {value}
            </label>
          ))}
        </fieldset>

        <label>
          Recenzija (opciono)
          <textarea
            value={review}
            onChange={(event) => setReview(event.target.value)}
            maxLength={1000}
            placeholder="Kratak utisak o knjizi..."
          />
        </label>

        <button type="submit" disabled={submitting || books.length === 0}>
          {submitting ? 'Čuvanje...' : 'Sačuvaj unos'}
        </button>
      </form>

      {successMessage && (
        <p className="message success page-feedback">{successMessage}</p>
      )}
      {errorMessage && <p className="message error page-feedback">{errorMessage}</p>}

      <h2>Moja istorija</h2>

      {loading ? (
        <p className="loading-state">Učitavanje istorije...</p>
      ) : history.length === 0 ? (
        <div className="empty-state">Još nema unosa u istoriji čitanja.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Knjiga</th>
                <th>Završeno</th>
                <th>Ocena</th>
                <th>Recenzija</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.book.title}</td>
                  <td>{formatDate(entry.finishedAt)}</td>
                  <td className="rating-value">{entry.rating} / 5</td>
                  <td className="review-text">{entry.review || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
