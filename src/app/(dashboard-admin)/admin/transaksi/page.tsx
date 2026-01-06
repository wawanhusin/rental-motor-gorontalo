"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase"; // Sesuaikan titik
import Link from "next/link";

export default function AdminTransaksiPage() {
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      // Ambil SEMUA data, diurutkan dari yang terbaru
      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          *,
          motor (merk, model, plat_nomor),
          pelanggan (nama, no_hp)
        `)
        .order('created_at', { ascending: false });

      if (error) console.log(error);
      setTransaksi(data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Fitur Pencarian (Filter Client-Side)
  const filteredData = transaksi.filter((t) =>
    t.pelanggan?.nama?.toLowerCase().includes(search.toLowerCase()) ||
    t.motor?.plat_nomor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Semua Transaksi</h1>
           <p className="text-slate-500 text-sm">Rekap lengkap riwayat penyewaan & pendapatan.</p>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Cari Nama Pelanggan / Plat Nomor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 shadow-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
            <tr>
              <th className="p-4 border-b">ID / Tanggal</th>
              <th className="p-4 border-b">Pelanggan</th>
              <th className="p-4 border-b">Unit Motor</th>
              <th className="p-4 border-b">Keuangan</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
            ) : filteredData.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-slate-400">Data tidak ditemukan.</td></tr>
            ) : (
              filteredData.map((t) => (
                <tr key={t.id_transaksi} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <span className="font-mono text-[10px] text-slate-400 block mb-1">#{t.id_transaksi.slice(0,8)}</span>
                    <span className="text-xs font-bold text-slate-700">
                      {new Date(t.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{t.pelanggan?.nama || "Tanpa Nama"}</p>
                    <p className="text-xs text-slate-500">{t.pelanggan?.no_hp}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-800 font-medium">{t.motor?.merk} {t.motor?.model}</p>
                    <span className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded font-mono border border-gray-200">{t.motor?.plat_nomor}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-700">Rp {t.total_harga.toLocaleString()}</p>
                    {t.denda > 0 && (
                      <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-bold border border-red-100 mt-1 inline-block">
                        + Denda {t.denda.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                       t.status_transaksi === 'lunas' ? 'bg-emerald-100 text-emerald-800' :
                       t.status_transaksi === 'selesai' ? 'bg-gray-100 text-gray-500' :
                       t.status_transaksi === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'
                    }`}>
                      {t.status_transaksi}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Link
                      href={`/cetak/${t.id_transaksi}`}
                      target="_blank"
                      className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm inline-flex items-center gap-1"
                    >
                      <span>🖨️</span> Nota
                    </Link>
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