import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getBookById, getBookReviews, getBranchAvailabilityForBook } from '../../api/bookApi';
import { createReservation } from '../../api/reservationApi';
import { useAuth } from '../../context/AuthContext';
import { BookCover } from '../../components/BookCover/BookCover';
import { ScrollReveal } from '../../components/ScrollReveal/ScrollReveal';
import type { BookBranchAvailability } from '../../models/book-branch-availability.model';
import type { Book } from '../../models/book.model';
import type { BookReview } from '../../models/book-review.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { formatDate } from '../../utils/date.util';
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

function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function getAverageRating(reviews: BookReview[]): number | null {
  const ratedReviews = reviews.filter((review) => review.rating != null);
  if (ratedReviews.length === 0) {
    return null;
  }

  const sum = ratedReviews.reduce((total, review) => total + (review.rating ?? 0), 0);
  return sum / ratedReviews.length;
}

function formatReviewCount(count: number): string {
  if (count === 1) {
    return '1 recenzija';
  }
  if (count >= 2 && count <= 4) {
    return `${count} recenzije`;
  }
  return `${count} recenzija`;
}

export function BookDetailsPage() {
  const { id: idParam } = useParams();
  const bookId = Number(idParam);
  const { user } = useAuth();
  const member = user?.role === 'MEMBER';
  const librarian = user?.role === 'LIBRARIAN';

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showReservationForm, setShowReservationForm] = useState(false);
  const [branchAvailability, setBranchAvailability] = useState<BookBranchAvailability[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchUnavailableMessage, setBranchUnavailableMessage] = useState<string | null>(null);
  const [branchId, setBranchId] = useState('');
  const [notes, setNotes] = useState('');
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);

  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const reservableBranches = getReservableBranches(branchAvailability);
  const averageRating = useMemo(() => getAverageRating(reviews), [reviews]);

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
    if (!Number.isFinite(bookId)) {
      return;
    }

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError(null);

      try {
        const data = await getBookReviews(bookId);
        setReviews(data);
      } catch (error) {
        setReviews([]);
        setReviewsError(getApiErrorMessage(error, 'Recenzije nisu učitane.'));
      } finally {
        setReviewsLoading(false);
      }
    }

    void loadReviews();
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

    if (!book || !branchId) {
      setReservationError('Izaberite filijalu.');
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
    <div className="page-shell book-details-page">
      <Link to="/books" className="back-link">
        ← Nazad na knjige
      </Link>

      <ScrollReveal>
        <p className="eyebrow">{formatGenre(book.genre)}</p>
        <h1>{book.title}</h1>
      </ScrollReveal>

      <ScrollReveal delay={100}>
      <div className="book-details-layout luxury-card">
        <div className="book-details-cover-wrap">
        <BookCover
          coverImageUrl={book.coverImageUrl}
          isbn={book.isbn}
          title={book.title}
          author={book.author}
          imageClassName="book-cover"
        />
        </div>

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
            {!user && (
              <p>
                <Link to="/login">Uloguj se da rezervišeš</Link>
              </p>
            )}

            {librarian && (
              <p className="admin-note">Bibliotekari ne prave korisničke rezervacije.</p>
            )}

            {member && (
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
                    className="gold-button"
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
                  <form className="reservation-form luxury-card" onSubmit={handleReservationSubmit}>
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
                      Napomena (opciono)
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        maxLength={1000}
                      />
                    </label>

                    <div className="reservation-form-actions">
                      <button type="submit" className="gold-button" disabled={reservationLoading}>
                        {reservationLoading ? 'Slanje...' : 'Potvrdi rezervaciju'}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
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
      </ScrollReveal>

      <ScrollReveal delay={180}>
        <section className="book-reviews-section" aria-labelledby="book-reviews-heading">
          <div className="book-reviews-header">
            <h2 id="book-reviews-heading">Recenzije čitalaca</h2>
            {!reviewsLoading && reviews.length > 0 && (
              <div className="book-reviews-summary">
                {averageRating != null && (
                  <p className="book-reviews-average">
                    <span className="rating-stars" aria-hidden="true">
                      {renderStars(Math.round(averageRating))}
                    </span>
                    <span className="book-reviews-average-value">
                      {averageRating.toFixed(1)} / 5
                    </span>
                  </p>
                )}
                <p className="book-reviews-count">{formatReviewCount(reviews.length)}</p>
              </div>
            )}
          </div>

          {reviewsLoading && (
            <p className="loading-state">Učitavanje recenzija...</p>
          )}

          {!reviewsLoading && reviewsError && (
            <p className="message error">{reviewsError}</p>
          )}

          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <p className="book-reviews-empty">Još nema recenzija za ovu knjigu.</p>
          )}

          {!reviewsLoading && !reviewsError && reviews.length > 0 && (
            <div className="book-reviews-grid">
              {reviews.map((review, index) => (
                <article
                  key={`${review.reviewDate}-${index}`}
                  className="book-review-card luxury-card"
                >
                  <div className="book-review-card-head">
                    <p className="book-review-author">{review.reviewerLabel}</p>
                    {review.rating != null && (
                      <p className="rating-stars" aria-label={`Ocena ${review.rating} od 5`}>
                        {renderStars(review.rating)}
                      </p>
                    )}
                  </div>
                  {review.comment && (
                    <p className="book-review-comment">{review.comment}</p>
                  )}
                  <p className="book-review-date">
                    <time>{formatDate(review.reviewDate)}</time>
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </ScrollReveal>
    </div>
  );
}
