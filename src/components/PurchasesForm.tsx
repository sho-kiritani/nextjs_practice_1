"use client";
import { useActionState, useEffect, useState } from "react";
import { z } from "zod";
import type { Purchases } from "@/generated/prisma/client";
import { submitPurchasesForm } from "@/lib/actions/purchases";
import type { Mode } from "@/lib/types/types";
import { PurchasesSchema } from "@/validations/purchases";
import Button from "./Button";
import InputItem from "./InputItem";

// クライアントバリデーションエラーState型定義
type ClientErrors = {
  itemName?: string[];
  unitPrice?: string[];
  quantity?: string[];
  supplierName?: string[];
  purchaseDate?: string[];
  paymentMethod?: string[];
  note?: string[];
};

// props型定義
type Props = {
  purchase?: Purchases;
};

export default function PurchasesForm(props: Props) {
  // props展開
  const { purchase } = props;

  // 更新モード判定
  const _mode: Mode = purchase ? "update" : "regist";

  const submitAction = submitPurchasesForm.bind(null, _mode, purchase?.id);

  // ActionState
  const [state, formAction, pending] = useActionState(submitAction, {
    success: false,
    errors: {},
    purchasesFormData: {},
  });

  // フォーム入力値初期値設定
  const defaultValueData = {
    itemName:
      (state.purchasesFormData?.itemName ?? purchase?.itemName?.toString()) ||
      "",
    unitPrice:
      (state.purchasesFormData?.unitPrice ?? purchase?.unitPrice?.toString()) ||
      "",
    quantity:
      (state.purchasesFormData?.quantity ?? purchase?.quantity?.toString()) ||
      "",
    supplierName:
      (state.purchasesFormData?.supplierName ??
        purchase?.supplierName?.toString()) ||
      "",
    purchaseDate:
      (state.purchasesFormData?.purchaseDate ??
        _formatDate(purchase?.purchaseDate, "-")) ||
      "",
    paymentMethod:
      (state.purchasesFormData?.paymentMethod ??
        purchase?.paymentMethod?.toString()) ||
      "",
    note: (state.purchasesFormData?.note ?? purchase?.note?.toString()) || "",
  };

  // クライアントバリデーションエラーState
  const [validationErrors, setValidationErrors] = useState<ClientErrors>({
    itemName: [],
    unitPrice: [],
    quantity: [],
    supplierName: [],
    purchaseDate: [],
    paymentMethod: [],
    note: [],
  });

  // サーバーエラーメッセージをvalidationErrorsに設定する
  useEffect(() => {
    if (!state.success) {
      setValidationErrors(state.errors);
    }
  }, [state.success, state.errors]);

  // 購入方法
  const paymentMethods = [
    {
      value: "",
      label: "選択してください",
    },
    {
      value: "money",
      label: "現金",
    },
    {
      value: "creditCard",
      label: "クレジットカード",
    },
    {
      value: "lease",
      label: "リース",
    },
  ];

  // onBlur関数
  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    try {
      // zodのparseでバリデーション実行する
      switch (name) {
        case "itemName":
          PurchasesSchema.pick({ itemName: true }).parse({ itemName: value });
          break;
        case "unitPrice":
          PurchasesSchema.pick({ unitPrice: true }).parse({ unitPrice: value });
          break;
        case "quantity":
          PurchasesSchema.pick({ quantity: true }).parse({ quantity: value });
          break;
        case "supplierName":
          PurchasesSchema.pick({ supplierName: true }).parse({
            supplierName: value,
          });
          break;
        case "purchaseDate":
          PurchasesSchema.pick({ purchaseDate: true }).parse({
            purchaseDate: value,
          });
          break;
        case "paymentMethod":
          PurchasesSchema.pick({ paymentMethod: true }).parse({
            paymentMethod: value,
          });
          break;
        case "note":
          PurchasesSchema.pick({ note: true }).parse({ note: value });
          break;
      }

      // バリデーション通過の場合はエラーメッセージをクリアする
      setValidationErrors((prev) => ({
        ...prev,
        [name]: [],
      }));
    } catch (error) {
      // zodによるバリデーションエラーの場合はエラーメッセージを設定する
      if (error instanceof z.ZodError) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: error.errors?.map((e) => e.message) || [],
        }));
      }
    }
  };

  // サーバーエラーメッセージが存在する場合はalert表示
  if (state.serverError) alert(state.serverError);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="border-gray-400 border-l-5 py-1 pl-2 text-xl">
        購入品登録
      </h1>

      <form action={formAction}>
        <div className="flex flex-col gap-3 py-5">
          <InputItem
            type="text"
            name="itemName"
            label="品名"
            placeholder="例）業務用ノートPC"
            width="md"
            validationErrorMessages={validationErrors.itemName}
            onBlur={handleBlur}
            defaultValue={defaultValueData.itemName}
          />
          <InputItem
            type="number"
            name="unitPrice"
            label="金額（円）"
            placeholder="例）12000"
            width="auto"
            validationErrorMessages={validationErrors.unitPrice}
            onBlur={handleBlur}
            defaultValue={defaultValueData.unitPrice}
          />
          <InputItem
            type="number"
            name="quantity"
            label="個数"
            placeholder="例）5"
            width="auto"
            validationErrorMessages={validationErrors.quantity}
            onBlur={handleBlur}
            defaultValue={defaultValueData.quantity}
          />
          <InputItem
            type="text"
            name="supplierName"
            label="購入先"
            placeholder="例）株式会社Amazon"
            width="md"
            validationErrorMessages={validationErrors.supplierName}
            onBlur={handleBlur}
            defaultValue={defaultValueData.supplierName}
          />
          <InputItem
            type="date"
            name="purchaseDate"
            label="購入日"
            width="auto"
            validationErrorMessages={validationErrors.purchaseDate}
            onBlur={handleBlur}
            defaultValue={defaultValueData.purchaseDate}
          />
          <InputItem
            type="select"
            name="paymentMethod"
            label="支払い方法"
            width="auto"
            selectItems={paymentMethods}
            validationErrorMessages={validationErrors.paymentMethod}
            onBlur={handleBlur}
            defaultValue={defaultValueData.paymentMethod}
          />
          <InputItem
            type="textarea"
            name="note"
            label="備考"
            width="full"
            validationErrorMessages={validationErrors.note}
            onBlur={handleBlur}
            defaultValue={defaultValueData.note}
          />
          <div className="flex justify-start">
            <Button
              type="submit"
              value={_mode === "regist" ? "登録" : "更新"}
              disabled={pending || state.success}
              loading={pending}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

function _formatDate(date: Date | undefined, sep = "") {
  if (date === undefined) return null;

  const yyyy = date.getFullYear();
  const mm = `00${date.getMonth() + 1}`.slice(-2);
  const dd = `00${date.getDate()}`.slice(-2);

  return `${yyyy}${sep}${mm}${sep}${dd}`;
}
