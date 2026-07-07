import type { ApiResponse } from '../models/api-response.model';
import { unwrapValue, unwrapValues } from '../models/api-response.model';
import type {
  MyReadingHistoryItem,
  ReadingHistoryReviewRequest,
} from '../models/reading-history.model';
import { axiosInstance } from './axiosInstance';

const basePath = '/reading-history';

/** GET /api/reading-history/my */
export async function getMyReadingHistory(): Promise<MyReadingHistoryItem[]> {
  const response = await axiosInstance.get<ApiResponse<MyReadingHistoryItem>>(`${basePath}/my`);
  return unwrapValues(response.data);
}

/** POST /api/reading-history */
export async function createReadingReview(
  request: ReadingHistoryReviewRequest,
): Promise<MyReadingHistoryItem> {
  const response = await axiosInstance.post<ApiResponse<MyReadingHistoryItem>>(
    basePath,
    request,
  );
  return unwrapValue(response.data);
}
