-- CreateTable
CREATE TABLE "Purchases" (
    "id" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "supplierName" TEXT NOT NULL,
    "purchaseDate" DATE NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Purchases_pkey" PRIMARY KEY ("id")
);
