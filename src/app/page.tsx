import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="border-gray-400 border-l-5 py-1 pl-2 text-xl">ホーム</h1>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          href="list"
          className="text-blue-600 underline hover:text-blue-800"
        >
          購入品一覧
        </Link>
        <Link
          href="purchase"
          className="text-blue-600 underline hover:text-blue-800"
        >
          新規登録
        </Link>
      </div>
    </div>
  );
}
