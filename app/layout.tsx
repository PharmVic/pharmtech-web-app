import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import "../styles/theme.css";
import BootstrapClient from "@/components/BootstrapClient";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pharmtech Web Application",
  description: "CCTV, Solar, Networking, Automation, Access Control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${roboto.variable} antialiased font-sans`}
      >
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
