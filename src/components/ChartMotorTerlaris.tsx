"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

type Props = {
  dataTransaksi: any[];
};

export default function ChartMotorTerlaris({ dataTransaksi }: Props) {
  // 1. OLAH DATA: Hitung frekuensi penyewaan per motor
  const hitungData = () => {
    const mapMotor: Record<string, number> = {};

    dataTransaksi.forEach((t) => {
      // Ambil nama motor dari relasi (pastikan tidak null)
      const namaMotor = t.motor ? `${t.motor.merk} ${t.motor.model}` : "Unknown";
      
      // Jika motor sudah ada di map, tambah 1. Jika belum, set 1.
      if (mapMotor[namaMotor]) {
        mapMotor[namaMotor] += 1;
      } else {
        mapMotor[namaMotor] = 1;
      }
    });

    // Ubah format Map ke Array biar bisa dibaca Recharts
    // Format: [{ name: "Vario", jumlah: 5 }, { name: "Nmax", jumlah: 3 }]
    const dataSiap = Object.keys(mapMotor).map((key) => ({
      name: key,
      jumlah: mapMotor[key],
    }));

    // Urutkan dari yang terbanyak
    return dataSiap.sort((a, b) => b.jumlah - a.jumlah).slice(0, 5); // Ambil Top 5
  };

  const dataChart = hitungData();
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink'];

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h3 className="text-lg font-bold mb-4 text-gray-700">Top 5 Motor Paling Laris</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{fontSize: 12}} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {dataChart.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % 20]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}