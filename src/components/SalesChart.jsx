import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5200 },
  { name: "Apr", sales: 4800 },
  { name: "May", sales: 6100 },
  { name: "Jun", sales: 7000 },
  { name: "Jul", sales: 8000 },
  { name: "Aug", sales: 3500 },
  { name: "Sep", sales: 4500 },
  { name: "Oct", sales: 2900 },
  { name: "Nov", sales: 6000 },
  { name: "Dec", sales: 9000 },
];

export default function SalesChart() {
  return (
    <div className="bg-white text-black rounded-xl p-5 shadow">
      <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#6366f1"
            fillOpacity={1}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
