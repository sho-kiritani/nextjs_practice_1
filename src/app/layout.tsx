import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "購入品管理システム",
  description: "購入品を管理するシステムです",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <header className="fixed top-0 left-0 w-full border-gray-300 border-b bg-white px-3 py-5 text-gray-800">
          <Link href="/">購入品管理システム</Link>
        </header>
        <div className="h-screen bg-gray-100 pt-20">{children}</div>
      </body>
    </html>
  );
}
