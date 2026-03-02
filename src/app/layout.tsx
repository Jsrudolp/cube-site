import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, Belanosima, Work_Sans, Merriweather, DM_Sans, Fanwood_Text, Metal, Lora } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { PersistentCubeProvider } from "@/components/cube";
import { PostHogProvider } from "@/components/PostHogProvider";

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

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fanwoodText = Fanwood_Text({
  variable: "--font-fanwood-text",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const metal = Metal({
  variable: "--font-metal",
  weight: "400",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
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
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${belanosima.variable} ${workSans.variable} ${drukWideBold.variable} ${merriweather.variable} ${dmSans.variable} ${fanwoodText.variable} ${metal.variable} ${lora.variable} antialiased`}
      >
        <PostHogProvider>
          <PersistentCubeProvider>{children}</PersistentCubeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
