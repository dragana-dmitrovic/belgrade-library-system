import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse, unwrapValue, unwrapValues } from '../models/api-response.model';
import {
  Reservation,
  ReservationCreateRequest,
  ReservationStatusUpdateRequest,
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reservations`;

  /** GET /api/reservations/my */
  getMyReservations(): Observable<Reservation[]> {
    return this.http
      .get<ApiResponse<Reservation>>(`${this.baseUrl}/my`)
      .pipe(map((response) => unwrapValues(response)));
  }

  /** POST /api/reservations/create */
  createReservation(request: ReservationCreateRequest): Observable<Reservation> {
    return this.http
      .post<ApiResponse<Reservation>>(`${this.baseUrl}/create`, request)
      .pipe(map((response) => unwrapValue(response)));
  }

  /** PUT /api/reservations/{id}/cancel */
  cancelReservation(id: number): Observable<Reservation> {
    return this.http
      .put<ApiResponse<Reservation>>(`${this.baseUrl}/${id}/cancel`, {})
      .pipe(map((response) => unwrapValue(response)));
  }

  /** PUT /api/reservations/updateStatus — ADMIN */
  updateReservationStatus(
    request: ReservationStatusUpdateRequest,
  ): Observable<Reservation> {
    return this.http
      .put<ApiResponse<Reservation>>(`${this.baseUrl}/updateStatus`, request)
      .pipe(map((response) => unwrapValue(response)));
  }

  /** GET /api/reservations/all — ADMIN */
  getAllReservationsForAdmin(): Observable<Reservation[]> {
    return this.http
      .get<ApiResponse<Reservation>>(`${this.baseUrl}/all`)
      .pipe(map((response) => unwrapValues(response)));
  }
}
