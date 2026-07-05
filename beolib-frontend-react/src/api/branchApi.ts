import type { ApiResponse } from '../models/api-response.model';
import { unwrapValue, unwrapValues } from '../models/api-response.model';
import type { Branch } from '../models/branch.model';
import { axiosInstance } from './axiosInstance';

const basePath = '/branches';

/** GET /api/branches/all */
export async function getAllBranches(): Promise<Branch[]> {
  const response = await axiosInstance.get<ApiResponse<Branch>>(`${basePath}/all`);
  return unwrapValues(response.data);
}

/** GET /api/branches/{id} */
export async function getBranchById(id: number): Promise<Branch> {
  const response = await axiosInstance.get<ApiResponse<Branch>>(`${basePath}/${id}`);
  return unwrapValue(response.data);
}
