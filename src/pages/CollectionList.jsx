import { useState, useRef, useEffect } from "react";
import { collectionData } from "../data/collectionData.js";
import CollectiontTable from "../components/collection/CollectiontTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterDropdown from "../components/common/FilterDropdown.jsx";
import ReusableEditModal from "../components/common/ReusableEditModal.jsx";
import FeesCollectionModal from "../components/FeesCollectionModal.jsx";
import {
  getCollectionsAPI,
  initializeCollectionsStorage,
  updateCollectionAPI,
  deleteCollectionAPI,
  saveCollectionAPI,
  getCollectionsFromStorage,
} from "../utils/collectionUtils";
import { studentData } from "../data/studentData";
import { feeTypeData } from "../data/feeTypeData";
import { discountData } from "../data/discountData";

export default function CollectionList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const collectionsPerPage = 20;

  // Load collections from localStorage on mount
  useEffect(() => {
    const loadCollections = async () => {
      try {
        // Initialize with default data if storage is empty
        initializeCollectionsStorage(collectionData);
        // Load collections (from localStorage, ready for API)
        const data = await getCollectionsAPI();
        setCollections(data);
      } catch (error) {
        console.error("Error loading collections:", error);
        // Fallback to default data
        setCollections(collectionData);
      }
    };
    loadCollections();
  }, []);

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
  const [showCollectionModal, setShowCollectionModal] = useState(false);

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

    const sheetData = data.map((c, i) => {
      const student = studentData.find(
        (s) => s.studentId?.toUpperCase() === c.student_id?.toUpperCase()
      );
      const studentName = c.student_name || student?.student_name || "N/A";
      
      return {
        Sl: i + 1,
        "Collection Date": c.pay_date || "",
        "Student ID": c.student_id,
        "Student Name": studentName,
        Class: c.class,
        Group: c.group,
        Section: c.section,
        Session: c.session,
        "Fees Type": c.fees_type,
        "Paid Amount": c.paid_amount || c.type_amount || 0,
        "Total Due": c.total_due || 0,
      };
    });

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
      "Collection Date",
      "Student ID",
      "Student Name",
      "Class",
      "Group",
      "Section",
      "Session",
      "Fees Type",
      "Paid Amount",
      "Total Due",
    ];

    const rows = data.map((c, i) => {
      const student = studentData.find(
        (s) => s.studentId?.toUpperCase() === c.student_id?.toUpperCase()
      );
      const studentName = c.student_name || student?.student_name || "N/A";
      
      return [
        i + 1,
        c.pay_date || "",
        c.student_id,
        studentName,
        c.class,
        c.group,
        c.section,
        c.session,
        c.fees_type,
        c.paid_amount || c.type_amount || 0,
        c.total_due || 0,
      ];
    });

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("Collections_List.pdf");
  };

  const handleRefresh = async () => {
    try {
      const data = await getCollectionsAPI();
      setCollections(data);
    } catch (error) {
      console.error("Error refreshing collections:", error);
      setCollections(collectionData);
    }
    setSearch("");
    setFilters({ className: "", group: "", section: "", session: "" });
    setSortOrder("newest");
    setCurrentPage(1);
  };

  // Generate dynamic options from collectionData
  const getUniqueOptions = (data, key) => {
    return Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  };

  // Generate options from current collections (from localStorage)
  const classOptions = getUniqueOptions(collections.length > 0 ? collections : collectionData, "class");
  const groupOptions = getUniqueOptions(collections.length > 0 ? collections : collectionData, "group");
  const sectionOptions = getUniqueOptions(collections.length > 0 ? collections : collectionData, "section");
  const sessionOptions = getUniqueOptions(collections.length > 0 ? collections : collectionData, "session");
  const feesTypeOptions = getUniqueOptions(collections.length > 0 ? collections : collectionData, "fees_type");

  // Handle collection form submit (edit only)
  const handleCollectionFormSubmit = async (formData) => {
    if (editingCollection) {
      try {
        const updatedData = {
          student_id: formData.student_id,
          student_name: formData.student_name,
          class: formData.class,
          group: formData.group,
          section: formData.section,
          session: formData.session,
          fees_type: formData.fees_type,
          total_payable: parseFloat(formData.total_payable) || 0,
          payable_due: parseFloat(formData.payable_due) || 0,
          type_amount: parseFloat(formData.type_amount) || 0,
          paid_amount: parseFloat(formData.type_amount) || 0, // Also update paid_amount
          total_due: parseFloat(formData.total_due) || 0,
          pay_date: formData.pay_date || new Date().toISOString().split("T")[0],
        };
        
        // Update in localStorage (ready for API)
        await updateCollectionAPI(editingCollection.sl, updatedData);
        
        // Reload collections
        const data = await getCollectionsAPI();
        setCollections(data);
        setEditingCollection(null);
        alert("Collection updated successfully ✅");
      } catch (error) {
        console.error("Error updating collection:", error);
        alert("Error updating collection. Please try again.");
      }
    }
  };

  // Handle collection form submit from modal
  const handleCollectionModalSubmit = async (formData) => {
    try {
      // Get all fee types data (static + localStorage)
      const getAllFeeTypeData = () => {
        const storedData = localStorage.getItem("feeTypes");
        const storedItems = storedData ? JSON.parse(storedData) : [];
        return [...feeTypeData, ...storedItems];
      };
      
      const allFeeTypeData = getAllFeeTypeData();
      
      // Calculate fees amounts based on selected fees types
      const matchingFees = allFeeTypeData.filter(
        (fee) =>
          fee.class === formData.class &&
          fee.group === formData.group &&
          fee.section === formData.section &&
          fee.session === formData.session &&
          formData.fees_type.includes(fee.fees_type)
      );

      let totalPayable = matchingFees.reduce((sum, fee) => {
        let feeAmount = fee.fees_amount || 0;
        
        // Check if there's a discount for this student and fees_type
        if (formData.student_id) {
          const student = studentData.find(
            (s) => s.studentId?.toUpperCase() === formData.student_id.toUpperCase()
          );
          
          if (student) {
            const matchingDiscount = discountData.find(
              (discount) =>
                discount.student_name === student.student_name &&
                discount.class === formData.class &&
                discount.group === formData.group &&
                discount.section === formData.section &&
                discount.session === formData.session &&
                discount.fees_type === fee.fees_type
            );
            
            if (matchingDiscount) {
              const today = new Date().toISOString().split("T")[0];
              const startDate = matchingDiscount.start_date;
              const endDate = matchingDiscount.end_date;
              
              if (today >= startDate && today <= endDate) {
                feeAmount = Math.max(0, (matchingDiscount.regular || feeAmount) - (matchingDiscount.discount_amount || 0));
              }
            }
          }
        }
        
        return sum + feeAmount;
      }, 0);

      // Get student fees due
      const student = studentData.find(
        (s) => s.studentId?.toUpperCase() === formData.student_id.toUpperCase()
      );
      const studentFeesDue = student?.feesDue || 0;

      // Get existing collections
      const storedCollections = getCollectionsFromStorage();
      const allCollections = storedCollections.length > 0 ? storedCollections : collectionData;
      
      // Find existing collections for this student with remaining dues
      const existingCollections = allCollections.filter(
        (collection) =>
          collection.student_id?.toUpperCase() === formData.student_id.toUpperCase() &&
          collection.class === formData.class &&
          collection.group === formData.group &&
          collection.section === formData.section &&
          collection.session === formData.session &&
          collection.total_due > 0
      );

      const overdueAmount = existingCollections.reduce((sum, collection) => {
        return sum + (collection.total_due || 0);
      }, 0);

      const paidAmount = parseFloat(formData.paid_amount) || 0;
      const payableDue = Math.max(0, totalPayable - paidAmount);
      const calculatedTotalDue = totalPayable + studentFeesDue;
      const totalDue = paidAmount >= calculatedTotalDue ? 0 : calculatedTotalDue - paidAmount;

      // If paid amount covers all existing due, update previous collections' total_due to 0
      const totalExistingDue = existingCollections.reduce((sum, collection) => {
        return sum + (collection.total_due || 0);
      }, 0);

      if (paidAmount >= totalExistingDue && totalExistingDue > 0) {
        for (const collection of existingCollections) {
          if (collection.total_due > 0) {
            await updateCollectionAPI(collection.sl, {
              ...collection,
              total_due: 0,
              payable_due: 0,
            });
          }
        }
      }

      const collectionDataToSave = {
        student_id: formData.student_id,
        student_name: formData.student_name,
        class: formData.class,
        group: formData.group,
        section: formData.section,
        session: formData.session,
        fees_type: formData.fees_type.join(", "),
        total_payable: totalPayable,
        payable_due: payableDue,
        type_amount: paidAmount,
        paid_amount: paidAmount,
        total: totalPayable + overdueAmount + studentFeesDue,
        total_due: totalDue,
        overdue_amount: overdueAmount,
        pay_date: formData.pay_date,
        payment_method: "Cash", // Default payment method
      };

      await saveCollectionAPI(collectionDataToSave);

      // Update student's feesDue
      const updatedCollections = getCollectionsFromStorage();
      const finalCollections = updatedCollections.length > 0 ? updatedCollections : collectionData;
      
      const studentCollections = finalCollections.filter(
        (collection) => collection.student_id?.toUpperCase() === formData.student_id.toUpperCase()
      );
      
      const totalDueFromAll = studentCollections.reduce((sum, collection) => {
        return sum + (collection.total_due || 0);
      }, 0);
      
      const storedStudents = localStorage.getItem("students");
      let students = storedStudents ? JSON.parse(storedStudents) : [...studentData];
      
      const studentIndex = students.findIndex(
        (s) => s.studentId?.toUpperCase() === formData.student_id.toUpperCase()
      );
      
      if (studentIndex !== -1) {
        students[studentIndex] = {
          ...students[studentIndex],
          feesDue: totalDueFromAll,
        };
        localStorage.setItem("students", JSON.stringify(students));
        window.dispatchEvent(new Event('studentsUpdated'));
      }

      // Reload collections
      const data = await getCollectionsAPI();
      setCollections(data);
      
      alert("Collection Added Successfully ✅");
      setShowCollectionModal(false);
    } catch (error) {
      console.error("Error saving collection:", error);
      alert("Error saving collection. Please try again.");
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
      name: "student_name",
      label: "Student Name",
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
      name: "paid_amount",
      label: "Paid Amount",
      type: "number",
      required: true,
    },
    {
      name: "total_due",
      label: "Total Due",
      type: "number",
      required: true,
    },
    {
      name: "pay_date",
      label: "Collection Date",
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
      <div className={`space-y-4  p-3 ${cardBg}`}>
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold ">Collection List</h2>
            <p className="text-xs text-gray-400">
              <Link to="/school/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <span className="mx-1">/</span>
              <span>Collection List</span>
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
                onClick={() => setShowCollectionModal(true)}
                className="flex items-center w-28  bg-blue-600 px-3 py-2 text-xs text-white"
              >
                Collection
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
                  onClick={() => exportPDF(filteredCollections)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100 "
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredCollections)}
                  className="w-full px-3 h-8 text-left text-xs hover:bg-gray-100 "
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => setShowCollectionModal(true)}
              className="w-full flex items-center  bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Collection
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="space-y-2 md:flex md:items-center md:justify-between md:gap-4">
          <div className="grid grid-cols-2 gap-2 md:flex md:w-auto items-center">
            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full  flex items-center  md:px-3 md:w-24 px-3 h-8 text-xs border ${borderClr} ${inputBg}`}
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
                className={`w-full  flex items-center  md:px-3 md:w-24 px-3 h-8 text-xs border ${
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
              placeholder="Search by student id, class, fees type..."
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
          onDelete={async () => {
            // Reload collections after delete
            try {
              const data = await getCollectionsAPI();
              setCollections(data);
            } catch (error) {
              console.error("Error reloading collections:", error);
            }
          }}
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

      {/* Fees Collection Modal */}
      <FeesCollectionModal
        open={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        onSubmit={handleCollectionModalSubmit}
      />
    </div>
  );
}
