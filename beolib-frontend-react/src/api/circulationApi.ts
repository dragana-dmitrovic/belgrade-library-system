import type { ApiResponse } from '../models/api-response.model';
import { unwrapValue, unwrapValues } from '../models/api-response.model';
import type {
  ActiveReservation,
  DirectLoanCreateRequest,
  ExpireOverdueResponse,
  Loan,
  LoanSearchParams,
} from '../models/circulation.model';
import { axiosInstance } from './axiosInstance';

const basePath = '/circulation';

/** GET /api/circulation/reservations/active */
export async function getActiveReservations(): Promise<ActiveReservation[]> {
  const response = await axiosInstance.get<ApiResponse<ActiveReservation>>(
    `${basePath}/reservations/active`,
  );
  return unwrapValues(response.data);
}

/** POST /api/circulation/reservations/{reservationId}/issue */
export async function issueReservation(reservationId: number): Promise<Loan> {
  const response = await axiosInstance.post<ApiResponse<Loan>>(
    `${basePath}/reservations/${reservationId}/issue`,
    {},
  );
  return unwrapValue(response.data);
}

/** POST /api/circulation/loans */
export async function createDirectLoan(request: DirectLoanCreateRequest): Promise<Loan> {
  const body: DirectLoanCreateRequest = {
    memberEmail: request.memberEmail.trim(),
    bookId: request.bookId,
    branchId: request.branchId,
  };

  if (request.notes?.trim()) {
    body.notes = request.notes.trim();
  }

  const response = await axiosInstance.post<ApiResponse<Loan>>(`${basePath}/loans`, body);
  return unwrapValue(response.data);
}

/** GET /api/circulation/loans */
export async function getLoans(params: LoanSearchParams = {}): Promise<Loan[]> {
  const query: Record<string, string | number | boolean> = {};
  if (params.status && params.status !== 'ALL') {
    query.status = params.status;
  }
  if (params.memberEmail?.trim()) {
    query.memberEmail = params.memberEmail.trim();
  }
  if (params.bookTitle?.trim()) {
    query.bookTitle = params.bookTitle.trim();
  }
  if (params.branchId != null) {
    query.branchId = params.branchId;
  }
  if (params.activeOnly) {
    query.activeOnly = true;
  }

  const response = await axiosInstance.get<ApiResponse<Loan>>(`${basePath}/loans`, {
    params: query,
  });
  return unwrapValues(response.data);
}

/** POST /api/circulation/loans/{loanId}/return */
export async function returnLoan(loanId: number): Promise<Loan> {
  const response = await axiosInstance.post<ApiResponse<Loan>>(
    `${basePath}/loans/${loanId}/return`,
    {},
  );
  return unwrapValue(response.data);
}

/** POST /api/circulation/reservations/expire-overdue */
export async function expireOverdueReservations(): Promise<ExpireOverdueResponse> {
  const response = await axiosInstance.post<ApiResponse<ExpireOverdueResponse>>(
    `${basePath}/reservations/expire-overdue`,
    {},
  );
  return unwrapValue(response.data);
}
