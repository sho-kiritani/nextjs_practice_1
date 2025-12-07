"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Mode } from "@/lib/types/types";
import { PurchasesSchema } from "@/validations/purchases";

type PurchasesFormData = {
  itemName?: string;
  unitPrice?: string;
  quantity?: string;
  supplierName?: string;
  purchaseDate?: string;
  paymentMethod?: string;
  note?: string;
};

// useActionState用の型定義
export type ActionState = {
  success: boolean;
  errors: {
    itemName?: string[];
    unitPrice?: string[];
    quantity?: string[];
    supplierName?: string[];
    purchaseDate?: string[];
    paymentMethod?: string[];
    note?: string[];
  };
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
  const itemName = formData.get("itemName");
  const unitPrice = formData.get("unitPrice");
  const quantity = formData.get("quantity");
  const supplierName = formData.get("supplierName");
  const purchaseDate = formData.get("purchaseDate");
  const paymentMethod = formData.get("paymentMethod");
  const note = formData.get("note");

  // バリデーション実行
  const validationResult = PurchasesSchema.safeParse({
    itemName,
    unitPrice,
    quantity,
    supplierName,
    purchaseDate,
    paymentMethod,
    note,
  });

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
      purchasesFormData: {
        itemName: itemName?.toString() || "",
        unitPrice: unitPrice?.toString() || "",
        quantity: quantity?.toString() || "",
        supplierName: supplierName?.toString() || "",
        purchaseDate: purchaseDate?.toString() || "",
        paymentMethod: paymentMethod?.toString() || "",
        note: note?.toString() || "",
      },
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
      purchasesFormData: {
        itemName: itemName?.toString() || "",
        unitPrice: unitPrice?.toString() || "",
        quantity: quantity?.toString() || "",
        supplierName: supplierName?.toString() || "",
        purchaseDate: purchaseDate?.toString() || "",
        paymentMethod: paymentMethod?.toString() || "",
        note: note?.toString() || "",
      },
    };
  }

  redirect("/list");
}
