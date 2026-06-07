import crypto from "crypto";
import { YooCheckout } from "@a2seven/yoo-checkout";

const checkout = new YooCheckout({
  shopId: process.env.YOO_SHOP_ID || "1378276",
  secretKey:
    process.env.YOO_SECRET_KEY ||
    "test_1LSaugZ3bJef-PeQEkrtTBHl3EXyanoV4JtLCjOi6so",
});

const PAYMENT_RETURN_URL =
  process.env.PAYMENT_RETURN_URL ||
  `${process.env.CLIENT_URL || "http://localhost:3000"}/profile`;

export async function createPayment(orderData) {
  const idempotenceKey = crypto.randomUUID();
  const amountValue = Number(orderData.totalPrice || 0).toFixed(2);

  const paymentPayload = {
    amount: {
      value: amountValue,
      currency: "RUB",
    },
    description: `Оплата заказа ${orderData.orderNumber} для ${orderData.userName}`,
    payment_method_data: {
      type: "bank_card",
    },
    confirmation: {
      type: "redirect",
      return_url: PAYMENT_RETURN_URL,
      locale: "ru_RU",
    },
    capture: true,
    save_payment_method: false,
    metadata: {
      orderNumber: orderData.orderNumber,
      userName: orderData.userName,
      userPhone: orderData.userPhone,
      userAddress: orderData.userAddress,
      paymentType: orderData.paymentType,
      orderType: orderData.orderType,
      totalPrice: orderData.totalPrice,
      totalQuantity: orderData.totalQuantity,
      cart: orderData.cart,
      userId: orderData.userId || null,
    },
  };

  const payment = await checkout.createPayment(paymentPayload, idempotenceKey);
  return payment;
}
