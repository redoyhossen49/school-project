import { useState, useRef, useEffect } from "react";
import { feeTypeData } from "../data/feeTypeData.js";
import { feesTypeData } from "../data/feesTypeData.js";
import FeeTypeTable from "../components/fee/FeeTypeTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import ReusableEditModal from "../components/common/ReusableEditModal.jsx";

// Load data from localStorage and merge with static data
const loadFeeTypes = () => {
  const storedData = localStorage.getItem("feeTypes");
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      // Merge with static data, avoiding duplicates by sl
      const staticMap = new Map(feeTypeData.map(item => [item.sl, item]));
      parsedData.forEach(item => {
        if (!staticMap.has(item.sl)) {
          staticMap.set(item.sl, item);
        }
      });
      return Array.from(staticMap.values()).sort((a, b) => (a.sl || 0) - (b.sl || 0));
    } catch (e) {
      console.error("Error loading fee types from localStorage:", e);
      return feeTypeData;
    }
  }
  return feeTypeData;
};

// Save fees to localStorage
const saveFeeTypes = (feeData) => {
  try {
    localStorage.setItem("feeTypes", JSON.stringify(feeData));
  } catch (e) {
    console.error("Error saving fee types to localStorage:", e);
  }
};

export default function FeeTypeList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [fees, setFees] = useState(loadFeeTypes());
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const feesPerPage = 20;

  const userRole = localStorage.getItem("role");
  const canEdit = userRole === "school";

  const [selectedDate, setSelectedDate] = useState("Monthly");
  const [dateOpen, setDateOpen] = useState(false);
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
  const [editingFee, setEditingFee] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateFeesModal, setShowCreateFeesModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  const [feesName, setFeesName] = useState("");

  // Handle modal opening animation
  useEffect(() => {
    if (showCreateFeesModal) {
      setIsModalClosing(false);
      // Trigger opening animation after a small delay
      setTimeout(() => {
        setIsModalOpening(true);
      }, 10);
    } else {
      setIsModalOpening(false);
    }
  }, [showCreateFeesModal]);

  const dateDropdownRef = useRef(null);
  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const dateOptions = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  // ===== Close dropdowns on outside click =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(e.target)
      ) {
        setDateOpen(false);
      }
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
  const filteredFees = fees
    .filter((f) => 
      f.class?.toLowerCase().includes(search.toLowerCase()) ||
      f.group?.toLowerCase().includes(search.toLowerCase()) ||
      f.section?.toLowerCase().includes(search.toLowerCase()) ||
      f.session?.toLowerCase().includes(search.toLowerCase()) ||
      f.fees_type?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((f) => {
      // Cumulative filtering: only apply if value is selected
      if (filters.className && f.class !== filters.className) return false;
      if (filters.group && f.group !== filters.group) return false;
      if (filters.section && f.section !== filters.section) return false;
      if (filters.session && f.session !== filters.session) return false;
      return true;
    })
    .sort((a, b) => {
      return sortOrder === "oldest" ? a.sl - b.sl : b.sl - a.sl;
    });

  const totalFees = filteredFees.length;
  const totalPages = Math.ceil(totalFees / feesPerPage);
  const currentFees = filteredFees.slice(
    (currentPage - 1) * feesPerPage,
    currentPage * feesPerPage
  );

  // ===== EXPORT EXCEL =====
  const exportExcel = (data) => {
    if (!data.length) return;

    const sheetData = data.map((f, i) => ({
      Sl: i + 1,
      Class: f.class,
      Group: f.group,
      Section: f.section,
      Session: f.session,
      "Fees Type": f.fees_type,
      Amount: f.fees_amount,
      "Total Payable": f.total_payable || f.fees_amount,
      "Payable Due": f.payable_due !== undefined ? f.payable_due : (f.total_payable || f.fees_amount),
      "Payable Last Date": f.payable_last_date || "N/A",
    }));

    const ws = utils.json_to_sheet(sheetData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Fee Types");
    writeFile(wb, "Fee_Types_List.xlsx");
  };

  // ===== EXPORT PDF =====
  const exportPDF = (data) => {
    if (!data.length) return;

    const doc = new jsPDF("landscape", "pt", "a4");

    const columns = [
      "Sl",
      "Class",
      "Group",
      "Section",
      "Session",
      "Fees Type",
      "Amount",
      "Total Payable",
      "Payable Due",
      "Payable Last Date",
    ];

    const rows = data.map((f, i) => [
      i + 1,
      f.class,
      f.group,
      f.section,
      f.session,
      f.fees_type,
      f.fees_amount,
      f.total_payable || f.fees_amount,
      f.payable_due !== undefined ? f.payable_due : (f.total_payable || f.fees_amount),
      f.payable_last_date || "N/A",
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("Fee_Types_List.pdf");
  };

  const handleRefresh = () => {
    setFees(loadFeeTypes());
    setSearch("");
    setFilters({ className: "", group: "", section: "", session: "" });
    setSortOrder("newest");
    setSelectedDate("Monthly");
    setCurrentPage(1);
  };

  // Reload data when component mounts
  useEffect(() => {
    setFees(loadFeeTypes());
  }, []);

  // Custom event listener for localStorage changes within same window
  useEffect(() => {
    const handleCustomStorageChange = () => {
      setFees(loadFeeTypes());
      // Update fees type options when fees are updated
      setFeesTypeOptions(getFeesTypeOptions());
    };
    
    // Listen for custom storage event (for same-window updates)
    window.addEventListener('feeTypesUpdated', handleCustomStorageChange);
    window.addEventListener('feesUpdated', handleCustomStorageChange);
    
    // Also listen for storage events (when localStorage changes in another tab/window)
    window.addEventListener('storage', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('feeTypesUpdated', handleCustomStorageChange);
      window.removeEventListener('feesUpdated', handleCustomStorageChange);
      window.removeEventListener('storage', handleCustomStorageChange);
    };
  }, []);

  // Load fees from localStorage
  const loadFees = () => {
    const storedData = localStorage.getItem("fees");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error("Error loading fees from localStorage:", e);
        return [];
      }
    }
    return [];
  };

  // Generate dynamic options from feeData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  // Get all data (static + localStorage)
  const getAllFeeTypeData = () => {
    const storedData = localStorage.getItem("feeTypes");
    const storedItems = storedData ? JSON.parse(storedData) : [];
    return [...feeTypeData, ...storedItems];
  };

  // Get class options
  const classOptions = getUniqueOptions(getAllFeeTypeData(), "class");

  // Get group options based on selected class
  const getGroupOptions = (selectedClass) => {
    if (!selectedClass) return getUniqueOptions(getAllFeeTypeData(), "group");
    const filtered = getAllFeeTypeData().filter(item => item.class === selectedClass);
    return getUniqueOptions(filtered, "group");
  };

  // Get section options based on selected class and group
  const getSectionOptions = (selectedClass, selectedGroup) => {
    if (!selectedClass && !selectedGroup) return getUniqueOptions(getAllFeeTypeData(), "section");
    let filtered = getAllFeeTypeData();
    if (selectedClass) filtered = filtered.filter(item => item.class === selectedClass);
    if (selectedGroup) filtered = filtered.filter(item => item.group === selectedGroup);
    return getUniqueOptions(filtered, "section");
  };

  const sessionOptions = getUniqueOptions(getAllFeeTypeData(), "session");
  
  // For filter dropdown - use all options (not filtered)
  const groupOptions = getUniqueOptions(getAllFeeTypeData(), "group");
  const sectionOptions = getUniqueOptions(getAllFeeTypeData(), "section");
  
  // Get fees type options from both static data (feesTypeData.js) and localStorage - make it dynamic
  const getFeesTypeOptions = () => {
    const staticFeesTypeOptions = feesTypeData || [];
    const createdFees = loadFees();
    const createdFeesNames = createdFees.map(fee => fee.name).filter(Boolean);
    // Merge and remove duplicates
    return [...new Set([...staticFeesTypeOptions, ...createdFeesNames])];
  };

  const [feesTypeOptions, setFeesTypeOptions] = useState(getFeesTypeOptions());
  
  // Handle add fee form submit
  const handleAddFeeFormSubmit = (formData) => {
    // Validate required fields
    if (
      !formData.class ||
      !formData.group ||
      !formData.section ||
      !formData.session ||
      !formData.fees_type ||
      !formData.fees_amount
    ) {
      alert("Please fill all required fields");
      return;
    }

    // Get existing data from localStorage
    const storedData = localStorage.getItem("feeTypes");
    const existingData = storedData ? JSON.parse(storedData) : [];
    
    // Generate new serial number
    const maxSl = existingData.length > 0 
      ? Math.max(...existingData.map(item => item.sl || 0))
      : feeTypeData.length > 0
      ? Math.max(...feeTypeData.map(item => item.sl || 0))
      : 0;
    
    // Create new fee type entry
    // Note: total_payable and payable_due will be calculated by backend
    const newFeeType = {
      sl: maxSl + 1,
      group_name: formData.group, // Keep group_name for backward compatibility
      class: formData.class,
      group: formData.group,
      section: formData.section,
      session: formData.session,
      fees_type: formData.fees_type,
      fees_amount: parseFloat(formData.fees_amount) || 0,
      payable_last_date: formData.payable_last_date || "",
      // total_payable and payable_due will be calculated by backend - not included here
    };

    // Add to localStorage
    const updatedData = [...existingData, newFeeType];
    localStorage.setItem("feeTypes", JSON.stringify(updatedData));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('feeTypesUpdated'));

    // Update local state
    setFees(loadFeeTypes());
    setShowAddModal(false);
    
    console.log("FEE TYPE DATA SAVED TO LOCALSTORAGE 👉", newFeeType);
    alert("Fee Type Added Successfully ✅");
  };

  // Handle fee form submit (edit only - add is now handled by modal)
  const handleFeeFormSubmit = (formData) => {
    if (editingFee) {
      // Edit existing fee
      // Note: total_payable and payable_due will be calculated by backend
      const updatedFee = {
        ...editingFee,
        class: formData.class,
        group: formData.group,
        section: formData.section,
        session: formData.session,
        fees_type: formData.fees_type,
        fees_amount: parseFloat(formData.fees_amount) || 0,
        payable_last_date: formData.payable_last_date || "",
        // total_payable and payable_due will be calculated by backend - not included here
      };
      const updatedFees = fees.map((f) => (f.sl === editingFee.sl ? updatedFee : f));
      setFees(updatedFees);
      
      // Save to localStorage (only items that are not in static data)
      const storedData = localStorage.getItem("feeTypes");
      const existingData = storedData ? JSON.parse(storedData) : [];
      const isFromStorage = existingData.some(item => item.sl === editingFee.sl);
      
      if (isFromStorage) {
        // Update in localStorage
        const updatedStorage = existingData.map((f) => (f.sl === editingFee.sl ? updatedFee : f));
        saveFeeTypes(updatedStorage);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('feeTypesUpdated'));
      }
      
      setEditingFee(null);
      alert("Fee type updated successfully ✅");
    }
  };

  // Handle Create Fees submit
  const handleCreateFeesSubmit = () => {
    if (!feesName.trim()) {
      alert("Please enter fees name");
      return;
    }

    // Get existing fees data from localStorage
    const storedData = localStorage.getItem("fees");
    const existingFees = storedData ? JSON.parse(storedData) : [];
    
    // Generate new ID
    const maxId = existingFees.length > 0 
      ? Math.max(...existingFees.map(item => item.id || 0))
      : 0;
    
    // Create new fees entry
    const newFee = {
      id: maxId + 1,
      name: feesName.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add to localStorage
    const updatedFees = [...existingFees, newFee];
    localStorage.setItem("fees", JSON.stringify(updatedFees));

    // Dispatch custom event
    window.dispatchEvent(new Event('feesUpdated'));

    console.log("FEES DATA SAVED TO LOCALSTORAGE 👉", newFee);
    alert("Fees Created Successfully ✅");
    
    // Reset form and close modal
    setFeesName("");
    setShowCreateFeesModal(false);
  };

  // Create feeFormFields function that returns fields with dynamic options based on formData
  const feeFormFields = (formData = {}) => [
    {
      name: "class",
      label: "Class",
      type: "select",
      placeholder: "Class",
      options: classOptions,
      required: true,
    },
    {
      name: "group",
      label: "Group",
      type: "select",
      placeholder: "Group",
      options: getGroupOptions(formData.class || ""),
      required: true,
    },
    {
      name: "section",
      label: "Section",
      type: "select",
      placeholder: "Section",
      options: getSectionOptions(formData.class || "", formData.group || ""),
      required: true,
    },
    {
      name: "session",
      label: "Session",
      type: "select",
      placeholder: "Session",
      options: sessionOptions,
      required: true,
    },
    {
      name: "fees_type",
      label: "Fees Type",
      type: "select",
      placeholder: "Admission",
      options: feesTypeOptions, // This will be dynamic now
      required: true,
    },
    {
      name: "fees_amount",
      label: "Type Amount",
      type: "number",
      placeholder: "Type Amount",
      required: true,
    },
    {
      name: "payable_last_date",
      label: "Payable Last Date",
      type: "date",
      placeholder: "Select Last Date",
      required: false,
    },
  ];

  const cardBg = darkMode
    ? "bg-gray-800 text-gray-100"
    : "bg-white text-gray-800";

  const borderClr = darkMode ? "border-gray-600" : "border-gray-200";

  const inputBg = darkMode
    ? "bg-gray-700 text-white"
    : "bg-white text-gray-800";

  const dropdownBg = darkMode
    ? "bg-gray-800 text-gray-100"
    : "bg-white text-gray-900";

  return (
    <div className="p-3 space-y-4">
      {/* ===== TOP SECTION ===== */}
      <div className={`space-y-4  p-3 ${cardBg}`}>
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold ">Fee Type List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <button
                onClick={() => navigate("/school/dashboard/fee/type")}
                className="hover:text-indigo-600"
              >
                / Fee Type List
              </button>
            </p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={handleRefresh}
              className={`flex items-center   px-3 h-8 text-xs w-24  border ${borderClr} ${inputBg}`}
            >
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={`flex items-center justify-between  px-3 h-8 text-xs w-24  border ${borderClr} ${inputBg}`}
              >
                Export 
              </button>
              {exportOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <button
                    onClick={() => exportPDF(filteredFees)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredFees)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center w-28  bg-blue-600 px-3 py-2 text-xs text-white"
              >
                Fee Type
              </button>
            )}
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            onClick={handleRefresh}
            className={`w-full  flex items-center  px-3 h-8 text-sm   border ${borderClr} ${inputBg}`}
          >
            Refresh
          </button>

          <div className="relative w-full " ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className={`w-full  flex items-center   px-3 h-8 text-xs   border ${borderClr} ${inputBg}`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border   ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredFees)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100 "
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredFees)}
                  className="w-full px-3 h-8 text-left text-xs hover:bg-gray-100 "
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center  bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Fee Type
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <div className="relative flex-1 md:flex-none" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full flex items-center justify-center md:w-24 px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Fee Types"
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

            {/* Create Fees Button */}
            {canEdit && (
              <button
                onClick={() => setShowCreateFeesModal(true)}
                className={`flex-1 md:flex-none flex items-center justify-center md:w-24 px-3 h-8 text-xs border ${borderClr} ${
                  darkMode
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                Create Fees
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="relative flex-1 md:flex-none" ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className={`w-full flex items-center justify-center md:w-24 px-3 h-8 text-xs border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-full md:w-36 z-40 border ${
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
          <div className="flex items-center gap-2 md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by class, group, section, session, fees type..."
              className={`w-full md:w-64 ${borderClr} ${inputBg}  border  px-3 h-8  text-xs focus:outline-none`}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ===== FEE TYPE TABLE ===== */}
      <div
        className={`${
          darkMode ? "bg-gray-900" : "bg-white"
        } p-2 overflow-x-auto`}
      >
        <FeeTypeTable
          data={currentFees}
          setData={setFees}
          onEdit={(fee) => setEditingFee(fee)}
        />
      </div>

      {/* Fee Edit Modal */}
      <ReusableEditModal
        open={editingFee !== null}
        title="Edit Fees Type"
        item={editingFee}
        onClose={() => setEditingFee(null)}
        onSubmit={handleFeeFormSubmit}
        fields={feeFormFields}
      />

      {/* Add Fee Type Modal */}
      <ReusableEditModal
        open={showAddModal}
        title="Add Fees Type"
        item={null}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFeeFormSubmit}
        fields={feeFormFields}
      />

      {/* Create Fees Modal */}
      {(showCreateFeesModal || isModalClosing) && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-300 ${
            isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => {
            setIsModalClosing(true);
            setIsModalOpening(false);
            setTimeout(() => {
              setShowCreateFeesModal(false);
              setIsModalClosing(false);
              setFeesName("");
            }, 300);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[400px] border ${borderClr} p-5 transition-all duration-300 transform ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            } ${
              isModalOpening && !isModalClosing
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-base font-semibold text-center mb-6">Create Fees</h2>
            
            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  value={feesName}
                  onChange={(e) => setFeesName(e.target.value)}
                  placeholder="Enter Fees Name"
                  className={`w-full h-10 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-white placeholder-gray-400"
                      : "bg-white text-gray-800 placeholder-gray-400"
                  } px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 `}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateFeesSubmit();
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalClosing(true);
                    setIsModalOpening(false);
                    setTimeout(() => {
                      setShowCreateFeesModal(false);
                      setIsModalClosing(false);
                      setFeesName("");
                    }, 300);
                  }}
                  className={`flex-1 py-[8px] border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-sm hover:bg-gray-600 text-gray-200"
                      : "bg-gray-50 text-sm hover:bg-gray-100 text-gray-700"
                  } transition rounded`}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleCreateFeesSubmit}
                  className="flex-1 text-sm py-[8px] bg-blue-600 text-white hover:bg-blue-700 transition "
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
