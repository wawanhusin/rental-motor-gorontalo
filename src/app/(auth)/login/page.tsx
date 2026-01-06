"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    // 1. Proses Login ke Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login Gagal: " + error.message);
      setLoading(false);
      return;
    }

    // 2. LOGIKA PENGARAHAN HALAMAN (ROUTING)
    if (data.user) {
      
      const role = data.user.user_metadata?.role; // Ambil role

      // A. Admin
      if (email.includes("admin")) {
        router.push("/admin/dashboard");
      } 
      
      // B. Pegawai (Staff) ATAU Mekanik
      // Keduanya kita arahkan ke Dashboard Pegawai (Nanti di dashboard baru kita batasi fiturnya)
      else if (role === 'pegawai' || role === 'staff' || role === 'mekanik') {
        
        // Opsional: Jika Mekanik, langsung arahkan ke halaman Maintenance
        if (role === 'mekanik') {
           router.push("/pegawai/kendaraan");
        } else {
           router.push("/pegawai/transaksi");
        }
      }
      
      // C. Pelanggan
      else {
        router.push("/pelanggan/katalog");
      }
      
      router.refresh();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Masuk Aplikasi</h2>
      
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
          <input 
            type="email" 
            required 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
            placeholder="nama@email.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
          <input 
            type="password" 
            required 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
            placeholder="••••••••"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <button 
          disabled={loading} 
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:bg-gray-400 transition shadow-lg"
        >
          {loading ? "Sedang Memproses..." : "Masuk Sekarang"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-slate-500">
        Kembali Ke <Link href="/" className="text-blue-600 font-bold hover:underline">Beranda</Link>
      </p>
    </div>
  );
}