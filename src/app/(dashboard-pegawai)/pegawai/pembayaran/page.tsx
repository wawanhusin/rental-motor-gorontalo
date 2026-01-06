"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function PembayaranPegawai() {
  const supabase = createClient();
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. Ambil Data Transaksi dari Database
  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("transaksi") 
        .select(`
          id_transaksi,
          total_harga,
          status_transaksi,
          tgl_mulai,
          tgl_selesai,
          bukti_pembayaran,
          pelanggan ( nama ),  
          motor ( * )
        `) // Kita ambil data detail dari tabel relasi (pelanggan & motor)
        .eq("status_transaksi", "Belum Lunas") 
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransaksi(data || []);
    } catch (error: any) {
      console.error("Error fetch transaksi:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaksi();
  }, []);

  // 2. Fungsi Proses Bayar (Update Status ke Lunas)
  const handleProsesBayar = async (id: string) => {
    if (!confirm("Konfirmasi pembayaran lunas untuk transaksi ini?")) return;

    try {
      // Pastikan nama kolom status sesuai dengan database Anda (status_transaksi)
      const { error } = await supabase
        .from("transaksi")
        .update({ status_transaksi: "Lunas" }) 
        .eq("id_transaksi", id);

      if (error) throw error;
      alert("Pembayaran Berhasil Dicatat!");
      fetchTransaksi(); // Refresh data agar data yang lunas menghilang dari list
    } catch (error: any) {
      alert("Gagal memproses: " + error.message);
    }
  };

  // 3. Filter Search (Client Side)
  const filteredTransaksi = transaksi.filter((item) => {
    // Karena data pelanggan ada di dalam object relasi, cara aksesnya berbeda
    const namaPelanggan = item.pelanggan?.nama || "";
    const idTransaksi = item.id_transaksi || "";
    
    return (
      namaPelanggan.toLowerCase().includes(search.toLowerCase()) ||
      idTransaksi.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Kasir & Pembayaran</h1>
        <p className="text-sm text-slate-500">Menampilkan transaksi yang belum lunas.</p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-md relative">
        <input 
          type="text" 
          placeholder="Cari Nama Pelanggan atau ID..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-11 text-sm outline-none focus:ring-2 focus:ring-green-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="absolute left-4 top-3.5">🔍</span>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">Memuat data transaksi...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Unit Motor</th>
                <th className="p-4">Total Tagihan</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransaksi.map((trx) => (
                <tr key={trx.id_transaksi} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">
                    #{trx.id_transaksi.slice(0, 8)}
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    {/* Akses ke tabel relasi pelanggan */}
                    {trx.pelanggan?.nama || "Tanpa Nama"}
                  </td>
                  <td className="p-4 text-slate-500">
                     {/* Cek berbagai kemungkinan nama kolom motor */}
                    {trx.motor?.nama || trx.motor?.nama_motor || trx.motor?.merk || "Motor"} 
                    <span className="text-xs bg-slate-100 px-1 ml-1 rounded border">
                      {trx.motor?.plat_nomor || "-"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-red-600">
                    Rp {trx.total_harga?.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleProsesBayar(trx.id_transaksi)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                    >
                      Tandai Lunas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filteredTransaksi.length === 0 && (
          <div className="p-10 text-center text-slate-400 italic">Tidak ada tagihan tertunda.</div>
        )}
      </div>
    </div>
  );
}