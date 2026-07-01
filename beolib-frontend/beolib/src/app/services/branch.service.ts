import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse, unwrapValue, unwrapValues } from '../models/api-response.model';
import { Branch } from '../models/branch.model';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/branches`;

  /** GET /api/branches/all */
  getAllBranches(): Observable<Branch[]> {
    return this.http
      .get<ApiResponse<Branch>>(`${this.baseUrl}/all`)
      .pipe(map((response) => unwrapValues(response)));
  }

  /** GET /api/branches/{id} */
  getBranchById(id: number): Observable<Branch> {
    return this.http
      .get<ApiResponse<Branch>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => unwrapValue(response)));
  }
}
