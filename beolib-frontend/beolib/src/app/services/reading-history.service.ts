import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse, unwrapValue, unwrapValues } from '../models/api-response.model';
import {
  ReadingHistory,
  ReadingHistoryCreateRequest,
} from '../models/reading-history.model';

@Injectable({
  providedIn: 'root',
})
export class ReadingHistoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/history`;

  /** GET /api/history/my */
  getMyReadingHistory(): Observable<ReadingHistory[]> {
    return this.http
      .get<ApiResponse<ReadingHistory>>(`${this.baseUrl}/my`)
      .pipe(map((response) => unwrapValues(response)));
  }

  /** POST /api/history/add */
  createReadingHistory(
    request: ReadingHistoryCreateRequest,
  ): Observable<ReadingHistory> {
    return this.http
      .post<ApiResponse<ReadingHistory>>(`${this.baseUrl}/add`, request)
      .pipe(map((response) => unwrapValue(response)));
  }
}
