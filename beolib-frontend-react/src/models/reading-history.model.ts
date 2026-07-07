import type { BookGenre } from './enums.model';

/** Odgovara backend MyReadingHistoryItemDto. */
export interface MyReadingHistoryItem {
  loanId: number;
  bookId: number;
  title: string;
  author: string;
  genre: BookGenre;
  coverImageUrl?: string | null;
  returnedAt: string;
  dueDate: string;
  reviewId?: number | null;
  rating?: number | null;
  comment?: string | null;
  reviewDate?: string | null;
  canReview: boolean;
  hasReview: boolean;
}

/** Odgovara backend ReadingHistoryReviewRequest. */
export interface ReadingHistoryReviewRequest {
  bookId: number;
  rating: number;
  comment?: string;
}
