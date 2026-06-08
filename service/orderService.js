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

      // --- Сохраняем заказ в БД как раньше ---
      let userConnect;
      if (userId) {
        userConnect = { connect: { id: Number(userId) } };
      } else {
        const guestEmail = "guest@purr.store";
        const guestUser = await prisma.user.upsert({
          where: { email: guestEmail },
          update: {},
          create: {
            username: "Guest",
            email: guestEmail,
            password: await bcrypt.hash("guest-password", 3),
          },
        });
        userConnect = { connect: { id: guestUser.id } };
      }

      const createdOrder = await prisma.order.create({
        data: {
          orderNumber,
          timestamp: new Date(timestamp),
          userName,
          userPhone,
          userAddress,
          paymentType,
          orderType,
          cardNumber,
          cardExpiry,
          cardCvv,
          cardHolder,
          totalPrice,
          totalWeight,
          totalDiscount,
          totalQuantity,
          // NOTE: metadata field removed because current Prisma runtime/client
          // does not support it in this deployed environment.
          // If you regenerate Prisma client after schema update, you can add it back.
          user: userConnect,
          cart: {
            create: await Promise.all(
              cart.map(async (item) => {
                // Получаем товар из БД чтобы взять colorImages
                const product = await prisma.product.findUnique({
                  where: { id: item.productId },
                  select: { colorImages: true },
                });

                return {
                  productId: item.productId,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  totalPrice: item.totalPrice,
                  weight: item.weight,
                  totalWeight: item.totalWeight,
                  selectedMaterial: item.selectedMaterial,
                  selectedSize: item.selectedSize,
                  selectedColor: item.selectedColor,
                  discountedPrice: item.discountedPrice,
                  discount: item.discount,
                  profit: item.profit,
                  colorImages: product?.colorImages || {},
                };
              }),
            ),
          },
        },
        include: { cart: true },
      });

      const paymentUrl = payment?.confirmation?.confirmation_url ?? null;

      const result = {
        ...createdOrder,
        timestamp: createdOrder.timestamp.getTime(),
        paymentUrl,
        paymentId: payment?.id,
        paymentStatus: payment?.status,
        amount: payment?.amount,
        confirmation: payment?.confirmation,
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
