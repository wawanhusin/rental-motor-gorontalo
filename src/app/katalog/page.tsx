/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase"; 
import { Motor } from "@/types";

export default function KatalogPage() {
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [search, setSearch] = useState("");
  
  // 1. Ambil Data Motor "Tersedia"
  useEffect(() => {
    const fetchMotors = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("motor")
        .select("*")
        .eq("status", "tersedia") // Hanya tampilkan yang ready
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setMotors(data || []);
      
      setLoading(false);
    };
    fetchMotors();
  }, []);

  // 2. Logika Pencarian
  const filteredMotors = motors.filter((m) => {
    const text = search.toLowerCase();
    return (
      m.merk.toLowerCase().includes(text) || 
      m.model.toLowerCase().includes(text)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* === NAVBAR === */}
      <nav className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-white group-hover:bg-emerald-400 transition">←</div>
            <span className="font-bold text-lg">Kembali ke Home</span>
          </Link>
          <div className="text-xs text-slate-400 font-mono hidden md:block">
            KATALOG RESMI
          </div>
        </div>
      </nav>

      {/* === HEADER & SEARCH === */}
      <header className="bg-white border-b border-slate-200 py-12 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Pilih Motor Impianmu
          </h1>
          <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
            Temukan armada terbaik untuk perjalanan di Gorontalo. Semua unit terawat, pajak hidup, dan siap gas.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder="Cari motor (misal: Nmax, Vario, Beat)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-lg shadow-sm transition"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 absolute left-4 top-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      {/* === GRID MOTOR === */}
      <main className="container mx-auto px-6 py-12">
        {loading ? (
          <p className="text-center py-20 text-slate-400 animate-pulse">Memuat katalog...</p>
        ) : filteredMotors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMotors.map((m) => (
              <div key={m.id_motor} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                
                {/* Gambar */}
                <div className="h-64 overflow-hidden relative bg-slate-100">
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm z-10">
                    Ready
                  </div>
                  {m.gambar_motor ? (
                    <img 
                      src={m.gambar_motor} 
                      alt={m.model} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">No Image</div>
                  )}
                </div>

                {/* Konten */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">{m.model}</h2>
                      <p className="text-sm text-slate-500 font-medium">{m.merk} • {(m as any).tahun}</p>
                    </div>
                    {/* Plat Nomor Disamarkan untuk Publik */}
                    <div className="bg-slate-50 px-2 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-100">
                      {m.plat_nomor.substring(0, 2)} **** {m.plat_nomor.slice(-2)}
                    </div>
                  </div>

                  {/* Fitur / Info Singkat (Hardcoded visual only) */}
                  <div className="flex gap-4 my-4 border-t border-b border-slate-50 py-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span>⛽</span> Bensin Irit
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span>⛑️</span> 2 Helm
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span>🧼</span> Bersih
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Harga Sewa</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {parseInt(m.harga_per_hari.toString()).toLocaleString('id-ID')}
                        <span className="text-xs text-slate-400 font-normal ml-1">/hari</span>
                      </p>
                    </div>
                    
                    {/* Tombol Booking */}
                    <Link 
                      href={`https://wa.me/628988891921?text=Halo%20Admin,%20saya%20tertarik%20sewa%20motor%20${m.merk}%20${m.model}%20nopol%20${m.plat_nomor}`}
                      target="_blank"
                      className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold text-sm transition shadow-lg flex items-center gap-2"
                    >
                      <span>Booking WA</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tampilan Jika Tidak Ada Motor / Hasil Pencarian Kosong */
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="text-6xl mb-4">🛵💨</div>
            <h3 className="text-xl font-bold text-slate-800">Motor tidak ditemukan</h3>
            <p className="text-slate-500">Coba cari dengan kata kunci lain atau hubungi admin.</p>
            <button 
              onClick={() => setSearch("")}
              className="mt-6 text-emerald-600 font-bold hover:underline"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </main>

      {/* === FOOTER === */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center border-t border-slate-800">
        <p className="text-sm">&copy; {new Date().getFullYear()} Rental Motor Premium Gorontalo.</p>
      </footer>
    </div>
  );
}