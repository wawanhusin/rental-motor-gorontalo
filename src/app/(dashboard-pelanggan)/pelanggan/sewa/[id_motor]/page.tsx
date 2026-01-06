"use client";

import { useEffect, useState, use } from "react"; // Tambah 'use'
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase"; 
import { Motor } from "../../../../../types"; 

export default function HalamanSewa({ params }: { params: Promise<{ id_motor: string }> }) {
  // 1. Unwrap params (Khusus Next.js 15)
  const unwrappedParams = use(params);
  const id_motor = unwrappedParams.id_motor;
  
  const router = useRouter();
  
  // 2. Definisi State (Variabel Penampung)
  const [userId, setUserId] = useState<string | null>(null);
  const [motor, setMotor] = useState<Motor | null>(null); // State motor yang tadi hilang
  const [loading, setLoading] = useState(true); // State loading yang tadi hilang
  
  // State Form
  const [tglMulai, setTglMulai] = useState("");
  const [tglKembali, setTglKembali] = useState("");
  const [totalHarga, setTotalHarga] = useState(0);

  // 3. UseEffect A: Cek Login User
  useEffect(() => {
    const cekUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Anda harus login untuk menyewa!");
        router.push("/login");
      } else {
        setUserId(user.id);
      }
    };
    cekUser();
  }, [router]);

  // 4. UseEffect B: Ambil Data Motor (Ini yang tadi hilang)
  useEffect(() => {
    const fetchMotor = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("motor")
        .select("*")
        .eq("id_motor", id_motor)
        .single();

      if (error) {
        console.error(error);
      } else {
        setMotor(data);
      }
      setLoading(false);
    };

    if (id_motor) {
      fetchMotor();
    }
  }, [id_motor]);

  // 5. UseEffect C: Hitung Harga Otomatis
  useEffect(() => {
    if (tglMulai && tglKembali && motor) {
      const start = new Date(tglMulai);
      const end = new Date(tglKembali);
      const diffTime = end.getTime() - start.getTime();
      
      if (diffTime < 0) {
        setTotalHarga(0);
        return;
      }

      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const jumlahHari = diffDays === 0 ? 1 : diffDays;
      setTotalHarga(jumlahHari * motor.harga_per_hari);
    }
  }, [tglMulai, tglKembali, motor]);

  // 6. Fungsi Submit Sewa
  const handleSewa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return alert("Sesi habis, silakan login ulang");
    
    const supabase = createClient();
    const { error } = await supabase.from("transaksi").insert([
      {
        id_pelanggan: userId, // Pakai userId yang didapat dari Login
        id_motor: id_motor,
        tgl_mulai: tglMulai,
        tgl_kembali: tglKembali,
        total_harga: totalHarga,
        status_transaksi: 'pending'
      }
    ]);

    if (error) {
      alert("Gagal menyewa: " + error.message);
    } else {
      alert("Berhasil Booking! Silakan cek status di riwayat (nanti dibuat).");
      router.push("/pelanggan/katalog");
    }
  };

  if (loading) return <p className="p-8">Memuat data...</p>;
  if (!motor) return <p className="p-8">Motor tidak ditemukan.</p>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Formulir Sewa Motor</h2>
        
        {/* Info Motor Singkat */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">{motor.merk} {motor.model}</h3>
            <p className="text-gray-600">{motor.plat_nomor}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Harga/hari</p>
            <p className="font-bold text-blue-600">Rp {motor.harga_per_hari.toLocaleString()}</p>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSewa} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input 
                type="date" 
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                value={tglMulai}
                onChange={(e) => setTglMulai(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kembali</label>
                <input 
                type="date" 
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                value={tglKembali}
                onChange={(e) => setTglKembali(e.target.value)}
                />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-700">Total Biaya:</span>
              <span className="text-2xl font-bold text-blue-600">
                Rp {totalHarga.toLocaleString('id-ID')}
              </span>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
            >
              Konfirmasi Sewa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}