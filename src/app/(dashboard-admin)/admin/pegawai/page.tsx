"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase"; 

// --- TYPE DEFINITIONS ---
type Pegawai = {
  id_pegawai: string;
  nama: string;
  email: string;
  no_hp: string;
  alamat: string;
  jabatan: string; 
  jenis_kelamin: string; 
};

type JadwalKerja = {
  id_pegawai: string;
  senin: string;
  selasa: string;
  rabu: string;
  kamis: string;
  jumat: string;
  sabtu: string;
  minggu: string;
};

export default function KelolaPegawai() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"data" | "absensi" | "jadwal">("data");
  
  // Data State
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [jadwal, setJadwal] = useState<JadwalKerja[]>([]);
  const [absensiHariIni, setAbsensiHariIni] = useState<any[]>([]); 
  
  // State Filter Bulan
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    nama: "", email: "", password: "", no_hp: "", alamat: "", jabatan: "staff", jenis_kelamin: "Laki-laki"
  });

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    
    // A. Ambil Data Pegawai
    const { data: dataPegawai } = await supabase.from("pegawai").select("*").order('nama', { ascending: true });
    
    if (dataPegawai) {
      setPegawai(dataPegawai);
      
      // B. Ambil Data Jadwal
      const { data: dataJadwal } = await supabase.from("jadwal_kerja").select("*");
      
      const mergedJadwal = dataPegawai.map(p => {
        const existingJadwal = dataJadwal?.find((j: any) => j.id_pegawai === p.id_pegawai);
        const defaultShift = 'Pagi'; 
        return existingJadwal || {
          id_pegawai: p.id_pegawai,
          senin: defaultShift, selasa: defaultShift, rabu: defaultShift, 
          kamis: defaultShift, jumat: defaultShift, sabtu: defaultShift, minggu: defaultShift
        };
      });
      setJadwal(mergedJadwal);

      // C. Ambil Data Absensi Hari Ini
      const today = new Date().toISOString().split('T')[0];
      const { data: dataAbsen } = await supabase.from("absensi").select("*").eq('tanggal', today);
      
      const mergedAbsensi = dataPegawai.map(p => {
        const record = dataAbsen?.find((a: any) => a.id_pegawai === p.id_pegawai);
        const hariIniIndo = new Date().toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase();
        // @ts-ignore
        const jadwalUser = mergedJadwal.find(j => j.id_pegawai === p.id_pegawai);
        // @ts-ignore
        const shiftHariIni = jadwalUser ? jadwalUser[hariIniIndo] || 'Pagi' : 'Pagi';

        return {
          ...p,
          jam_masuk: record ? record.jam_masuk.substring(0, 5) : "-",
          status: record ? record.status : (shiftHariIni === 'Libur' ? 'Libur' : 'Belum Hadir'),
          shift: shiftHariIni,
          jabatan: p.jabatan
        };
      });
      setAbsensiHariIni(mergedAbsensi);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. LOGIC CRUD PEGAWAI ---
  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/pegawai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal");
      alert("Sukses!"); setForm({ nama: "", email: "", password: "", no_hp: "", alamat: "", jabatan: "staff", jenis_kelamin: "Laki-laki" }); fetchData();
    } catch (err) { alert("Gagal"); } finally { setProcessing(false); }
  };

  const handleHapus = async (id: string, nama: string) => {
    if (confirm(`Hapus ${nama}?`)) {
      await fetch(`/api/admin/pegawai?id=${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  // --- 3. LOGIC ROLLING JADWAL ---
  const handleJadwalChange = (id_pegawai: string, day: string, value: string) => {
    setJadwal(prev => prev.map(item => 
      item.id_pegawai === id_pegawai ? { ...item, [day]: value } : item
    ));
  };

  // === UPDATE LOGIKA ROLLING OTOMATIS (3 SIF KASIR) ===
  const handleAutoRolling = () => {
    if(!confirm("Acak ulang jadwal? Sistem akan membagi sif Pagi/Sore/Malam untuk kasir secara adil.")) return;

    const days = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];
    let newJadwal = [...jadwal];
    let offDayIndex = 0; 

    newJadwal = newJadwal.map((item) => {
      const peg = pegawai.find(p => p.id_pegawai === item.id_pegawai);
      const isMekanik = peg?.jabatan === 'mekanik';
      
      const myOffDay = days[offDayIndex % 7]; 
      offDayIndex++;

      const newItem = { ...item };
      days.forEach(day => {
        if (day === myOffDay) {
          // @ts-ignore
          newItem[day] = "Libur";
        } else {
          const rand = Math.random();
          if (isMekanik) {
             // Mekanik: 50% Pagi, 50% Sore
             // @ts-ignore
             newItem[day] = rand < 0.5 ? "Pagi" : "Sore";
          } else {
             // Kasir/Staff: Dibagi 3 Sif (Pagi, Sore, Malam)
             // @ts-ignore
             if (rand < 0.33) newItem[day] = "Pagi";
             // @ts-ignore
             else if (rand < 0.66) newItem[day] = "Sore";
             // @ts-ignore
             else newItem[day] = "Malam";
          }
        }
      });
      return newItem;
    });

    setJadwal(newJadwal);
    alert("Rolling selesai! Kasir kini terbagi dalam Pagi, Sore, dan Malam.");
  };

  const simpanJadwalKeDB = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase.from("jadwal_kerja").upsert(jadwal, { onConflict: 'id_pegawai' });
      if (error) throw error;
      alert(`Jadwal berhasil disimpan!`);
      fetchData(); 
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen SDM</h1>
          <p className="text-sm text-slate-500">Rental Buka Setiap Hari (Senin - Minggu)</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg mt-3 md:mt-0">
          {["data", "absensi", "jadwal"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 text-sm font-bold rounded-md transition-all capitalize ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {tab === "data" ? "Data Pegawai" : tab === "jadwal" ? "Atur Shift" : "Absensi Harian"}
            </button>
          ))}
        </div>
      </div>

      {/* --- TAB 1: DATA PEGAWAI --- */}
      {activeTab === "data" && (
        <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in zoom-in duration-300">
          <div className="xl:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Tambah Personil</h2>
              <form onSubmit={handleTambah} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Posisi</label>
                  <select className="w-full border p-2 rounded mt-1 bg-slate-50 font-bold" value={form.jabatan} onChange={(e) => setForm({...form, jabatan: e.target.value})}>
                    <option value="staff">Staff Operasional (Kasir)</option>
                    <option value="mekanik">Mekanik</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Jenis Kelamin</label>
                  <select className="w-full border p-2 rounded mt-1 bg-slate-50" value={form.jenis_kelamin} onChange={(e) => setForm({...form, jenis_kelamin: e.target.value})}>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div><label className="text-sm font-semibold">Nama</label><input required className="w-full border p-2 rounded" value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} /></div>
                <div><label className="text-sm font-semibold">Email</label><input required type="email" className="w-full border p-2 rounded" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
                <div><label className="text-sm font-semibold">Password</label><input required className="w-full border p-2 rounded" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} /></div>
                <div><label className="text-sm font-semibold">No. HP</label><input required className="w-full border p-2 rounded" value={form.no_hp} onChange={(e) => setForm({...form, no_hp: e.target.value})} /></div>
                <div><label className="text-sm font-semibold">Alamat</label><textarea className="w-full border p-2 rounded" value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} /></div>
                <button disabled={processing} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:bg-gray-400">{processing ? "Simpan..." : "+ Tambah"}</button>
              </form>
            </div>
          </div>
          <div className="xl:w-2/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h2 className="text-xl font-bold mb-6 text-slate-800">Daftar Pegawai</h2>
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-slate-600 uppercase border-b">
                    <tr><th className="p-3">Nama</th><th className="p-3">Kontak</th><th className="p-3 text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {pegawai.map((p) => (
                      <tr key={p.id_pegawai} className="hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{p.nama}</p>
                          <div className="flex gap-2 mt-1">
                             <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${p.jabatan === 'mekanik' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{p.jabatan}</span>
                             <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{p.jenis_kelamin || "-"}</span>
                          </div>
                        </td>
                        <td className="p-3"><p>{p.no_hp}</p><p className="text-xs text-slate-400">{p.email}</p></td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleHapus(p.id_pegawai, p.nama)} className="text-red-600 bg-red-50 px-3 py-1 rounded text-xs font-bold hover:bg-red-100">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ABSENSI HARIAN --- */}
      {activeTab === "absensi" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Absensi Hari Ini</h2>
            <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
               {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-slate-600 uppercase border-b">
                <tr><th className="p-3">Nama Pegawai</th><th className="p-3">Jabatan</th><th className="p-3">Sif</th><th className="p-3">Jam Masuk</th><th className="p-3">Status</th></tr>
              </thead>
              <tbody className="divide-y">
                {absensiHariIni.map((item) => (
                  <tr key={item.id_pegawai} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-slate-800">{item.nama}</td>
                    <td className="p-3"><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.jabatan === 'mekanik' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{item.jabatan}</span></td>
                    <td className="p-3">
                       {/* Indikator Shift dengan Warna Beda */}
                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                         item.shift === 'Malam' ? 'bg-indigo-100 text-indigo-700' : 
                         item.shift === 'Sore' ? 'bg-purple-100 text-purple-700' : 
                         item.shift === 'Pagi' ? 'bg-orange-100 text-orange-700' : 
                         'bg-gray-200 text-gray-500'
                       }`}>
                         {item.shift}
                       </span>
                    </td>
                    <td className="p-3 font-mono">{item.jam_masuk}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Hadir' ? 'bg-green-100 text-green-700' : item.status === 'Telat' ? 'bg-red-100 text-red-700' : item.status === 'Libur' ? 'bg-gray-200 text-gray-500' : 'bg-orange-100 text-orange-700'}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: ROLLING JADWAL --- */}
      {activeTab === "jadwal" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Atur Rolling Shift</h2>
              <p className="text-xs text-slate-500 mt-1 mb-3">Kasir: Pagi, Sore, Malam. Mekanik: Pagi, Sore.</p>
              <div className="flex gap-2">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-slate-900">{monthNames.map((m, idx) => (<option key={idx} value={idx}>{m}</option>))}</select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-slate-900"><option value={2024}>2024</option><option value={2025}>2025</option><option value={2026}>2026</option></select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAutoRolling} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-200 transition">Rolling Otomatis</button>
              <button onClick={simpanJadwalKeDB} disabled={processing} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition disabled:bg-gray-400">{processing ? "Menyimpan..." : "Simpan Perubahan"}</button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b">
                <tr>
                  <th className="p-3 border-r min-w-[180px] bg-slate-100 sticky left-0 z-10">Pegawai <span className="text-xs font-normal text-slate-400 block">{monthNames[selectedMonth]} {selectedYear}</span></th>
                  {["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"].map(day => (<th key={day} className="p-3 text-center border-r min-w-[100px] capitalize">{day}</th>))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {jadwal.map((row) => {
                  const pegawaiInfo = pegawai.find(p => p.id_pegawai === row.id_pegawai);
                  const isMekanik = pegawaiInfo?.jabatan === 'mekanik';
                  return (
                    <tr key={row.id_pegawai} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-slate-800 border-r bg-gray-50 sticky left-0 z-10">
                        {pegawaiInfo?.nama}
                        <div className={`text-[10px] font-bold uppercase mt-1 w-fit px-1.5 py-0.5 rounded ${isMekanik ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{pegawaiInfo?.jabatan}</div>
                      </td>
                      {["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"].map((dayKey) => (
                        <td key={dayKey} className="p-1 border-r text-center">
                          <select 
                            // @ts-ignore
                            value={row[dayKey]}
                            onChange={(e) => handleJadwalChange(row.id_pegawai, dayKey, e.target.value)}
                            className={`w-full text-xs font-medium py-1.5 rounded border-0 cursor-pointer text-center focus:ring-1 focus:ring-blue-500 ${
                              // @ts-ignore
                              row[dayKey] === 'Libur' ? 'text-gray-400 bg-gray-100' : 
                              // @ts-ignore
                              row[dayKey] === 'Pagi' ? 'text-orange-600 bg-orange-50/50' : 
                              // @ts-ignore
                              row[dayKey] === 'Sore' ? 'text-purple-600 bg-purple-50/50' :
                              // @ts-ignore
                              row[dayKey] === 'Malam' ? 'text-indigo-600 bg-indigo-50/50' :
                              'text-blue-600 bg-blue-50/50' 
                            }`}
                          >
                            <option value="Libur">Libur</option>
                            <option value="Pagi">Pagi</option>
                            <option value="Sore">Sore</option>
                            {/* Opsi Malam hanya untuk Kasir/Staff */}
                            {!isMekanik && <option value="Malam">Malam</option>}
                          </select>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}