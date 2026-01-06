"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function NavbarPelanggan() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login"); 
    router.refresh();
  };

  return (
    <nav className="bg-white text-slate-800 p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/pelanggan/katalog" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          Rental Motor
        </Link>
        
        <ul className="flex gap-6 items-center font-medium">
          <li>
            <Link href="/pelanggan/katalog" className="hover:text-blue-600 transition-colors">
              Katalog
            </Link>
          </li>
          <li>
            <Link href="/pelanggan/riwayat" className="hover:text-blue-600 transition-colors">
              Riwayat
            </Link>
          </li>
          <li>
            <Link href="/pelanggan/profil" className="hover:text-blue-600 transition-colors">
              Profil Saya
            </Link>
          </li>
          <li>
            {/* --- TOMBOL LOGOUT YANG DIMODIFIKASI --- */}
            <button 
              onClick={handleLogout} 
              className="bg-slate-100 text-slate-700 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:bg-red-600 hover:text-white hover:shadow-red-200 hover:shadow-lg"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}