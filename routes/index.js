import express from "express";
import { userController } from "../controllers/userController.js";
import { orderController } from "../controllers/orderController.js";
import { reviewController } from "../controllers/reviewController.js";
import { productController } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { prisma } from "../prisma.js";
import multer from "multer";
import { uploadController } from "../controllers/uploadController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

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

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получение списка продуктов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 */
router.get("/products", productController.getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получение товара по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные товара
 */
router.get("/products/:id", productController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создание нового товара
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               brandId:
 *                 type: string
 *               genderId:
 *                 type: string
 *               description:
 *                 type: string
 *               discountPercent:
 *                 type: number
 *               discountedPrice:
 *                 type: number
 *             required:
 *               - name
 *               - price
 *     responses:
 *       200:
 *         description: Товар создан
 */
router.post("/products", productController.create);

// Server-side file upload endpoint. Expects multipart/form-data with field name `file`.
router.post("/upload", upload.single("file"), uploadController.upload);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновление товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               brandId:
 *                 type: string
 *               genderId:
 *                 type: string
 *               description:
 *                 type: string
 *               discountPercent:
 *                 type: number
 *               discountedPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Товар обновлён
 */
router.put("/products/:id", productController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаление товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар удалён
 */
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

router.post("/brands", async (req, res) => {
  try {
    const { id, name, description, url } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const brand = await prisma.brand.create({
      data: {
        id: id || Date.now().toString(),
        name,
        description: description || "",
        url: url || "",
      },
    });

    return res.status(201).json(brand);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create brand" });
  }
});

router.put("/brands/:id", async (req, res) => {
  try {
    const { name, description, url } = req.body;
    const { id } = req.params;

    if (!name) {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        description: description || "",
        url: url || "",
      },
    });

    return res.json(updatedBrand);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update brand" });
  }
});

router.delete("/brands/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({ where: { id } });
    return res.json({ id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete brand" });
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
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Обновление статуса заказа
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Статус заказа обновлён
 */
router.patch("/orders/:id/status", orderController.updateStatus);

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
