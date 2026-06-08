-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "colorImages" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colorImages" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "image" SET DEFAULT '';
