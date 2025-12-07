import { z } from "zod";

export const PurchasesSchema = z.object({
  itemName: z.string().trim().min(1, "購入品は必須です。"),
  unitPrice: z
    .string()
    .trim()
    .min(1, "金額は必須です。")
    .pipe(
      z.coerce
        .number({ invalid_type_error: "不正な入力状態です。" })
        .min(1, "金額は1以上を入力してください。"),
    ),
  quantity: z
    .string()
    .trim()
    .min(1, "個数は必須です。")
    .pipe(
      z.coerce
        .number({ invalid_type_error: "不正な入力状態です。" })
        .min(1, "個数は1以上を入力してください。"),
    ),
  supplierName: z.string().trim().min(1, "購入先は必須です。"),
  purchaseDate: z
    .string()
    .trim()
    .min(1, "購入日は必須です。")
    .pipe(z.coerce.date({ invalid_type_error: "不正な入力状態です。" })),
  paymentMethod: z
    .string()
    .trim()
    .min(1, "支払い方法を選択してください。")
    .pipe(
      z.enum(["money", "creditCard", "lease"], {
        errorMap: () => ({ message: "不正なステータス値です。" }),
      }),
    ),
  note: z.string().optional(),
});

export type PurchasesSchemaType = z.infer<typeof PurchasesSchema>;
