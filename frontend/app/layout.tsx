import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ClientProvider from "@/HOC/ClientProvider";

const font = Roboto({
  weight: ['100','300','400','500','700','900'],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixora is a canvas for your social life—share, connect, and create",
  description: "Pixora is a canvas for your social life—share, connect, and create built with next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased`}
      >
        <ClientProvider>
          {children}
        <Toaster />
        </ClientProvider>
        
      </body>
    </html>
  );
}
