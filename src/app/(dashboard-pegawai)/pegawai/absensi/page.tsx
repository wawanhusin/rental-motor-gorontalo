/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../../lib/supabase"; 

export default function HalamanAbsensi() {
  const supabase = createClient();
  const [jamSekarang, setJamSekarang] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusAbsen, setStatusAbsen] = useState<"Belum" | "Sudah">("Belum");
  const [isLibur, setIsLibur] = useState(false);
  const [shiftHariIni, setShiftHariIni] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setJamSekarang(new Date().toLocaleTimeString('id-ID', { hour12: false }));
    }, 1000);
    checkStatusDanJadwal();
    return () => clearInterval(timer);
  }, []);

  const checkStatusDanJadwal = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const hariIniIndo = new Date().toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase();

      // 1. Cek Jadwal hari ini di database
      const { data: dataJadwal } = await supabase
        .from('jadwal_kerja')
        .select(hariIniIndo)
        .eq('id_pegawai', user.id)
        .single();

      if (dataJadwal) {
        const jadwalHariIni = (dataJadwal as any)[hariIniIndo];
        setShiftHariIni(jadwalHariIni);
        if (jadwalHariIni === 'Libur') {
          setIsLibur(true);
        }
      }

      // 2. Cek apakah sudah absen hari ini
      const { data: dataAbsen } = await supabase
        .from('absensi')
        .select('*')
        .eq('id_pegawai', user.id)
        .eq('tanggal', today)
        .single();
      
      if (dataAbsen) setStatusAbsen("Sudah");
    }
    setLoading(false);
  };

  const handleAbsenMasuk = async () => {
    if (isLibur) return; // Guard clause tambahan
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");

      const today = new Date().toISOString().split('T')[0];
      const timeNow = new Date().toLocaleTimeString('id-ID', { hour12: false });

      const { error } = await supabase.from('absensi').insert({
        id_pegawai: user.id,
        tanggal: today,
        jam_masuk: timeNow,
        status: "Hadir"
      });

      if (error) throw error;
      setStatusAbsen("Sudah");
      alert("Berhasil Absen Masuk!");
    } catch (err: any) {
      alert("Gagal absen: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 p-6 rounded-3xl animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Absensi Harian</h1>
      
      {/* Keterangan Shift */}
      <div className="mb-8 flex flex-col items-center">
        <p className="text-slate-500">Jadwal Anda hari ini:</p>
        <span className={`mt-1 font-bold px-4 py-1 rounded-full text-sm ${isLibur ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          {shiftHariIni || "Memuat..."}
        </span>
      </div>

      <div className="text-6xl font-mono font-bold text-slate-900 mb-12 tracking-widest bg-white px-8 py-4 rounded-2xl shadow-sm border border-slate-100">
        {jamSekarang || "00:00:00"}
      </div>

      {isLibur ? (
        // TAMPILAN JIKA LIBUR
        <div className="w-64 h-64 rounded-full bg-red-50 text-red-400 flex flex-col items-center justify-center border-4 border-red-100 border-dashed">
          <span className="text-5xl mb-3">🏖️</span>
          <span className="text-xl font-bold text-center leading-tight">HARI INI ANDA<br/>LIBUR</span>
        </div>
      ) : statusAbsen === "Sudah" ? (
        // TAMPILAN JIKA SUDAH ABSEN
        <div className="w-64 h-64 rounded-full bg-slate-100 text-slate-400 flex flex-col items-center justify-center border-4 border-slate-200 border-dashed">
          <span className="text-5xl mb-3">✅</span>
          <span className="text-lg font-bold text-center leading-tight">ANDA SUDAH<br/>ABSEN HARI INI</span>
        </div>
      ) : (
        // TAMPILAN TOMBOL AKTIF
        <button 
          onClick={handleAbsenMasuk}
          disabled={loading}
          className="w-64 h-64 rounded-full bg-green-500 hover:bg-green-600 text-white flex flex-col items-center justify-center shadow-2xl shadow-green-500/40 transition-all active:scale-95 disabled:bg-gray-400"
        >
          <div className="text-5xl mb-3">👆</div>
          <span className="text-xl font-bold text-center leading-tight">TEKAN UNTUK<br/>ABSEN MASUK</span>
        </button>
      )}
    </div>
  );
}