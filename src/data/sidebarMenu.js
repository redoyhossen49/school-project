import {
  Home,
  Users,
  GraduationCap,
  UserCheck,
  UserMinus,
  UserCog,
  BookOpen,
  CreditCard,
  FileText,
  FileCheck,
  FilePlus,
  Calendar,
  DollarSign,
  Layers,
  Archive,
  Clipboard,
  Truck,
  ShoppingCart,
  Box,
  BarChart2,
  Wallet,
  BadgeCheck,
  ShieldCheck,
  Settings,
  RefreshCw,
  School,
  Building2,
  IdCard,
  Video,
  Plus,
  HandCoins,
  PackageCheck,
  UserCircle,
  ClipboardList,
  Eye,
  Star,
  Clock,
  Book,
  Pencil,
  AlertCircle,
  Hash,
  Send,
  Search,
  Award,
  Percent,
  TrendingUp,
  RotateCw,
  Trash2,
} from "lucide-react";
import {
  FiUsers,
  FiMinusCircle,
  FiPlusCircle,
  FiKey,
  FiRefreshCw,
  FiBell,
  FiMessageSquare,
} from "react-icons/fi";
import {
  FaSchool,
  FaRegUser,
  FaCrown,
  FaMoneyBillWave,
  FaWallet,
  FaUserTie,
  FaIdBadge,
  FaLevelUpAlt,
  FaCheck,
  FaCheckDouble,
  FaRegFilePdf,
  FaUsersSlash,
  FaFileMedicalAlt,
  FaBookReader,
} from "react-icons/fa";
import {
  FaMoneyCheck,
  FaPersonWalkingArrowRight,
  FaUsersBetweenLines,
  FaListCheck,
  FaListOl,
  FaFilterCircleDollar,
  FaBookAtlas,
  FaUsersRays,
  FaUsersLine,
} from "react-icons/fa6";
import { IoCalendarNumberSharp, IoExtensionPuzzleOutline, IoSchoolOutline } from "react-icons/io5";
import { BiCategory, BiMailSend } from "react-icons/bi";
import { RxIdCard } from "react-icons/rx";
import {
  MdOutlineDashboard,
  MdOutlineFormatListNumberedRtl,
  MdOutlineGroupWork,
  MdOutlineProductionQuantityLimits,
  MdOutlineSendTimeExtension,
} from "react-icons/md";
import { LuLayoutList, LuType } from "react-icons/lu";
import {
  CiBoxList,
  CiCalendarDate,
  CiCreditCardOff,
  CiShoppingBasket,
} from "react-icons/ci";
import { BsCalendarDay, BsCollection } from "react-icons/bs";
import { FcCalendar, FcCollect, FcImageFile, FcMoneyTransfer } from "react-icons/fc";
import { VscCalendar } from "react-icons/vsc";
import { RiAlignItemLeftFill, RiMoneyDollarCircleLine, RiMoneyPoundBoxLine } from "react-icons/ri";
import { TbTruckLoading } from "react-icons/tb";
import { GiBookAura, GiTakeMyMoney } from "react-icons/gi";
import { AiFillFileAdd } from "react-icons/ai";
import { SlCalender } from "react-icons/sl";

export const sidebarMenu = (role) => {
  // ================= Admin Menu =================
  const adminMenu = [
    {
      title: "Landing Page",
      icon: Home,
      children: [
        { title: "See", path: "/landing/see", icon: FileCheck },
        { title: "Edit", path: "/landing/edit", icon: FileText },
        { title: "Add", path: "/landing/add", icon: FilePlus },
      ],
    },
    {
      title: "Member Ship",
      icon: FiUsers,
      children: [
        { title: "Member Ship Plan", path: "/membership/plan", icon: FaCrown },
        { title: "Active Plan", path: "/membership/active", icon: UserCircle },
        {
          title: "Unactive Plan",
          path: "/membership/unactive",
          icon: UserMinus,
        },
      ],
    },
    {
      title: "School Details",
      icon: FaSchool,
      children: [
        { title: "School List", path: "/school/list", icon: FileText },
        { title: "Pending", path: "/school/pending", icon: Archive },
      ],
    },
    {
      title: "Transaction",
      icon: CreditCard,
      children: [
        {
          title: "Cash In History",
          path: "/transaction/cashin",
          icon: FiPlusCircle,
        },
        {
          title: "Cash Out History",
          path: "/transaction/cashout",
          icon: FiMinusCircle,
        },
        {
          title: "Profit History",
          path: "/transaction/profit",
          icon: BarChart2,
        },
        {
          title: "Cash Out Request",
          path: "/transaction/request",
          icon: HandCoins,
        },
        { title: "Cash Out", path: "/transaction/out", icon: FaMoneyBillWave },
      ],
    },
    {
      title: "Financial & Profit",
      icon:  RiMoneyDollarCircleLine,
      children: [
        { title: "Our Profit", path: "/financial/profit", icon: BarChart2 },
        {
          title: "Our Balance",
          path: "/financial/balance",
          icon: FaMoneyCheck,
        },
        {
          title: "Member Balance",
          path: "/financial/memberbalance",
          icon: FaWallet,
        },
      ],
    },
    {
      title: "Dashboard",
      icon: MdOutlineDashboard,
      children: [
        { title: "School", path: "/dashboard/school", icon: IoSchoolOutline },
        { title: "Teacher", path: "/dashboard/teacher", icon: FaRegUser },
        { title: "Student", path: "/dashboard/student", icon: IdCard },
      ],
    },
    {
      title: "Integration API",
      icon: IoExtensionPuzzleOutline,
      children: [
        { title: "Add Payment", path: "/integration/payment", icon: Plus },
        { title: "Delivery API", path: "/integration/delivery", icon: Truck },
      ],
    },
    {
      title: "E-commerce",
      icon: ShoppingCart,
      children: [
        { title: "Category", path: "/ecommerce/category", icon: BiCategory },
        { title: "Product", path: "/ecommerce/product", icon: Box },
        { title: "Product List", path: "/ecommerce/list", icon: FileText },
        {
          title: "Order Receive",
          path: "/ecommerce/order/receive",
          icon: FileCheck,
        },
        {
          title: "Order Process",
          path: "/ecommerce/order/process",
          icon: Clipboard,
        },
        {
          title: "Order Delivery",
          path: "/ecommerce/order/delivery",
          icon: PackageCheck,
        },
      ],
    },
    {
      title: "Profile Tool",
      icon: Settings,
      children: [
        { title: "Profile", path: "/profile", icon: UserCheck },
        { title: "Forget", path: "/profile/forget", icon: FiKey },
        { title: "Reset", path: "/profile/reset", icon: FiRefreshCw },
      ],
    },
  ];

  // ================= School Menu =================
  const schoolMenu = [
    { title: "Dashboard", icon: MdOutlineDashboard, path: "/dashboard" },
    { title: "Membarship Plan", icon: FiUsers, path: "/membership" },

    { title: "Principle", icon: FaUserTie, path: "/principle" },

    {
      title: "Teacher",
      icon: UserCog,
      children: [
        { title: "Teacher List", path: "/teacher/list", icon: ClipboardList },
        { title: "Teacher ID", path: "/teacher/id", icon: IdCard },
        {
          title: "Class Permission",
          path: "/teacher/permission",
          icon: ShieldCheck,
        },
        
      ],
    },

    {
      title: "Student",
      icon: GraduationCap,
      children: [
        { title: "Student List", path: "/student/list", icon: Users },
        { title: "Student ID", path: "/student/id", icon: FaIdBadge },
        { title: "Class Time", path: "/student/time", icon: Calendar },
        {
          title: "Class Promote",
          path: "/student/promote",
          icon: FaLevelUpAlt,
        },
      ],
    },

    {
      title: "Guardian",
      icon: FaUsersSlash,
      children: [
        { title: "Guardian List", path: "/guardian/list", icon: FaUsersRays },
      ],
    },

    {
      title: "Academic",
      icon:  GiBookAura,
      children: [
        { title: "Class", path: "/academic/class", icon: Layers },
        { title: "Group", path: "/academic/group", icon: Box },
        { title: "Section", path: "/academic/section", icon: FileCheck },
        { title: "Session", path: "/academic/session", icon: Calendar },
        { title: "Subject", path: "/academic/subject", icon: Book },
        { title: "Syllabus", path: "/academic/syllabus", icon: Archive },
        { title: "Class Routine", path: "/academic/routine", icon: Clock },
      ],
    },

    {
      title: "Examination",
      icon: BookOpen,
      children: [
        { title: "Exam Name", path: "/exam/name", icon: FileText },
        { title: "Exam Routine", path: "/exam/routine", icon: AlertCircle },
        { title: "Grade", path: "/exam/grade", icon: BadgeCheck },
        { title: "Admit Card", path: "/exam/admit", icon: RxIdCard },
        { title: "Set Number", path: "/exam/setnumber", icon: Hash },
        { title: "Mark Submit", path: "/exam/marksubmit", icon: FileCheck },
        { title: "OMR Submit", path: "/exam/omrsubmit", icon: Send },
        { title: "Result Find", path: "/exam/result", icon: Search },
        { title: "Certificate", path: "/exam/certificate", icon: Award },
      ],
    },

    {
      title: "Fee Management",
      icon: CreditCard,
      children: [
        {
          title: "Fees Collection",
          path: "/fee/collection-main",
          icon: DollarSign,
        },
        { title: "Fees Group", path: "/fee/group", icon: MdOutlineGroupWork },
        { title: "Fees Type", path: "/fee/type", icon: LuType },
        { title: "Discount", path: "/fee/discount", icon: Percent },
        { title: "Fee List", path: "/fee/list", icon: CiBoxList },
        { title: "Collection", path: "/fee/collection", icon: BsCollection },
      ],
    },

    {
      title: "HRM",
      icon: FaUsersBetweenLines,
      children: [
        {
          title: "Employee",
          path: "/hrm/employee",
          icon: FaPersonWalkingArrowRight,
        },
        { title: "Payroll", path: "/hrm/payroll", icon: FcMoneyTransfer },
      ],
    },

    {
      title: "Attendance",
      icon: FaListCheck, // group icon for attendance section
      children: [
        {
          title: "Teacher Attendance",
          path: "/attendance/teacher",
          icon: FaCheckDouble, // verified document
        },
        {
          title: "Student Attendance",
          path: "/attendance/student",
          icon: FaCheck, // writing / marking attendance
        },
      ],
    },

    // Leaves Sub-section
    {
      title: "Leaves",
      icon: SlCalender, // section icon for leaves
      children: [
        {
          title: "List Of Leave",
          path: "/leaves/list",
          icon: FaListOl, // approved leave list
        },
        {
          title: "Request",
          path: "/leaves/request",
          icon: BiMailSend, // request approval
        },
       
      ],
    },

     {
          title: "Holiday",
          path: "/leaves/holiday",
          icon: BsCalendarDay, // holiday calendar
        },

    {
      title: "Financial & Account",
      icon: Wallet, // Main section icon
      children: [
        {
          title: "Income",
          path: "/financial/income",
          icon: RiMoneyPoundBoxLine,
        },
        { title: "Expense", path: "/financial/expense", icon: CiCreditCardOff },
        {
          title: "Product",
          path: "/financial/product",
          icon: MdOutlineProductionQuantityLimits,
        },
        {
          title: "Supplier",
          path: "/financial/supplier",
          icon: TbTruckLoading,
        },
        { title: "Purchase", path: "/financial/purchase", icon: ShoppingCart },
        { title: "Return", path: "/financial/return", icon: PackageCheck },
        { title: "Payment", path: "/financial/payment", icon: GiTakeMyMoney },
      ],
    },

    {
      title: "Announcement",
      icon: FiBell,
      children: [
        {
          title: "Send Notice",
          path: "/notice",
          icon: MdOutlineSendTimeExtension,
        },
      ],
    },

    {
      title: "Report",
      icon: FaRegFilePdf, // Example icon for reports
      children: [
        { title: "Today", path: "/report/today", icon: CiCalendarDate },
        {
          title: "Monthly",
          path: "/report/monthly",
          icon: IoCalendarNumberSharp,
        },
        {
          title: "Cash In",
          path: "/report/cash-in",
          icon: FaFilterCircleDollar,
        },
        { title: "Cash Out", path: "/report/cash-out", icon: CreditCard },
        {
          title: "Order Process",
          path: "/report/order-process",
          icon: CiShoppingBasket,
        },
        { title: "Collection", path: "/report/collection", icon: FcCollect },
        { title: "Profit Loss", path: "/report/profit-loss", icon: TrendingUp },
      ],
    },

    {
      title: "Tools",
      icon: Settings, // Main section icon
      children: [
        { title: "Forget", path: "/tool/forget", icon: RefreshCw }, // Feather refresh icon
        { title: "Reset", path: "/tool/reset", icon: RotateCw }, // Feather rotate icon
        { title: "Delete", path: "/tool/delete", icon: Trash2 }, // Feather trash icon
      ],
    },

    {
      title: "Details Item",
      icon: MdOutlineFormatListNumberedRtl,
      children: [
        {
          title: "Academic Details",
          path: "/details/academic",
          icon: FaBookAtlas,
        },
        {
          title: " List of Ranking",
          path: "/details/schoollist",
          icon: School,
        },
      ],
    },
  ];
  // ================= Teacher Menu =================
  const teacherMenu = [
    { title: "Dashboard", icon: MdOutlineDashboard, path: "/dashboard" },

    {
      title: "Teacher",
      icon: UserCog,
      children: [
        { title: "Teacher List", path: "/teacher/list", icon: ClipboardList },
        { title: "Teacher ID", path: "/teacher/id", icon: IdCard },
        {
          title: "Class Permission",
          path: "/teacher/permission",
          icon: ShieldCheck,
        },
        {
          title: "Assignment",
          path: "/teacher/assignment",
          icon: LuLayoutList,
        },
        { title: "Live Class", path: "/teacher/live", icon: Video },
        { title: "Attendance", path: "/teacher/attendance", icon: FileCheck },
      ],
    },

    {
      title: "Student",
      icon:GraduationCap,
      children: [
        { title: "Student List", path: "/student/list", icon: Users },
        { title: "Student ID", path: "/student/id", icon: FaIdBadge },
        { title: "Class Time", path: "/student/time", icon: Calendar },

        { title: "Attendance", path: "/student/attendance", icon: FaListCheck },
      ],
    },

    {
      title: "Guardian",
      icon: FaUsersSlash,
      children: [
        { title: "Guardian List", path: "/guardian/list", icon: FaUsersLine },
        {
          title: "Complain",
          path: "/guardian/complain",
          icon: FiMessageSquare,
        },
      ],
    },

    {
      title: "Academic",
      icon: GiBookAura,
      children: [
        { title: "Class", path: "/academic/class", icon: Layers },
        { title: "Group", path: "/academic/group", icon: Box },
        { title: "Section", path: "/academic/section", icon: FileCheck },
        { title: "Session", path: "/academic/session", icon: Calendar },
        { title: "Subject", path: "/academic/subject", icon: Book },
        { title: "Syllabus", path: "/academic/syllabus", icon: Archive },
        { title: "Class Routine", path: "/academic/routine", icon: Clock },
      ],
    },

    {
      title: "Examination",
      icon: BookOpen,
      children: [
        { title: "Exam Name", path: "/exam/name", icon: FileText },
        { title: "Exam Routine", path: "/exam/routine", icon: AlertCircle },
        { title: "Grade", path: "/exam/grade", icon: BadgeCheck },
        { title: "Admit Card", path: "/exam/admit", icon: RxIdCard },
        { title: "Set Number", path: "/exam/setnumber", icon: Hash },
        { title: "Mark Submit", path: "/exam/marksubmit", icon: FileCheck },
        { title: "OMR Submit", path: "/exam/omrsubmit", icon: Send },
        { title: "Result Find", path: "/exam/result", icon: Search },
        { title: "Certificate", path: "/exam/certificate", icon: Award },
      ],
    },

    {
      title: "Fee Management",
      icon: Wallet,
      children: [
        {
          title: "Fees Collection",
          path: "/fee/collection-main",
          icon: DollarSign,
        },
        { title: "Fee List", path: "/fee/list", icon: CiBoxList },
        { title: "Collection", path: "/fee/collection", icon: BsCollection },
      ],
    },
    {
      title: "HRM",
      icon: FaUsersBetweenLines,
      children: [
        {
          title: "Employee",
          path: "/hrm/employee",
          icon: FaPersonWalkingArrowRight,
        },
        { title: "Payroll", path: "/hrm/payroll", icon: FcMoneyTransfer },
      ],
    },

    {
      title: "Attendance",
      icon: FaListCheck, // group icon for attendance section
      children: [
        {
          title: "Teacher Attendance",
          path: "/attendance/teacher",
          icon: FaCheckDouble, // verified document
        },
        {
          title: "Student Attendance",
          path: "/attendance/student",
          icon: FaCheck, // writing / marking attendance
        },
      ],
    },

    // Leaves Sub-section
    {
      title: "Leaves",
      icon: VscCalendar, // section icon for leaves
      children: [
        {
          title: "List Of Leave",
          path: "/leaves/list",
          icon: FaListOl, // approved leave list
        },

       
      ],
    },
    
     {
          title: "Holiday",
          path: "/leaves/holiday",
          icon: BsCalendarDay, // holiday calendar
        }, 
    {
      title: "Tool",
      icon: Settings,
      children: [
        { title: "Forget", path: "/information/forget", icon: BadgeCheck },
      ],
    },

    {
      title: "Details Item",
      icon: MdOutlineFormatListNumberedRtl,
      children: [
        { title: "Principle", path: "/details/principle", icon: UserCheck },
        { title: "Academic", path: "/details/academic", icon: FaBookAtlas },
        {
          title: "School List",
          path: "/details/schoollist",
          icon: FaFileMedicalAlt,
        },
      ],
    },
  ];

  // ================= Student Menu =================
  const studentMenu = [
    { title: "Dashboard", icon: MdOutlineDashboard, path: "/dashboard" },

    {
      title: "Teacher",
      icon:UserCog ,
      children: [{ title: "Teacher List", path: "/teacher/list", icon: ClipboardList }],
    },


    {
      title: "Student",
      icon: GraduationCap,
      children: [
        { title: "Student List", path: "/student/list", icon: Users },
        { title: "Student ID", path: "/student/id", icon: FaIdBadge },
        { title: "Class Time", path: "/student/time", icon: Calendar },
        {
          title: "Class Promote",
          path: "/student/promote",
          icon: FaLevelUpAlt,
        },
        {
          title: "Assignment",
          path: "/teacher/assignment",
          icon: LuLayoutList,
        },

        { title: "Live Class", path: "/student/live", icon: Video },
      ],
    },

  
    {
      title: "Academic",
      icon: GiBookAura,
      children: [
        { title: "Class", path: "/academic/class", icon: Layers },
        { title: "Group", path: "/academic/group", icon: Box },
        { title: "Section", path: "/academic/section", icon: FileCheck },
        { title: "Session", path: "/academic/session", icon: Calendar },
        { title: "Subject", path: "/academic/subject", icon: Book },
        { title: "Syllabus", path: "/academic/syllabus", icon: Archive },
        { title: "Class Routine", path: "/academic/routine", icon: Clock },
      ],
    },

    {
      title: "Examination",
      icon: BookOpen,
      children: [
        { title: "Exam Name", path: "/exam/name", icon: FileText },
        { title: "Exam Routine", path: "/exam/routine", icon: AlertCircle },
        { title: "Grade", path: "/exam/grade", icon: BadgeCheck },
        { title: "Admit Card", path: "/exam/admit", icon: RxIdCard },
        { title: "Set Number", path: "/exam/setnumber", icon: Hash },
        { title: "Mark Submit", path: "/exam/marksubmit", icon: FileCheck },
        { title: "OMR Submit", path: "/exam/omrsubmit", icon: Send },
        { title: "Result Find", path: "/exam/result", icon: Search },
        { title: "Certificate", path: "/exam/certificate", icon: Award },
      ],
    },


    {
      title: "Fee Management",
      icon: Wallet,
      children: [
        { title: "Fee List", path: "/fee/list", icon: CiBoxList },
        { title: "Pay Fee", path: "/fee/pay", icon: DollarSign },
        { title: "Pay Slip", path: "/fee/payslip", icon: FileText },
        
      ],
    },

    {
      title: "Attendance",
      icon: FaListCheck,
      children: [
        { title: "Student", path: "/attendance/student", icon: FileCheck },
      ],
    },

    {
      title: "Leaves",
      icon:  VscCalendar,
      children: [{ title: "Leave", path: "/leaves/leave", icon: FileText }],
    },

    { title: "Holiday", icon: BsCalendarDay, path: "/holiday" },

    {
      title: "Information",
      icon: Settings,
      children: [
        { title: "Forget", path: "/information/forget", icon: BadgeCheck },
      ],
    },

    {
      title: "Details Item",
      icon: MdOutlineFormatListNumberedRtl,
      children: [
        { title: "Principle", path: "/details/principle", icon: UserCheck },
        { title: "Academic", path: "/details/academic", icon: BookOpen },
        { title: "School List", path: "/details/schoollist", icon: FileText },
      ],
    },
  ];

  if (role === "admin") return adminMenu;
  if (role === "school") return schoolMenu;
  if (role === "teacher") return teacherMenu;
  if (role === "student") return studentMenu;
  return [];
};
