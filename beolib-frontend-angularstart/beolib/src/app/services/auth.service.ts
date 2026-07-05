import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse, unwrapValue } from '../models/api-response.model';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TokenResponse,
} from '../models/auth.model';
import { UserRole } from '../models/enums.model';
import { User } from '../models/user.model';

const TOKEN_KEY = 'beolib_token';
const USER_KEY = 'beolib_user';
const USER_ROLE_KEY = 'beolib_user_role';

export interface AuthSessionState {
  loggedIn: boolean;
  isAdmin: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /** Signal za reaktivno osvežavanje navbar-a posle login/logout. */
  readonly session = signal<AuthSessionState>(this.readSessionState());

  /** POST /api/auth/login */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.baseUrl}/login`, request)
      .pipe(
        map((response) => unwrapValue(response)),
        tap((loginResponse) => this.saveSession(loginResponse.token, loginResponse.user)),
      );
  }

  /**
   * POST /api/auth/register
   * Ne čuva token — nakon registracije korisnik ide na /login (Phase 3).
   */
  register(request: RegisterRequest): Observable<TokenResponse> {
    return this.http
      .post<ApiResponse<TokenResponse>>(`${this.baseUrl}/register`, request)
      .pipe(map((response) => unwrapValue(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    this.session.set({ loggedIn: false, isAdmin: false });
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  getCurrentUserRole(): UserRole | null {
    const role = localStorage.getItem(USER_ROLE_KEY);
    if (role === 'USER' || role === 'ADMIN') {
      return role;
    }
    return null;
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(USER_ROLE_KEY, user.role);
    this.session.set(this.readSessionState());
  }

  private readSessionState(): AuthSessionState {
    const role = localStorage.getItem(USER_ROLE_KEY);
    return {
      loggedIn: !!localStorage.getItem(TOKEN_KEY),
      isAdmin: role === 'ADMIN',
    };
  }
}
