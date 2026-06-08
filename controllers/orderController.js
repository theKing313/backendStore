import { orderService } from "../service/orderService.js";

class OrderController {
  async create(req, res) {
    try {
      console.log("📨 Request body:", JSON.stringify(req.body, null, 2));
      const order = await orderService.createOrder(req.body);
      console.log("✅ Order created:", order);
      return res.status(201).json(order);
    } catch (error) {
      console.error("💥 Error in orderController.create:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      return res.status(500).json({
        message: error.message,
        error: error.toString(),
      });
    }
  }

  async getAll(req, res) {
    try {
      const { userId } = req.query;
      const orders = await orderService.getAllOrders(
        userId ? Number(userId) : undefined,
      );
      return res.json(orders);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const order = await orderService.updateOrderStatus(id, status);
      return res.json(order);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
}

export const orderController = new OrderController();
