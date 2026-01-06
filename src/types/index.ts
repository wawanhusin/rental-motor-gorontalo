// src/types/index.ts

// Tipe data untuk tabel 'motor'
export type Motor = {
  id_motor: string;
  created_at: string;
  merk: string;
  model: string;
  plat_nomor: string;
  harga_per_hari: number;
  status: 'tersedia' | 'terpakai'; // Enum sesuai database
  gambar_motor: string | null;     // Bisa null jika belum ada gambar
};

// Tipe data untuk tabel 'pelanggan'
export type Pelanggan = {
  id_pelanggan: string;
  created_at: string;
  nama: string;
  alamat: string | null;
  no_hp: string | null;
  email: string;
  foto: string | null;
};

// Tipe data untuk tabel 'transaksi'
export type Transaksi = {
  id_transaksi: string;
  created_at: string;
  id_pelanggan: string;
  id_motor: string;
  tgl_mulai: string;
  tgl_kembali: string;
  total_harga: number;
  status_transaksi: 'pending' | 'lunas' | 'selesai' | 'dibatalkan';
  bukti_transfer: string | null;
};