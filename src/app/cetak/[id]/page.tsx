"use client";

import { useEffect, useState, use } from "react"; // Tambah 'use'
import { createClient } from "../../../lib/supabase"; 
import { useRouter } from "next/navigation";

export default function HalamanCetak({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id_transaksi = unwrappedParams.id;

  const [trx, setTrx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Cek Login (Hanya Admin/Pegawai yang boleh cetak)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      // 2. Ambil Detail Transaksi
      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          *,
          motor (merk, model, plat_nomor),
          pelanggan (nama, no_hp, alamat)
        `)
        .eq("id_transaksi", id_transaksi)
        .single();

      if (error) {
        alert("Data tidak ditemukan");
        console.error(error);
      } else {
        setTrx(data);
        // Otomatis memicu dialog print browser setelah data siap
        setTimeout(() => {
          window.print();
        }, 1000);
      }
      setLoading(false);
    };

    fetchData();
  }, [id_transaksi, router]);

  if (loading) return <p className="text-center p-10">Menyiapkan Nota...</p>;
  if (!trx) return <p className="text-center p-10">Transaksi tidak valid.</p>;

  // Hitung Total Akhir (Sewa + Denda)
  const totalBayar = trx.total_harga + (trx.denda || 0);

  return (
    <div className="max-w-3xl mx-auto bg-white p-10 text-slate-900 font-sans">
      {/* HEADER NOTA */}
      <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-wider uppercase">INVOICE</h1>
          <p className="text-sm font-bold mt-1">RENTAL MOTOR PREMIUM</p>
          <p className="text-xs text-slate-500">Jl. Teknologi No. 1, Kota Coding</p>
          <p className="text-xs text-slate-500">WA: 0812-3456-7890</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">No. Order</p>
          <p className="font-mono font-bold">{trx.id_transaksi.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm text-slate-500 mt-2">Tanggal Cetak</p>
          <p className="font-bold">{new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      {/* INFO PELANGGAN */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Penyewa</p>
          <p className="font-bold text-lg">{trx.pelanggan?.nama}</p>
          <p className="text-sm text-slate-600">{trx.pelanggan?.no_hp}</p>
          <p className="text-sm text-slate-600 max-w-[200px]">{trx.pelanggan?.alamat || '-'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Unit Motor</p>
          <p className="font-bold text-lg">{trx.motor?.merk} {trx.motor?.model}</p>
          <span className="bg-slate-200 px-2 py-1 rounded text-xs font-mono font-bold">
            {trx.motor?.plat_nomor}
          </span>
        </div>
      </div>

      {/* TABEL RINCIAN */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
            <th className="p-3 text-left border-y">Keterangan</th>
            <th className="p-3 text-right border-y">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-3 border-b">
              <p className="font-bold">Biaya Sewa Motor</p>
              <p className="text-xs text-slate-500">
                {trx.tgl_mulai} s/d {trx.tgl_kembali}
              </p>
            </td>
            <td className="p-3 border-b text-right font-bold">
              Rp {trx.total_harga.toLocaleString('id-ID')}
            </td>
          </tr>
          
          {/* Baris Denda (Hanya muncul jika ada) */}
          {trx.denda > 0 && (
            <tr className="text-red-600 bg-red-50">
              <td className="p-3 border-b">
                <p className="font-bold">Denda Keterlambatan</p>
                <p className="text-xs">Charge tambahan pengembalian telat</p>
              </td>
              <td className="p-3 border-b text-right font-bold">
                Rp {trx.denda.toLocaleString('id-ID')}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* TOTAL AKHIR */}
      <div className="flex justify-end mb-12">
        <div className="text-right">
          <p className="text-sm text-slate-500">Total Pembayaran</p>
          <p className="text-4xl font-extrabold text-slate-900 border-b-4 border-slate-900 inline-block pb-1">
            Rp {totalBayar.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* FOOTER / TTD */}
      <div className="flex justify-between mt-20 text-center text-xs text-slate-500">
        <div className="w-32">
          <p className="mb-16">Penyewa,</p>
          <p className="border-t border-slate-300 pt-2 font-bold">{trx.pelanggan?.nama}</p>
        </div>
        <div className="w-32">
          <p className="mb-16">Petugas Rental,</p>
          <p className="border-t border-slate-300 pt-2 font-bold">Admin/Staff</p>
        </div>
      </div>

      {/* INFO CETAK (Hanya muncul di layar, hilang pas diprint) */}
      <style jsx global>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
        }
      `}</style>

      <div className="no-print fixed bottom-10 right-10 flex gap-4">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition"
        >
          🖨️ Print Nota
        </button>
        <button 
          onClick={() => window.close()}
          className="bg-slate-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-slate-600 transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}