import type { ApiResponse } from '../models/api-response.model';
import { unwrapValue, unwrapValues } from '../models/api-response.model';
import type { Reservation, ReservationCreateRequest } from '../models/reservation.model';
import { axiosInstance } from './axiosInstance';

const basePath = '/reservations';

/** GET /api/reservations/my */
export async function getMyReservations(): Promise<Reservation[]> {
  const response = await axiosInstance.get<ApiResponse<Reservation>>(`${basePath}/my`);
  return unwrapValues(response.data);
}

/** POST /api/reservations/create */
export async function createReservation(
  request: ReservationCreateRequest,
): Promise<Reservation> {
  const body: ReservationCreateRequest = {
    bookId: request.bookId,
    branchId: request.branchId,
  };

  if (request.notes?.trim()) {
    body.notes = request.notes.trim();
  }

  const response = await axiosInstance.post<ApiResponse<Reservation>>(
    `${basePath}/create`,
    body,
  );
  return unwrapValue(response.data);
}

/** PUT /api/reservations/{id}/cancel */
export async function cancelReservation(id: number): Promise<Reservation> {
  const response = await axiosInstance.put<ApiResponse<Reservation>>(
    `${basePath}/${id}/cancel`,
    {},
  );
  return unwrapValue(response.data);
}

/** GET /api/reservations/all — LIBRARIAN */
export async function getAllReservationsForAdmin(): Promise<Reservation[]> {
  const response = await axiosInstance.get<ApiResponse<Reservation>>(`${basePath}/all`);
  return unwrapValues(response.data);
}
