import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import { createReadingReview, getMyReadingHistory } from '../../api/readingHistoryApi';
import { BookCover } from '../../components/BookCover/BookCover';
import { ScrollReveal } from '../../components/ScrollReveal/ScrollReveal';
import type { MyReadingHistoryItem } from '../../models/reading-history.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { formatDate, formatDateTime } from '../../utils/date.util';
import { formatGenre } from '../../utils/genre.util';
import './ReadingHistory.css';

function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

interface ReviewModalProps {
  item: MyReadingHistoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

function ReviewModal({ item, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await createReadingReview({
        bookId: item.bookId,
        rating: Number(rating),
        comment: comment.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel review-modal"
        role="dialog"
        aria-labelledby="review-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="review-modal-title">Recenzija: {item.title}</h2>
        <p className="review-modal-meta">
          {item.author} · {formatGenre(item.genre)}
        </p>

        <form onSubmit={handleSubmit}>
          <fieldset className="rating-fieldset">
            <legend>Ocena (1–5)</legend>
            <div className="rating-options">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className="rating-option">
                  <input
                    type="radio"
                    name="rating"
                    value={String(value)}
                    checked={rating === String(value)}
                    onChange={(event) => setRating(event.target.value)}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            Komentar (opciono)
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Vaš utisak o knjizi..."
            />
          </label>

          {errorMessage && <p className="message error">{errorMessage}</p>}

          <div className="modal-actions">
            <button type="submit" className="gold-button" disabled={submitting}>
              {submitting ? 'Čuvanje...' : 'Sačuvaj recenziju'}
            </button>
            <button type="button" className="ghost-button" onClick={onClose}>
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistoryCard({
  item,
  onReview,
}: {
  item: MyReadingHistoryItem;
  onReview: (item: MyReadingHistoryItem) => void;
}) {
  return (
    <article className="history-card luxury-card">
      <div className="history-card-cover">
        <BookCover
          coverImageUrl={item.coverImageUrl}
          isbn={item.isbn}
          title={item.title}
          author={item.author}
          imageClassName="history-cover-image"
        />
      </div>
      <div className="history-card-body">
        <div className="history-card-head">
          <h3>{item.title}</h3>
          {item.hasReview ? (
            <span className="badge badge-success">Recenzija sačuvana</span>
          ) : (
            <span className="badge">Za recenziju</span>
          )}
        </div>
        <p className="history-card-author">{item.author}</p>
        <p className="history-card-genre">{formatGenre(item.genre)}</p>
        <p className="history-card-date">
          Vraćeno: <time>{formatDateTime(item.returnedAt)}</time>
        </p>

        {item.hasReview && item.rating != null ? (
          <div className="history-review-block">
            <p className="rating-stars" aria-label={`Ocena ${item.rating} od 5`}>
              {renderStars(item.rating)}
            </p>
            {item.comment && <p className="history-comment">{item.comment}</p>}
            {item.reviewDate && (
              <p className="history-review-date">Recenzija: {formatDate(item.reviewDate)}</p>
            )}
          </div>
        ) : (
          <button type="button" className="gold-button" onClick={() => onReview(item)}>
            Ostavi recenziju
          </button>
        )}
      </div>
    </article>
  );
}

export function ReadingHistoryPage() {
  const [items, setItems] = useState<MyReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<MyReadingHistoryItem | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await getMyReadingHistory();
      setItems(data);
    } catch (error) {
      setItems([]);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const pendingReview = useMemo(() => items.filter((item) => item.canReview), [items]);
  const reviewed = useMemo(() => items.filter((item) => item.hasReview), [items]);

  function handleReviewSuccess() {
    setSuccessMessage('Recenzija je uspešno sačuvana.');
    void loadHistory();
  }

  return (
    <div className="page-shell reading-history-page">
      <ScrollReveal>
        <p className="eyebrow">Vaše čitanje</p>
        <h1>Moja istorija čitanja</h1>
        <p className="page-lead">
          Pregled vraćenih knjiga i vaših recenzija. Recenziju možete ostaviti samo za knjige koje
          ste vratili biblioteci.
        </p>
      </ScrollReveal>

      {successMessage && (
        <p className="message success page-feedback">{successMessage}</p>
      )}
      {errorMessage && <p className="message error page-feedback">{errorMessage}</p>}

      {loading ? (
        <p className="loading-state">Učitavanje istorije čitanja...</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>Još nemate vraćenih knjiga.</p>
          <p className="empty-state-hint">
            Kada bibliotekar evidentira povrat pozajmice, knjiga će se pojaviti ovde i moći ćete da
            ostavite recenziju.
          </p>
        </div>
      ) : (
        <>
          {pendingReview.length > 0 && (
            <section className="history-section">
              <ScrollReveal>
                <h2 className="section-heading">Spremno za recenziju</h2>
              </ScrollReveal>
              <div className="history-grid">
                {pendingReview.map((item, index) => (
                  <ScrollReveal key={`pending-${item.loanId}`} delay={(index % 3) * 80}>
                    <HistoryCard item={item} onReview={setReviewTarget} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {reviewed.length > 0 && (
            <section className="history-section">
              <ScrollReveal>
                <h2 className="section-heading">Vaše recenzije</h2>
              </ScrollReveal>
              <div className="history-grid">
                {reviewed.map((item, index) => (
                  <ScrollReveal key={`reviewed-${item.bookId}`} delay={(index % 3) * 80}>
                    <HistoryCard item={item} onReview={setReviewTarget} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {reviewTarget && (
        <ReviewModal
          item={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
