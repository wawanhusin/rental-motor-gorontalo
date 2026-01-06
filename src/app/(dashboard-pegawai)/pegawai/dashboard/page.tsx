"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function DashboardPegawai() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [statusAbsen, setStatusAbsen] = useState("Memuat...");
  const [shiftHariIni, setShiftHariIni] = useState("-");

  useEffect(() => {
    async function getDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Ambil Profil
        const { data: p } = await supabase.from("pegawai").select("*").eq("id_pegawai", user.id).single();
        setProfile(p);

        // Ambil Jadwal Hari Ini
        const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase();
        const { data: j } = await supabase.from("jadwal_kerja").select(hariIni).eq("id_pegawai", user.id).single();
        if (j) setShiftHariIni(j[hariIni]);

        // Cek Absensi
        const today = new Date().toISOString().split('T')[0];
        const { data: a } = await supabase.from("absensi").select("*").eq("id_pegawai", user.id).eq("tanggal", today).single();
        setStatusAbsen(a ? `Sudah Absen (${a.jam_masuk})` : "Belum Absen");
      }
    }
    getDashboardData();
  }, [supabase]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* WELCOME HEADER */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="relative z-10">
          <p className="text-slate-400 mt-2">Semoga hari liburmu menyenangkan 👋</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Jadwal Sif Hari Ini" value={shiftHariIni} icon="📅" color="text-blue-600" />
        <StatCard label="Status Kehadiran" value={statusAbsen} icon="✅" color="text-green-600" />
        <StatCard label="Jabatan" value={profile?.jabatan || "-"} icon="👤" color="text-orange-600" />
      </div>

      {/* INFO BOX */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Pengumuman Internal</h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-green-500 text-sm text-slate-600">
            Harap pastikan semua unit motor dicek kembali kebersihan dan bensinnya sebelum diberikan ke pelanggan.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl">{icon}</div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}