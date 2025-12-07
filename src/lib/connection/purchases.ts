import { prisma } from "@/lib/prisma";

/**
 * 登録済みの購入品一覧を取得する
 * @returns 登録済み購入品一覧
 */
export async function getPurchases() {
  return await prisma.purchases.findMany({
    select: {
      id: true,
      itemName: true,
      unitPrice: true,
      quantity: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * 指定したIDの購入品情報を取得
 * @returns 指定対象の購入品情報
 */
export async function getPurchase(id: string) {
  return await prisma.purchases.findUnique({
    where: {
      id: id,
    },
  });
}
