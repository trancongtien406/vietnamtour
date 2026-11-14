import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";

const body = Be_Vietnam_Pro({
  variable: "--font-be",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const display = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Vietnamtour – Tours & experiences across Vietnam", template: "%s · Vietnamtour" },
  description:
    "Book small-group tours, cruises and food experiences in Hạ Long Bay, Hội An, Sa Pa and beyond with instant confirmation and free cancellation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
