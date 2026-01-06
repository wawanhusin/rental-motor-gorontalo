"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";

export default function EditMotorPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id_motor = unwrappedParams.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // State Form (Tahun SUDAH DIHAPUS)
  const [form, setForm] = useState({
    merk: "",
    model: "",
    plat_nomor: "",
    harga_per_hari: "",
    status: "",
    gambar_motor: ""
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 1. FETCH DATA
  useEffect(() => {
    const getData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("motor")
        .select("*")
        .eq("id_motor", id_motor)
        .single();

      if (error) {
        alert("Motor tidak ditemukan!");
        router.push("/admin/motor");
      } else {
        setForm({
          merk: data.merk,
          model: data.model,
          // tahun dihapus
          plat_nomor: data.plat_nomor,
          harga_per_hari: data.harga_per_hari,
          status: data.status,
          gambar_motor: data.gambar_motor
        });
        setPreviewImage(data.gambar_motor);
      }
      setLoading(false);
    };

    getData();
  }, [id_motor, router]);

  // 2. HANDLER GAMBAR
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  // 3. UPDATE DATA
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    const supabase = createClient();

    let finalImageUrl = form.gambar_motor; 

    // Upload Gambar Baru jika ada
    if (newImage) {
      const fileExt = newImage.name.split('.').pop();
      const fileName = `motor-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('motor-images') 
        .upload(filePath, newImage);

      if (uploadError) {
        alert("Gagal upload gambar: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('motor-images')
        .getPublicUrl(filePath);
        
      finalImageUrl = urlData.publicUrl;
    }

    // Update Database (Tahun DIHAPUS)
    const { error: dbError } = await supabase
      .from("motor")
      .update({
        merk: form.merk,
        model: form.model,
        plat_nomor: form.plat_nomor,
        harga_per_hari: parseInt(form.harga_per_hari),
        status: form.status,
        gambar_motor: finalImageUrl
      })
      .eq("id_motor", id_motor);

    if (dbError) {
      alert("Gagal update data: " + dbError.message);
    } else {
      alert("Berhasil diperbarui!");
      router.push("/admin/motor");
      router.refresh();
    }
    setUploading(false);
  };

  if (loading) return <p className="p-8 text-center">Memuat data...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100 mt-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Edit Data Motor</h1>
      
      <form onSubmit={handleUpdate} className="space-y-6">
        
        {/* PREVIEW GAMBAR */}
        <div className="flex flex-col items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="w-48 h-32 bg-white rounded-lg overflow-hidden border border-slate-300 mb-3 shadow-sm">
            {previewImage ? (
               <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
            ) : (
               <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Img</div>
            )}
          </div>
          <label className="cursor-pointer bg-white border border-slate-300 px-4 py-2 rounded text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <span>📷 Ganti Foto</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        {/* --- FORM INPUT --- */}
        
        {/* Baris 1: Merk & Model */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Merk</label>
            <input 
              type="text" required 
              className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 ring-blue-500 outline-none"
              value={form.merk} 
              onChange={(e) => setForm({...form, merk: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Model / Tipe</label>
            <input 
              type="text" required 
              className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 ring-blue-500 outline-none"
              value={form.model} 
              onChange={(e) => setForm({...form, model: e.target.value})} 
            />
          </div>
        </div>

        {/* Baris 2: Plat Nomor & Harga (SEJAJAR) */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Plat Nomor</label>
            <input 
              type="text" required 
              className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 ring-blue-500 outline-none bg-yellow-50 font-mono font-bold text-slate-800"
              value={form.plat_nomor} 
              onChange={(e) => setForm({...form, plat_nomor: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Harga Sewa (Per Hari)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-500 font-bold">Rp</span>
              <input 
                type="number" required 
                className="w-full border border-slate-300 p-3 pl-10 rounded-lg focus:ring-2 ring-blue-500 outline-none font-bold text-slate-700"
                value={form.harga_per_hari} 
                onChange={(e) => setForm({...form, harga_per_hari: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* Baris 3: Status Motor (Full Width) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status Motor</label>
          <select 
            className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:ring-2 ring-blue-500 outline-none font-medium"
            value={form.status}
            onChange={(e) => setForm({...form, status: e.target.value})}
          >
            <option value="tersedia">✅ Tersedia</option>
            <option value="terpakai">🔑 Terpakai (Disewa)</option>
            <option value="maintenance">🔧 Maintenance (Bengkel)</option>
            <option value="selesai_servis">⏳ Selesai Servis (QC)</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={uploading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-300 shadow-md"
          >
            {uploading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

      </form>
    </div>
  );
}