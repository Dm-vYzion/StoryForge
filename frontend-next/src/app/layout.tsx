import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StoryForge",
  description: "StoryForge creator tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="min-h-screen flex items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}