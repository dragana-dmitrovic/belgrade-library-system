import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse, unwrapValue, unwrapValues } from '../models/api-response.model';
import {
  Book,
  BookCreateRequest,
  BookSearchParams,
  BookUpdateRequest,
} from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/books`;

  /** GET /api/books/all */
  getAllBooks(params: BookSearchParams = {}): Observable<Book[]> {
    let httpParams = new HttpParams();

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.genre) {
      httpParams = httpParams.set('genre', params.genre);
    }
    if (params.available !== undefined) {
      httpParams = httpParams.set('available', String(params.available));
    }

    return this.http
      .get<ApiResponse<Book>>(`${this.baseUrl}/all`, { params: httpParams })
      .pipe(map((response) => unwrapValues(response)));
  }

  /** GET /api/books/{id} */
  getBookById(id: number): Observable<Book> {
    return this.http
      .get<ApiResponse<Book>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => unwrapValue(response)));
  }

  /** POST /api/books/add */
  createBook(request: BookCreateRequest): Observable<Book> {
    return this.http
      .post<ApiResponse<Book>>(`${this.baseUrl}/add`, request)
      .pipe(map((response) => unwrapValue(response)));
  }

  /** PUT /api/books/update */
  updateBook(request: BookUpdateRequest): Observable<Book> {
    return this.http
      .put<ApiResponse<Book>>(`${this.baseUrl}/update`, request)
      .pipe(map((response) => unwrapValue(response)));
  }

  /** DELETE /api/books/delete/{id} */
  deleteBook(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl}/delete/${id}`)
      .pipe(map(() => undefined));
  }

  /** Alias za getAllBooks sa filter parametrima — backend podržava search. */
  searchBooks(params: BookSearchParams): Observable<Book[]> {
    return this.getAllBooks(params);
  }
}
