import { useState, useRef, useEffect, useMemo } from "react";
import { discountData } from "../data/discountData.js";
import DiscountTable from "../components/discount/DiscountTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import ReusableEditModal from "../components/common/ReusableEditModal.jsx";
import Input from "../components/Input.jsx";
import { feeTypeData } from "../data/feeTypeData.js";
import FindCollectionModal from "../components/FindCollectionModal.jsx";
import {
  getDiscountsAPI,
  saveDiscountAPI,
  updateDiscountAPI,
  initializeDiscountsStorage,
} from "../utils/discountUtils.js";

export default function DiscountList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [discounts, setDiscounts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const discountsPerPage = 20;

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
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showFindModal, setShowFindModal] = useState(false);
  const [findFilterType, setFindFilterType] = useState(""); // "Running" or "Closing" - for modal selection
  const [appliedFindFilterType, setAppliedFindFilterType] = useState(""); // Applied filter after clicking Finding button

  const exportRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const filterButtonRef = useRef(null);

  // Load discounts from localStorage on mount
  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        // Initialize with default data if storage is empty
        initializeDiscountsStorage(discountData);
        // Load discounts (from localStorage, ready for API)
        const data = await getDiscountsAPI();
        setDiscounts(data);
      } catch (error) {
        console.error("Error loading discounts:", error);
        // Fallback to default data
        setDiscounts(discountData);
      }
    };
    loadDiscounts();

    // Listen for discountsUpdated event (only reload when explicitly triggered)
    const handleDiscountsUpdate = async () => {
      try {
        const data = await getDiscountsAPI();
        setDiscounts(data);
      } catch (error) {
        console.error("Error reloading discounts:", error);
      }
    };

    window.addEventListener('discountsUpdated', handleDiscountsUpdate);

    return () => {
      window.removeEventListener('discountsUpdated', handleDiscountsUpdate);
    };
  }, []);

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
  const filteredDiscounts = discounts
    .filter((d) =>
      d.group_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.class?.toLowerCase().includes(search.toLowerCase()) ||
      d.group?.toLowerCase().includes(search.toLowerCase()) ||
      d.fees_type?.toLowerCase().includes(search.toLowerCase()) ||
      d.student_name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((d) => {
      // Cumulative filtering: only apply if value is selected
      if (filters.className && d.class !== filters.className) return false;
      if (filters.group && d.group !== filters.group) return false;
      if (filters.section && d.section !== filters.section) return false;
      if (filters.session && d.session !== filters.session) return false;

      // Find modal filters (Running/Closing) - only apply when Finding button is clicked
      if (appliedFindFilterType === "Running") {
        const today = new Date().toISOString().split("T")[0];
        const startDate = d.start_date || "";
        const endDate = d.end_date || "";
        if (!startDate || !endDate) return false;
        if (today < startDate || today > endDate) return false;
      } else if (appliedFindFilterType === "Closing") {
        const today = new Date().toISOString().split("T")[0];
        const endDate = d.end_date || "";
        if (!endDate) return false;
        if (today <= endDate) return false;
      }

      return true;
    })
    .sort((a, b) => {
      return sortOrder === "oldest" ? a.sl - b.sl : b.sl - a.sl;
    });

  const totalDiscounts = filteredDiscounts.length;
  const totalPages = Math.ceil(totalDiscounts / discountsPerPage);
  const currentDiscounts = filteredDiscounts.slice(
    (currentPage - 1) * discountsPerPage,
    currentPage * discountsPerPage
  );

  // ===== EXPORT EXCEL =====
  const exportExcel = (data) => {
    if (!data.length) return;

    const sheetData = data.map((d, i) => ({
      Sl: i + 1,
      "Group Name": d.group_name,
      Class: d.class,
      Group: d.group,
      Section: d.section,
      Session: d.session,
      "Student Name": d.student_name,
      "Fees Type": d.fees_type,
      Regular: d.regular,
      "Discount Amount": d.discount_amount,
      "Start Date": d.start_date,
      "End Date": d.end_date,
    }));

    const ws = utils.json_to_sheet(sheetData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Discounts");
    writeFile(wb, "Discount_List.xlsx");
  };

  // ===== EXPORT PDF =====
  const exportPDF = (data) => {
    if (!data.length) return;

    const doc = new jsPDF("landscape", "pt", "a4");

    const columns = [
      "Sl",
      "Group Name",
      "Class",
      "Group",
      "Section",
      "Session",
      "Student Name",
      "Fees Type",
      "Regular",
      "Discount Amount",
      "Start Date",
      "End Date",
    ];

    const rows = data.map((d, i) => [
      i + 1,
      d.group_name,
      d.class,
      d.group,
      d.section,
      d.session,
      d.student_name,
      d.fees_type,
      d.regular,
      d.discount_amount,
      d.start_date,
      d.end_date,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("Discount_List.pdf");
  };

  const handleRefresh = async () => {
    try {
      const data = await getDiscountsAPI();
      setDiscounts(data);
    } catch (error) {
      console.error("Error refreshing discounts:", error);
      setDiscounts(discountData);
    }
    setSearch("");
    setFilters({ className: "", group: "", section: "", session: "" });
    setSortOrder("newest");
    setFindFilterType("");
    setAppliedFindFilterType("");
    setCurrentPage(1);
  };

  // Generate dynamic options from discountData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  const classOptions = getUniqueOptions(discountData, "class");
  const groupOptions = getUniqueOptions(discountData, "group");
  const sectionOptions = getUniqueOptions(discountData, "section");
  const sessionOptions = getUniqueOptions(discountData, "session");
  const feesTypeOptions = getUniqueOptions(discountData, "fees_type");
  const studentNameOptions = getUniqueOptions(discountData, "student_name");

  // Discount form fields for ReusableEditModal
  const discountFields = [
    {
      name: "group_name",
      label: "Group Name",
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
      name: "student_name",
      label: "Student Name",
      type: "select",
      options: studentNameOptions,
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
      name: "regular",
      label: "Regular Amount",
      type: "number",
      required: true,
    },
    {
      name: "discount_amount",
      label: "Discount Amount",
      type: "number",
      required: true,
    },
    {
      name: "start_date",
      label: "Start Date",
      type: "date",
      required: true,
    },
    {
      name: "end_date",
      label: "End Date",
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

  // DiscountModal Component (similar to FeesCollectionModal)
  function DiscountModal({
    open,
    onClose,
    onSubmit,
  }) {
    const { darkMode } = useTheme();
    const [isModalClosing, setIsModalClosing] = useState(false);
    const [isModalOpening, setIsModalOpening] = useState(false);

    // Handle modal opening animation
    useEffect(() => {
      if (open) {
        setIsModalClosing(false);
        setTimeout(() => {
          setIsModalOpening(true);
        }, 0);
      } else {
        setIsModalOpening(false);
      }
    }, [open]);

    const classOptions = getUniqueOptions(discountData, "class");
    const groupOptions = getUniqueOptions(discountData, "group");
    const sectionOptions = getUniqueOptions(discountData, "section");
    const sessionOptions = getUniqueOptions(discountData, "session");
    const studentNameOptions = getUniqueOptions(discountData, "student_name");
    const feesTypeOptions = getUniqueOptions(feeTypeData, "fees_type");
    const discountTypeOptions = ["Fix", "Percentage"];

    const [formData, setFormData] = useState({
      class: "",
      group: "",
      section: "",
      session: "",
      student_name: "",
      fees_type: "",
      total_fees: "",
      discount_type: "Fix",
      discount_amount: "",
      total_after_discount: "",
      start_date: "",
      end_date: "",
    });

    // Find matching fee type record to get total fees amount
    const matchingFeeTypeRecord = useMemo(() => {
      if (!formData.fees_type || !formData.class || !formData.group || !formData.section || !formData.session) {
        return null;
      }
      return feeTypeData.find(
        (item) =>
          item.class === formData.class &&
          item.group === formData.group &&
          item.section === formData.section &&
          item.session === formData.session &&
          item.fees_type === formData.fees_type
      );
    }, [formData.fees_type, formData.class, formData.group, formData.section, formData.session]);

    // Auto-populate total fees when fees_type is selected
    useEffect(() => {
      if (matchingFeeTypeRecord) {
        setFormData((prev) => ({
          ...prev,
          total_fees: matchingFeeTypeRecord.fees_amount?.toString() || "",
        }));
      } else if (formData.fees_type && formData.class && formData.group && formData.section && formData.session) {
        setFormData((prev) => ({
          ...prev,
          total_fees: "",
        }));
      }
    }, [matchingFeeTypeRecord]);

    // Calculate total after discount
    useEffect(() => {
      const totalFees = parseFloat(formData.total_fees) || 0;
      const discountAmount = parseFloat(formData.discount_amount) || 0;

      if (formData.discount_type === "Fix") {
        const totalAfterDiscount = Math.max(0, totalFees - discountAmount);
        setFormData((prev) => ({
          ...prev,
          total_after_discount: totalAfterDiscount.toString(),
        }));
      } else if (formData.discount_type === "Percentage") {
        const discountPercent = discountAmount / 100;
        const totalAfterDiscount = Math.max(0, totalFees * (1 - discountPercent));
        setFormData((prev) => ({
          ...prev,
          total_after_discount: totalAfterDiscount.toFixed(2),
        }));
      }
    }, [formData.total_fees, formData.discount_amount, formData.discount_type]);

    // Reset form when modal closes
    useEffect(() => {
      if (!open) {
        setFormData({
          class: "",
          group: "",
          section: "",
          session: "",
          student_name: "",
          fees_type: "",
          total_fees: "",
          discount_type: "Fix",
          discount_amount: "",
          total_after_discount: "",
          start_date: "",
          end_date: "",
        });
      }
    }, [open]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      // Validate required fields
      const requiredFields = [
        "class",
        "group",
        "section",
        "session",
        "student_name",
        "fees_type",
        "total_fees",
        "discount_type",
        "discount_amount",
        "start_date",
        "end_date",
      ];

      for (let field of requiredFields) {
        if (!formData[field]) {
          alert(`${field.replace("_", " ")} is required`);
          return;
        }
      }

      if (onSubmit) {
        onSubmit(formData);
      }
      handleClose();
    };

    // Handle close with animation
    const handleClose = () => {
      setIsModalClosing(true);
      setIsModalOpening(false);
      setTimeout(() => {
        onClose();
        setIsModalClosing(false);
      }, 300);
    };

    const borderClr = darkMode ? "border-gray-600" : "border-gray-300";
    const inputBg = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800";
    const readOnlyBg = darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600";
    const modalBg = darkMode ? "bg-gray-800" : "bg-white";
    const textColor = darkMode ? "text-gray-100" : "text-gray-800";

    if (!open && !isModalClosing) return null;

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
          }`}
        onClick={handleClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`${modalBg} ${textColor} w-full max-w-max border ${borderClr} p-6 max-h-[90vh] overflow-y-auto hide-scrollbar transition-all duration-300 transform ${isModalOpening && !isModalClosing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
            }`}
        >
          {/* Title */}
          <h2 className="text-lg font-semibold text-center mb-4">Add Discount</h2>

          <div
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
                e.preventDefault();
              }
            }}
          >
            {/* Select Class */}
            <Input
              label="Select Class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              type="select"
              options={classOptions}
            />

            {/* Select Group */}
            <Input
              label="Select Group"
              name="group"
              value={formData.group}
              onChange={handleChange}
              type="select"
              options={groupOptions}
            />

            {/* Select Section */}
            <Input
              label="Select Section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              type="select"
              options={sectionOptions}
            />

            {/* Select Session Year */}
            <Input
              label="Select Session Year"
              name="session"
              value={formData.session}
              onChange={handleChange}
              type="select"
              options={sessionOptions}
            />

            {/* Select Student */}
            <Input
              label="Select Student"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              type="select"
              options={studentNameOptions}
            />

            {/* Select Fees Type */}
            <Input
              label="Select Fees Type"
              name="fees_type"
              value={formData.fees_type}
              onChange={handleChange}
              type="select"
              options={feesTypeOptions}
            />

            {/* TOTAL FEES - Read-only */}
            <div className="relative w-full">
              <label className="block text-xs font-medium mb-1">TOTAL FEES</label>
              <input
                type="text"
                value={formData.total_fees}
                readOnly
                className={`w-full border h-8 px-2 text-sm font-semibold ${borderClr} ${readOnlyBg} cursor-not-allowed`}
              />
            </div>

            {/* DISCOUNT TYPE and DISCOUNT AMOUNT */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="DISCOUNT TYPE"
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                type="select"
                options={discountTypeOptions}
              />
              <Input
                label="DISCOUNT AMOUNT"
                name="discount_amount"
                value={formData.discount_amount}
                onChange={handleChange}
                type="number"
                step="0.01"
              />
            </div>

            {/* TOTAL AFTER DISCOUNT - Read-only */}
            <div className="relative w-full">
              <label className="block text-xs font-medium mb-1">TOTAL AFTER DISCOUNT</label>
              <input
                type="text"
                value={formData.total_after_discount}
                readOnly
                className={`w-full border h-8 px-2 text-sm ${borderClr} ${readOnlyBg} cursor-not-allowed`}
              />
            </div>

            {/* START DATE and CLOSE DATE */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="START DATE"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                type="date"
              />
              <Input
                label="CLOSE DATE"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                type="date"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 text-sm h-8 border ${borderClr} ${darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                } transition`}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 text-sm h-8 bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle discount form submit
  const handleDiscountFormSubmit = async (formData) => {
    try {
      const discountDataToSave = {
        group_name: `${formData.class}-${formData.group}-${formData.section}`,
        class: formData.class,
        group: formData.group,
        section: formData.section,
        session: formData.session,
        student_name: formData.student_name,
        fees_type: formData.fees_type,
        regular: parseFloat(formData.total_fees) || 0,
        discount_amount: parseFloat(formData.discount_amount) || 0,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      await saveDiscountAPI(discountDataToSave);

      // Reload discounts from storage
      const updatedDiscounts = await getDiscountsAPI();
      setDiscounts(updatedDiscounts);

      alert("Discount Added Successfully ✅");
    } catch (error) {
      console.error("Error saving discount:", error);
      alert("Failed to save discount. Please try again.");
    }
  };

  return (
    <div className="p-3 space-y-4">
      {/* ===== TOP SECTION ===== */}
      <div className={`space-y-4  p-3 ${cardBg}`}>
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold ">Discount List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <button
                onClick={() => navigate("/school/dashboard/discountlist")}
                className="hover:text-indigo-600"
              >
                / Discount List
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
                  className={`absolute top-full left-0 mt-1 w-28 z-40 border  ${darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                    }`}
                >
                  <button
                    onClick={() => exportPDF(filteredDiscounts)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredDiscounts)}
                    className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setShowDiscountModal(true)}
                className="flex items-center w-28  bg-blue-600 px-3 py-2 text-xs text-white"
              >
                Discount
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
                className={`absolute top-full left-0 mt-1 w-full z-40 border   ${darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-200 text-gray-900"
                  }`}
              >
                <button
                  onClick={() => exportPDF(filteredDiscounts)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100 "
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredDiscounts)}
                  className="w-full px-3 h-8 text-left text-xs hover:bg-gray-100 "
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => setShowDiscountModal(true)}
              className="w-full flex items-center  bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Discount
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2">
          <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 w-full md:w-auto">
            {/* Find Button */}
            <div className="relative flex-1 md:flex-none">
              <button
                onClick={() => {
                  setFindFilterType(appliedFindFilterType || "");
                  setShowFindModal(true);
                }}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs ${darkMode
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                  : "bg-white border-gray-300 hover:bg-gray-100"
                  }`}
              >
                Find
              </button>
            </div>

            {/* Filter Button */}
            <div className="relative flex-1 md:flex-none" ref={filterRef}>
              <button
                ref={filterButtonRef}
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs ${darkMode
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                  : "bg-white border-gray-300 hover:bg-gray-100"
                  }`}
              >
                Filter
              </button>

              <FilterDropdown
                title="Filter Discounts"
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

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className={`w-full  flex items-center  md:px-3 md:w-24 px-3 h-8 text-xs border ${darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-200"
                  }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute top-full left-0 mt-1 w-full md:w-36 z-40 border  ${darkMode
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
              placeholder="Search by group name, class, student name, fees type..."
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

      {/* ===== DISCOUNT TABLE ===== */}
      <div
        className={`${darkMode ? "bg-gray-900" : "bg-white"
          } p-2 overflow-x-auto hide-scrollbar`}
      >
        <DiscountTable
          data={currentDiscounts}
          setData={setDiscounts}
          onEdit={(discount) => setEditingDiscount(discount)}
          onDelete={async () => {
            // Reload discounts after delete
            try {
              const data = await getDiscountsAPI();
              setDiscounts(data);
            } catch (error) {
              console.error("Error reloading discounts:", error);
            }
          }}
        />
      </div>

      {/* Edit Discount Modal */}
      <ReusableEditModal
        open={editingDiscount !== null}
        title="Edit Discount"
        item={editingDiscount}
        onClose={() => setEditingDiscount(null)}
        onSubmit={async (formData) => {
          if (editingDiscount) {
            try {
              const updatedData = {
                group_name: formData.group_name,
                class: formData.class,
                group: formData.group,
                section: formData.section,
                session: formData.session,
                student_name: formData.student_name,
                fees_type: formData.fees_type,
                regular: parseFloat(formData.regular) || 0,
                discount_amount: parseFloat(formData.discount_amount) || 0,
                start_date: formData.start_date,
                end_date: formData.end_date,
              };

              await updateDiscountAPI(editingDiscount.sl, updatedData);

              // Reload discounts from storage
              const updatedDiscounts = await getDiscountsAPI();
              setDiscounts(updatedDiscounts);
              setEditingDiscount(null);
              alert("Discount updated successfully ✅");
            } catch (error) {
              console.error("Error updating discount:", error);
              alert("Failed to update discount. Please try again.");
            }
          }
        }}
        fields={discountFields}
      />

      {/* Discount Modal */}
      <DiscountModal
        open={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onSubmit={handleDiscountFormSubmit}
      />

      {/* Find Discount Modal */}
      <FindCollectionModal
        open={showFindModal}
        onClose={() => {
          setShowFindModal(false);
          setFindFilterType("");
        }}
        filterType={findFilterType}
        setFilterType={setFindFilterType}
        onApplyFilters={(filterData) => {
          setAppliedFindFilterType(filterData.filterType);
          setCurrentPage(1);
        }}
        options={[
          { label: "Running", value: "Running", colorScheme: "blue" },
          { label: "Closing", value: "Closing", colorScheme: "red" },
        ]}
      />
    </div>
  );
}
