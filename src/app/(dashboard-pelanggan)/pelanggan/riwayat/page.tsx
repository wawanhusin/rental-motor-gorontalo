"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase"; // Sesuaikan path titik-titik jika perlu
import { useRouter } from "next/navigation";
import Link from "next/link";

// Tipe data gabungan (Transaksi + Motor)
type RiwayatTransaksi = {
  id_transaksi: string;
  tgl_mulai: string;
  tgl_kembali: string;
  total_harga: number;
  status_transaksi: string;
  created_at: string;
  motor: {
    merk: string;
    model: string;
    plat_nomor: string;
    gambar_motor: string | null;
  } | null;
};

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<RiwayatTransaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Fetch Data
  useEffect(() => {
    const fetchRiwayat = async () => {
      const supabase = createClient();
      
      // Cek User Login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Ambil Transaksi milik user ini
      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          *,
          motor (merk, model, plat_nomor, gambar_motor)
        `)
        .eq("id_pelanggan", user.id)
        .order("created_at", { ascending: false }); // Paling baru di atas

      if (error) {
        console.error(error);
      } else {
        setRiwayat(data as any[] || []);
      }
      setLoading(false);
    };

    fetchRiwayat();
  }, [router]);

  // 2. Fungsi Konfirmasi via WhatsApp (KODE BARU DITAMBAHKAN DI SINI)
  const handleKonfirmasi = (item: RiwayatTransaksi) => {
    // --- GANTI NOMOR INI DENGAN NOMOR WA ADMIN ASLI ---
    const nomorAdmin = "628988891921"; 
    
    // Format Pesan
    const pesan = `Halo Admin, saya ingin konfirmasi pembayaran untuk:
--------------------------------
🆔 Order ID: ${item.id_transaksi.slice(0, 8)}...
🏍️ Motor: ${item.motor?.merk} ${item.motor?.model}
📅 Tgl Sewa: ${item.tgl_mulai} s/d ${item.tgl_kembali}
💰 Total: Rp ${item.total_harga.toLocaleString('id-ID')}
--------------------------------
Mohon dicek bukti transfer saya. Terima kasih!`;

    // Buka WhatsApp di tab baru
    const url = `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  };

  // 3. Helper Warna Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "lunas": return "bg-green-100 text-green-800 border-green-200";
      case "selesai": return "bg-blue-100 text-blue-800 border-blue-200";
      case "dibatalkan": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat riwayat...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Riwayat Peminjaman</h1>

      {riwayat.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 mb-4">Kamu belum pernah menyewa motor.</p>
          <Link href="/pelanggan/katalog" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
            Cari Motor Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {riwayat.map((item) => (
            <div key={item.id_transaksi} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              {/* FOTO MOTOR */}
              <div className="w-full md:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.motor?.gambar_motor ? (
                  <img src={item.motor.gambar_motor} alt={item.motor.model} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                )}
              </div>

              {/* DETAIL TRANSAKSI */}
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{item.motor?.merk} {item.motor?.model}</h3>
                    <p className="text-slate-500 text-sm font-mono">{item.motor?.plat_nomor}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status_transaksi)} uppercase tracking-wide`}>
                    {item.status_transaksi}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3 text-slate-600">
                  <div>
                    <span className="block text-xs text-slate-400">Tanggal Sewa</span>
                    <span className="font-semibold">{item.tgl_mulai}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Tanggal Kembali</span>
                    <span className="font-semibold">{item.tgl_kembali}</span>
                  </div>
                  <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-2 md:pt-0 mt-2 md:mt-0">
                     <span className="block text-xs text-slate-400">Total Biaya</span>
                     <span className="font-bold text-blue-600 text-lg">Rp {item.total_harga.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* TOMBOL AKSI DENGAN WA (UPDATE DI SINI) */}
              {item.status_transaksi === 'pending' && (
                 <button 
                   onClick={() => handleKonfirmasi(item)} 
                   className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold w-full md:w-auto hover:bg-green-700 flex items-center justify-center gap-2 transition"
                 >
                   {/* Ikon WhatsApp SVG */}
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                     <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592z"/>
                   </svg>
                   Konfirmasi via WA
                 </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}