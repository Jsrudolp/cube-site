import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, Belanosima, Work_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const drukWideBold = localFont({
  src: "../../public/fonts/DrukWideBold.ttf",
  variable: "--font-druk-wide-bold",
  weight: "700",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const belanosima = Belanosima({
  variable: "--font-belanosima",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jake Rudolph",
  description:
    "A multi-dimensional website, made by a multidimensional person.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${belanosima.variable} ${workSans.variable} ${drukWideBold.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
