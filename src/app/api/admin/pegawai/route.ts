import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. POST: Tambah Pegawai dengan Jabatan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Ambil 'jabatan' dari data yang dikirim frontend
    const { email, password, nama, no_hp, alamat, jabatan } = body;

    // A. Buat Akun Auth
    // Kita simpan jabatan juga di metadata agar Login page bisa mendeteksinya
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: jabatan } // role akan berisi 'staff' atau 'mekanik'
    });

    if (authError) throw authError;

    // B. Simpan ke Tabel Pegawai
    if (authData.user) {
      const { error: dbError } = await supabaseAdmin
        .from('pegawai')
        .insert([{
          id_pegawai: authData.user.id,
          nama,
          email,
          no_hp,
          alamat,
          jabatan: jabatan // Simpan jabatan ke database
        }]);

      if (dbError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw dbError;
      }
    }

    return NextResponse.json({ message: 'Pegawai berhasil dibuat' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. DELETE (Tetap sama)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID Kosong' }, { status: 400 });

    await supabaseAdmin.auth.admin.deleteUser(id);
    await supabaseAdmin.from('pegawai').delete().eq('id_pegawai', id);

    return NextResponse.json({ message: 'Dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}