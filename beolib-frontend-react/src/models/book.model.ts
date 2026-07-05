import type { BookGenre } from './enums.model';

/** Odgovara backend BookDto. */
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  genre: BookGenre | string;
  description: string;
  coverImageUrl: string;
  totalCopies: number;
  availableCopies: number;
}

/** Odgovara backend BookCreateRequest. */
export interface BookCreateRequest {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description?: string;
  coverImageUrl?: string;
  totalCopies: number;
  availableCopies: number;
}

/** Odgovara backend BookUpdateRequest. */
export interface BookUpdateRequest {
  id: number;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description?: string;
  coverImageUrl?: string;
  totalCopies: number;
  availableCopies: number;
}

/** Query parametri za GET /api/books/all */
export interface BookSearchParams {
  search?: string;
  genre?: string;
  available?: boolean;
}
