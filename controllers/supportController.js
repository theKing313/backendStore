import { prisma } from "../prisma.js";

export const supportController = {
  create: async (req, res) => {
    try {
      const { userId, orderId, content } = req.body;
      if (!content)
        return res.status(400).json({ message: "content is required" });

      const message = await prisma.supportMessage.create({
        data: {
          userId: userId || null,
          orderId: orderId || null,
          content,
        },
      });

      return res.status(201).json(message);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to create support message" });
    }
  },

  getAll: async (req, res) => {
    try {
      const { orderId } = req.query;
      const where = orderId ? { where: { orderId } } : {};
      const messages = await prisma.supportMessage.findMany({
        orderBy: { createdAt: "asc" },
        ...(orderId ? { where: { orderId } } : {}),
      });
      return res.json(messages);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to fetch support messages" });
    }
  },
};
