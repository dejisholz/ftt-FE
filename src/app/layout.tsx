import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import Header from "@/components/Header";
import PaymentClosed from "@/components/reusables/PaymentClosed";
import { getPaymentWindowStatus } from "@/utils/payment-window";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FreeTradeTutor",
  description: "Premium Membership",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { isOpen } = getPaymentWindowStatus();
  const isOpen = true;
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-[url('/banner-bg.jpg')] bg-bottom bg-no-repeat bg-fixed bg-cover`}>
        <Providers>
          {isOpen ? <Header /> : <PaymentClosed />}
          {isOpen && children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
