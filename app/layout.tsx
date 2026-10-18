import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Galatasaray Kadro Tahtası",
  description: "2026/27 Galatasaray kadrosunu dilediğin gibi sahaya diz.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}
