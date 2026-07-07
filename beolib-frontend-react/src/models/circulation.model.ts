import type { ReservationStatus } from './enums.model';
import type { LoanStatus } from './loan-status.model';

/** Odgovara backend ActiveReservationDto. */
export interface ActiveReservation {
  reservationId: number;
  memberId: number;
  memberEmail: string;
  memberFullName: string;
  bookId: number;
  bookTitle: string;
  branchId: number;
  branchName: string;
  bookCopyId: number | null;
  copyCode: string | null;
  reservedAt: string;
  expiresAt: string | null;
  status: ReservationStatus | string;
}

/** Odgovara backend LoanDto. */
export interface Loan {
  id: number;
  memberId: number;
  memberEmail: string;
  memberFullName: string;
  bookCopyId: number;
  copyCode: string;
  bookId: number;
  bookTitle: string;
  branchId: number;
  branchName: string;
  reservationId: number | null;
  loanDate: string;
  dueDate: string;
  returnedAt: string | null;
  status: LoanStatus | string;
}

/** Odgovara backend DirectLoanCreateRequest. */
export interface DirectLoanCreateRequest {
  memberEmail: string;
  bookId: number;
  branchId: number;
  notes?: string;
}

/** Odgovara backend ExpireOverdueResponse. */
export interface ExpireOverdueResponse {
  expiredCount: number;
  message: string;
}

export interface LoanSearchParams {
  status?: string;
  memberEmail?: string;
  bookTitle?: string;
  branchId?: number;
  activeOnly?: boolean;
}
