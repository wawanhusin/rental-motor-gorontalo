import NavbarPelanggan from "@/components/NavbarPelanggan"; // Pastikan path import benar

export default function PelangganLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Navbar dipanggil di sini */}
      <NavbarPelanggan />
      
      {/* Halaman anak (profil/katalog) akan muncul di bawah navbar */}
      <div className="pt-20 px-6 min-h-screen"> 
        {children}
      </div>
    </section>
  );
}
