import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../../context/ThemeContext.jsx";
import Pagination from "../../components/Pagination.jsx";
import FormModal from "../../components/FormModal.jsx";
import ReusableTable from "./ReusableTable.jsx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Dynamic Filter Section Component
function TableFilters({ filterConfig = [], filterValues, setFilterValues, darkMode, sortOrder, setSortOrder }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2">
      <div className="flex flex-col md:flex-row gap-2 md:gap-2 w-full md:w-auto">
        {filterConfig.map((f, idx) => (
          <div key={idx} className="relative flex-1 md:flex-none md:w-28">
            <select
              value={filterValues[f.key] || ""}
              onChange={(e) =>
                setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
              className={`appearance-none w-full rounded border px-2 py-2 text-xs shadow-sm pr-6 ${
                darkMode ? "bg-gray-700 border-gray-500 text-gray-200" : "bg-white border-gray-200"
              }`}
            >
              <option value="">{f.label}</option>
              {f.options?.map((opt, idx2) => (
                <option key={idx2} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <BiChevronDown className="text-xs text-gray-500 dark:text-gray-200" />
            </div>
          </div>
        ))}

        {/* Sort Button */}
        <div className="flex-1 md:flex-none md:w-28">
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className={`w-full flex items-center justify-center rounded border px-2 py-2 text-xs shadow-sm ${
              darkMode ? "bg-gray-700 border-gray-500" : "bg-white border-gray-200"
            }`}
          >
            Sort {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Reusable List Page
export default function ReusableListPage({
  title,
  breadcrumbs = [],
  data = [],
  columns = [],
  formFields = [],
  onSubmit,
  filters = [],        // old filters for initial state
  filterConfig = [],   // new dynamic filters for UI
  canEdit = false,
  extraTableProps = {},
}) {
  const { darkMode } = useTheme();

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState(
    Object.fromEntries(filterConfig.map((f) => [f.key, ""]))
  );
  const [sortOrder, setSortOrder] = useState("asc");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const filterRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRefresh = () => {
    setSearch("");
    setSortOrder("asc");
    setCurrentPage(1);
    setFilterValues(Object.fromEntries(filterConfig.map((f) => [f.key, ""])));
  };

  // Filter + Search + Sort
  let filteredData = data.filter((item) =>
    columns.some((c) =>
      item[c.key]?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  filterConfig.forEach((f) => {
    filteredData = filteredData.filter((item) =>
      filterValues[f.key] ? item[f.key] === filterValues[f.key] : true
    );
  });

  filteredData.sort((a, b) =>
    sortOrder === "asc" ? a.id - b.id : b.id - a.id
  );

  const perPage = 10;
  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Excel export
  const exportExcel = () => {
    if (!currentData.length) return;

    const wsData = currentData.map((row) =>
      columns.reduce((acc, col) => {
        acc[col.label] = row[col.key];
        return acc;
      }, {})
    );

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title}.xlsx`);
    setExportOpen(false);
  };

  // PDF export
  const exportPDF = () => {
    if (!currentData.length) return;

    const doc = new jsPDF();
    const head = [columns.map((c) => c.label)];
    const body = currentData.map((row) => columns.map((c) => row[c.key]));

    doc.autoTable({ head, body, styles: { fontSize: 8 }, startY: 20 });
    doc.save(`${title}.pdf`);
    setExportOpen(false);
  };

  return (
    <div className="p-3 space-y-4">
      {/* Header */}
      <div className={`rounded-md p-3 space-y-3 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Title + Breadcrumb */}
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-xs text-blue-400">
              {breadcrumbs.map((b, idx) => (
                <span key={idx}>
                  {b.link ? (
                    <Link to={b.link} className="hover:text-blue-700">{b.name}</Link>
                  ) : b.name}
                  {idx < breadcrumbs.length - 1 ? " / " : ""}
                </span>
              ))}
            </p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-2 w-full md:w-auto">
            <button onClick={handleRefresh} className={`w-full md:w-28 flex items-center gap-1 rounded border px-2 py-2 text-xs shadow-sm ${darkMode ? "bg-gray-700 border-gray-500" : "bg-white border-gray-200"}`}>
              Refresh
            </button>

            <div ref={filterRef} className="relative w-full md:w-28">
              <button onClick={() => setExportOpen(!exportOpen)} className={`w-full flex items-center justify-between gap-1 rounded border px-2 py-2 text-xs shadow-sm ${darkMode ? "bg-gray-700 border-gray-500" : "bg-white border-gray-200"}`}>
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div className={`absolute right-0 mt-1 w-28 rounded border shadow-md z-50 ${darkMode ? "bg-gray-700 text-gray-200 border-gray-500" : "bg-white text-gray-800 border-gray-300"}`}>
                  <button onClick={exportExcel} className="block w-full text-left px-2 py-1 text-xs hover:bg-blue-50 dark:hover:bg-gray-600">Excel</button>
                  <button onClick={exportPDF} className="block w-full text-left px-2 py-1 text-xs hover:bg-blue-50 dark:hover:bg-gray-600">PDF</button>
                </div>
              )}
            </div>

            {canEdit && (
              <button onClick={() => setAddModalOpen(true)} className="w-full md:w-28 flex items-center gap-1 rounded bg-blue-600 px-2 py-2 text-xs text-white">
                Add
              </button>
            )}

            <FormModal
              open={addModalOpen}
              title={`Add ${title}`}
              initialValues={Object.fromEntries(formFields.map((f) => [f.name, ""]))}
              onClose={() => setAddModalOpen(false)}
              onSubmit={onSubmit}
              fields={formFields}
            />
          </div>
        </div>

        {/* Dynamic Filters */}
        <TableFilters
          filterConfig={filterConfig}
          filterValues={filterValues}
          setFilterValues={setFilterValues}
          darkMode={darkMode}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Search + Pagination */}
        <div className="flex items-center gap-2 md:mt-0 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className={`w-full md:w-64 rounded border px-3 py-2 text-xs shadow-sm focus:outline-none ${darkMode ? "bg-gray-700 border-gray-500 text-gray-200" : "bg-white border-gray-200"}`}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-md p-2 overflow-x-auto ${darkMode ? "bg-gray-900" : "bg-white"}`}>
        <ReusableTable data={currentData} columns={columns} {...extraTableProps} />
      </div>
    </div>
  );
}
