"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase"; 
import { Motor } from "../../../../types";

export default function KatalogPage() {
  const [daftarMotor, setDaftarMotor] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // STATE PENCARIAN
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMotor = async () => {
      const supabase = createClient();
      // Ambil motor yang tersedia saja
      const { data, error } = await supabase
        .from("motor")
        .select("*")
        .eq("status", "tersedia")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setDaftarMotor(data || []);
      setLoading(false);
    };

    fetchMotor();
  }, []);

  // --- LOGIKA FILTER PENCARIAN ---
  // Kita filter array daftarMotor berdasarkan apa yang diketik di 'search'
  const motorTerfilter = daftarMotor.filter((item) => {
    const textCari = search.toLowerCase(); // Ubah ke huruf kecil biar pencarian tidak sensitif huruf besar/kecil
    return (
      item.merk.toLowerCase().includes(textCari) ||
      item.model.toLowerCase().includes(textCari)
    );
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Katalog Motor</h1>
          <p className="text-slate-500 mt-1">Pilih motor terbaik untuk perjalananmu.</p>
        </div>

        {/* KOLOM PENCARIAN MODISH */}
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Cari Merk atau Model (cth: Nmax)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          {/* Icon Kaca Pembesar */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-20 text-slate-500">Sedang memuat katalog...</p>
      ) : (
        <>
          {/* HASIL PENCARIAN KOSONG */}
          {motorTerfilter.length === 0 && (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
               <p className="text-slate-500">Yah, motor <strong>"{search}"</strong> tidak ditemukan atau sedang habis :(</p>
               <button onClick={() => setSearch("")} className="text-blue-600 font-bold mt-2 hover:underline">Reset Pencarian</button>
             </div>
          )}

          {/* GRID CARD MOTOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {motorTerfilter.map((m) => (
              <div key={m.id_motor} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-slate-100 overflow-hidden group flex flex-col">
                
                {/* Gambar */}
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                   {m.gambar_motor ? (
                      <img src={m.gambar_motor} alt={m.model} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                   )}
                   <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                     {m.tahun}
                   </div>
                </div>

                {/* Info */}
                <div className="p-6 flex-1 flex flex-col">
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">{m.merk}</p>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{m.model}</h3>
                  </div>
                  
                  <div className="mt-auto pt-6 flex items-end justify-between border-t border-slate-50 mt-4">
                    <div>
                       <span className="text-slate-400 text-xs block">Harga Sewa</span>
                       <span className="text-xl font-bold text-slate-800">Rp {m.harga_per_hari.toLocaleString('id-ID')}</span>
                       <span className="text-xs text-slate-500">/hari</span>
                    </div>
                    <Link 
                      href={`/pelanggan/sewa/${m.id_motor}`} 
                      className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
                    >
                      Sewa
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}