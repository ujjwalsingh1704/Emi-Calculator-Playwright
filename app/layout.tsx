import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMI Calculator | ClearPlan",
  description: "Plan loan payments with an interactive EMI calculator and repayment charts."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
