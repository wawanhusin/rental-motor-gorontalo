"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase"; // Sesuaikan path

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    // 1. Daftar ke Supabase Auth (Email & Password)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert("Gagal daftar: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Jika sukses, simpan data profil ke tabel 'pelanggan'
      // Kita gunakan ID dari Auth agar sinkron
      const { error: dbError } = await supabase.from("pelanggan").insert([
        {
          id_pelanggan: authData.user.id, // KUNCI PENTING: ID-nya sama
          nama: nama,
          email: email,
          no_hp: noHp,
          foto: null
        }
      ]);

      if (dbError) {
        alert("Akun dibuat tapi gagal simpan profil: " + dbError.message);
      } else {
        alert("Registrasi Berhasil! Silakan Login.");
        router.push("/login");
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Daftar Akun Baru</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nama Lengkap</label>
          <input type="text" required className="w-full border p-2 rounded" 
            value={nama} onChange={(e) => setNama(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">No. HP</label>
          <input type="text" required className="w-full border p-2 rounded" 
             value={noHp} onChange={(e) => setNoHp(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" required className="w-full border p-2 rounded" 
             value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" required className="w-full border p-2 rounded" 
             value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? "Mendaftar..." : "Daftar Sekarang"}
        </button>
      </form>
      <p className="text-center mt-4 text-sm">
        Sudah punya akun? <Link href="/login" className="text-blue-600 font-bold">Login disini</Link> | <Link href="/" className="text-blue-600 font-bold">Ke Beranda</Link>
      </p>
    </div>
  );
}