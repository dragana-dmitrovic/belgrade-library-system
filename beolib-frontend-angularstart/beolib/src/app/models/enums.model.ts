/** Vrednosti iz backend enum-a BookGenre. */
export type BookGenre =
  | 'FICTION'
  | 'NON_FICTION'
  | 'SCIENCE'
  | 'HISTORY'
  | 'ROMANCE'
  | 'MYSTERY'
  | 'BIOGRAPHY'
  | 'CHILDREN'
  | 'OTHER';

/** Vrednosti iz backend enum-a ReservationStatus. */
export type ReservationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PICKED_UP'
  | 'RETURNED'
  | 'CANCELLED';

/** Vrednosti iz backend enum-a UserRole. */
export type UserRole = 'USER' | 'ADMIN';

export const BOOK_GENRES: BookGenre[] = [
  'FICTION',
  'NON_FICTION',
  'SCIENCE',
  'HISTORY',
  'ROMANCE',
  'MYSTERY',
  'BIOGRAPHY',
  'CHILDREN',
  'OTHER',
];

export const RESERVATION_STATUSES: ReservationStatus[] = [
  'PENDING',
  'APPROVED',
  'PICKED_UP',
  'RETURNED',
  'CANCELLED',
];
