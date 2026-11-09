import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Trường Học AI Tại Nhà", description: "Cùng con khám phá và học tập mỗi ngày." };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="vi"><body>{children}</body></html>; }
