import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getBookById, getBranchAvailabilityForBook } from '../../api/bookApi';
import { createReservation } from '../../api/reservationApi';
import { useAuth } from '../../context/AuthContext';
import type { BookBranchAvailability } from '../../models/book-branch-availability.model';
import type { Book } from '../../models/book.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { todayIsoDate } from '../../utils/date.util';
import { formatGenre } from '../../utils/genre.util';
import './BookDetails.css';

function getReservableBranches(
  availability: BookBranchAvailability[],
): BookBranchAvailability[] {
  return availability.filter((branch) => branch.availableCopies > 0);
}

function formatBranchOption(branch: BookBranchAvailability): string {
  return `${branch.branchName} — ${branch.availableCopies} dostupno`;
}

export function BookDetailsPage() {
  const { id: idParam } = useParams();
  const bookId = Number(idParam);
  const { isLoggedIn, isAdmin } = useAuth();
  const loggedIn = isLoggedIn();
  const admin = isAdmin();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showReservationForm, setShowReservationForm] = useState(false);
  const [branchAvailability, setBranchAvailability] = useState<BookBranchAvailability[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchUnavailableMessage, setBranchUnavailableMessage] = useState<string | null>(null);
  const [branchId, setBranchId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);

  const reservableBranches = getReservableBranches(branchAvailability);

  const loadBranchAvailability = useCallback(async (): Promise<BookBranchAvailability[]> => {
    if (!book) {
      return [];
    }

    const data = await getBranchAvailabilityForBook(book.id);
    setBranchAvailability(data);

    const reservable = getReservableBranches(data);
    if (reservable.length === 0) {
      setBranchId('');
      setBranchUnavailableMessage('Knjiga trenutno nije dostupna ni u jednoj filijali.');
      setShowReservationForm(false);
    } else {
      setBranchUnavailableMessage(null);
      setBranchId((current) => {
        const stillValid = reservable.some((branch) => String(branch.branchId) === current);
        return stillValid ? current : String(reservable[0].branchId);
      });
    }

    return data;
  }, [book]);

  useEffect(() => {
    if (!Number.isFinite(bookId)) {
      setBook(null);
      setLoading(false);
      setErrorMessage('Neispravan ID knjige.');
      return;
    }

    async function loadBook() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const data = await getBookById(bookId);
        setBook(data);
      } catch (error) {
        setBook(null);
        setErrorMessage(getApiErrorMessage(error, 'Knjiga nije pronađena.'));
      } finally {
        setLoading(false);
      }
    }

    void loadBook();
  }, [bookId]);

  useEffect(() => {
    if (!showReservationForm || !book) {
      return;
    }

    async function loadAvailabilityForForm() {
      setBranchesLoading(true);
      setReservationError(null);

      try {
        await loadBranchAvailability();
      } catch (error) {
        setReservationError(getApiErrorMessage(error));
        setShowReservationForm(false);
      } finally {
        setBranchesLoading(false);
      }
    }

    void loadAvailabilityForForm();
  }, [showReservationForm, book, loadBranchAvailability]);

  function openReservationForm() {
    setReservationError(null);
    setReservationSuccess(null);
    setBranchUnavailableMessage(null);
    setDueDate('');
    setNotes('');
    setBranchAvailability([]);
    setShowReservationForm(true);
  }

  function closeReservationForm() {
    setShowReservationForm(false);
    setReservationError(null);
    setBranchAvailability([]);
    setBranchId('');
  }

  async function handleReservationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!book || !branchId || !dueDate) {
      setReservationError('Popunite filijalu i datum vraćanja.');
      return;
    }

    const selectedBranch = reservableBranches.find(
      (branch) => branch.branchId === Number(branchId),
    );

    if (!selectedBranch || selectedBranch.availableCopies <= 0) {
      setReservationError('Izabrana filijala više nema dostupnih primeraka.');
      setBranchesLoading(true);
      try {
        await loadBranchAvailability();
      } catch (error) {
        setReservationError(getApiErrorMessage(error));
      } finally {
        setBranchesLoading(false);
      }
      return;
    }

    setReservationLoading(true);
    setReservationError(null);
    setReservationSuccess(null);

    try {
      await createReservation({
        bookId: book.id,
        branchId: Number(branchId),
        dueDate,
        notes: notes.trim() || undefined,
      });
      setReservationSuccess('Rezervacija je uspešno kreirana.');
      setShowReservationForm(false);
      setBranchAvailability([]);
      setBranchId('');

      const refreshedBook = await getBookById(book.id);
      setBook(refreshedBook);
    } catch (error) {
      setReservationError(getApiErrorMessage(error));
      setBranchesLoading(true);
      try {
        await loadBranchAvailability();
      } catch (refreshError) {
        setReservationError(getApiErrorMessage(refreshError));
      } finally {
        setBranchesLoading(false);
      }
    } finally {
      setReservationLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="loading-state">Učitavanje knjige...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="page">
        <Link to="/books" className="back-link">
          ← Nazad na knjige
        </Link>
        <p className="message error">{errorMessage ?? 'Knjiga nije pronađena.'}</p>
      </div>
    );
  }

  const noCopiesAvailable = book.availableCopies === 0;

  return (
    <div className="page">
      <Link to="/books" className="back-link">
        ← Nazad na knjige
      </Link>

      <h1>{book.title}</h1>

      <div className="book-details-layout">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} className="book-cover" />
        ) : (
          <div className="book-cover-placeholder">Nema slike</div>
        )}

        <div>
          <div className="book-meta">
            <p>
              <strong>Autor:</strong> {book.author}
            </p>
            <p>
              <strong>Žanr:</strong> {formatGenre(book.genre)}
            </p>
            <p>
              <strong>ISBN:</strong> {book.isbn}
            </p>
            <p>
              <strong>Opis:</strong> {book.description || '—'}
            </p>
            <p>
              <strong>Dostupnost:</strong> {book.availableCopies} / {book.totalCopies} primeraka
            </p>
          </div>

          <div className="book-actions">
            {!loggedIn && (
              <p>
                <Link to="/login">Uloguj se da rezervišeš</Link>
              </p>
            )}

            {loggedIn && admin && (
              <p className="admin-note">Administratori ne rezervišu knjige.</p>
            )}

            {loggedIn && !admin && (
              <>
                {noCopiesAvailable && !branchUnavailableMessage && (
                  <p className="message error">Nema dostupnih primeraka</p>
                )}

                {branchUnavailableMessage && (
                  <p className="message error">{branchUnavailableMessage}</p>
                )}

                {reservationError && (
                  <p className="message error">{reservationError}</p>
                )}

                {!showReservationForm && (
                  <button
                    type="button"
                    disabled={noCopiesAvailable}
                    onClick={openReservationForm}
                  >
                    Rezerviši
                  </button>
                )}

                {showReservationForm && branchesLoading && (
                  <p className="loading-state">Učitavanje dostupnosti po filijalama...</p>
                )}

                {showReservationForm && !branchesLoading && reservableBranches.length > 0 && (
                  <form className="reservation-form" onSubmit={handleReservationSubmit}>
                    <h2>Nova rezervacija</h2>

                    <label>
                      Filijala
                      <select
                        value={branchId}
                        onChange={(event) => setBranchId(event.target.value)}
                        required
                      >
                        {reservableBranches.map((branch) => (
                          <option key={branch.branchId} value={branch.branchId}>
                            {formatBranchOption(branch)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Datum vraćanja
                      <input
                        type="date"
                        value={dueDate}
                        min={todayIsoDate()}
                        onChange={(event) => setDueDate(event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Napomena (opciono)
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        maxLength={1000}
                      />
                    </label>

                    <div className="reservation-form-actions">
                      <button type="submit" disabled={reservationLoading}>
                        {reservationLoading ? 'Slanje...' : 'Potvrdi rezervaciju'}
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={closeReservationForm}
                        disabled={reservationLoading}
                      >
                        Otkaži
                      </button>
                    </div>
                  </form>
                )}

                {reservationSuccess && (
                  <p className="message success">{reservationSuccess}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
