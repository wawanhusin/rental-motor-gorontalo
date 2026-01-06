"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase"; 
import ChartMotorTerlaris from "../../../../components/ChartMotorTerlaris";
import Link from "next/link"; // <--- 1. INI DITAMBAHKAN

// Tipe data
type TransaksiLengkap = {
  id_transaksi: string;
  total_harga: number;
  status_transaksi: string;
  tgl_mulai: string;
  tgl_kembali: string;
  pelanggan: { nama: string; no_hp: string } | null;
  motor: { merk: string; model: string; plat_nomor: string } | null;
};

export default function AdminDashboard() {
  const [transaksi, setTransaksi] = useState<TransaksiLengkap[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi Fetch
  const fetchTransaksi = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transaksi")
      .select(`
        *,
        motor (merk, model, plat_nomor),
        pelanggan (nama, no_hp)
      `)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setTransaksi(data as any[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransaksi();
  }, []);

  // Update Status (Hanya untuk tombol Terima cepat di dashboard)
  const handleUpdateStatus = async (id: string, statusBaru: string) => {
    if (!confirm(`Ubah status menjadi ${statusBaru}?`)) return;
    const supabase = createClient();
    await supabase.from("transaksi").update({ status_transaksi: statusBaru }).eq("id_transaksi", id);
    fetchTransaksi(); 
  };

  // --- LOGIKA RINGKASAN KEUANGAN ---
  const totalPendapatan = transaksi
    .filter(t => t.status_transaksi === 'lunas' || t.status_transaksi === 'selesai')
    .reduce((acc, curr) => acc + curr.total_harga, 0);

  const totalTransaksiPending = transaksi.filter(t => t.status_transaksi === 'pending').length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard & Laporan</h2>

      {/* 1. BAGIAN KARTU RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-80">Total Pendapatan (Lunas)</p>
          <h3 className="text-3xl font-bold">Rp {totalPendapatan.toLocaleString('id-ID')}</h3>
        </div>
        
        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-80">Menunggu Konfirmasi</p>
          <h3 className="text-3xl font-bold">{totalTransaksiPending} Transaksi</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm text-gray-500">Total Semua Transaksi</p>
          <h3 className="text-3xl font-bold text-gray-800">{transaksi.length}</h3>
        </div>
      </div>

      {/* 2. BAGIAN GRAFIK */}
      {!loading && <ChartMotorTerlaris dataTransaksi={transaksi} />}

      {/* 3. TABEL DATA */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-700">Riwayat Transaksi Terbaru</h3>
        
        {loading ? <p>Memuat data...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100">
                 <tr>
                    <th className="px-4 py-2">Pelanggan</th>
                    <th className="px-4 py-2">Motor</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                {transaksi.slice(0, 5).map((item) => (
                  <tr key={item.id_transaksi}>
                    <td className="px-4 py-3">{item.pelanggan?.nama}</td>
                    <td className="px-4 py-3">{item.motor?.merk} {item.motor?.model}</td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-1 rounded text-xs ${
                          item.status_transaksi === 'lunas' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                       }`}>
                          {item.status_transaksi}
                       </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.status_transaksi === 'pending' && (
                        <button onClick={() => handleUpdateStatus(item.id_transaksi, 'lunas')} className="text-blue-600 font-bold hover:underline">
                          Terima
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* --- 2. INI BAGIAN YANG DIGANTI --- */}
            <div className="mt-4 text-center border-t pt-4">
                <Link 
                  href="/admin/transaksi" 
                  className="text-blue-600 text-sm font-bold hover:underline hover:text-blue-800 transition"
                >
                  Lihat Semua Transaksi &rarr;
                </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}