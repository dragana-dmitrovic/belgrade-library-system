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
  | 'ACTIVE'
  | 'PICKED_UP'
  | 'CANCELLED'
  | 'EXPIRED';

/** Vrednosti iz backend enum-a UserRole. */
export type UserRole = 'MEMBER' | 'LIBRARIAN';

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
  'ACTIVE',
  'PICKED_UP',
  'CANCELLED',
  'EXPIRED',
];
