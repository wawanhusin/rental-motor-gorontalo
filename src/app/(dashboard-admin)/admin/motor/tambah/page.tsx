"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase"; // Sesuaikan path titik-titik

export default function TambahMotor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State untuk form input
  const [merk, setMerk] = useState("");
  const [model, setModel] = useState("");
  const [plat, setPlat] = useState("");
  const [harga, setHarga] = useState("");
  
  // State khusus file gambar
  const [fileGambar, setFileGambar] = useState<File | null>(null);

  // Fungsi saat user memilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileGambar(e.target.files[0]);
    }
  };

  // Fungsi Submit Utama
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      let imageUrl = null;

      // 1. PROSES UPLOAD GAMBAR (Jika ada file yang dipilih)
      if (fileGambar) {
        // Buat nama file unik (pakai waktu sekarang) biar tidak bentrok
        const fileName = `${Date.now()}-${fileGambar.name}`;
        
        // Upload ke Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from("motor-images") // Nama bucket yang kita buat tadi
          .upload(fileName, fileGambar);

        if (uploadError) throw uploadError;

        // Ambil Public URL agar bisa disimpan di database
        const { data: urlData } = supabase.storage
          .from("motor-images")
          .getPublicUrl(fileName);
          
        imageUrl = urlData.publicUrl;
      }

      // 2. PROSES SIMPAN DATA KE DATABASE
      const { error: dbError } = await supabase
        .from("motor")
        .insert([
          {
            merk: merk,
            model: model,
            plat_nomor: plat,
            harga_per_hari: parseInt(harga),
            status: 'tersedia',
            gambar_motor: imageUrl, // Simpan URL-nya saja
          },
        ]);

      if (dbError) throw dbError;

      alert("Motor berhasil ditambahkan!");
      router.push("/admin/motor"); // Redirect kembali ke list motor (nanti kita buat)
      router.refresh(); // Refresh data

    } catch (error: any) {
      console.error("Error:", error);
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tambah Motor Baru</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Merk</label>
            <input
              type="text" required placeholder="Contoh: Honda"
              className="w-full border p-2 rounded"
              value={merk} onChange={(e) => setMerk(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text" required placeholder="Contoh: Vario 160"
              className="w-full border p-2 rounded"
              value={model} onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Plat Nomor</label>
          <input
            type="text" required placeholder="B 1234 XYZ"
            className="w-full border p-2 rounded uppercase"
            value={plat} onChange={(e) => setPlat(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Harga Sewa per Hari (Rp)</label>
          <input
            type="number" required placeholder="100000"
            className="w-full border p-2 rounded"
            value={harga} onChange={(e) => setHarga(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Foto Motor</label>
          <input
            type="file"
            accept="image/*" // Hanya terima file gambar
            className="w-full border p-2 rounded text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-500 mt-1">*Format: JPG, PNG. Maks 2MB.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400"
        >
          {loading ? "Sedang Mengupload..." : "Simpan Motor"}
        </button>
      </form>
    </div>
  );
}