import { RESERVATION_STATUSES, type ReservationStatus } from '../models/enums.model';

/** Čitljiv prikaz backend enum vrednosti statusa rezervacije. */
const STATUS_LABELS: Record<ReservationStatus, string> = {
  ACTIVE: 'Aktivna',
  PICKED_UP: 'Preuzeta',
  CANCELLED: 'Otkazana',
  EXPIRED: 'Istekla',
};

export function formatReservationStatus(status: string): string {
  if ((RESERVATION_STATUSES as string[]).includes(status)) {
    return STATUS_LABELS[status as ReservationStatus];
  }
  return 'Nepoznat status';
}

/** Backend dozvoljava cancel samo za ACTIVE rezervacije. */
export function canCancelReservation(status: string): boolean {
  return status === 'ACTIVE';
}

export function reservationStatusPillClass(status: string): string {
  if (status === 'EXPIRED' || status === 'CANCELLED') {
    return 'status-pill cancelled';
  }
  if (status === 'PICKED_UP') {
    return 'status-pill closed';
  }
  return 'status-pill';
}
