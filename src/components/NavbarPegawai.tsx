"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function NavbarPegawai() {
  const [isOpen, setIsOpen] = useState(false);
  const [jabatan, setJabatan] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("pegawai")
          .select("jabatan")
          .eq("id_pegawai", user.id)
          .single();
        if (data) setJabatan(data.jabatan);
      }
    }
    getProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-[#0B0F19] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-white">R</div>
            <span className="text-white font-bold text-lg hidden md:block">
              Rental<span className="text-green-500">Gorontalo</span>
            </span>
          </div>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink href="/pegawai/dashboard" label="Dashboard" />
            <NavLink href="/pegawai/jadwal" label="Jadwal" />
            <NavLink href="/pegawai/absensi" label="Absen" />

            {/* Menu Khusus STAFF (Kasir) */}
            {jabatan === "staff" && (
              <>
                <div className="w-px h-6 bg-white/20 mx-2"></div>
                {/* Menu Pembayaran sudah DIHAPUS, sisa Transaksi saja */}
                <NavLink href="/pegawai/transaksi" label="Transaksi Sewa" />
              </>
            )}

            {/* Menu Khusus MEKANIK */}
            {jabatan === "mekanik" && (
              <>
                <div className="w-px h-6 bg-white/20 mx-2"></div>
                <NavLink href="/pegawai/perbaikan" label="Perbaikan" />
              </>
            )}
            
            <button 
              onClick={handleLogout}
              className="ml-4 text-red-400 hover:text-red-300 text-sm font-bold px-3 py-2"
            >
              Logout
            </button>
          </div>

          {/* TOMBOL MENU MOBILE */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE */}
      {isOpen && (
        <div className="md:hidden bg-[#0B0F19] border-t border-white/10 p-4 space-y-2">
          <Link href="/pegawai/dashboard" className="block text-slate-300 py-2">Dashboard</Link>
          <Link href="/pegawai/jadwal" className="block text-slate-300 py-2">Jadwal Sif</Link>
          <Link href="/pegawai/absensi" className="block text-slate-300 py-2">Absensi Masuk</Link>
          
          {jabatan === "staff" && (
            <Link href="/pegawai/transaksi" className="block text-slate-300 py-2 border-t border-white/10 mt-2 pt-2">Transaksi Sewa</Link>
          )}

          {jabatan === "mekanik" && (
            <Link href="/pegawai/perbaikan" className="block text-slate-300 py-2 border-t border-white/10 mt-2 pt-2">Perbaikan Motor</Link>
          )}

          <button onClick={handleLogout} className="block w-full text-left text-red-400 py-2 mt-4 font-bold border-t border-white/10 pt-4">
            Logout Keluar
          </button>
        </div>
      )}
    </nav>
  );
}

// Komponen Helper dipisah di luar agar tidak render ulang terus
function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
        isActive
          ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
          : "text-slate-300 hover:text-white hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
}