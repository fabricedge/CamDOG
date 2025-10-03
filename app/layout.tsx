import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gemini Pet Cam",
  description: "An interactive pet camera that lets you talk to your pet from anywhere using Gemini's real-time audio capabilities. See your pet, talk to them, and dispense virtual treats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand-bg text-brand-text">{children}</body>
    </html>
  );
}
