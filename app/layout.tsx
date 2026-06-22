import type { Metadata } from "next";
import { ppEditorialNew, suisseIntl } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARTISUN — A New Language of Suncare",
  description: "ARTISUN — premium suncare redefined. A new language of sun protection crafted for those who move through the world with intention.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ppEditorialNew.variable} ${suisseIntl.variable}`}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
