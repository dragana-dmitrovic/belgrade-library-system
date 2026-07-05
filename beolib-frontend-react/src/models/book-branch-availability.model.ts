/** Odgovara backend BookBranchAvailabilityDto (GET /api/books/{id}/branches). */
export interface BookBranchAvailability {
  branchId: number;
  branchName: string;
  totalCopies: number;
  availableCopies: number;
}
