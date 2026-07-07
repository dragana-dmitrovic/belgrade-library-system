import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { cancelReservation, getMyReservations } from '../../api/reservationApi';
import { ScrollReveal } from '../../components/ScrollReveal/ScrollReveal';
import type { Reservation } from '../../models/reservation.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { formatDateTime } from '../../utils/date.util';
import {
  canCancelReservation,
  formatReservationStatus,
} from '../../utils/reservation-status.util';
import './Reservations.css';

function statusPillClass(status: string): string {
  if (status === 'CANCELLED' || status === 'EXPIRED') {
    return 'status-pill cancelled';
  }
  if (status === 'PICKED_UP') {
    return 'status-pill closed';
  }
  return 'status-pill';
}

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch (error) {
      setReservations([]);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  async function handleCancel(reservation: Reservation) {
    const confirmed = window.confirm(
      `Da li želiš da otkažeš rezervaciju za knjigu "${reservation.book.title}"?`,
    );
    if (!confirmed) {
      return;
    }

    setCancellingId(reservation.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await cancelReservation(reservation.id);
      setSuccessMessage('Rezervacija je uspešno otkazana.');
      await loadReservations();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="page-shell reservations-page">
      <ScrollReveal>
        <p className="eyebrow">Članstvo</p>
        <h1>Moje rezervacije</h1>
        <p className="page-lead">Pregled aktivnih i završenih rezervacija u elegantnom pregledu.</p>
      </ScrollReveal>

      {successMessage && (
        <p className="message success page-feedback">{successMessage}</p>
      )}
      {errorMessage && <p className="message error page-feedback">{errorMessage}</p>}

      {loading ? (
        <p className="loading-state">Učitavanje rezervacija...</p>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <p>Nemaš rezervacija.</p>
          <p className="muted-text">
            Pretraži <Link to="/books">katalog</Link> i rezerviši primerak u filijali po izboru.
          </p>
        </div>
      ) : (
        <div className="reservations-grid">
          {reservations.map((reservation, index) => (
            <ScrollReveal key={reservation.id} delay={(index % 3) * 80}>
              <article className="reservation-card luxury-card">
                <div className="reservation-card-head">
                  <h2>{reservation.book.title}</h2>
                  <span className={statusPillClass(reservation.status)}>
                    {formatReservationStatus(reservation.status)}
                  </span>
                </div>
                <p className="reservation-card-author muted-text">{reservation.book.author}</p>
                <dl className="reservation-meta">
                  <div>
                    <dt>Filijala</dt>
                    <dd>{reservation.branch.name}</dd>
                  </div>
                  <div>
                    <dt>Rezervisano</dt>
                    <dd>{formatDateTime(reservation.reservedAt)}</dd>
                  </div>
                  <div>
                    <dt>Ističe</dt>
                    <dd>
                      {reservation.expiresAt ? formatDateTime(reservation.expiresAt) : '—'}
                    </dd>
                  </div>
                </dl>
                {canCancelReservation(reservation.status) && (
                  <button
                    type="button"
                    className="ghost-button reservation-cancel"
                    disabled={cancellingId === reservation.id}
                    onClick={() => void handleCancel(reservation)}
                  >
                    {cancellingId === reservation.id ? 'Otkazivanje...' : 'Otkaži rezervaciju'}
                  </button>
                )}
              </article>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
