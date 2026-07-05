import type { ApiResponse } from '../models/api-response.model';
import { unwrapValue, unwrapValues } from '../models/api-response.model';
import type {
  ReadingHistory,
  ReadingHistoryCreateRequest,
} from '../models/reading-history.model';
import { axiosInstance } from './axiosInstance';

const basePath = '/history';

/** GET /api/history/my */
export async function getMyReadingHistory(): Promise<ReadingHistory[]> {
  const response = await axiosInstance.get<ApiResponse<ReadingHistory>>(`${basePath}/my`);
  return unwrapValues(response.data);
}

/** POST /api/history/add */
export async function createReadingHistory(
  request: ReadingHistoryCreateRequest,
): Promise<ReadingHistory> {
  const response = await axiosInstance.post<ApiResponse<ReadingHistory>>(
    `${basePath}/add`,
    request,
  );
  return unwrapValue(response.data);
}
