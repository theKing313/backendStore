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
  `${process.env.CLIENT_URL || "https://shop-store-dzjw.vercel.app"}/profile`;

export async function createPayment(orderData) {
  try {
    console.log("💳 Creating payment with orderData:", {
      orderNumber: orderData.orderNumber,
      totalPrice: orderData.totalPrice,
      userName: orderData.userName,
    });

    const idempotenceKey = crypto.randomUUID();
    const amountValue = Number(orderData.totalPrice || 0).toFixed(2);

    console.log("💰 Amount value:", amountValue);
    console.log("🔑 Idempotence key:", idempotenceKey);

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
        cartItems: Array.isArray(orderData.cart) ? orderData.cart.length : 0,
        userId: orderData.userId || null,
      },
    };

    console.log("📤 Payment payload:", JSON.stringify(paymentPayload, null, 2));
    console.log("🛒 Shop ID:", process.env.YOO_SHOP_ID || "1378276");

    const payment = await checkout.createPayment(
      paymentPayload,
      idempotenceKey,
    );

    console.log("✅ Payment created successfully:", {
      id: payment.id,
      status: payment.status,
      confirmation_url: payment.confirmation?.confirmation_url,
    });

    return payment;
  } catch (error) {
    console.error("❌ Error in createPayment:");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2));

    if (error.response?.data) {
      console.error("Response data:", error.response.data);
    }

    throw error;
  }
}
