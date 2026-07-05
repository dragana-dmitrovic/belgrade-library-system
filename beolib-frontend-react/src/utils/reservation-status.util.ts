import { RESERVATION_STATUSES, type ReservationStatus } from '../models/enums.model';

/** Čitljiv prikaz backend enum vrednosti statusa rezervacije. */
const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Na čekanju',
  APPROVED: 'Odobreno',
  PICKED_UP: 'Preuzeto',
  RETURNED: 'Vraćeno',
  CANCELLED: 'Otkazano',
};

export function formatReservationStatus(status: string): string {
  if ((RESERVATION_STATUSES as string[]).includes(status)) {
    return STATUS_LABELS[status as ReservationStatus];
  }
  return status;
}

/**
 * Backend dozvoljava cancel (PUT /{id}/cancel) za sve statuse osim CANCELLED i RETURNED.
 * PICKED_UP se takođe može otkazati — usklađeno sa ReservationService.cancelMine().
 */
export function canCancelReservation(status: string): boolean {
  return status !== 'CANCELLED' && status !== 'RETURNED';
}
