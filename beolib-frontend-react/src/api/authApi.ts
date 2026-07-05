import type { ApiResponse } from '../models/api-response.model';
import { unwrapValue } from '../models/api-response.model';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TokenResponse,
} from '../models/auth.model';
import { axiosInstance } from './axiosInstance';

const basePath = '/auth';

/** POST /api/auth/login */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
    `${basePath}/login`,
    request,
  );
  return unwrapValue(response.data);
}

/** POST /api/auth/register */
export async function register(request: RegisterRequest): Promise<TokenResponse> {
  const response = await axiosInstance.post<ApiResponse<TokenResponse>>(
    `${basePath}/register`,
    request,
  );
  return unwrapValue(response.data);
}
