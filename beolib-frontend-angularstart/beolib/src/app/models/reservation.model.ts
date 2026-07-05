import { ReservationStatus } from './enums.model';
import { Book } from './book.model';
import { Branch } from './branch.model';
import { User } from './user.model';

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
