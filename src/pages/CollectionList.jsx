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
import FindCollectionModal from "../components/FindCollectionModal.jsx";
import Input from "../components/Input.jsx";
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
import { feesTypeData } from "../data/feesTypeData";
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

    // Listen for collectionsUpdated event (only reload when explicitly triggered)
    const handleCollectionsUpdate = async () => {
      try {
        const data = await getCollectionsAPI();
        setCollections(data);
      } catch (error) {
        console.error("Error reloading collections:", error);
      }
    };

    window.addEventListener('collectionsUpdated', handleCollectionsUpdate);

    return () => {
      window.removeEventListener('collectionsUpdated', handleCollectionsUpdate);
    };
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
  const [showFindModal, setShowFindModal] = useState(false);
  const [findFilterType, setFindFilterType] = useState(""); // "Paid" or "Due" - for modal selection
  const [appliedFindFilterType, setAppliedFindFilterType] = useState(""); // Applied filter after clicking Finding button

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
      // Regular filters
      if (filters.className && c.class !== filters.className) return false;
      if (filters.group && c.group !== filters.group) return false;
      if (filters.section && c.section !== filters.section) return false;
      if (filters.session && c.session !== filters.session) return false;

      // Find modal filters (Paid/Due) - only apply when Finding button is clicked
      if (appliedFindFilterType === "Paid") {
        if ((c.total_due || 0) !== 0) return false;
      } else if (appliedFindFilterType === "Due") {
        if ((c.total_due || 0) === 0) return false;
      }


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
    setFindFilterType("");
    setAppliedFindFilterType("");
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

        // Collections will reload automatically via collectionsUpdated event listener
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
      // TODO: Replace with API call when backend is ready
      // Example: const allCollections = await getCollectionsAPI();
      const storedCollections = await getCollectionsAPI();
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
      // TODO: Replace with API call when backend is ready
      // Example: await updateStudentFeesDueAPI(formData.student_id);
      const updatedCollections = await getCollectionsAPI();
      const finalCollections = updatedCollections.length > 0 ? updatedCollections : collectionData;
      
      const studentCollections = finalCollections.filter(
        (collection) => collection.student_id?.toUpperCase() === formData.student_id.toUpperCase()
      );
      
      const totalDueFromAll = studentCollections.reduce((sum, collection) => {
        return sum + (collection.total_due || 0);
      }, 0);
      
      // TODO: Replace with API call when backend is ready
      // Example: await updateStudentAPI(formData.student_id, { feesDue: totalDueFromAll });
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

      // Collections will reload automatically via collectionsUpdated event listener
      
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

  // FeesCollectionModal Component (moved from separate file)
  function FeesCollectionModal({
    open,
    onClose,
    onSubmit,
  }) {
    const { darkMode } = useTheme();
    const [isModalClosing, setIsModalClosing] = useState(false);
    const [isModalOpening, setIsModalOpening] = useState(false);
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Handle modal opening animation
    useEffect(() => {
      if (open) {
        setIsModalClosing(false);
        setTimeout(() => {
          setIsModalOpening(true);
        }, 10);
      } else {
        setIsModalOpening(false);
      }
    }, [open]);

    // Get fees types from localStorage if available
    const loadFees = () => {
      const storedData = localStorage.getItem("fees");
      if (storedData) {
        try {
          return JSON.parse(storedData);
        } catch (e) {
          return [];
        }
      }
      return [];
    };
    
    const createdFees = loadFees();
    const createdFeesNames = createdFees.map(fee => fee.name).filter(Boolean);
    const feesTypeOptions = [...new Set([...feesTypeData, ...createdFeesNames, "Session"])];

    const [formData, setFormData] = useState({
      student_id: "",
      student_name: "",
      student_fees_due: 0,
      class: "",
      group: "",
      section: "",
      session: "",
      fees_type: [],
      fees_amounts: {},
      total_payable: 0,
      payable_due: 0,
      total_fees: 0,
      total_due: 0,
      in_total: 0,
      overdue_amount: 0,
      paid_amount: "0.00",
      pay_date: today,
      payment_method: "",
    });

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPaymentModalClosing, setIsPaymentModalClosing] = useState(false);
    const [isPaymentModalOpening, setIsPaymentModalOpening] = useState(false);

    // Handle payment modal opening animation
    useEffect(() => {
      if (showPaymentModal) {
        setIsPaymentModalClosing(false);
        setTimeout(() => {
          setIsPaymentModalOpening(true);
        }, 10);
      } else {
        setIsPaymentModalOpening(false);
      }
    }, [showPaymentModal]);

    // Reset form when modal closes
    useEffect(() => {
      if (!open) {
        setFormData({
          student_id: "",
          student_name: "",
          student_fees_due: 0,
          class: "",
          group: "",
          section: "",
          session: "",
          fees_type: [],
          fees_amounts: {},
          total_payable: 0,
          payable_due: 0,
          total_fees: 0,
          total_due: 0,
          in_total: 0,
          overdue_amount: 0,
          paid_amount: "0.00",
          pay_date: today,
          payment_method: "",
        });
        setShowPaymentModal(false);
      }
    }, [open, today]);

    // Auto-populate student data when Student ID is entered
    useEffect(() => {
      if (formData.student_id) {
        const student = studentData.find(
          (s) => s.studentId?.toUpperCase() === formData.student_id.toUpperCase() ||
                 s.rollNo?.toString() === formData.student_id
        );

        if (student) {
          setFormData((prev) => ({
            ...prev,
            student_name: student.student_name || student.name || "",
            student_fees_due: student.feesDue || 0,
            class: student.className || "",
            group: student.group || "",
            section: student.section || "",
            session: student.session || "",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            student_name: "",
            student_fees_due: 0,
            class: "",
            group: "",
            section: "",
            session: "",
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          student_name: "",
          student_fees_due: 0,
          class: "",
          group: "",
          section: "",
          session: "",
        }));
      }
    }, [formData.student_id]);

    // Calculate fees amounts based on selected fees types
    useEffect(() => {
      if (formData.fees_type.length > 0 && formData.class && formData.group && formData.section && formData.session) {
        const getAllFeeTypeData = () => {
          const storedData = localStorage.getItem("feeTypes");
          const storedItems = storedData ? JSON.parse(storedData) : [];
          return [...feeTypeData, ...storedItems];
        };
        
        const allFeeTypeData = getAllFeeTypeData();
        
        const matchingFees = allFeeTypeData.filter(
          (fee) =>
            fee.class === formData.class &&
            fee.group === formData.group &&
            fee.section === formData.section &&
            fee.session === formData.session &&
            formData.fees_type.includes(fee.fees_type)
        );

        let feesAmountsObj = {};
        
        const totalPayable = matchingFees.reduce((sum, fee) => {
          let feeAmount = fee.fees_amount || 0;
          
          feesAmountsObj[fee.fees_type] = feeAmount;
          
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
                  feesAmountsObj[fee.fees_type] = feeAmount;
                }
              }
            }
          }
          
          return sum + feeAmount;
        }, 0);

        setFormData((prev) => ({
          ...prev,
          fees_amounts: feesAmountsObj,
          total_payable: totalPayable,
          payable_due: totalPayable,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          fees_amounts: {},
          total_payable: 0,
          payable_due: 0,
        }));
      }
    }, [formData.fees_type, formData.student_id, formData.class, formData.group, formData.section, formData.session]);

    // Calculate overdue amount
    useEffect(() => {
      if (formData.student_id && formData.class && formData.group && formData.section && formData.session) {
        const storedCollections = getCollectionsFromStorage();
        const allCollections = storedCollections.length > 0 ? storedCollections : collectionData;
        
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

        setFormData((prev) => ({
          ...prev,
          overdue_amount: overdueAmount,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          overdue_amount: 0,
        }));
      }
    }, [formData.student_id, formData.class, formData.group, formData.section, formData.session]);

    // Calculate totals when paid amount changes
    useEffect(() => {
      const paidAmount = parseFloat(formData.paid_amount) || 0;
      const totalPayable = formData.total_payable || 0;
      const overdueAmount = formData.overdue_amount || 0;
      const studentFeesDue = formData.student_fees_due || 0;
      
      const payableDue = Math.max(0, totalPayable - paidAmount);
      const inTotal = paidAmount;
      // Total Due includes: new fees (totalPayable) + student existing dues + overdue amounts
      const calculatedTotalDue = totalPayable + studentFeesDue + overdueAmount;
      const totalDue = paidAmount >= calculatedTotalDue ? 0 : Math.max(0, calculatedTotalDue - paidAmount);

      setFormData((prev) => ({
        ...prev,
        total_fees: totalPayable,
        payable_due: payableDue,
        total_due: totalDue,
        in_total: inTotal,
      }));
    }, [formData.paid_amount, formData.total_payable, formData.overdue_amount, formData.student_fees_due]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFeesTypeChange = (feesType) => {
      setFormData((prev) => {
        const currentTypes = prev.fees_type || [];
        const isSelected = currentTypes.includes(feesType);
        
        if (isSelected) {
          return {
            ...prev,
            fees_type: currentTypes.filter((type) => type !== feesType),
          };
        } else {
          return {
            ...prev,
            fees_type: [...currentTypes, feesType],
          };
        }
      });
    };

    const handleCollection = () => {
      if (!formData.student_id) {
        alert("Please enter Student ID");
        return;
      }
      
      // Allow payment if fees type is selected OR if there's a due amount to pay
      const hasSelectedFeesType = formData.fees_type.length > 0;
      const hasDueAmount = formData.student_fees_due > 0 || formData.overdue_amount > 0;
      
      if (!hasSelectedFeesType && !hasDueAmount) {
        alert("Please select at least one Fees Type or there should be a due amount to pay");
        return;
      }
      
      if (!formData.paid_amount || parseFloat(formData.paid_amount) <= 0) {
        alert("Please enter a valid Paid Amount");
        return;
      }
      
      // Show payment method modal
      setShowPaymentModal(true);
    };

    const handlePaymentMethodSelect = (method) => {
      setFormData((prev) => ({
        ...prev,
        payment_method: method,
      }));
    };

    const handlePaymentClose = () => {
      setIsPaymentModalClosing(true);
      setIsPaymentModalOpening(false);
      setTimeout(() => {
        setShowPaymentModal(false);
        setIsPaymentModalClosing(false);
        setFormData((prev) => ({
          ...prev,
          payment_method: "",
        }));
      }, 300);
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
    const readOnlyBg = darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600";
    const modalBg = darkMode ? "bg-gray-800" : "bg-white";
    const textColor = darkMode ? "text-gray-100" : "text-gray-800";

    if (!open && !isModalClosing) return null;

    return (
      <>
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
            isModalOpening && !isModalClosing ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClose}
        >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`${modalBg} ${textColor} w-full max-w-[320px] border ${borderClr} p-6 max-h-[550px] overflow-y-auto transition-all duration-300 transform ${
            isModalOpening && !isModalClosing
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-4"
          }`}
        >
            {/* Title */}
            <h2 className="text-base font-semibold text-center mb-4">Fees Collection</h2>
            
            <div className="space-y-4 py-2">
            {/* Student ID */}
           <Input
             label="Student ID"
             name="student_id"
             value={formData.student_id}
             onChange={handleChange}
             type="text"
           />

          {/* Class */}
           <Input
             label="Class"
             name="class"
                 value={formData.class}
             onChange={handleChange}
             type="text"
                 readOnly
             inputClassName={`${readOnlyBg} cursor-not-allowed`}
               />

          {/* Group */}
           <Input
             label="Group"
             name="group"
                 value={formData.group}
             onChange={handleChange}
             type="text"
                 readOnly
             inputClassName={`${readOnlyBg} cursor-not-allowed`}
               />

           {/* Section */}
           <Input
             label="Section"
             name="section"
                 value={formData.section}
             onChange={handleChange}
             type="text"
                 readOnly
             inputClassName={`${readOnlyBg} cursor-not-allowed`}
               />

           {/* Session */}
           <Input
             label="Session"
             name="session"
                 value={formData.session}
             onChange={handleChange}
             type="text"
                 readOnly
             inputClassName={`${readOnlyBg} cursor-not-allowed`}
               />

           {/* Student Name */}
           <Input
             label="Student Name"
             name="student_name"
               value={formData.student_name}
             onChange={handleChange}
             type="text"
               readOnly
             inputClassName={`${readOnlyBg} cursor-not-allowed`}
             />

          {/* SELECT FEES TYPE - Table Format */}
          <div className="relative w-full">
            <table className={`w-full border-collapse border ${borderClr}`}>
              <thead >
                <tr className={`border-b ${borderClr} ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}>
                  <th className={`w-1/3 border-r ${borderClr} text-xs font-semibold py-2 px-2 text-left ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Fees Type
                  </th>
                  <th className={`w-1/3 border-r ${borderClr} text-xs font-semibold py-2 px-2 text-left ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Payable
                  </th>
                  <th className={`w-1/3 text-xs font-semibold py-2 px-2 text-left ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Due
                  </th>
                </tr>
              </thead>
              <tbody>
                {feesTypeOptions.map((feesType) => {
                  const isSelected = formData.fees_type.includes(feesType);
                  const payableAmount = formData.fees_amounts[feesType] || 0;
                  
                  // Get due amount from studentData
                  const dueAmount = formData.student_fees_due || 0;
                  const hasDue = dueAmount > 0;
                  
                  return (
                    <tr
                      key={feesType}
                      className={`border-b ${borderClr} cursor-pointer transition ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      onClick={() => handleFeesTypeChange(feesType)}
                    >
                      {/* Fees Type Column */}
                      <td className={`border-r ${borderClr} py-2 px-2`}>
                        <div className="flex items-center gap-2">
                          <div className="relative shrink-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleFeesTypeChange(feesType)}
                              className="sr-only"
                            />
                            <div
                              className={`w-[15px] h-[15px] border-2 rounded transition-all flex items-center justify-center ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600"
                                  : darkMode
                                  ? "border-gray-500 bg-transparent"
                                  : "border-gray-400 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <label
                            className={`text-sm cursor-pointer ${
                              darkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFeesTypeChange(feesType);
                            }}
                          >
                            {feesType}
                          </label>
                        </div>
                      </td>
                      
                      {/* Payable Column */}
                      <td className={`border-r ${borderClr} text-sm text-right py-2 px-2 ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}>
                        {payableAmount.toFixed(0)}
                      </td>
                      
                      {/* Due Column */}
                      <td className={`text-sm text-right py-2 px-2 ${
                        hasDue
                          ? darkMode ? "text-red-400" : "text-red-600"
                          : darkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                        <div className="flex items-center justify-end gap-1">
    
                          <span>{dueAmount.toFixed(0)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Section - Total Fees, Total Due, In Total */}
          <div className="space-y-2">
            <div className={`flex justify-between items-center border h-8 px-[8px]  ${borderClr} ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <span className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-600"}`}>Total Fees</span>
              <span className={`text-sm pr-3 ${darkMode ? "text-gray-200" : "text-gray-600"}`}>{formData.total_payable || 0}</span>
            </div>
            {formData.overdue_amount > 0 && (
              <div className={`flex justify-between items-center h-8 px-[8px] border  ${borderClr} ${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              }`}>
                <span className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-600"}`}>Overdue Amount</span>
                <span className={`text-sm pr-3 ${darkMode ? "text-gray-200" : "text-gray-600"}`}>{formData.overdue_amount || 0}</span>
              </div>
            )}
            <div className={`flex justify-between items-center border h-8 px-[8px] ${borderClr} ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <span className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-600"}`}>Total Due</span>
              <span className={`text-sm pr-3 ${darkMode ? "text-gray-200" : "text-gray-600"}`}>{formData.total_due || 0}</span>
            </div>
            <div className={`flex justify-between items-center h-8 px-[8px] border  ${borderClr} ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <span className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-600"}`}>In Total</span>
              <span className={`text-sm pr-3 ${darkMode ? "text-gray-200" : "text-gray-600"}`}>{formData.in_total || 0}</span>
            </div>
          </div>

         <div className="grid grid-cols-2 gap-4 pt-2">
           {/* Paid Amount */}
           <Input
             label="Paid Amount"
             name="paid_amount"
             value={formData.paid_amount}
             onChange={handleChange}
             type="number"
             step="0.02"
           />

           {/* Pay Date */}
           <Input
             label="Pay Date"
             name="pay_date"
             value={formData.pay_date}
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
                className={`flex-1 text-[12px] h-8 border ${borderClr} ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                } transition `}
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleCollection}
                className="flex-1 text-[12px] h-8 bg-blue-600 text-white hover:bg-blue-700 transition  font-semibold"
              >
                Collection
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method Modal */}
        {showPaymentModal && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${
              isPaymentModalOpening && !isPaymentModalClosing ? "opacity-100" : "opacity-0"
            }`}
            onClick={handlePaymentClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`${modalBg} ${textColor} w-full max-w-[250px] border ${borderClr} p-4 transition-all duration-300 transform ${
                isPaymentModalOpening && !isPaymentModalClosing
                  ? "scale-100 opacity-100 translate-y-0"
                  : "scale-95 opacity-0 translate-y-4"
              }`}
            >
              {/* Title */}
              <h2 className="text-base font-semibold text-center mb-4">Payment Method</h2>

              <div className="space-y-3">
                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      handlePaymentMethodSelect("Cash");
                    }}
                    className={`w-full flex items-center justify-left gap-2 py-2 px-3 border transition min-h-[36px] shrink-0 ${
                      formData.payment_method === "Cash"
                        ? darkMode
                          ? "border-green-500 bg-green-900/30 text-green-300"
                          : "border-green-600 bg-green-50 text-green-600"
                        : darkMode
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <span className="font-semibold text-xs shrink-0">Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handlePaymentMethodSelect("Bank");
                    }}
                    className={`w-full flex items-center justify-left gap-2 py-2 px-3 border transition min-h-[36px] shrink-0 ${
                      formData.payment_method === "Bank"
                        ? darkMode
                          ? "border-blue-500 bg-blue-900/30 text-blue-300"
                          : "border-blue-600 bg-blue-50 text-blue-600"
                        : darkMode
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <span className="font-semibold text-xs shrink-0">Bank</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePaymentClose}
                    className={`w-[50%] text-xs py-2 border ${borderClr} ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                    } transition font-medium`}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.payment_method) {
                        alert("Please select a payment method (Cash or Bank)");
                        return;
                      }
                      if (onSubmit) {
                        onSubmit({ ...formData });
                      }
                      onClose();
                    }}
                    disabled={!formData.payment_method}
                    className={`w-[50%] text-xs py-2 transition font-semibold uppercase ${
                      formData.payment_method
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : darkMode
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Pay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

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
                    onClick={() => exportPDF(filteredCollections)}
                    className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => exportExcel(filteredCollections)}
                    className="w-full px-3 h-8 text-left text-sm hover:bg-gray-100"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>


            {canEdit && (
              <button
                onClick={() => setShowCollectionModal(true)}
                className="w-28 flex items-center bg-blue-600 px-3 h-8 text-xs text-white"
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
                  onClick={() => exportPDF(filteredCollections)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                >
                  PDF
                </button>
                <button
                  onClick={() => exportExcel(filteredCollections)}
                  className="w-full px-3 h-6 text-left text-xs hover:bg-gray-100"
                >
                  Excel
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => setShowCollectionModal(true)}
              className="w-full flex items-center bg-blue-600 px-3 h-8 text-xs text-white"
            >
              Collection
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2">
          <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 w-full md:w-auto">
            {/* Find Button */}
            <div className="relative flex-1 md:flex-none">
              <button
                onClick={() => setShowFindModal(true)}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs ${
                  darkMode
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
            <div className="relative flex-1 md:flex-none" ref={sortRef}>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className={`w-full md:w-28 flex items-center border px-3 h-8 text-xs ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                Sort By
              </button>
              {sortOpen && (
                <div
                  className={`absolute left-0 mt-2 md:w-36 z-40 w-full border ${
                    darkMode
                      ? "bg-gray-800 text-gray-100 border-gray-700"
                      : "bg-white text-gray-900 border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => {
                      setSortOrder("newest");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-xs text-left hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("oldest");
                      setSortOpen(false);
                    }}
                    className="w-full px-3 h-6 text-xs text-left hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search + Pagination */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-96 md:mt-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student id, class, fees type..."
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

      {/* ===== COLLECTION TABLE ===== */}
      <div
        className={`${
          darkMode ? "bg-gray-900" : "bg-white"
        } p-2 overflow-x-auto hide-scrollbar`}
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

      {/* Find Collection Modal */}
      <FindCollectionModal
        open={showFindModal}
        onClose={() => {
          setShowFindModal(false);
          setFindFilterType("");
        }}
        collections={collections}
        filterType={findFilterType}
        setFilterType={setFindFilterType}
        onApplyFilters={(filterData) => {
          setAppliedFindFilterType(filterData.filterType);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
