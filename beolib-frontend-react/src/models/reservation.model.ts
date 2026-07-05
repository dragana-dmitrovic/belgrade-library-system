import type { ReservationStatus } from './enums.model';
import type { Book } from './book.model';
import type { Branch } from './branch.model';
import type { User } from './user.model';

/** Odgovara backend ReservationDto. */
export interface Reservation {
  id: number;
  user: User;
  book: Book;
  branch: Branch;
  reservedAt: string;
  dueDate: string;
  status: ReservationStatus | string;
  notes: string;
}

/** Odgovara backend ReservationCreateRequest. */
export interface ReservationCreateRequest {
  bookId: number;
  branchId: number;
  dueDate: string;
  notes?: string;
}

/** Odgovara backend ReservationStatusUpdateRequest. */
export interface ReservationStatusUpdateRequest {
  reservationId: number;
  status: string;
}
