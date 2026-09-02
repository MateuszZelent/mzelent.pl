import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

import "../styles/globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mzelent.pl"),
  title: {
    default: "Mateusz Zelent | Theoretical & Computational Physics",
    template: "%s | Mateusz Zelent",
  },
  description:
    "Theoretical and computational research across chiral skyrmions, spin waves, nanomagnetic vector fields, and high-performance physics simulations.",
  keywords: [
    "Mateusz Zelent",
    "Physics",
    "Magnonics",
    "Skyrmions",
    "Micromagnetics",
    "Spin Waves",
    "Computational Physics",
    "AMU Poznań",
  ],
  authors: [{ name: "Mateusz Zelent", url: "https://mzelent.pl" }],
  creator: "Mateusz Zelent",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mzelent.pl",
    siteName: "Mateusz Zelent — Computational Physics Portfolio",
    title: "Mateusz Zelent | Theoretical & Computational Physics",
    description:
      "Theoretical and computational research across chiral skyrmions, spin waves, nanomagnetic vector fields, and high-performance physics simulations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mateusz Zelent | Theoretical & Computational Physics",
    description:
      "Theoretical and computational research across chiral skyrmions, spin waves, nanomagnetic vector fields, and high-performance physics simulations.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
