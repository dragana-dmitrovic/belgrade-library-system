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
  bookCopyId?: number | null;
  reservedAt: string;
  expiresAt?: string | null;
  status: ReservationStatus | string;
  notes?: string | null;
}

/** Odgovara backend ReservationCreateRequest. */
export interface ReservationCreateRequest {
  bookId: number;
  branchId: number;
  notes?: string;
}
