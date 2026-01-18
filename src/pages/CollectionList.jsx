import { useState, useRef, useEffect } from "react";
import { collectionData } from "../data/collectionData.js";
import CollectiontTable from "../components/collection/CollectiontTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";
import { BiChevronDown } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import ReusableEditModal from "../components/common/ReusableEditModal.jsx";

export default function CollectionList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [collections, setCollections] = useState(collectionData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const collectionsPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    className: "",
    group: "",
    section: "",
    session: "",
  });
  const [editingCollection, setEditingCollection] = useState(null);

  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  // ===== Close dropdowns on outside click =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== Filter + Sort Logic =====
  const filteredCollections = collections
    .filter((c) =>
      c.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      c.class?.toLowerCase().includes(search.toLowerCase()) ||
      c.group?.toLowerCase().includes(search.toLowerCase()) ||
      c.fees_type?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((c) => {
      if (filters.className && c.class !== filters.className) return false;
      if (filters.group && c.group !== filters.group) return false;
      if (filters.section && c.section !== filters.section) return false;
      if (filters.session && c.session !== filters.session) return false;
      return true;
    })
    .sort((a, b) => {
      return sortOrder === "oldest" ? a.sl - b.sl : b.sl - a.sl;
    });

  const totalCollections = filteredCollections.length;
  const totalPages = Math.ceil(totalCollections / collectionsPerPage);
  const currentCollections = filteredCollections.slice(
    (currentPage - 1) * collectionsPerPage,
    currentPage * collectionsPerPage
  );

  // ===== EXPORT EXCEL =====
  const exportExcel = (data) => {
    if (!data.length) return;

    const sheetData = data.map((c, i) => ({
      Sl: i + 1,
      "Student id": c.student_id,
      Class: c.class,
      Group: c.group,
      Section: c.section,
      Session: c.session,
      "Fees Type": c.fees_type,
      "Total payable": c.total_payable,
      "Payable due": c.payable_due,
      "Pay type": c.pay_type,
      "Type amount": c.type_amount,
      "Total due": c.total_due,
      "Pay Date": c.pay_date,
    }));

    const ws = utils.json_to_sheet(sheetData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Collections");
    writeFile(wb, "Collections_List.xlsx");
  };

  // ===== EXPORT PDF =====
  const exportPDF = (data) => {
    if (!data.length) return;

    const doc = new jsPDF("landscape", "pt", "a4");

    const columns = [
      "Sl",
      "Student id",
      "Class",
      "Group",
      "Section",
      "Session",
      "Fees Type",
      "Total payable",
      "Payable due",
      "Pay type",
      "Type amount",
      "Total due",
      "Pay Date",
    ];

    const rows = data.map((c, i) => [
      i + 1,
      c.student_id,
      c.class,
      c.group,
      c.section,
      c.session,
      c.fees_type,
      c.total_payable,
      c.payable_due,
      c.pay_type,
      c.type_amount,
      c.total_due,
      c.pay_date,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("Collections_List.pdf");
  };

  const handleRefresh = () => {
    setCollections(collectionData);
    setSearch("");
    setFilters({ className: "", group: "", section: "", session: "" });
    setSortOrder("newest");
    setCurrentPage(1);
  };

  // Generate dynamic options from collectionData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  const classOptions = getUniqueOptions(collectionData, "class");
  const groupOptions = getUniqueOptions(collectionData, "group");
  const sectionOptions = getUniqueOptions(collectionData, "section");
  const sessionOptions = getUniqueOptions(collectionData, "session");
  const feesTypeOptions = getUniqueOptions(collectionData, "fees_type");
  const payTypeOptions = ["Due", "Payable", "Advance"];

  // Handle collection form submit (edit only)
  const handleCollectionFormSubmit = (formData) => {
    if (editingCollection) {
      const updatedCollection = {
        ...editingCollection,
        student_id: formData.student_id,
        class: formData.class,
        group: formData.group,
        section: formData.section,
        session: formData.session,
        fees_type: formData.fees_type,
        total_payable: parseFloat(formData.total_payable) || 0,
        payable_due: parseFloat(formData.payable_due) || 0,
        pay_type: formData.pay_type,
        type_amount: parseFloat(formData.type_amount) || 0,
        total_due: parseFloat(formData.total_due) || 0,
        pay_date: formData.pay_date || new Date().toISOString().split("T")[0],
      };
      setCollections(
        collections.map((c) =>
          c.sl === editingCollection.sl ? updatedCollection : c
        )
      );
      setEditingCollection(null);
      alert("Collection updated successfully ✅");
    }
  };

  // Collection form fields for ReusableEditModal
  const collectionFields = [
    {
      name: "student_id",
      label: "Student id",
      type: "text",
      required: true,
    },
    {
      name: "class",
      label: "Class",
      type: "select",
      options: classOptions,
      required: true,
    },
    {
      name: "group",
      label: "Group",
      type: "select",
      options: groupOptions,
      required: true,
    },
    {
      name: "section",
      label: "Section",
      type: "select",
      options: sectionOptions,
      required: true,
    },
    {
      name: "session",
      label: "Session",
      type: "select",
      options: sessionOptions,
      required: true,
    },
    {
      name: "fees_type",
      label: "Fees Type",
      type: "select",
      options: feesTypeOptions,
      required: true,
    },
    {
      name: "total_payable",
      label: "Total payable",
      type: "number",
      required: true,
    },
    {
      name: "payable_due",
      label: "Payable due",
      type: "number",
      required: true,
    },
    {
      name: "pay_type",
      label: "Pay type",
      type: "select",
      options: payTypeOptions,
      required: true,
    },
    {
      name: "type_amount",
      label: "Type amount",
      type: "number",
      required: true,
    },
    {
      name: "total_due",
      label: "Total due",
      type: "number",
      required: true,
    },
    {
      name: "pay_date",
      label: "Pay Date",
      type: "date",
      required: true,
    },
  ];

  const cardBg = darkMode
    ? "bg-gray-800 text-gray-100"
    : "bg-white text-gray-800";

  const borderClr = darkMode ? "border-gray-600" : "border-gray-200";

  const inputBg = darkMode
    ? "bg-gray-700 text-white"
    : "bg-white text-gray-800";

  return (
    <div className="p-3 space-y-4">
      {/* ===== TOP SECTION ===== */}
      <div className={`space-y-4 p-3 ${cardBg}`}>
        <div className="md:flex md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <h2 className="text-base font-semibold">Collection List</h2>
            <p className="text-xs text-gray-400 flex flex-wrap items-center gap-x-1">
              <Link to={`/${canEdit ? "school" : ""}/dashboard`} className="hover:text-indigo-600">
                Dashboard
              </Link>
              <span>/</span>
              <button
                onClick={() =>
                  navigate(
                    `/${canEdit ? "school" : ""}/dashboard/fee/collection`
                  )
                }
                className="hover:text-indigo-600 cursor-pointer"
              >
                Collection List
              </button>
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={handleRefresh}
              className={`flex items-center shadow-sm px-3 py-2 text-xs w-24 rounded border ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={`flex items-center justify-between shadow-sm px-3 py-2 text-xs w-24 border ${borderClr} ${inputBg}`}
              >
                Export <BiChevronDown />
              </button>
              {exportOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border shadow-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredCollections)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredCollections)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => {
                  const userRole = localStorage.getItem("role");
                  const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
                  navigate(`${basePath}/fee/addcollection`);
                }}
                className="flex items-center justify-center shadow-sm bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
              >
                Add Collection
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <button
            onClick={handleRefresh}
            className={`w-full flex items-center justify-center shadow-sm px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
          >
            Refresh
          </button>

          <div className="relative w-full" ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className={`w-full flex items-center justify-center shadow-sm px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredCollections)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredCollections)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => {
                const userRole = localStorage.getItem("role");
                const basePath = userRole === "school" ? "/school/dashboard" : "/teacher/dashboard";
                navigate(`${basePath}/fee/addcollection`);
              }}
              className={`w-full flex items-center justify-center shadow-sm bg-blue-600 px-3 h-8 text-xs text-white hover:bg-blue-700 ${
                canEdit ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              Add Collection
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="space-y-3 md:flex md:items-center md:justify-between md:gap-4 md:space-y-0">
          <div className="grid grid-cols-2 gap-2 md:flex md:w-auto items-center">
            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full flex items-center justify-center shadow-sm md:px-3 md:w-24 px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Collections"
                fields={[
                  {
                    key: "className",
                    label: "Class",
                    options: classOptions,
                    placeholder: "Select Class",
                  },
                  {
                    key: "group",
                    label: "Group",
                    options: groupOptions,
                    placeholder: "Select Group",
                  },
                  {
                    key: "section",
                    label: "Section",
                    options: sectionOptions,
                    placeholder: "Select Section",
                  },
                  {
                    key: "session",
                    label: "Session",
                    options: sessionOptions,
                    placeholder: "Select Session",
                  },
                ]}
                selected={filters}
                setSelected={setFilters}
                darkMode={darkMode}
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={() => setCurrentPage(1)}
                buttonRef={filterRef}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className={`w-full flex items-center justify-center shadow-sm md:px-3 md:w-24 px-3 h-8 text-xs border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-full md:w-36 z-40 border shadow-sm ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    className="w-full px-3 h-6 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpen(false);
                    }}
                  >
                    First
                  </button>
                  <button
                    className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100"
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpen(false);
                    }}
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:mt-0 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student id, class, fees type..."
              className={`w-full md:w-64 ${borderClr} ${inputBg} border px-3 h-8 shadow-sm text-xs focus:outline-none`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ===== COLLECTION TABLE ===== */}
      <div
        className={`${
          darkMode ? "bg-gray-900" : "bg-white"
        } p-2 overflow-x-auto`}
      >
        <CollectiontTable
          data={currentCollections}
          setData={setCollections}
          onEdit={(collection) => setEditingCollection(collection)}
        />
      </div>

      {/* Collection Edit Modal */}
      <ReusableEditModal
        open={editingCollection !== null}
        title="Edit Collection"
        item={editingCollection}
        onClose={() => setEditingCollection(null)}
        onSubmit={handleCollectionFormSubmit}
        fields={collectionFields}
        getInitialValues={(item) => ({
          ...item,
          pay_date: item.pay_date || new Date().toISOString().split("T")[0],
        })}
      />
    </div>
  );
}
