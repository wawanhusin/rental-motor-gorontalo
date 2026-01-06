"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase"; 
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); 
  
  // State untuk Buka/Tutup Sidebar di Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/"); 
    router.refresh();
  };

  const menus = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { name: "Kelola Motor", href: "/admin/motor", icon: "🛵" },
    { name: "Kelola Pegawai", href: "/admin/pegawai", icon: "👥" },
    { name: "Laporan", href: "/admin/transaksi", icon: "📄" }, 
  ];

  return (
    // TAMBAHAN: 'overflow-x-hidden' dan 'w-full' di sini mencegah scroll samping
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 relative w-full overflow-x-hidden">
      
      {/* --- 1. OVERLAY GELAP (Mobile) --- */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* --- 2. SIDEBAR --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-xl transition-transform duration-300 ease-in-out transform 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`} 
      >
        {/* Header Sidebar */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">ADMIN PANEL</h1>
            <p className="text-[10px] text-slate-200 uppercase tracking-widest">Rental System</p>
          </div>
          
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {menus.map((menu) => {
            const isActive = pathname.startsWith(menu.href);
            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setIsSidebarOpen(false)} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{menu.icon}</span>
                {menu.name}
              </Link>
            );
          })}
        </nav>

        {/* Tombol Logout */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold text-sm transition shadow-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* --- 3. KONTEN UTAMA --- */}
      {/* TAMBAHAN: 'w-full' dan 'max-w-full' agar tidak melebar */}
      <div className="flex-1 flex flex-col min-h-screen w-full max-w-full transition-all duration-300 md:ml-64">
        
        {/* Header Mobile */}
        <header className="bg-white p-4 shadow-sm md:hidden flex items-center justify-between sticky top-0 z-30">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
               </svg>
             </button>
             <h1 className="font-bold text-slate-800 text-lg">Admin Area</h1>
           </div>
        </header>

        {/* Isi Halaman */}
        <main className="p-4 md:p-8 flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="p-4 text-center text-xs text-slate-400 border-t bg-white md:bg-transparent">
          &copy; {new Date().getFullYear()} Rental Motor Premium. Hak Akses Administrator.
        </footer>
      </div>

    </div>
  );
}