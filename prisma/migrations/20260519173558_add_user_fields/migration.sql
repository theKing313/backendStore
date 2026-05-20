-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gender" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Gender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "sizes" TEXT[],
    "materials" TEXT[],
    "colors" TEXT[],
    "discountPercent" INTEGER,
    "discountedPrice" DOUBLE PRECISION,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "genderId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Gender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
