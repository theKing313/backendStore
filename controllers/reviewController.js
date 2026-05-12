import { reviewService } from "../service/reviewService.js";

class ReviewController {
  async create(req, res) {
    try {
      const { productId, username, rating, comment } = req.body;

      if (!productId || !username || !comment) {
        return res
          .status(400)
          .json({ message: "productId, username и comment обязательны" });
      }

      const review = await reviewService.createReview({
        productId,
        username,
        rating,
        comment,
      });

      return res.status(201).json(review);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }

  async getByProduct(req, res) {
    try {
      const { productId } = req.params;
      const reviews = await reviewService.getReviewsByProduct(productId);
      return res.json(reviews);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
}

export const reviewController = new ReviewController();
