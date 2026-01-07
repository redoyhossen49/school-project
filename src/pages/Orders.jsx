import { useState } from "react";

const ordersData = [
  {
    id: "#ORD-1001",
    customer: "John Doe",
    date: "2025-01-12",
    amount: "$320.00",
    status: "Completed",
  },
  {
    id: "#ORD-1002",
    customer: "Rahim Uddin",
    date: "2025-01-13",
    amount: "$150.00",
    status: "Pending",
  },
  {
    id: "#ORD-1003",
    customer: "Alex Smith",
    date: "2025-01-14",
    amount: "$980.00",
    status: "Cancelled",
  },
  {
    id: "#ORD-1004",
    customer: "Hasan Ali",
    date: "2025-01-15",
    amount: "$430.00",
    status: "Completed",
  },
];

const statusStyle = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function Orders() {
  const [search, setSearch] = useState("");

  const filteredOrders = ordersData.filter(
    (order) =>
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Orders</h1>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search order..."
            className="px-4 py-2 border rounded-lg text-sm outline-none placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="px-3 py-2 border rounded-lg text-sm">
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white text-black rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-left">
            <tr>
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order, i) => (
              <tr
                key={i}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 font-medium">{order.id}</td>
                <td className="px-6 py-4">{order.customer}</td>
                <td className="px-6 py-4">{order.date}</td>
                <td className="px-6 py-4">{order.amount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:underline text-sm">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 text-sm">
          <p className="text-gray-500">Showing 1–4 of 20</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-md">Prev</button>
            <button className="px-3 py-1 border rounded-md bg-blue-600 text-white">
              1
            </button>
            <button className="px-3 py-1 border rounded-md">2</button>
            <button className="px-3 py-1 border rounded-md">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
