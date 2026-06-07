import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";
import { createPayment } from "./paymentService.js";

class OrderService {
  async createOrder(orderData) {
    try {
      console.log(
        "🛒 createOrder called with:",
        JSON.stringify(orderData, null, 2),
      );

      const {
        userId,
        userName,
        userPhone,
        userAddress,
        paymentType,
        orderType,
        cardNumber,
        cardExpiry,
        cardCvv,
        cardHolder,
        cart,
        timestamp,
        totalPrice,
        totalWeight,
        totalDiscount,
        totalQuantity,
      } = orderData;

      const orderNumber =
        Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 90);

      console.log("💳 Payment type:", paymentType);

      let payment = null;
      if (paymentType === "card") {
        console.log("💳 Creating payment...");
        payment = await createPayment({
          ...orderData,
          orderNumber,
          cart,
        });
        console.log("✅ Payment created:", payment);
      }

      const paymentUrl = payment?.confirmation?.confirmation_url ?? null;

      // Возвращаем информацию о платеже с красивой ссылкой на модалку Yookassa
      const result = {
        success: true,
        orderNumber,
        paymentUrl,
        paymentId: payment?.id,
        paymentStatus: payment?.status,
        amount: payment?.amount,
        confirmation: payment?.confirmation,
        // Сохраняем данные заказа в памяти до подтверждения платежа
        orderData: {
          userId,
          userName,
          userPhone,
          userAddress,
          paymentType,
          orderType,
          cardNumber,
          cardExpiry,
          cardCvv,
          cardHolder,
          cart,
          timestamp,
          totalPrice,
          totalWeight,
          totalDiscount,
          totalQuantity,
        },
      };

      console.log("📤 Returning result:", JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error("❌ Error in createOrder:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  }

  async getAllOrders() {
    // const peeeeeeeeeeeeeee = prisma;
    // return { test: JSON.stringify(peeeeeeeeeeeeeee.order) };
    // const orders = await prisma.order.findMany({
    //   include: { cart: true },
    //   orderBy: { createdAt: "desc" },
    // });
    const orders = await prisma.order.findMany({
      include: { cart: true },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => ({
      ...order,
      timestamp: order.timestamp.getTime(),
    }));
  }

  async updateOrderStatus(orderId, status) {
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { cart: true },
    });

    return {
      ...updatedOrder,
      timestamp: updatedOrder.timestamp.getTime(),
    };
  }
}

export const orderService = new OrderService();
