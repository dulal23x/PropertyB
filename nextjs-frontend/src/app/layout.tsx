import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://propertybikri.com"),
  title: {
    default: "PropertyBikri: Flats, Houses & Properties for Sale in Dhaka",
    template: "%s",
  },
  description: "Find flats, apartments, houses, land and commercial properties for sale in Dhaka, Bangladesh. Browse verified listings in Gulshan, Banani, Bashundhara, Uttara and Dhanmondi.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PropertyBikri: Flats, Houses & Properties for Sale in Dhaka",
    description: "Find flats, apartments, houses, land and commercial properties for sale in Dhaka, Bangladesh.",
    url: "https://propertybikri.com",
    siteName: "PropertyBikri",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PropertyBikri: Flats, Houses & Properties for Sale in Dhaka",
    description: "Find flats, apartments, houses, land and commercial properties for sale in Dhaka, Bangladesh.",
  },
  icons: {
    icon: [
      { url: "/assets/site-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/site-icon.png", sizes: "128x128", type: "image/png" },
    ],
    apple: "/assets/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
