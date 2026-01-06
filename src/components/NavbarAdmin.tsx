"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function NavbarAdmin() {
  const router = useRouter();

  const handleLogout = async () => {
    // 1. Proses Logout Supabase
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // 2. Redirect ke Login & Refresh agar sesi bersih
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="bg-slate-500 text-red p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider">Admin Panel</h1>
        
        <ul className="flex gap-6 items-center font-medium">
          <li><Link href="/admin/dashboard" className="hover:text-blue-300 transition-colors">Dashboard</Link></li>
          <li><Link href="/admin/motor" className="hover:text-blue-300 transition-colors">Kelola Motor</Link></li>
          <li>
            <Link href="/admin/laporan" className="hover:text-blue-300 transition-colors">
              Laporan
            </Link>
          </li>
          <li><Link href="/admin/pegawai" className="hover:text-blue-300 transition-colors">Pegawai</Link></li>
          <li>
            <button 
              onClick={handleLogout} 
              className="bg-red-600 px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-900/50"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}