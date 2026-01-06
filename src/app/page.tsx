/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase"; 
import { Motor } from "@/types";

export default function LandingPage() {
  const [featuredMotor, setFeaturedMotor] = useState<Motor[]>([]);

  // Ambil 3 Motor acak/teratas untuk display
  useEffect(() => {
    const fetchFeatured = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("motor")
        .select("*")
        .eq("status", "tersedia")
        .limit(3); 
      
      setFeaturedMotor(data || []);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen font-sans text-slate-900">
      
      {/* === 1. NAVBAR (Sticky) === */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10 shadow-md transition-all">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/40">
              R
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-wider leading-none text-emerald-400 drop-shadow-sm">
                RENTAL
              </h1>
              <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-medium">
                Gorontalo
              </p>
            </div>
          </div>

          {/* Menu Desktop */}
          <div className="flex items-center gap-8 text-sm font-medium text-slate-200">
            <a href="#katalog" className="hover:text-emerald-400 transition hidden md:block">Katalog Motor</a>
            <a href="#tentang" className="hover:text-emerald-400 transition hidden md:block">Tentang Kami</a>
            
            {/* TOMBOL LOGIN STAFF */}
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white px-5 py-2.5 rounded-full font-bold transition-all duration-300 group"
            >
              <span className="text-emerald-400 group-hover:text-white transition">Login Staff</span> 
            </Link>
          </div>
        </div>
      </nav>

      {/* === 2. HERO SECTION === */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        
        {/* Background Image Gelap */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900 z-10"></div>
          <img 
            src="https://news.batampos.co.id/storage/2023/03/yamaha-2.jpg" 
            alt="Background Motor" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-16">
          <span className="inline-block py-2 px-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold mb-6 uppercase tracking-widest backdrop-blur-sm animate-fade-in-up">
            Solusi Transportasi Terbaik
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
            Jelajahi Gorontalo <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Tanpa Batas.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Sewa motor premium dengan harga terjangkau. Armada terawat, helm bersih, dan siap menemani perjalanan Anda kapan saja.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="#katalog" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-xl shadow-emerald-500/20 transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Pilih Motor Sekarang
            </a>
            <Link 
              href="/register"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <span>👤</span> Daftar Disini
            </Link>
          </div>
        </div>
      </header>

      {/* === 3. STATISTIK === */}
      <div className="bg-slate-900 py-12 border-b border-slate-800 relative z-20 -mt-10 mx-4 md:mx-20 rounded-xl shadow-2xl flex flex-wrap justify-center gap-8 md:gap-20 text-center text-white">
          <div>
            <h3 className="text-4xl font-bold text-emerald-400">50+</h3>
            <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">Unit Ready</p>
          </div>
          <div className="w-px bg-slate-800 hidden md:block"></div>
          <div>
            <h3 className="text-4xl font-bold text-emerald-400">24/7</h3>
            <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">Layanan Admin</p>
          </div>
          <div className="w-px bg-slate-800 hidden md:block"></div>
          <div>
            <h3 className="text-4xl font-bold text-emerald-400">100%</h3>
            <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">Terawat Rutin</p>
          </div>
      </div>

      {/* === 4. KATALOG PREVIEW === */}
      <section id="katalog" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Pilihan Pelanggan</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Armada Populer 🔥</h2>
            </div>
            <Link href="/katalog" className="text-slate-600 hover:text-emerald-600 font-bold flex items-center gap-2 transition">
              Lihat Semua <span className="text-xl">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredMotor.map((m) => (
              <div key={m.id_motor} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group flex flex-col h-full">
                <div className="h-60 overflow-hidden relative bg-slate-100">
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 text-slate-700">
                    {(m as any).tahun}
                  </div>
                  {m.gambar_motor ? (
                    <img src={m.gambar_motor} alt={m.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image</div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{m.model}</h3>
                    <p className="text-slate-500 text-sm">{m.merk}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Mulai dari</p>
                      <p className="text-lg font-bold text-emerald-600">Rp {parseInt(m.harga_per_hari.toString()).toLocaleString('id-ID')}</p>
                    </div>
                    {/* === BAGIAN INI YANG DIUBAH (TOMBOL WHATSAPP) === */}
                    <Link 
                      href={`https://wa.me/628988891921?text=Halo,%20saya%20mau%20sewa%20${m.model}`} 
                      className="w-10 h-10 bg-slate-900 hover:bg-[#25D366] hover:border-[#25D366] rounded-full flex items-center justify-center text-white transition shadow-lg group-btn"
                      target="_blank"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 5. KENAPA KAMI? === */}
      <section id="tentang" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* BAGIAN KIRI: Gambar */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative z-10">
                <img 
                  src="https://awsimages.detik.net.id/community/media/visual/2025/10/24/modifikasi-xmax-1761275394949_43.jpeg?w=600&q=90" 
                  className="rounded-3xl shadow-2xl w-full object-cover h-[500px] hover:scale-[1.01] transition duration-500"
                  alt="Layanan Rental Terbaik"
                />
                
                {/* Floating Card */}
                <div className="absolute -bottom-6 -right-6 md:right-10 bg-white p-5 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Rating Google</p>
                    <p className="text-xl font-bold text-slate-800">5.0 / 5.0 ⭐</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BAGIAN KANAN: Text */}
            <div className="order-1 lg:order-2">
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4">
                Kenapa Memilih Kami?
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Partner Perjalanan <br/>
                <span className="text-emerald-500">Terpercaya & Aman.</span>
              </h2>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                Nikmati sensasi berkeliling Gorontalo dengan unit motor yang selalu dalam kondisi prima, bersih, dan legalitas terjamin.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Syarat Mudah", desc: "Cukup KTP Asli", icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2", color: "text-blue-600", bg: "bg-blue-100" },
                  { title: "Unit Terbaru", desc: "Tahun 2023 Up", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-600", bg: "bg-emerald-100" },
                  { title: "Helm Bersih", desc: "2 Helm SNI Wangi", icon: "M9.172 16.172a4 4 0 015.656 0M9 10a9 9 0 011 0v1m-6.586-4.586a2 2 0 112.828-2.828L6 4.828m9.172 0a2 2 0 112.828 2.828L17.172 4m-4.5 12h.01", color: "text-orange-600", bg: "bg-orange-100" },
                  { title: "Antar Jemput", desc: "Bandara / Hotel", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", color: "text-purple-600", bg: "bg-purple-100" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition duration-300 group">
                    <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* === 6. FOOTER === */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">RENTAL MOTOR GORONTALO</h2>
          <p className="mb-6">Jalan Jalan No. 77, Gorontalo</p>
          <div className="flex justify-center gap-6 mb-8 text-sm font-bold">
            <a href="#" className="hover:text-emerald-400 transition">INSTAGRAM</a>
            <a href="#" className="hover:text-emerald-400 transition">WHATSAPP</a>
            <a href="#" className="hover:text-emerald-400 transition">FACEBOOK</a>
          </div>
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Rental Motor Premium System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}