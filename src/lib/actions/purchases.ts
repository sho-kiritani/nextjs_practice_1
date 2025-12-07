"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Mode } from "@/lib/types/types";
import {
  PurchasesSchema,
  type PurchasesSchemaType,
} from "@/validations/purchases";

// フォーム入力値用型定義
type PurchasesFormData = {
  [K in keyof PurchasesSchemaType]?: string;
};

// バリデーションエラーメッセージ用型定義
export type FieldErrors = {
  [K in keyof PurchasesSchemaType]?: string[];
};

// useActionState用の型定義
export type ActionState = {
  success: boolean;
  errors: FieldErrors;
  serverError?: string;
  purchasesFormData: PurchasesFormData;
};

export async function submitPurchasesForm(
  mode: Mode,
  id: string | undefined,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 入力内容取得
  const PpurchasesFormData: PurchasesFormData = {
    itemName: formData.get("itemName")?.toString() || "",
    unitPrice: formData.get("unitPrice")?.toString() || "",
    quantity: formData.get("quantity")?.toString() || "",
    supplierName: formData.get("supplierName")?.toString() || "",
    purchaseDate: formData.get("purchaseDate")?.toString() || "",
    paymentMethod: formData.get("paymentMethod")?.toString() || "",
    note: formData.get("note")?.toString() || "",
  };

  // バリデーション実行
  const validationResult = PurchasesSchema.safeParse(PpurchasesFormData);

  // バリデーションエラーの場合はエラーメッセージを返却して処理終了
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        itemName: errors.itemName || [],
        unitPrice: errors.unitPrice || [],
        quantity: errors.quantity || [],
        supplierName: errors.supplierName || [],
        purchaseDate: errors.purchaseDate || [],
        paymentMethod: errors.paymentMethod || [],
        note: errors.note || [],
      },
      purchasesFormData: PpurchasesFormData,
    };
  }

  // DB操作

  try {
    if (mode === "regist") {
      // 新規登録の場合はDB登録
      await prisma.purchases.create({
        data: {
          ...validationResult.data,
        },
      });
    } else if (mode === "update" && id) {
      // 更新の場合はDB更新
      await prisma.purchases.update({
        where: {
          id: id,
        },
        data: {
          ...validationResult.data,
        },
      });
    }
  } catch (error) {
    console.error("Database operation failed", error);
    return {
      success: false,
      errors: {},
      serverError: "データベース操作に失敗しました。",
      purchasesFormData: PpurchasesFormData,
    };
  }

  redirect("/list");
}
