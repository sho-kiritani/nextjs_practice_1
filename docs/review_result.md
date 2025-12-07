# コードレビュー結果

## 概要

Next.js 16 / React 19 / Prisma / Zod / TailwindCSS を使用した購入品管理 CRUD アプリケーションのコードレビュー結果です。

全体として、基本的な構造は理解できており、Server Component / Client Component の分離、Server Action の使用、Zod によるバリデーションなど、モダンな Next.js の機能を活用しようとしている姿勢が見えます。以下に改善点を指摘します。

---

## High（重大度：高）

### 1. Server Action の `useActionState` 使用方法の問題

**ファイル**: `src/components/PurchasesForm.tsx:36-44`, `src/lib/actions/purchases.ts:33-38`

**指摘内容**:
`useActionState` に追加パラメータ（`mode`, `id`）を渡す方法が不適切です。現在の実装ではラッパー関数内で Server Action を呼び出していますが、これは React の推奨パターンではありません。

**理由**:
Next.js / React の公式ドキュメントでは、追加の引数を Server Action に渡す場合は `bind` メソッドを使用することが推奨されています。ラッパー関数を使用すると、Server Action の最適化（プログレッシブエンハンスメントなど）が適用されない可能性があります。

**修正例**:

```typescript
// src/lib/actions/purchases.ts
"use server";

export async function submitPurchasesForm(
  mode: Mode,
  id: string | undefined,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // ... 既存のロジック
}
```

```typescript
// src/components/PurchasesForm.tsx
import { submitPurchasesForm } from "@/lib/actions/purchases";

export default function PurchasesForm(props: Props) {
  const { purchase } = props;
  const mode: Mode = purchase ? "update" : "regist";

  // bind で追加パラメータをバインド
  const submitAction = submitPurchasesForm.bind(null, mode, purchase?.id);

  const [state, formAction, pending] = useActionState(submitAction, {
    success: false,
    errors: {},
    purchasesFormData: {},
  });

  // ...
}
```

---

### 2. Server Action でのエラーハンドリング不足

**ファイル**: `src/lib/actions/purchases.ts:85-104`

**指摘内容**:
Prisma の DB 操作（`create`, `update`）に対する `try-catch` がありません。DB 接続エラーや制約違反などの例外が発生した場合、アプリケーションがクラッシュします。

**理由**:
Server Action 内で発生した未処理の例外は、クライアントに予期しないエラーとして伝播します。ユーザーフレンドリーなエラーメッセージを返すためにも、適切なエラーハンドリングが必要です。

**修正例**:

```typescript
// src/lib/actions/purchases.ts
try {
  if (mode === "regist") {
    await prisma.purchases.create({
      data: validationResult.data,
    });
  } else if (mode === "update" && id) {
    await prisma.purchases.update({
      where: { id },
      data: validationResult.data,
    });
  }
} catch (error) {
  console.error("Database operation failed:", error);
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
```

---

### 3. `pending` 状態の未使用

**ファイル**: `src/components/PurchasesForm.tsx:36`

**指摘内容**:
`useActionState` は第3の戻り値として `pending`（送信中かどうかを示すboolean）を返しますが、現在の実装では取得していません。そのため、送信中のローディング状態を表示できていません。

**理由**:
React 19 / Next.js 16 では `useActionState` が `pending` 状態を返すようになりました。これを使用することで、送信中のボタン無効化やローディング表示が可能になります。現在の `disabled={state.success}` は成功後の無効化であり、送信中のフィードバックではありません。

**修正例**:

```typescript
// src/components/PurchasesForm.tsx
const [state, formAction, pending] = useActionState(submitAction, {
  success: false,
  errors: {},
  purchasesFormData: {},
});

// ...

<Button
  type="submit"
  value={pending ? "処理中..." : (_mode === "regist" ? "登録" : "更新")}
  disabled={pending || state.success}
/>
```

---

### 4. ページコンポーネントの命名規則違反

**ファイル**: `src/app/list/page.tsx:3`

**指摘内容**:
`listPage` 関数が小文字始まりになっています。React コンポーネントは PascalCase で命名する必要があります。

**理由**:
React は関数名が小文字で始まる場合、それを DOM 要素として扱おうとします。コンポーネントとして正しく認識させるには、PascalCase（`ListPage`）で命名する必要があります。

**修正例**:

```typescript
// src/app/list/page.tsx
import PurchasesList from "@/components/PurchasesList";

export default function ListPage() {
  return <PurchasesList />;
}
```

---

## Medium（重大度：中）

### 5. クライアントバリデーションの冗長な実装

**ファイル**: `src/components/PurchasesForm.tsx:110-164`

**指摘内容**:
`handleBlur` 関数内の `switch` 文で各フィールドを個別に処理していますが、Zod のスキーマを使えばより簡潔に実装できます。

**理由**:
同じパターンの繰り返しは保守性を下げます。フィールドが増えるたびに `switch` 文を更新する必要があり、バグの温床になります。

**修正例**:

```typescript
const handleBlur = (
  e: React.FocusEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
  const { name, value } = e.target;

  // 動的にフィールドを検証
  const fieldSchema = PurchasesSchema.pick({ [name]: true } as Record<string, true>);
  const result = fieldSchema.safeParse({ [name]: value });

  if (result.success) {
    setValidationErrors((prev) => ({
      ...prev,
      [name]: [],
    }));
  } else {
    setValidationErrors((prev) => ({
      ...prev,
      [name]: result.error.errors.map((e) => e.message),
    }));
  }
};
```

---

### 6. 型の重複定義

**ファイル**: `src/lib/actions/purchases.ts:17-31`, `src/components/PurchasesForm.tsx:12-20`

**指摘内容**:
`ActionState.errors` と `ClientErrors` がほぼ同じ構造で重複定義されています。

**理由**:
同じ型を複数箇所で定義すると、一方を変更した際にもう一方の更新を忘れる可能性があります。

**修正例**:

```typescript
// src/lib/types/types.ts または src/validations/purchases.ts に統合
import type { PurchasesSchemaType } from "@/validations/purchases";

export type FieldErrors = {
  [K in keyof PurchasesSchemaType]?: string[];
};

// ActionState でも ClientErrors でも同じ型を使用
export type ActionState = {
  success: boolean;
  errors: FieldErrors;
  serverError?: string;
  purchasesFormData: Partial<Record<keyof PurchasesSchemaType, string>>;
};
```

---

### 7. ユーティリティ関数の配置

**ファイル**: `src/components/PurchasesForm.tsx:255-263`

**指摘内容**:
`_formatDate` 関数がコンポーネントファイルの最下部に定義されていますが、これはユーティリティ関数として `src/lib/` に分離すべきです。

**理由**:
- 日付フォーマット関数は汎用的で、他のコンポーネントでも使用される可能性がある
- コンポーネントファイルの責務は UI の描画に限定すべき
- テストの書きやすさも向上する

**修正例**:

```typescript
// src/lib/date.ts
export function formatDate(date: Date | undefined, sep = ""): string | null {
  if (date === undefined) return null;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}${sep}${mm}${sep}${dd}`;
}
```

---

### 8. Button コンポーネントの不要な `"use client"`

**ファイル**: `src/components/Button.tsx:1`

**指摘内容**:
`Button` コンポーネントには `"use client"` ディレクティブが付いていますが、このコンポーネント自体は `useState`, `useEffect` などの Client Component 固有の機能を使用していません。

**理由**:
`onClick` props を受け取るだけであれば、親コンポーネントが Client Component であれば問題なく動作します。不要な `"use client"` はバンドルサイズに影響を与える可能性があります。

ただし、`onClick` を使用するコンポーネントは Client Component である必要があるという考え方もあるため、これはチームの方針次第です。現状の実装でも動作上の問題はありません。

**修正例（オプション）**:

```typescript
// src/components/Button.tsx
// "use client" を削除

type ButtonProps = {
  value: string;
  type: "submit" | "button";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

export default function Button(props: ButtonProps) {
  // ...
}
```

---

### 9. リダイレクトパスの一貫性

**ファイル**: `src/app/purchase/[id]/page.tsx:20`

**指摘内容**:
`redirect("purchase")` は相対パスになっていますが、`/purchase` と絶対パスで記述した方が意図が明確です。

**理由**:
相対パスはリファクタリング時にバグの原因になりやすく、コードを読む際も挙動が分かりづらくなります。

**修正例**:

```typescript
if (!purchase) redirect("/purchase");
```

---

### 10. エラーメッセージのアクセシビリティ

**ファイル**: `src/components/InputItem.tsx:123-128`

**指摘内容**:
バリデーションエラーメッセージに `aria-live` 属性がありません。スクリーンリーダーを使用するユーザーにエラーが通知されません。

**理由**:
アクセシビリティの観点から、動的に表示されるエラーメッセージには `aria-live="polite"` を付与することが推奨されます。

**修正例**:

```typescript
{validationErrorMessages && validationErrorMessages.length > 0 && (
  <p className="text-red-500 text-sm" aria-live="polite" role="alert">
    {validationErrorMessages.join(",")}
  </p>
)}
```

---

## Low（重大度：低）

### 11. Prisma のログ設定

**ファイル**: `src/lib/prisma.ts:7-9`

**指摘内容**:
`log: ["query"]` が設定されていますが、これは本番環境でも有効になります。本番環境では不要なログ出力によりパフォーマンスが低下する可能性があります。

**修正例**:

```typescript
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
```

---

### 12. 支払い方法の定数化

**ファイル**: `src/components/PurchasesForm.tsx:91-108`

**指摘内容**:
`paymentMethods` がコンポーネント内で定義されていますが、これはバリデーションスキーマ（`src/validations/purchases.ts`）と同じ値を持つべきです。

**理由**:
現在、Zod スキーマでは `["money", "creditCard", "lease"]` が定義されていますが、コンポーネント内の定数と同期が取れていないと、バリデーションとUIの不整合が発生する可能性があります。

**修正例**:

```typescript
// src/lib/constants/paymentMethods.ts
export const PAYMENT_METHODS = [
  { value: "", label: "選択してください" },
  { value: "money", label: "現金" },
  { value: "creditCard", label: "クレジットカード" },
  { value: "lease", label: "リース" },
] as const;

export const PAYMENT_METHOD_VALUES = ["money", "creditCard", "lease"] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];
```

```typescript
// src/validations/purchases.ts
import { PAYMENT_METHOD_VALUES } from "@/lib/constants/paymentMethods";

// ...
paymentMethod: z
  .string()
  .trim()
  .min(1, "支払い方法を選択してください。")
  .pipe(
    z.enum(PAYMENT_METHOD_VALUES, {
      errorMap: () => ({ message: "不正なステータス値です。" }),
    }),
  ),
```

---

### 13. オブジェクトプロパティの省略記法

**ファイル**: `src/lib/actions/purchases.ts:95-97`

**指摘内容**:
`id: id` はES6の省略記法で `id` と書けます。

**修正例**:

```typescript
await prisma.purchases.update({
  where: { id },
  data: validationResult.data,
});
```

---

### 14. コンポーネントの props 展開

**ファイル**: `src/components/InputItem.tsx:26-36`

**指摘内容**:
props を展開して個別の変数に代入していますが、これは必ずしも必要ではありません。オブジェクト分割代入を関数の引数で直接行うことで、コードを簡潔にできます。

**修正例**:

```typescript
export default function InputItem({
  name,
  type,
  label,
  placeholder,
  width,
  selectItems,
  validationErrorMessages,
  onBlur,
  defaultValue,
}: InputItemProps) {
  // ...
}
```

---

## 良い点

以下の点は適切に実装されています：

1. **Prisma Client のシングルトンパターン**: 開発環境でのホットリロード時に複数のクライアントインスタンスが生成されることを防いでいます。

2. **Zod によるサーバーサイドバリデーション**: `safeParse` を使用し、エラーを適切にハンドリングしています。

3. **Server Component と Client Component の分離**: `PurchasesList` は Server Component として実装され、データフェッチをサーバーサイドで行っています。

4. **型安全性**: TypeScript を活用し、props の型定義が適切に行われています。

5. **App Router の使用**: Next.js 16 の App Router を正しく使用しています。

6. **Biome の設定**: フォーマットとリンティングが適切に設定されています。

---

## 次のステップに向けた改善案

1. **テストの追加**: Jest / Vitest + React Testing Library でコンポーネントテスト、Prisma のモックを使った Server Action のユニットテストを追加することを推奨します。

2. **エラーバウンダリの実装**: `error.tsx` を使用したエラーハンドリングの実装を検討してください。

3. **ローディング UI の実装**: `loading.tsx` を使用した Suspense ベースのローディング表示を検討してください。

4. **フォームライブラリの検討**: より複雑なフォームを扱う場合は、`react-hook-form` との組み合わせも検討の価値があります。

5. **キャッシュ戦略**: データ更新後の `revalidatePath` / `revalidateTag` の使用を検討してください。現在は `redirect` のみですが、明示的なキャッシュ無効化があるとより堅牢になります。

---

## まとめ

| 重大度 | 件数 |
|--------|------|
| High   | 4    |
| Medium | 6    |
| Low    | 4    |

High の指摘事項は早急に対応することを推奨します。特に Server Action のエラーハンドリングと `useActionState` の正しい使用方法は、アプリケーションの安定性に直結します。

レビュー実施日: 2025-12-06
