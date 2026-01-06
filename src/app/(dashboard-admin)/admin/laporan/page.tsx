"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase"; // Sesuaikan path titik-titik
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

// Tipe data transaksi
type LaporanTransaksi = {
  id_transaksi: string;
  tgl_mulai: string;
  total_harga: number;
  status_transaksi: string;
  motor: { merk: string; model: string; plat_nomor: string } | null;
  pelanggan: { nama: string } | null;
};

// Nama Bulan untuk tabel tahunan
const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function HalamanLaporan() {
  const [dataMentah, setDataMentah] = useState<LaporanTransaksi[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE KONTROL ---
  const [mode, setMode] = useState<'bulanan' | 'tahunan'>('bulanan');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1); // 1-12
  const [tahun, setTahun] = useState(new Date().getFullYear());

  // 1. Fetch Data (Ambil SEMUA data VALID)
  useEffect(() => {
    const ambilData = async () => {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          id_transaksi, tgl_mulai, total_harga, status_transaksi,
          motor (merk, model, plat_nomor),
          pelanggan (nama)
        `)
        .in('status_transaksi', ['lunas', 'selesai']) // Hanya uang masuk valid
        .order('tgl_mulai', { ascending: true });

      if (error) console.error(error);
      else setDataMentah(data as any[] || []);
      
      setLoading(false);
    };

    ambilData();
  }, []);

  // --- LOGIKA PENGOLAHAN DATA ---

  // A. DATA MODE BULANAN (Detail Harian)
  const dataBulanan = dataMentah.filter((item) => {
    const tgl = new Date(item.tgl_mulai);
    return tgl.getMonth() + 1 === Number(bulan) && tgl.getFullYear() === Number(tahun);
  });

  const chartBulanan = Object.values(
    dataBulanan.reduce((acc: any, curr) => {
      const tgl = new Date(curr.tgl_mulai).getDate();
      if (!acc[tgl]) acc[tgl] = { name: `Tgl ${tgl}`, total: 0, date: tgl };
      acc[tgl].total += curr.total_harga;
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.date - b.date); // Urutkan tanggal 1-31

  // B. DATA MODE TAHUNAN (Ringkasan Per Bulan)
  const dataTahunan = dataMentah.filter((item) => {
    return new Date(item.tgl_mulai).getFullYear() === Number(tahun);
  });

  // Inisialisasi array 12 bulan kosong biar grafik tetap muncul walau 0
  const initChartTahunan = NAMA_BULAN.map((nama, index) => ({
    name: nama.substring(0, 3), // Jan, Feb...
    fullName: nama,
    index: index,
    total: 0,
    jumlahTransaksi: 0
  }));

  dataTahunan.forEach((item) => {
    const idxBulan = new Date(item.tgl_mulai).getMonth();
    initChartTahunan[idxBulan].total += item.total_harga;
    initChartTahunan[idxBulan].jumlahTransaksi += 1;
  });

  const chartTahunan = initChartTahunan; // Data siap pakai untuk grafik tahunan

  // Hitung Total Uang Sesuai Mode
  const totalPendapatan = mode === 'bulanan' 
    ? dataBulanan.reduce((acc, curr) => acc + curr.total_harga, 0)
    : dataTahunan.reduce((acc, curr) => acc + curr.total_harga, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm min-h-screen">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'bulanan' ? 'Laporan Bulanan' : 'Audit Tahunan'}
          </h1>
          <p className="text-slate-500 text-sm">
            {mode === 'bulanan' ? 'Detail transaksi harian' : 'Rekapitulasi performa per tahun'}
          </p>
        </div>

        {/* Control Bar */}
        <div className="flex flex-wrap gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
          
          {/* Toggle Mode */}
          <div className="flex bg-white rounded border border-gray-300 overflow-hidden">
            <button 
              onClick={() => setMode('bulanan')}
              className={`px-4 py-2 text-sm font-medium transition ${mode === 'bulanan' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-gray-100'}`}
            >
              Bulanan
            </button>
            <button 
              onClick={() => setMode('tahunan')}
              className={`px-4 py-2 text-sm font-medium transition ${mode === 'tahunan' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-gray-100'}`}
            >
              Tahunan
            </button>
          </div>

          {/* Filter Bulan (Hanya muncul di mode bulanan) */}
          {mode === 'bulanan' && (
            <select 
              value={bulan} onChange={(e) => setBulan(Number(e.target.value))}
              className="bg-white border border-gray-300 text-sm rounded p-2 focus:ring-2 focus:ring-blue-500"
            >
              {NAMA_BULAN.map((nama, i) => (
                <option key={i} value={i + 1}>{nama}</option>
              ))}
            </select>
          )}

          {/* Filter Tahun (Selalu muncul) */}
          <select 
            value={tahun} onChange={(e) => setTahun(Number(e.target.value))}
            className="bg-white border border-gray-300 text-sm rounded p-2 focus:ring-2 focus:ring-blue-500 font-bold"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>

          <button onClick={handlePrint} className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-bold hover:bg-slate-800">
            🖨️ Print
          </button>
        </div>
      </div>

      {/* RINGKASAN BIG NUMBER */}
      <div className={`mb-8 p-6 border rounded-xl flex justify-between items-center ${mode === 'bulanan' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
        <div>
          <p className={`${mode === 'bulanan' ? 'text-blue-600' : 'text-purple-600'} font-bold uppercase text-xs tracking-wider`}>
            Total Pendapatan {mode === 'bulanan' ? `(${NAMA_BULAN[bulan-1]} ${tahun})` : `(Tahun ${tahun})`}
          </p>
          <h2 className="text-4xl font-extrabold text-slate-900 mt-2">
            Rp {totalPendapatan.toLocaleString('id-ID')}
          </h2>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-slate-500 text-sm">Total Transaksi Valid</p>
          <p className="text-2xl font-bold text-slate-700">
            {mode === 'bulanan' ? dataBulanan.length : dataTahunan.length} <span className="text-sm font-normal">Sewa</span>
          </p>
        </div>
      </div>

      {/* --- VISUALISASI GRAFIK --- */}
      <div className="h-[350px] w-full mb-10 print:h-[250px]">
        <h3 className="font-bold text-slate-700 mb-4">
          {mode === 'bulanan' ? 'Grafik Tren Harian' : 'Grafik Performa Bulanan'}
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'bulanan' ? (
            // GRAFIK GARIS (Bulanan)
            <LineChart data={chartBulanan}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [`Rp ${(value || 0).toLocaleString()}`, 'Pendapatan']}
              />
              <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill:'#2563eb'}} />
            </LineChart>
          ) : (
            // GRAFIK BATANG (Tahunan)
            <BarChart data={chartTahunan}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Pendapatan']}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartTahunan.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#9333ea' : '#e9d5ff'} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* --- TABEL DATA --- */}
      <div className="overflow-x-auto">
        <h3 className="font-bold text-slate-700 mb-4">
          {mode === 'bulanan' ? 'Rincian Transaksi' : 'Rekapitulasi Per Bulan'}
        </h3>
        
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-slate-600 uppercase text-xs">
            <tr>
              {mode === 'bulanan' ? (
                // Header Tabel Bulanan
                <>
                  <th className="p-3 border-b">Tanggal</th>
                  <th className="p-3 border-b">Pelanggan</th>
                  <th className="p-3 border-b">Unit Motor</th>
                  <th className="p-3 border-b text-right">Nominal</th>
                </>
              ) : (
                // Header Tabel Tahunan
                <>
                  <th className="p-3 border-b">Bulan</th>
                  <th className="p-3 border-b text-center">Jumlah Transaksi</th>
                  <th className="p-3 border-b text-right">Total Pendapatan</th>
                  <th className="p-3 border-b text-right">Rata-rata / Transaksi</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {mode === 'bulanan' ? (
              // BODY TABEL BULANAN
              dataBulanan.length > 0 ? dataBulanan.map((t) => (
                <tr key={t.id_transaksi} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-slate-500">{t.tgl_mulai}</td>
                  <td className="p-3 font-medium text-slate-900">{t.pelanggan?.nama || 'Anonim'}</td>
                  <td className="p-3 text-slate-700">
                    {t.motor?.merk} {t.motor?.model} 
                    <span className="text-xs bg-gray-100 ml-2 px-1 rounded">{t.motor?.plat_nomor}</span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">Rp {t.total_harga.toLocaleString()}</td>
                </tr>
              )) : <tr><td colSpan={4} className="p-4 text-center text-slate-400">Data Kosong</td></tr>
            ) : (
              // BODY TABEL TAHUNAN
              chartTahunan.map((bln) => (
                <tr key={bln.name} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-bold text-slate-700">{bln.fullName}</td>
                  <td className="p-3 text-center">
                    {bln.jumlahTransaksi > 0 ? (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                        {bln.jumlahTransaksi} x
                      </span>
                    ) : "-"}
                  </td>
                  <td className={`p-3 text-right font-bold ${bln.total > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                    Rp {bln.total.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-slate-500 text-xs">
                    {bln.jumlahTransaksi > 0 
                      ? `Rp ${Math.round(bln.total / bln.jumlahTransaksi).toLocaleString()}` 
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}