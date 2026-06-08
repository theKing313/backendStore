import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fs from "fs/promises";
// import svgCaptcha from "svg-captcha";
// import { v4 as uuidv4 } from "uuid";
import router from "./routes/index.js";
import { prisma } from "./prisma.js";

dotenv.config();
// import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "./generated/prisma"; // ✅ путь до сгенерированного клиента
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import { createPayment } from "./service/paymentService.js";

const app = express();
const port = 5044;

// app.use(cors({ exposedHeaders: ["captcha-token"] }));

// export const prisma = new PrismaClient();
const captchaStore = new Map(); // token -> captchaText
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://shop-store-dzjw.vercel.app",
      "https://shop-store-six-eosin.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// app.use("/api", router);
// app.use("/users", userRouter); // http://localhost/users
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);

if (process.env.NODE_ENV !== "production") {
  app.get("/api/seed-database", async (req, res) => {
    try {
      await seedDatabase();
      return res.json({ message: "Seed database completed." });
    } catch (error) {
      console.error("Seed database failed:", error);
      return res.status(500).json({ message: "Seed database failed." });
    }
  });
}

app.post("/api/create-payment", async (req, res) => {
  try {
    const payment = await createPayment(req.body);
    return res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

//
async function seedDatabase() {
  const productsPath = new URL("./mock_data/products.json", import.meta.url);
  const brandsPath = new URL("./mock_data/brands.json", import.meta.url);
  const categoriesPath = new URL(
    "./mock_data/categories.json",
    import.meta.url,
  );

  const [productsRaw, brandsRaw, categoriesRaw] = await Promise.all([
    fs.readFile(productsPath, "utf-8"),
    fs.readFile(brandsPath, "utf-8"),
    fs.readFile(categoriesPath, "utf-8"),
  ]);

  const productsJson = JSON.parse(productsRaw);
  const brandsJson = JSON.parse(brandsRaw);
  const categoriesJson = JSON.parse(categoriesRaw);

  const brands = Object.entries(brandsJson).map(([id, value]) => ({
    id,
    ...(value ?? {}),
  }));

  const categories = Object.entries(categoriesJson).map(([id, value]) => ({
    id,
    ...(value ?? {}),
  }));

  const gendersMap = new Map();
  for (const value of Object.values(productsJson)) {
    if (value?.gender?.id) {
      gendersMap.set(value.gender.id, {
        id: value.gender.id,
        name: value.gender.name,
        url: value.gender.url,
      });
    }
  }

  const genders = Array.from(gendersMap.values());

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        url: category.url,
      },
      create: {
        id: category.id,
        name: category.name,
        url: category.url,
      },
    });
  }

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: {
        name: brand.name,
        url: brand.url ?? undefined,
        description: brand.description ?? undefined,
      },
      create: {
        id: brand.id,
        name: brand.name,
        url: brand.url ?? undefined,
        description: brand.description ?? undefined,
      },
    });
  }

  for (const gender of genders) {
    await prisma.gender.upsert({
      where: { id: gender.id },
      update: {
        name: gender.name,
        url: gender.url,
      },
      create: {
        id: gender.id,
        name: gender.name,
        url: gender.url,
      },
    });
  }

  for (const [id, item] of Object.entries(productsJson)) {
    await prisma.product.upsert({
      where: { id },
      update: {
        name: item.name,
        description: item.description,
        image: item.image,
        price: Number(item.price),
        weight: Number(item.weight),
        sizes: item.sizes ?? [],
        materials: item.materials ?? [],
        colors: item.colors ?? [],
        discountPercent: item.discount?.percent ?? null,
        discountedPrice: item.discount?.discountedPrice ?? null,
        categoryId: item.category.id,
        brandId: item.brand.id,
        genderId: item.gender.id,
      },
      create: {
        id,
        name: item.name,
        description: item.description,
        image: item.image,
        price: Number(item.price),
        weight: Number(item.weight),
        sizes: item.sizes ?? [],
        materials: item.materials ?? [],
        colors: item.colors ?? [],
        discountPercent: item.discount?.percent ?? null,
        discountedPrice: item.discount?.discountedPrice ?? null,
        categoryId: item.category.id,
        brandId: item.brand.id,
        genderId: item.gender.id,
      },
    });
  }

  console.log(
    "Seed completed: products, brands, categories and genders imported.",
  );
}

async function startServer() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Seed database failed:", error);
  }

  app.listen(port, () => {
    console.log(`Captcha API запущен на http://localhost:${port}`);
  });
}

startServer();
