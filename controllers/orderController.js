import { orderService } from "../service/orderService.js";

class OrderController {
  async create(req, res) {
    try {
      const order = await orderService.createOrder(req.body);
      return res.status(201).json(order);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const orders = await orderService.getAllOrders();
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
