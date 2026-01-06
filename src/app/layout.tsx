import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Mengimpor font Poppins
import "./globals.css"; // Mengimpor file CSS

// Konfigurasi Font Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Pilihan ketebalan font
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Rental Motor Premium",
  description: "Aplikasi Rental Motor Terlengkap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Menerapkan font Poppins dan warna background dasar ke seluruh aplikasi */}
      <body className={`${poppins.className} bg-gray-50 text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}