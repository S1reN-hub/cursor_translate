import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Translate 中英文互译",
  description: "基于 AI 的中英文双向翻译，支持段落翻译、语音播报与历史记录",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
