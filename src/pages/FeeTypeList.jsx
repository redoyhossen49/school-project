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
import ReusableActions from "../components/common/ReusableActions.jsx";
import { FiX } from "react-icons/fi";
import Input from "../components/Input.jsx";

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
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showFeeListModal, setShowFeeListModal] = useState(false);
  const [feeListSearch, setFeeListSearch] = useState("");
  const [editingFeeName, setEditingFeeName] = useState(null);
  const [feeListModalClosing, setFeeListModalClosing] = useState(false);
  const [feeListModalOpening, setFeeListModalOpening] = useState(false);
  const [feeList, setFeeList] = useState([]);
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
  
  // Add Fees Type Modal states
  const [isAddModalClosing, setIsAddModalClosing] = useState(false);
  const [isAddModalOpening, setIsAddModalOpening] = useState(false);
  const [addFormData, setAddFormData] = useState({
    class: "",
    group: "",
    section: "",
    session: "",
    fees_type: "",
    fees_amount: "",
    payable_last_date: "",
  });

  // Handle modal opening animation
  useEffect(() => {
    if (showCreateFeesModal) {
      setIsModalClosing(false);
      setTimeout(() => {
        setIsModalOpening(true);
      }, 10);
    } else {
      setIsModalOpening(false);
    }
  }, [showCreateFeesModal]);

  // Handle Add Fees Type modal opening animation
  useEffect(() => {
    if (showAddModal) {
      setIsAddModalClosing(false);
      setTimeout(() => {
        setIsAddModalOpening(true);
      }, 10);
    } else {
      setIsAddModalOpening(false);
    }
  }, [showAddModal]);

  // Load deleted static fees from localStorage
  const getDeletedStaticFees = () => {
    const storedData = localStorage.getItem("deletedStaticFees");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error("Error loading deleted static fees:", e);
        return [];
      }
    }
    return [];
  };

  // Save deleted static fees to localStorage
  const saveDeletedStaticFees = (deletedFees) => {
    try {
      localStorage.setItem("deletedStaticFees", JSON.stringify(deletedFees));
    } catch (e) {
      console.error("Error saving deleted static fees:", e);
    }
  };

  // Load fee list (static + dynamic, excluding deleted static)
  const loadFeeList = () => {
    const allFees = loadFees();
    const deletedStaticFees = getDeletedStaticFees();
    const staticFees = feesTypeData
      .map((name, index) => ({
        id: `static-${index}`,
        name: name,
        isStatic: true,
      }))
      .filter((fee) => !deletedStaticFees.includes(fee.name));
    return [...staticFees, ...allFees];
  };

  // Handle Fee List modal opening animation
  useEffect(() => {
    if (showFeeListModal) {
      setFeeListModalClosing(false);
      // Load fees when modal opens
      setFeeList(loadFeeList());
      setTimeout(() => {
        setFeeListModalOpening(true);
      }, 10);
    } else {
      setFeeListModalOpening(false);
    }
  }, [showFeeListModal]);

  // Update fee list when fees are updated
  useEffect(() => {
    const handleFeesUpdated = () => {
      if (showFeeListModal) {
        setFeeList(loadFeeList());
      }
    };
    
    window.addEventListener('feesUpdated', handleFeesUpdated);
    return () => window.removeEventListener('feesUpdated', handleFeesUpdated);
  }, [showFeeListModal]);

  // Handle close with animation
  const handleCreateFeesClose = () => {
    setIsModalClosing(true);
    setIsModalOpening(false);
    setTimeout(() => {
      setShowCreateFeesModal(false);
      setIsModalClosing(false);
      setFeesName("");
    }, 300);
  };

  // Handle Add Fees Type modal close with animation
  const handleAddModalClose = () => {
    setIsAddModalClosing(true);
    setIsAddModalOpening(false);
    setTimeout(() => {
      setShowAddModal(false);
      setIsAddModalClosing(false);
      setAddFormData({
        class: "",
        group: "",
        section: "",
        session: "",
        fees_type: "",
        fees_amount: "",
        payable_last_date: "",
      });
    }, 300);
  };

  // Handle Fee List modal close with animation
  const handleFeeListModalClose = () => {
    setFeeListModalClosing(true);
    setFeeListModalOpening(false);
    setTimeout(() => {
      setShowFeeListModal(false);
      setFeeListModalClosing(false);
      setFeeListSearch("");
      setEditingFeeName(null);
    }, 300);
  };

  const dateDropdownRef = useRef(null);
  const exportRef = useRef(null);
  const filterRef = useRef(null);
  const filterButtonRef = useRef(null);

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
    
    console.log("FEE TYPE DATA SAVED TO LOCALSTORAGE 👉", newFeeType);
    alert("Fee Type Added Successfully ✅");
    
    // Close modal after submission
    handleAddModalClose();
  };

  // Handle custom Add Fees Type form submit
  const handleCustomAddFeeSubmit = () => {
    handleAddFeeFormSubmit(addFormData);
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
    handleCreateFeesClose();
  };

  // Handle edit fee name
  const handleEditFeeName = (fee) => {
    setEditingFeeName(fee);
  };

  // Handle update fee name
  const handleUpdateFeeName = () => {
    if (!editingFeeName || !editingFeeName.name.trim()) {
      alert("Please enter a valid fee name");
      return;
    }

    const storedData = localStorage.getItem("fees");
    const existingFees = storedData ? JSON.parse(storedData) : [];
    
    // Check if it's a static fee
    if (editingFeeName.isStatic) {
      // Convert static fee to dynamic fee in localStorage
      const maxId = existingFees.length > 0 
        ? Math.max(...existingFees.map(item => item.id || 0))
        : 0;
      
      const newFee = {
        id: maxId + 1,
        name: editingFeeName.name.trim(),
        createdAt: new Date().toISOString(),
      };
      
      // Add to localStorage and mark original static as deleted
      const updatedFees = [...existingFees, newFee];
      localStorage.setItem("fees", JSON.stringify(updatedFees));
      
      // Mark original static fee as deleted
      const deletedStaticFees = getDeletedStaticFees();
      // Extract index from static ID (e.g., "static-0" -> 0)
      const staticIndex = parseInt(editingFeeName.id.replace('static-', ''));
      const originalStaticFeeName = feesTypeData[staticIndex];
      if (originalStaticFeeName && !deletedStaticFees.includes(originalStaticFeeName)) {
        saveDeletedStaticFees([...deletedStaticFees, originalStaticFeeName]);
      }
    } else {
      // Update existing dynamic fee
      const updatedFees = existingFees.map((f) =>
        f.id === editingFeeName.id
          ? { ...f, name: editingFeeName.name.trim() }
          : f
      );
      localStorage.setItem("fees", JSON.stringify(updatedFees));
    }
    
    window.dispatchEvent(new Event('feesUpdated'));
    setFeeList(loadFeeList());
    
    setEditingFeeName(null);
    alert("Fee name updated successfully ✅");
  };

  // Handle delete fee (called by ReusableActions - confirmation already handled)
  const handleDeleteFee = (id) => {
    // Find the fee from feeList
    const fee = feeList.find((f) => f.id === id);
    if (!fee) return;

    if (fee.isStatic) {
      // Mark static fee as deleted
      const deletedStaticFees = getDeletedStaticFees();
      if (!deletedStaticFees.includes(fee.name)) {
        saveDeletedStaticFees([...deletedStaticFees, fee.name]);
      }
    } else {
      // Delete dynamic fee from localStorage
      const storedData = localStorage.getItem("fees");
      const existingFees = storedData ? JSON.parse(storedData) : [];
      const updatedFees = existingFees.filter((f) => f.id !== id);
      localStorage.setItem("fees", JSON.stringify(updatedFees));
    }
    
    window.dispatchEvent(new Event('feesUpdated'));
    setFeeList(loadFeeList());
    
    alert("Fee deleted successfully ✅");
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
              className={`w-28 flex items-center border ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              } px-3 h-8 text-xs`}
            >
              Refresh
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((prev) => !prev)}
                className={`w-28 flex items-center border ${
                  darkMode
                    ? "bg-gray-700 border-gray-500"
                    : "bg-white border-gray-200"
                } px-3 h-8 text-xs`}
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
                    className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredFees)}
                    className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-28 flex items-center bg-blue-600 px-3 h-8 text-xs text-white"
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
            className={`w-full flex items-center gap-2 border ${
              darkMode
                ? "bg-gray-700 border-gray-500"
                : "bg-white border-gray-200"
            } px-3 h-8 text-xs`}
          >
            Refresh
          </button>

          <div className="relative w-full" ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className={`w-full flex items-center border ${
                darkMode
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-200"
              } px-3 h-8 text-xs`}
            >
              Export
            </button>
            {exportOpen && (
              <div
                className={`absolute top-full left-0 mt-1 w-full z-40 border  ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <button
                  onClick={() => exportPDF(filteredFees)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                >
                  PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredFees)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                >
                  Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Fee Type
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2">
          <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 w-full md:w-auto">
            {/* Filter Button */}
            <div className="relative flex-1 md:flex-none" ref={filterRef}>
              <button
                ref={filterButtonRef}
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
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
                buttonRef={filterButtonRef}
              />
            </div>

            {/* Create Fees Button */}
            {canEdit && (
              <div className="relative flex-1 md:flex-none">
                <button
                  onClick={() => setShowCreateFeesModal(true)}
                  className={`w-full md:w-28 flex items-center justify-start border px-3 h-8 text-xs ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                      : "bg-white border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Create Fees
                </button>
              </div>
            )}

            {/* Fee List Button */}
            <div className="relative flex-1 md:flex-none">
              <button
                onClick={() => setShowFeeListModal(true)}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                Fee list
              </button>
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-96 md:mt-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className={`w-full px-3 h-8 text-xs border ${
                darkMode
                  ? "border-gray-500 bg-gray-700 text-gray-100 placeholder:text-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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

      {/* Add Fee Type Modal - Custom */}
      {(!showAddModal && !isAddModalClosing) ? null : (
        <div
          className={`fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
            isAddModalOpening && !isAddModalClosing ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleAddModalClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${darkMode ? "bg-gray-800" : "bg-white"} ${darkMode ? "text-gray-100" : "text-gray-800"} w-full max-w-[320px] max-h-[550px] border ${borderClr} p-4 transition-all duration-300 transform max-h-[90vh] overflow-y-auto ${
              isAddModalOpening && !isAddModalClosing
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* Title */}
            <h2 className="text-base font-semibold text-center mb-4"> Fees Type</h2>

            <div className="space-y-3">
              {/* Class Field */}
              <div>
                <select
                  value={addFormData.class}
                  onChange={(e) => {
                    setAddFormData({
                      ...addFormData,
                      class: e.target.value,
                      group: "",
                      section: "",
                    });
                  }}
                  className={`w-full h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-800"
                  } px-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">Class</option>
                  {classOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Field */}
              <div>
                <select
                  value={addFormData.group}
                  onChange={(e) => {
                    setAddFormData({
                      ...addFormData,
                      group: e.target.value,
                      section: "",
                    });
                  }}
                  disabled={!addFormData.class}
                  className={`w-full h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-800"
                  } px-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    !addFormData.class ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Group</option>
                  {getGroupOptions(addFormData.class).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Field */}
              <div>
                <select
                  value={addFormData.section}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, section: e.target.value })
                  }
                  disabled={!addFormData.class || !addFormData.group}
                  className={`w-full h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-800"
                  } px-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    !addFormData.class || !addFormData.group
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="">Section</option>
                  {getSectionOptions(addFormData.class, addFormData.group).map(
                    (option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Session Field */}
              <div>
                <select
                  value={addFormData.session}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, session: e.target.value })
                  }
                  className={`w-full h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-800"
                  } px-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">Session</option>
                  {sessionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fees Type Field */}
              <div>
                <select
                  value={addFormData.fees_type}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, fees_type: e.target.value })
                  }
                  className={`w-full h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-800"
                  } px-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">Fees Type</option>
                  {feesTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fees Amount Field */}
              <div>
                <input
                  type="number"
                  value={addFormData.fees_amount}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, fees_amount: e.target.value })
                  }
                  placeholder="Type Amount"
                  className={`w-full h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-white placeholder-gray-400"
                      : "bg-white text-gray-800 placeholder-gray-400"
                  } px-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>

              {/* Payable Last Date Field */}
              <div className="pt-2">
                <Input
                  label="Payable Last Date"
                  name="payable_last_date"
                  value={addFormData.payable_last_date}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, payable_last_date: e.target.value })
                  }
                  type="date"
                  placeholder="Payable Last Date"
                  className={`w-full h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-white placeholder-gray-400"
                      : "bg-white text-gray-800 placeholder-gray-400"
                  } px-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddModalClose}
                  className={`w-[50%] text-[12px] h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                  } transition font-medium`}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCustomAddFeeSubmit}
                  disabled={
                    !addFormData.class ||
                    !addFormData.group ||
                    !addFormData.section ||
                    !addFormData.session ||
                    !addFormData.fees_type ||
                    !addFormData.fees_amount
                  }
                  className={`w-[50%] text-[12px] h-8 transition font-semibold  ${
                    addFormData.class &&
                    addFormData.group &&
                    addFormData.section &&
                    addFormData.session &&
                    addFormData.fees_type &&
                    addFormData.fees_amount
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : darkMode
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Fees Modal */}
      {(!showCreateFeesModal && !isModalClosing) ? null : (
        <div
          className={`fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
            isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleCreateFeesClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${darkMode ? "bg-gray-800" : "bg-white"} ${darkMode ? "text-gray-100" : "text-gray-800"} w-full max-w-[250px] border ${borderClr} p-4 transition-all duration-300 transform ${
              isModalOpening && !isModalClosing
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* Title */}
            <h2 className="text-base font-semibold text-center mb-4">Create Fees</h2>

            <div className="space-y-3">
              {/* Input Field */}
              <div>
                <input
                  type="text"
                  value={feesName}
                  onChange={(e) => setFeesName(e.target.value)}
                  placeholder="Fees Name"
                  className={`w-full h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 text-white placeholder-gray-400"
                      : "bg-white text-gray-800 placeholder-gray-400"
                  } px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateFeesSubmit();
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateFeesClose}
                  className={`w-[50%] text-xs h-8 border ${borderClr} ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                  } transition font-medium`}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCreateFeesSubmit}
                  disabled={!feesName.trim()}
                  className={`w-[50%] text-xs h-8 transition font-semibold uppercase ${
                    feesName.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : darkMode
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fee List Modal */}
      {(!showFeeListModal && !feeListModalClosing) ? null : (
        <div
          className={`fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
            feeListModalOpening && !feeListModalClosing ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleFeeListModalClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${darkMode ? "bg-gray-800" : "bg-white"} ${darkMode ? "text-gray-100" : "text-gray-800"} w-full max-w-[320px] border ${borderClr} p-4 transition-all duration-300 transform max-h-[90vh] overflow-y-auto ${
              feeListModalOpening && !feeListModalClosing
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* Title with Close Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold">Fee List</h2>
              <button
                onClick={handleFeeListModalClose}
                className={`p-1 rounded transition ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Search Row */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={feeListSearch}
                onChange={(e) => setFeeListSearch(e.target.value)}
                placeholder="Search"
                className={`flex-1 h-8 border ${borderClr} ${
                  darkMode
                    ? "bg-gray-700 text-white placeholder-gray-400"
                    : "bg-white text-gray-800 placeholder-gray-400"
                } px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    // Search functionality is handled by filter
                  }
                }}
              />
              <button
                onClick={() => {
                  // Search is handled by filter state
                }}
                className={`w-20 h-8 border ${borderClr} ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                } text-xs transition font-medium`}
              >
                Search
              </button>
            </div>

            {/* Table */}
            <div className={`border ${borderClr} overflow-x-auto ${
              darkMode ? "bg-gray-900" : "bg-white"
            }`}>
              <table className="w-full border-collapse text-xs">
                <thead className={`${
                  darkMode
                    ? "bg-gray-800 border-b border-gray-700"
                    : "bg-gray-100 border-b border-gray-200"
                }`}>
                  <tr>
                    <th className={`px-3 h-8 text-left font-semibold border-r ${borderClr} ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}>SI</th>
                    <th className={`px-3 h-8 text-left font-semibold border-r ${borderClr} ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}>Fee Name</th>
                    <th className={`px-3 h-8 text-left font-semibold ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredFees = feeList.filter((fee) =>
                      fee.name?.toLowerCase().includes(feeListSearch.toLowerCase())
                    );

                    // Sort: fees being edited should appear first
                    const sortedFees = [...filteredFees].sort((a, b) => {
                      if (editingFeeName) {
                        if (a.id === editingFeeName.id) return -1;
                        if (b.id === editingFeeName.id) return 1;
                      }
                      return 0;
                    });

                    if (sortedFees.length === 0) {
                      return (
                        <tr>
                          <td colSpan="3" className={`px-3 h-8 text-center border-r ${borderClr} ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            No fees found
                          </td>
                        </tr>
                      );
                    }

                    return sortedFees.map((fee, index) => (
                      <tr
                        key={fee.id || `static-${index}`}
                        className={`border-b ${borderClr} ${
                          darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className={`px-3 h-8 border-r ${borderClr} ${
                          darkMode ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {index + 1}
                        </td>
                        <td className={`px-3 h-8 border-r ${borderClr} ${
                          darkMode ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {editingFeeName?.id === fee.id ? (
                            <input
                              type="text"
                              value={editingFeeName.name}
                              onChange={(e) =>
                                setEditingFeeName({
                                  ...editingFeeName,
                                  name: e.target.value,
                                })
                              }
                              className={`w-full h-8 border ${borderClr} ${
                                darkMode
                                  ? "bg-gray-700 text-white"
                                  : "bg-white text-gray-800"
                              } px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleUpdateFeeName();
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            fee.name
                          )}
                        </td>
                        <td className={`px-3 h-8 ${
                          darkMode ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {editingFeeName?.id === fee.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateFeeName}
                                className={`px-2 py-1 text-xs border ${borderClr} ${
                                  darkMode
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                } transition`}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingFeeName(null)}
                                className={`px-2 py-1 text-xs border ${borderClr} ${
                                  darkMode
                                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                    : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                                } transition`}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <ReusableActions
                              item={fee}
                              onEdit={handleEditFeeName}
                              onDelete={handleDeleteFee}
                              deleteMessage="Are you sure you want to delete this fee?"
                              getId={(item) => item.id}
                            />
                          )}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
