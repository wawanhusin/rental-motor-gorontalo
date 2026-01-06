"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase"; 
import { useRouter } from "next/navigation";
import Link from "next/link"; // Pastikan Link di-import
import { Motor } from "../../../../types";

export default function TransaksiPegawai() {
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [motorBengkel, setMotorBengkel] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }
      if (user?.user_metadata?.role === 'mekanik') {
        router.push("/pegawai/kendaraan");
      } else {
        fetchData();
      }
    };
    init();
  }, [router]);

  const fetchData = async () => {
    const supabase = createClient();
    
    // 1. Ambil Transaksi
    const { data: trxData } = await supabase
      .from("transaksi")
      .select(`*, motor (id_motor, merk, model, plat_nomor), pelanggan (nama, no_hp)`)
      .order('created_at', { ascending: false }); 
      
    const sortedTrx = (trxData || []).sort((a, b) => {
      if (a.status_transaksi === 'pending' && b.status_transaksi !== 'pending') return -1;
      if (a.status_transaksi !== 'pending' && b.status_transaksi === 'pending') return 1;
      return 0;
    });
    setTransaksi(sortedTrx);

    // 2. Ambil Motor Bengkel (Status = selesai_servis)
    const { data: mtrData } = await supabase
      .from("motor")
      .select("*")
      .eq("status", "selesai_servis");
    
    setMotorBengkel(mtrData || []);
    setLoading(false);
  };

  // --- LOGIKA TERIMA DARI MEKANIK ---
  const handleTerimaDariBengkel = async (id: string) => {
    if(!confirm("Motor sudah dicek fisik dan SIAP DISEWAKAN kembali?")) return;
    
    const supabase = createClient();
    const { error } = await supabase.from("motor").update({ 
      status: 'tersedia', 
      gambar_kerusakan: null 
    }).eq("id_motor", id);

    if (error) alert("Gagal: " + error.message);
    else {
      alert("Berhasil! Motor kembali ke Stok Ready.");
      fetchData(); 
    }
  };

  // --- LOGIKA TRANSAKSI ---
  const handleKonfirmasiBayar = async (trx: any) => {
    if(!confirm("Terima pembayaran?")) return;
    const supabase = createClient();
    await supabase.from('transaksi').update({ status_transaksi: 'lunas' }).eq('id_transaksi', trx.id_transaksi);
    fetchData();
  };

  const handleKembaliPelanggan = async (trx: any, kondisi: 'bagus' | 'rusak') => {
    const supabase = createClient();
    let statusMotor = kondisi === 'bagus' ? 'tersedia' : 'maintenance';
    
    const tglJadwal = new Date(trx.tgl_kembali); const now = new Date();
    tglJadwal.setHours(0,0,0,0); now.setHours(0,0,0,0);
    const telat = Math.ceil((now.getTime() - tglJadwal.getTime()) / 86400000);
    const denda = telat > 0 ? telat * 50000 : 0;

    let msg = kondisi === 'bagus' ? "Motor kembali mulus?" : "Lapor RUSAK ke Mekanik?";
    if (!confirm(msg)) return;

    await supabase.from('transaksi').update({ status_transaksi: 'selesai', denda }).eq('id_transaksi', trx.id_transaksi);
    if (trx.motor?.id_motor) {
      await supabase.from('motor').update({ status: statusMotor }).eq('id_motor', trx.motor.id_motor);
    }
    fetchData();
  };

  if (loading) return <p className="p-8 text-center">Memuat dashboard staff...</p>;

  return (
    <div className="min-h-screen pb-20 space-y-8">
      
      {/* KOTAK MOTOR DARI MEKANIK */}
      {motorBengkel.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl shadow-lg">
          <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            🔔 Konfirmasi Unit Selesai Servis
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{motorBengkel.length} Unit</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {motorBengkel.map((m) => (
              <div key={m.id_motor} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                   <div>
                     <h3 className="font-bold text-slate-900">{m.merk} {m.model}</h3>
                     <p className="text-xs text-slate-500 font-mono">{m.plat_nomor}</p>
                   </div>
                   <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold uppercase">QC Check</span>
                </div>
                <button 
                  onClick={() => handleTerimaDariBengkel(m.id_motor)}
                  className="mt-auto w-full bg-emerald-600 text-white py-2 rounded font-bold text-sm hover:bg-emerald-700 shadow-sm transition"
                >
                  ✅ Terima & Masukkan Stok
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABEL TRANSAKSI */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Kasir: Transaksi Sewa</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 uppercase">
              <tr>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Motor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaksi.map((t) => (
                <tr key={t.id_transaksi} className="hover:bg-slate-50">
                  <td className="p-4 font-bold">{t.pelanggan?.nama}</td>
                  <td className="p-4">{t.motor?.merk} {t.motor?.model} <span className="text-xs bg-gray-100 px-1">{t.motor?.plat_nomor}</span></td>
                  <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold uppercase">{t.status_transaksi}</span></td>
                  <td className="p-4 text-center">
                    
                    {/* STATUS PENDING */}
                    {t.status_transaksi === 'pending' && (
                      <button onClick={() => handleKonfirmasiBayar(t)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Bayar</button>
                    )}

                    {/* STATUS LUNAS (SEDANG DISEWA) */}
                    {t.status_transaksi === 'lunas' && (
                      <div className="flex gap-2 justify-center items-center">
                        <button onClick={() => handleKembaliPelanggan(t, 'bagus')} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs">✅ Aman</button>
                        <button onClick={() => handleKembaliPelanggan(t, 'rusak')} className="bg-red-600 text-white px-3 py-1 rounded text-xs">🛠️ Rusak</button>
                        
                        {/* TOMBOL CETAK NOTA KEMBALI DI SINI */}
                        <Link 
                          href={`/cetak/${t.id_transaksi}`} 
                          target="_blank" 
                          className="bg-slate-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-slate-900 flex items-center gap-1"
                        >
                          <span>🖨️</span> Nota
                        </Link>
                      </div>
                    )}

                    {/* STATUS SELESAI */}
                    {t.status_transaksi === 'selesai' && (
                       <Link 
                          href={`/cetak/${t.id_transaksi}`} 
                          target="_blank" 
                          className="text-slate-500 text-xs hover:text-slate-700 hover:underline flex items-center justify-center gap-1"
                        >
                          🖨️ Cetak Ulang
                        </Link>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}