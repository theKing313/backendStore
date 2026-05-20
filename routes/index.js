import express from "express";
import { userController } from "../controllers/userController.js";
import { orderController } from "../controllers/orderController.js";
import { reviewController } from "../controllers/reviewController.js";
import { productController } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { prisma } from "../prisma.js";

const router = express.Router();
/**
 * @swagger
 * /api/registration:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешная регистрация
 */

router.post("/registration", userController.registration);
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Получение данных пользователя
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 */
router.get("/user", authMiddleware, userController.find);

router.get("/products", productController.getAll);
router.get("/products/:id", productController.getById);
router.post("/products", productController.create);
router.put("/products/:id", productController.update);
router.delete("/products/:id", productController.delete);

router.get("/brands", async (req, res) => {
  try {
    const brands = await prisma.brand.findMany();
    return res.json(brands);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch brands" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    return res.json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
});

router.get("/genders", async (req, res) => {
  try {
    const genders = await prisma.gender.findMany();
    return res.json(genders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch genders" });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Создание заказа
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Заказ успешно создан
 */
router.post("/orders", orderController.create);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Получение списка заказов
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Список заказов
 */
router.get("/orders", orderController.getAll);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Создание отзыва
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Отзыв успешно создан
 */
router.post("/reviews", reviewController.create);

/**
 * @swagger
 * /api/reviews/{productId}:
 *   get:
 *     summary: Получение отзывов по товару
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список отзывов
 */
router.get("/reviews/:productId", reviewController.getByProduct);

/**
 * @swagger
 * /api/send-code:
 *   post:
 *     summary: Отправка кода подтверждения
 *     tags: [Mail]
 *     responses:
 *       200:
 *         description: Код отправлен
 */
router.post("/send-code", userController.sendCode);

/**
 * @swagger
 * /api/verify-code:
 *   post:
 *     summary: Подтверждение кода
 *     tags: [Mail]
 *     responses:
 *       200:
 *         description: Код подтвержден
 */
router.post("/verify-code", userController.verifyCode);

/**
 * @swagger
 * /api/password-reset/request:
 *   post:
 *     summary: Отправка кода для восстановления пароля
 *     tags: [Password Reset]
 *     responses:
 *       200:
 *         description: Код отправлен
 */
router.post("/password-reset/request", userController.sendPasswordResetCode);

/**
 * @swagger
 * /api/password-reset/confirm:
 *   post:
 *     summary: Сброс пароля
 *     tags: [Password Reset]
 *     responses:
 *       200:
 *         description: Пароль успешно изменён
 */
router.post("/password-reset/confirm", userController.resetPassword);
// auth/user
export default router;
