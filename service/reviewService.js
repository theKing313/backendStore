import { prisma } from "../prisma.js";

class ReviewService {
  async createReview(reviewData) {
    const { productId, username, rating, comment } = reviewData;

    if (!productId || !username || !comment) {
      throw new Error("Missing required fields for review");
    }

    const sanitizedRating = Math.min(5, Math.max(1, Number(rating) || 1));

    const review = await prisma.review.create({
      data: {
        productId,
        username: username.trim(),
        rating: sanitizedRating,
        comment: comment.trim(),
      },
    });

    return review;
  }

  async getReviewsByProduct(productId) {
    return prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const reviewService = new ReviewService();
