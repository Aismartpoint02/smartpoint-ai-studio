import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SmartPoint AI Studio",
  description: "Professional AI video production, editing, audio, photo, learning, enterprise and live production platform."
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
