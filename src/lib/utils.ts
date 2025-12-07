import {
  PurchasesSchema,
  type PurchasesSchemaType,
} from "@/validations/purchases";

type PurchasesKey = keyof PurchasesSchemaType;
const purchasesKeys = Object.keys(PurchasesSchema.shape) as PurchasesKey[];

// Zodスキーマのキー項目型ガード
export function isPurchasesKey(value: string): value is PurchasesKey {
  return purchasesKeys.includes(value as PurchasesKey);
}

// Date型を文字列にフォーマット
export function formatDate(date: Date | undefined, sep = "") {
  if (date === undefined) return null;

  const yyyy = date.getFullYear();
  const mm = `00${date.getMonth() + 1}`.slice(-2);
  const dd = `00${date.getDate()}`.slice(-2);

  return `${yyyy}${sep}${mm}${sep}${dd}`;
}
