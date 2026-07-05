import type { Book } from './book.model';
import type { User } from './user.model';

/** Odgovara backend ReadingHistoryDto. */
export interface ReadingHistory {
  id: number;
  user: User;
  book: Book;
  finishedAt: string;
  rating: number;
  review: string;
}

/** Odgovara backend ReadingHistoryCreateRequest. */
export interface ReadingHistoryCreateRequest {
  bookId: number;
  finishedAt: string;
  rating: number;
  review?: string;
}
