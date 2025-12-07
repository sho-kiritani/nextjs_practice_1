import { redirect } from "next/navigation";
import PurchasesForm from "@/components/PurchasesForm";
import { getPurchase } from "@/lib/connection/purchases";

// props型定義
type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ItemPage({ params }: Params) {
  // urlパラメータ取得
  const { id } = await params;

  // idに紐ずく購入品情報を取得
  const purchase = await getPurchase(id);

  // 取得できない場合はホームに戻す
  if (!purchase) redirect("/purchase");

  return <PurchasesForm purchase={purchase} />;
}
