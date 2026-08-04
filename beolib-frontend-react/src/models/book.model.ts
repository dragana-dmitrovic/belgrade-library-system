import type { BookGenre } from './enums.model';

/** Odgovara backend BookDto. */
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  genre: BookGenre | string;
  description: string;
  coverImageUrl: string | null;
  totalCopies: number;
  availableCopies: number;
  selectedBranchTotalCopies?: number | null;
  selectedBranchAvailableCopies?: number | null;
}
export interface BookCreateRequest {
  title: string;
  authorName: string;
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
  authorName: string;
  isbn: string;
  genre: string;
  description?: string;
  coverImageUrl?: string;
  totalCopies: number;
  availableCopies: number;
}

/** Query parametri za GET /api/books/all i GET /api/books */
export interface BookSearchParams {
  search?: string;
  genre?: string;
  available?: boolean;
  branchId?: number;
}

/** Odgovara backend PagedResponse<T>. */
export interface PagedResponse<T> {
  values: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Query parametri za GET /api/books (paginirano). */
export interface BookPagedParams extends BookSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/** Odgovara backend BookMetadataLookupDto (ISBN lookup). */
export interface BookMetadataLookup {
  isbn: string;
  title: string;
  authorName: string | null;
  genre: string;
  coverImageUrl: string | null;
  description: string | null;
}

export interface BranchCopyAllocation {
  branchId: number;
  copyCount: number;
}

/** Odgovara backend BookCreateWithInventoryRequest. */
export interface BookCreateWithInventoryRequest {
  isbn: string;
  title: string;
  authorName: string;
  genre: string;
  description?: string;
  coverImageUrl?: string | null;
  branchAllocations: BranchCopyAllocation[];
}
