"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase"; // Sesuaikan titik-titik path

export default function ProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // State Data User
  const [userId, setUserId] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState(""); // Email biasanya read-only
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  // 1. Ambil Data User saat ini
  useEffect(() => {
    const getData = async () => {
      const supabase = createClient();
      
      // Cek siapa yang login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // Ambil detail dari tabel 'pelanggan'
      const { data, error } = await supabase
        .from("pelanggan")
        .select("*")
        .eq("id_pelanggan", user.id)
        .single();

      if (data) {
        setNama(data.nama);
        setEmail(data.email);
        setNoHp(data.no_hp || "");
        setAlamat(data.alamat || "");
        setFotoUrl(data.foto);
      }
      setLoading(false);
    };

    getData();
  }, [router]);

  // 2. Fungsi Upload Foto
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    const supabase = createClient();

    try {
      // Upload ke Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil Public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFotoUrl(urlData.publicUrl);
      alert("Foto berhasil diupload! Jangan lupa klik Simpan Perubahan.");
    } catch (error: any) {
      alert("Gagal upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Fungsi Simpan Perubahan Text
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("pelanggan")
      .update({
        nama,
        no_hp: noHp,
        alamat,
        foto: fotoUrl
      })
      .eq("id_pelanggan", userId);

    if (error) {
      alert("Gagal update profil: " + error.message);
    } else {
      alert("Profil berhasil diperbarui!");
      router.refresh();
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat profil...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Profil Saya</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* KOLOM KIRI: FOTO PROFIL */}
        <div className="bg-slate-50 p-8 flex flex-col items-center justify-center md:w-1/3 border-r border-slate-100">
          <div className="relative w-32 h-32 mb-4">
            {fotoUrl ? (
              <img src={fotoUrl} alt="Profil" className="w-full h-full object-cover rounded-full border-4 border-white shadow-md" />
            ) : (
              <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-slate-400 text-3xl font-bold">
                {nama.charAt(0)}
              </div>
            )}
            
            {/* Tombol Kamera Kecil */}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploading} />
            </label>
          </div>
          
          <h2 className="text-lg font-bold text-slate-800 text-center">{nama}</h2>
          <p className="text-sm text-slate-500 text-center">{email}</p>
        </div>

        {/* KOLOM KANAN: FORM DATA */}
        <div className="p-8 md:w-2/3">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition" 
                value={nama} onChange={(e) => setNama(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
              <input 
                type="text" 
                placeholder="08xxxxxxxxxx"
                className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition" 
                value={noHp} onChange={(e) => setNoHp(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <textarea 
                rows={3}
                placeholder="Jalan..."
                className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition" 
                value={alamat} onChange={(e) => setAlamat(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-200 transition transform active:scale-95"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}