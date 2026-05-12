import express from "express";
import { userController } from "../controllers/userController.js";
import { orderController } from "../controllers/orderController.js";
import { reviewController } from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

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
router.post("/login", userController.login);
router.get("/user", authMiddleware, userController.find);

router.post("/orders", orderController.create);
router.get("/orders", orderController.getAll);

router.post("/reviews", reviewController.create);
router.get("/reviews/:productId", reviewController.getByProduct);

//
router.post("/send-code", userController.sendCode);
router.post("/verify-code", userController.verifyCode);
router.post("/password-reset/request", userController.sendPasswordResetCode);
router.post("/password-reset/confirm", userController.resetPassword);
// auth/user
export default router;
