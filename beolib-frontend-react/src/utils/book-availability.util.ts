import type { Book } from '../models/book.model';

export interface BookAvailabilityDisplay {
  available: number;
  total: number;
  label: string;
}

/** Prikaz dostupnosti — po filijali ako su podaci prisutni, inače globalno. */
export function getBookAvailabilityDisplay(
  book: Book,
  branchFilterActive: boolean,
): BookAvailabilityDisplay {
  if (
    branchFilterActive &&
    book.selectedBranchAvailableCopies != null &&
    book.selectedBranchTotalCopies != null
  ) {
    return {
      available: book.selectedBranchAvailableCopies,
      total: book.selectedBranchTotalCopies,
      label: 'Dostupno u filijali',
    };
  }

  return {
    available: book.availableCopies,
    total: book.totalCopies,
    label: 'Dostupno ukupno',
  };
}
