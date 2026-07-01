import { User } from './user.model';

/** Odgovara backend LoginRequest. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Odgovara backend RegisterRequest. */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/** Odgovara backend LoginResponse. */
export interface LoginResponse {
  token: string;
  user: User;
}

/** Odgovara backend TokenResponse (register endpoint). */
export interface TokenResponse {
  token: string;
}
