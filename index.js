import dotenv from "dotenv";
import express from "express";
import cors from "cors";
// import svgCaptcha from "svg-captcha";
// import { v4 as uuidv4 } from "uuid";
import router from "./routes/index.js";

dotenv.config();
// import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "./generated/prisma"; // ✅ путь до сгенерированного клиента
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

const app = express();
const port = 5044;

// app.use(cors({ exposedHeaders: ["captcha-token"] }));

// export const prisma = new PrismaClient();
const captchaStore = new Map(); // token -> captchaText
app.use(
  cors({
    origin: ["http://localhost:3000", "https://shop-store-dzjw.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());
// 🟡 1. Генерация капчи
// app.get("/api/captcha", (req, res) => {
//   const captcha = svgCaptcha.create({
//     size: 3,
//     noise: 0, // ❌ отключает волнистые линии
//     color: false, // ❌ чтобы вручную контролировать цвет
//     background: "#000000",
//     width: 120,
//     height: 50,
//     charPreset: "ABCDEFGHJKMNPQRSTUVWXYZ123456789",
//   });
//   // captcha.data = captcha.data.replace(/<path[^>]*fill="[^"]*"/g, (match) =>
//   //   match.replace(/fill="[^"]*"/, 'fill="#00af55"')
//   // );
//   captcha.data = captcha.data
//     // убрать background <rect> если надо
//     .replace(/<rect[^>]*>/g, "")
//     // заменить все fill на зелёный (включая буквы)
//     .replace(/fill="[^"]*"/g, 'fill="#00af55"')
//     // удалить stroke, если есть
//     .replace(/stroke="[^"]*"/g, "");
//   const token = uuidv4();
//   captchaStore.set(token, captcha.text.toLowerCase());
//   console.log(`Captcha generated: ${captcha.text}, Token: ${token}`);
//   res.set("captcha-token", token);
//   res.type("svg");
//   res.json({ success: true, captcha: captcha, id: token });
// });

// 🟢 2. Проверка капчи
// app.post("/api/captcha", (req, res) => {
//   const { text, verify } = req.query;
//   const expected = captchaStore.get(verify);
//   console.log(req.query);
//   console.log(text);
//   console.log(verify);
//   console.log(expected);
//   if (!expected) {
//     return res.status(400).json({ success: false, message: "Token expired" });
//   }

//   const isCorrect = text.toLowerCase() === expected;
//   captchaStore.delete(verify); // удаляем после одного использования

//   res.json({ success: isCorrect });
// });

// app.use("/api", router);
// app.use("/users", userRouter); // http://localhost/users
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);
app.listen(port, () => {
  console.log(`Captcha API запущен на http://localhost:${port}`);
});
