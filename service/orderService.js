import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";
import { createPayment } from "./paymentService.js";

class OrderService {
  async createOrder(orderData) {
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

    let payment = null;
    if (paymentType === "card") {
      payment = await createPayment({
        ...orderData,
        orderNumber,
        cart,
      });
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
        metadata: {
          order: {
            orderNumber,
            paymentType,
            orderType,
            totalPrice,
            totalWeight,
            totalDiscount,
            totalQuantity,
            cart: cart.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.totalPrice,
              weight: item.weight,
              selectedMaterial: item.selectedMaterial,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
            })),
          },
          user: {
            userId: userId || null,
            userName,
            userPhone,
            userAddress,
            cardHolder,
            cardExpiry,
            cardNumber: cardNumber
              ? cardNumber.replace(/.(?=.{4})/g, "*")
              : null,
          },
          payment: payment
            ? {
                id: payment.id,
                status: payment.status,
                paid: payment.paid,
                confirmationType: payment.confirmation?.type,
                confirmationUrl: payment.confirmation?.confirmation_url,
                createdAt: payment.created_at,
                amount: payment.amount,
              }
            : null,
        },
        user: userConnect,
        cart: {
          create: cart.map((item) => ({
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
          })),
        },
      },
      include: { cart: true },
    });

    const paymentUrl = payment?.confirmation?.confirmation_url ?? null;

    return {
      ...createdOrder,
      timestamp: createdOrder.timestamp.getTime(),
      paymentUrl,
    };
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
