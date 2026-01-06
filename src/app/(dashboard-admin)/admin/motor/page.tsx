"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase"; 
import { Motor } from "../../../../types";

export default function AdminMotorPage() {
  const [daftarMotor, setDaftarMotor] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // STATE PENCARIAN
  const [search, setSearch] = useState("");

  const fetchMotor = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("motor")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setDaftarMotor(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMotor();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus motor ini?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("motor").delete().eq("id_motor", id);
    if (error) alert("Gagal hapus: " + error.message);
    else { alert("Motor dihapus!"); fetchMotor(); }
  };

  // --- LOGIKA PENCARIAN ADMIN ---
  const motorTerfilter = daftarMotor.filter((m) => {
    const text = search.toLowerCase();
    return (
      m.merk.toLowerCase().includes(text) ||
      m.model.toLowerCase().includes(text) ||
      m.plat_nomor.toLowerCase().includes(text) 
    );
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-screen">
      
      {/* HEADER & TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Data Armada</h2>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Input Pencarian */}
          <div className="relative flex-1 md:w-64">
             <input 
                type="text" 
                placeholder="Cari Plat / Model..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             />
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <Link 
            href="/admin/motor/tambah" 
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap shadow-lg"
          >
            + Tambah
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10">Memuat data...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 text-left">Foto</th>
                <th className="p-4 text-left">Info Motor</th>
                <th className="p-4 text-left">Plat Nomor</th>
                <th className="p-4 text-left">Harga</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {motorTerfilter.map((m) => (
                <tr key={m.id_motor} className="hover:bg-slate-50/50 transition">
                  <td className="p-4">
                    {m.gambar_motor ? (
                      <img src={m.gambar_motor} alt={m.model} className="w-16 h-12 object-cover rounded shadow-sm" />
                    ) : (
                      <div className="w-16 h-12 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">No Img</div>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{m.merk}</p>
                    <p className="text-sm text-slate-500">{m.model}</p>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-700 bg-slate-50 w-fit rounded px-2">{m.plat_nomor}</td>
                  <td className="p-4 text-sm font-medium">Rp {m.harga_per_hari.toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      m.status === 'tersedia' ? 'bg-emerald-100 text-emerald-800' : 
                      m.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                      m.status === 'selesai_servis' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  
                  {/* --- BAGIAN AKSI (EDIT & HAPUS) --- */}
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      
                      {/* TOMBOL EDIT (BARU) */}
                      <Link 
                        href={`/admin/motor/edit/${m.id_motor}`}
                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                      >
                        ✏️ Edit
                      </Link>

                      {/* TOMBOL HAPUS */}
                      <button 
                        onClick={() => handleDelete(m.id_motor)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded text-xs font-bold transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
              
              {motorTerfilter.length === 0 && (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-400">
                     Data motor tidak ditemukan.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}