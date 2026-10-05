export interface ReviewUser {
  _id: string;
  userName: string;
  profilePic?: string;
}

export interface ProductReview {
  _id: string;
  productId: string;
  userId: ReviewUser;
  orderId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  createdAt: string;
}
