

import { stats, orders } from "../data/dashBoardData";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Button from "../components/Button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Revenue",
        data: [12000, 19000, 15000, 22000, 18000, 26000, 30000],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `$${value}`,
        },
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
  return (
    <div className="space-y-6">
    <div className="flex flex-col md:flex-row gap-4 ">
     
        <div className="w-[60%] space-y-4">
        {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((item, i) => (
          <StatCard key={i} item={item} />
        ))}
      </div>
      <div className="">
          <SalesChart></SalesChart>
        </div>
         </div>
     <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[40%] space-y-6">
  
  {/* Header */}
  <div className="flex items-center justify-between">
    <h2 className="font-semibold text-lg">Revenue</h2>
    <select className="text-sm bg-gray-500  px-3 py-1 rounded-md">
      <option>This Month</option>
      <option>Last Month</option>
    </select>
  </div>

  {/* Amount */}
  <div>
    <h3 className="text-3xl font-bold">$48,290</h3>
    <p className="text-sm text-green-500 mt-1">
      ▲ 12.5% from last month
    </p>
     <Button  text="Login"
    type="submit"
    className="bg-red-500"></Button>
  </div>

  {/* Chart */}
  <div className="h-64">
   <Line data={data} options={options} />
  </div>

</div>
    </div>

     
      {/* Orders */}
      <RecentOrders orders={orders} />
    </div>
  );
}
