// 支払い方法
export const PAYMENT_METHODS = [
  { value: "money", label: "現金" },
  { value: "creditCard", label: "クレジットカード" },
  { value: "lease", label: "リース" },
] as const;

// 表示用
export const PAYMENT_METHODS_SELECT = [
  { value: "", label: "選択してください" },
  ...PAYMENT_METHODS,
] as const;

// Zodスキーマバリデーション用
export const PAYMENT_METHODS_VALUE = NonEmptyArray(PAYMENT_METHODS);

// NonEmptyArray を map できる関数
function NonEmptyArray(
  arr: typeof PAYMENT_METHODS,
): readonly [string, ...string[]] {
  if (arr.length <= 0) {
    throw new Error("PAYMENT_METHODS must have at least one item");
  }
  const result = arr.map((paymentMethods) => paymentMethods.value);
  return [result[0], ...result.slice(1)];
}
