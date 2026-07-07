/** Odgovara backend BookReviewDto. */
export interface BookReview {
  rating: number | null;
  comment: string | null;
  reviewDate: string;
  reviewerLabel: string;
}
