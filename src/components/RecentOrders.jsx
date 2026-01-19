export default function RecentOrders({ orders }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
      <h3 className="font-semibold mb-4 text-gray-800 ">
        Recent Orders
      </h3>

      <table className="w-full text-sm">
        <thead className="text-left text-gray-500 ">
          <tr>
            <th>Product</th>
            <th>Customer</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className="text-gray-500  pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <td>{o.product}</td>
              <td>{o.customer}</td>
              <td>{o.price}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs
                  ${o.status === "Delivered" && "bg-green-100 text-green-700"}
                  ${o.status === "Pending" && "bg-yellow-100 text-yellow-700"}
                  ${o.status === "Cancelled" && "bg-red-100 text-red-700"}
                `}
                >
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
