import StatCard from "../components/StatCard";
import { dashboardData } from "../data/dashBoardData";

export default function DashboardPage() {
  const role = localStorage.getItem("role") || "student";

  const cards = dashboardData[role] || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white rounded-xl p-6">
        <h2 className="text-xl font-semibold">
          Welcome Back, {role.charAt(0).toUpperCase() + role.slice(1)}
        </h2>
        <p className="text-sm opacity-80">
          Have a good day at work
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((item, index) => (
          <StatCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
}
