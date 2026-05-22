import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control Board",
  description: "Spotify-powered cue board for live events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
