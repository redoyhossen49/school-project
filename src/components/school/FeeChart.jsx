// src/components/school/FeeChart.jsx
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function FeeChart({ data = [] }) {
  if (!data.length) return null;

  // X-axis key detect
  const xKey = data[0]?.type ? "type" : "label";

  return (
    <div className="w-full mt-6 h-[220px]  md:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
          barSize={18} // thin & clean
        >
          {/* Only horizontal dashed grid */}
          <CartesianGrid
            horizontal
            vertical={false}
            strokeDasharray="4 4"
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey={xKey}
            interval={0} // সব label দেখাবে
            angle={-35} // mobile friendly rotate
            textAnchor="end"
            height={60} // নিচে জায়গা
            tick={{
              fontSize: 10,
              fill: "#6b7280",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(value) => {
              if (value >= 1000000) return `${value / 1000000}M`;
              if (value >= 1000) return `${value / 1000}K`;
              return value;
            }}
            tick={{
              fontSize: window.innerWidth < 640 ? 10 : 12,
              fill: "#6b7280",
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
            contentStyle={{
              backgroundColor: "#111827",
              borderRadius: "8px",
              border: "none",
              color: "#fff",
              fontSize: "10px", // small device friendly
              padding: "6px 8px", // cramped না হয়
            }}
            itemStyle={{
              fontSize: "10px", // small device readable
            }}
            wrapperStyle={{
              zIndex: 1000,
            }}
          />

          <Legend
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "10px",
            }}
          />

          {/* Stacked Bars */}
          <Bar
            dataKey="collected"
            stackId="a"
            fill="#4ade80"
            name="Collected"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="due"
            stackId="a"
            fill="#f87171"
            name="Due"
            radius={[0, 0, 4, 4]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
