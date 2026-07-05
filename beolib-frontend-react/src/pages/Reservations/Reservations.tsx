import { useCallback, useEffect, useState } from 'react';

import { cancelReservation, getMyReservations } from '../../api/reservationApi';
import type { Reservation } from '../../models/reservation.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { formatDate, formatDateTime } from '../../utils/date.util';
import {
  canCancelReservation,
  formatReservationStatus,
} from '../../utils/reservation-status.util';
import './Reservations.css';

function statusPillClass(status: string): string {
  if (status === 'CANCELLED') {
    return 'status-pill cancelled';
  }
  if (status === 'RETURNED') {
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
    <div className="page">
      <h1>Moje rezervacije</h1>

      {successMessage && (
        <p className="message success page-feedback">{successMessage}</p>
      )}
      {errorMessage && <p className="message error page-feedback">{errorMessage}</p>}

      {loading ? (
        <p className="loading-state">Učitavanje rezervacija...</p>
      ) : reservations.length === 0 ? (
        <div className="empty-state">Nemaš rezervacija.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Knjiga</th>
                <th>Filijala</th>
                <th>Rezervisano</th>
                <th>Rok vraćanja</th>
                <th>Status</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.book.title}</td>
                  <td>{reservation.branch.name}</td>
                  <td>{formatDateTime(reservation.reservedAt)}</td>
                  <td>{formatDate(reservation.dueDate)}</td>
                  <td>
                    <span className={statusPillClass(reservation.status)}>
                      {formatReservationStatus(reservation.status)}
                    </span>
                  </td>
                  <td>
                    {canCancelReservation(reservation.status) ? (
                      <button
                        type="button"
                        className="action-button"
                        disabled={cancellingId === reservation.id}
                        onClick={() => void handleCancel(reservation)}
                      >
                        {cancellingId === reservation.id ? 'Otkazivanje...' : 'Otkaži'}
                      </button>
                    ) : (
                      '—'
                    )}
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
