export interface IReview {
  _id?: string;
  review: string;
  rating: number;
  product_id: string;
  user_id: string;
  verified_purchase?: boolean;
  helpful_votes?: number;
  created_at?: Date;
  updated_at?: Date;
}
