import { prisma } from "../prisma.js";

function resolveRelationId(value, fallback) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.id ?? fallback;
  return fallback;
}

class ProductService {
  async getAllProducts() {
    return prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        gender: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async getProductById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        gender: true,
      },
    });
  }

  async createProduct(productData) {
    const id = productData.id || `product_${Date.now()}`;
    const categoryId = resolveRelationId(
      productData.category,
      productData.categoryId,
    );
    const brandId = resolveRelationId(productData.brand, productData.brandId);
    const genderId = resolveRelationId(
      productData.gender,
      productData.genderId,
    );

    // Подготовка colorImages: объект с ключами по цветам
    const colorImages = productData.colorImages || {};
    // Fallback: если есть старое поле image, использовать его
    const mainImage = productData.image || "";

    return prisma.product.create({
      data: {
        id,
        name: productData.name,
        description: productData.description,
        image: mainImage,
        // colorImages,
        price: Number(productData.price) || 0,
        weight: Number(productData.weight) || 0,
        sizes: productData.sizes ?? [],
        materials: productData.materials ?? [],
        colors: productData.colors ?? [],
        discountPercent: productData.discount?.percent ?? null,
        discountedPrice: productData.discount?.discountedPrice ?? null,
        categoryId,
        brandId,
        genderId,
      },
      include: {
        brand: true,
        category: true,
        gender: true,
      },
    });
  }

  async updateProduct(id, productData) {
    const categoryId = resolveRelationId(
      productData.category,
      productData.categoryId,
    );
    const brandId = resolveRelationId(productData.brand, productData.brandId);
    const genderId = resolveRelationId(
      productData.gender,
      productData.genderId,
    );

    // Подготовка colorImages: объект с ключами по цветам
    const colorImages = productData.colorImages || {};
    const mainImage = productData.image || "";

    return prisma.product.update({
      where: { id },
      data: {
        name: productData.name,
        description: productData.description,
        image: mainImage,
        colorImages,
        price: Number(productData.price) || 0,
        weight: Number(productData.weight) || 0,
        sizes: productData.sizes ?? [],
        materials: productData.materials ?? [],
        colors: productData.colors ?? [],
        discountPercent: productData.discount?.percent ?? null,
        discountedPrice: productData.discount?.discountedPrice ?? null,
        categoryId,
        brandId,
        genderId,
      },
      include: {
        brand: true,
        category: true,
        gender: true,
      },
    });
  }

  async deleteProduct(id) {
    // Use deleteMany to avoid Prisma throwing P2025 when the record doesn't exist.
    // deleteMany returns an object with `count` of deleted rows.
    const result = await prisma.product.deleteMany({ where: { id } });
    return result.count;
  }
}

export const productService = new ProductService();
