"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Motor } from "../../../../types"; 

export default function HalamanMaintenance() {
  const [listRusak, setListRusak] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Cek Security
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.role !== 'mekanik') {
        router.push("/pegawai/transaksi");
        return;
      }
      fetchRusak();
    };
    init();
  }, [router]);

  // 2. Fetch Data (Hanya yang status MAINTENANCE)
  const fetchRusak = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("motor")
        .select("*")
        .eq("status", "maintenance")
        .order('created_at', { ascending: false }); // Gunakan created_at agar aman

      if (error) throw error;
      setListRusak(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Tombol Selesai -> Ubah ke 'selesai_servis'
  const laporSelesai = async (id: string) => {
    if(!confirm("Yakin sudah diperbaiki? Serahkan ke Staff untuk pengecekan?")) return;
    
    setLoading(true);
    const supabase = createClient();
    
    // INI KUNCINYA: Jangan langsung 'tersedia', tapi 'selesai_servis'
    const { error } = await supabase.from("motor").update({ 
      status: 'selesai_servis', 
    }).eq("id_motor", id);

    if (error) {
      alert("Gagal update database: " + error.message);
      setLoading(false);
    } else {
      alert("Berhasil! Motor dikirim ke Dashboard Staff untuk konfirmasi.");
      fetchRusak(); 
    }
  };

  if (loading) return <p className="p-10 text-center">Memuat data bengkel...</p>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm min-h-screen border-t-4 border-orange-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Bengkel: Perbaikan Aktif</h1>
        <button onClick={() => { setLoading(true); fetchRusak(); }} className="text-blue-600 text-sm hover:underline">🔄 Refresh</button>
      </div>

      {listRusak.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded border border-gray-200 text-gray-500">
          <p>Tidak ada motor rusak saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listRusak.map((m) => (
            <div key={m.id_motor} className="border border-red-200 bg-red-50 p-4 rounded-xl flex flex-col shadow-sm">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 bg-white rounded overflow-hidden shadow-sm">
                  {m.gambar_motor ? <img src={m.gambar_motor} className="w-full h-full object-cover" /> : <div className="p-2 text-xs">No Img</div>}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{m.merk} {m.model}</h3>
                  <p className="font-mono bg-white px-1 rounded text-xs border border-red-100">{m.plat_nomor}</p>
                </div>
              </div>
              
              <button 
                onClick={() => laporSelesai(m.id_motor)}
                className="mt-auto w-full bg-orange-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-orange-700 shadow-lg transition"
              >
                ✅ Selesai Servis
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}