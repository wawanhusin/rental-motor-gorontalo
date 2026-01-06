"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase"; 

export default function HalamanJadwal() {
  const supabase = createClient();
  const [jadwal, setJadwal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserAndJadwal() {
      setLoading(true);
      
      // 1. Ambil data user yang sedang login secara otomatis
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setErrorMsg("Anda belum login. Silakan login terlebih dahulu.");
        setLoading(false);
        return;
      }

      // 2. Ambil jadwal dari database berdasarkan ID user yang login
      const { data, error: dbError } = await supabase
        .from('jadwal_kerja')
        .select('*')
        .eq('id_pegawai', user.id) // <--- Ini otomatis mengambil ID user login
        .single();

      if (dbError) {
        console.error("Error DB:", dbError);
        setErrorMsg("Jadwal belum diatur oleh Admin.");
      } else {
        setJadwal(data);
      }
      
      setLoading(false);
    }

    fetchUserAndJadwal();
  }, [supabase]);

  // Tampilan saat loading
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        <span className="ml-3">Memuat jadwal...</span>
      </div>
    );
  }

  // Tampilan jika ada error atau jadwal kosong
  if (errorMsg || !jadwal) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto mt-10">
        <div className="text-4xl mb-4">🗓️</div>
        <h2 className="text-xl font-bold text-slate-800">Ups! Jadwal Kosong</h2>
        <p className="text-slate-500 mt-2">{errorMsg || "Admin belum mengisi jadwal Anda."}</p>
        <p className="text-xs text-slate-400 mt-4 italic">Pastikan Admin sudah klik 'Simpan Perubahan' pada menu Atur Shift.</p>
      </div>
    );
  }

  // Tampilan jika jadwal ditemukan
  return (
    <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto mt-10 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="bg-slate-100 p-2 rounded-lg">📅</span> Jadwal Kerja Saya Minggu Ini
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        {["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"].map((hari) => (
          <div key={hari} className="flex flex-col items-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">{hari}</span>
            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg w-full text-center shadow-sm ${
              jadwal[hari] === 'Libur' ? 'bg-gray-200 text-gray-500' :
              jadwal[hari] === 'Pagi' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
              jadwal[hari] === 'Sore' ? 'bg-purple-100 text-purple-600 border border-purple-200' :
              'bg-indigo-100 text-indigo-600 border border-indigo-200'
            }`}>
              {jadwal[hari]}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700 flex items-center gap-2">
          <span>ℹ️</span> Jadwal di atas adalah jadwal sif resmi Anda. Harap hadir 10 menit sebelum sif dimulai.
        </p>
      </div>
    </div>
  );
}