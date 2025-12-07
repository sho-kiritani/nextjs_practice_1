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
