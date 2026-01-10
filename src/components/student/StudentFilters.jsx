// src/components/student/StudentFilters.jsx
export default function StudentFilters({ search, setSearch }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <select className="border rounded px-3 py-2 text-sm w-40">
        <option>10 Entries</option>
        <option>25 Entries</option>
        <option>50 Entries</option>
      </select>

      <input
        type="text"
        placeholder="Search student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full md:w-64"
      />
    </div>
  );
}
