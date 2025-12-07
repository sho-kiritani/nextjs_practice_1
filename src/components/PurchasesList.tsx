import Link from "next/link";
import { getPurchases } from "@/lib/connection/purchases";

export default async function PurchasesList() {
  // 購入済み商品一覧取得
  const purchases = await getPurchases();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="border-gray-400 border-l-5 py-1 pl-2 text-xl">
        購入品一覧
      </h1>

      <ul className="py-5">
        {purchases.map((purchase) => (
          <li key={purchase.id} className="mb-1">
            <Link
              href={`purchase/${purchase.id}`}
              className="text-blue-600 underline hover:text-blue-800"
            >
              {purchase.itemName} （単価：{purchase.unitPrice} 個数：
              {purchase.quantity}）
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-gray-300 border-t py-3">
        <Link
          className="inline-block rounded border px-5 py-2 hover:bg-white"
          href="purchase"
        >
          新規登録
        </Link>
      </div>
    </div>
  );
}
