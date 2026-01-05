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
  ClipboardList,
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
} from "lucide-react";
import { FiUsers ,FiMinusCircle,FiPlusCircle,FiKey ,FiRefreshCw } from "react-icons/fi";
import { FaSchool ,FaRegUser } from "react-icons/fa";
import { FaMoneyCheck } from "react-icons/fa6";
import { IoSchoolOutline } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";



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
      icon: FiUsers ,
      children: [
        { title: "Member Ship Plan", path: "/membership/plan", icon: FileText },
        { title: "Active Plan", path: "/membership/active", icon: UserCheck },
        { title: "Unactive Plan", path: "/membership/unactive", icon: UserMinus },
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
        { title: "Cash In History", path: "/transaction/cashin", icon: FiPlusCircle},
        { title: "Cash Out History", path: "/transaction/cashout", icon: FiMinusCircle  },
        { title: "Profit History", path: "/transaction/profit", icon: BarChart2 },
        { title: "Cash Out Request", path: "/transaction/request", icon: FileText },
        { title: "Cash Out", path: "/transaction/out", icon: DollarSign },
      ],
    },
    {
      title: "Financial & Profit",
      icon: DollarSign,
      children: [
        { title: "Our Profit", path: "/financial/profit", icon: BarChart2 },
        { title: "Our Balance", path: "/financial/balance", icon: FaMoneyCheck },
        { title: "Member Balance", path: "/financial/memberbalance", icon: UserCheck },
      ],
    },
    {
      title: "Dashboard",
      icon: Home,
      children: [
        { title: "School", path: "/dashboard/school", icon: IoSchoolOutline},
        { title: "Teacher", path: "/dashboard/teacher", icon: FaRegUser  },
        { title: "Student", path: "/dashboard/student", icon: Users },
      ],
    },
    {
      title: "Integration API",
      icon: Layers,
      children: [
        { title: "Add Payment", path: "/integration/payment", icon: DollarSign },
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
        { title: "Order Receive", path: "/ecommerce/order/receive", icon: FileCheck },
        { title: "Order Process", path: "/ecommerce/order/process", icon: Clipboard },
        { title: "Order Delivery", path: "/ecommerce/order/delivery", icon: Truck },
      ],
    },
    {
      title: "Profile Tool",
      icon: Settings,
      children: [
        { title: "Profile", path: "/profile", icon: UserCheck },
        { title: "Forget", path: "/profile/forget", icon:FiKey  },
        { title: "Reset", path: "/profile/reset", icon: FiRefreshCw},
      ],
    },
  ];

  // ================= School Menu =================
  const schoolMenu = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },

  { title: "Principle", icon: UserCheck, path: "/principle" },

  {
    title: "Teacher",
    icon: GraduationCap,
    children: [
      { title: "Teacher List", path: "/teacher/list", icon: Users },
      { title: "Teacher ID", path: "/teacher/id", icon: IdCard },
      { title: "Class Permission", path: "/teacher/permission", icon: ShieldCheck },
      { title: "Assignment", path: "/teacher/assignment", icon: ClipboardList },
      { title: "Live Class", path: "/teacher/live", icon: Video },
      { title: "Attendance", path: "/teacher/attendance", icon: FileCheck },
    ],
  },

  {
    title: "Student",
    icon: Users,
    children: [
      { title: "Student List", path: "/student/list", icon: Users },
      { title: "Student ID", path: "/student/id", icon: IdCard },
      { title: "Class Time", path: "/student/time", icon: Calendar },
      { title: "Class Promote", path: "/student/promote", icon: Layers },
      { title: "Assignment", path: "/student/assignment", icon: ClipboardList },
      { title: "Live Class", path: "/student/live", icon: Video },
    ],
  },

  {
    title: "Guardian",
    icon: UserCog,
    children: [
      { title: "Guardian List", path: "/guardian/list", icon: Users },
      { title: "Complain", path: "/guardian/complain", icon: FileText },
    ],
  },

  {
    title: "Academic",
    icon: BookOpen,
    children: [
      { title: "Class", path: "/academic/class", icon: Layers },
      { title: "Group", path: "/academic/group", icon: Layers },
      { title: "Section", path: "/academic/section", icon: Layers },
      { title: "Session", path: "/academic/session", icon: Calendar },
      { title: "Subject", path: "/academic/subject", icon: BookOpen },
      { title: "Syllabus", path: "/academic/syllabus", icon: ClipboardList },
      { title: "Class Routine", path: "/academic/routine", icon: Calendar },
    ],
  },

  {
    title: "Examination",
    icon: ClipboardList,
    children: [
      { title: "Exam Name", path: "/exam/name", icon: FileText },
      { title: "Exam Routine", path: "/exam/routine", icon: Calendar },
      { title: "Grade", path: "/exam/grade", icon: BadgeCheck },
      { title: "Admit Card", path: "/exam/admit", icon: IdCard },
      { title: "Set Number", path: "/exam/setnumber", icon: Layers },
      { title: "Mark Submit", path: "/exam/marksubmit", icon: FileCheck },
      { title: "OMR Submit", path: "/exam/omrsubmit", icon: FileCheck },
      { title: "Result Find", path: "/exam/result", icon: BadgeCheck },
      { title: "Certificate", path: "/exam/certificate", icon: FileText },
    ],
  },

  {
    title: "Fee Management",
    icon: Wallet,
    children: [
      { title: "Fee List", path: "/fee/list", icon: FileText },
      { title: "Pay Fee", path: "/fee/pay", icon: CreditCard },
      { title: "Pay Slip", path: "/fee/payslip", icon: FileText },
      { title: "Collection", path: "/fee/collection", icon: DollarSign },
    ],
  },

  {
    title: "HRM",
    icon: Users,
    children: [
      { title: "Employee", path: "/hrm/employee", icon: Users },
      { title: "Payroll", path: "/hrm/payroll", icon: DollarSign },
      { title: "Attendance Teacher", path: "/hrm/attendance/teacher", icon: FileCheck },
      { title: "Attendance Student", path: "/hrm/attendance/student", icon: FileCheck },
      { title: "Leaves", path: "/hrm/leaves", icon: ClipboardList },
      { title: "Holiday", path: "/hrm/holiday", icon: Calendar },
    ],
  },

  {
    title: "Tools",
    icon: Settings,
    children: [
      { title: "Forget / Reset", path: "/tool/forget", icon: RefreshCw },
    ],
  },

  {
    title: "Details Item",
    icon: Building2,
    children: [
      { title: "Principle Details", path: "/details/principle", icon: UserCheck },
      { title: "Academic Details", path: "/details/academic", icon: BookOpen },
      { title: "School List", path: "/details/schoollist", icon: School },
    ],
  },
];
  // ================= Teacher Menu =================
 const teacherMenu = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },

  {
    title: "Teacher",
    icon: GraduationCap,
    children: [
      { title: "Teacher List", path: "/teacher/list", icon: Users },
      { title: "Teacher ID", path: "/teacher/id", icon: IdCard },
      { title: "Class Permission", path: "/teacher/permission", icon: ShieldCheck },
      { title: "Assignment", path: "/teacher/assignment", icon: ClipboardList },
      { title: "Live Class", path: "/teacher/live", icon: Video },
      { title: "Attendance", path: "/teacher/attendance", icon: FileCheck },
    ],
  },

  {
    title: "Student",
    icon: Users,
    children: [
      { title: "Student List", path: "/student/list", icon: Users },
      { title: "Student ID", path: "/student/id", icon: IdCard },
      { title: "Class Time", path: "/student/time", icon: Calendar },
      { title: "Class Promote", path: "/student/promote", icon: Layers },
      { title: "Assignment", path: "/student/assignment", icon: ClipboardList },
      { title: "Live Class", path: "/student/live", icon: Video },
    ],
  },

  {
    title: "Guardian",
    icon: Users,
    children: [
      { title: "Guardian List", path: "/guardian/list", icon: Users },
      { title: "Complain", path: "/guardian/complain", icon: FileText },
    ],
  },

  {
    title: "Academic",
    icon: BookOpen,
    children: [
      { title: "Class", path: "/academic/class", icon: Layers },
      { title: "Group", path: "/academic/group", icon: Layers },
      { title: "Section", path: "/academic/section", icon: Layers },
      { title: "Session", path: "/academic/session", icon: Calendar },
      { title: "Subject", path: "/academic/subject", icon: BookOpen },
      { title: "Syllabus", path: "/academic/syllabus", icon: ClipboardList },
      { title: "Class Routine", path: "/academic/routine", icon: Calendar },
    ],
  },

  {
    title: "Examination",
    icon: BadgeCheck,
    children: [
      { title: "Exam Name", path: "/exam/name", icon: FileText },
      { title: "Exam Routine", path: "/exam/routine", icon: Calendar },
      { title: "Grade", path: "/exam/grade", icon: BadgeCheck },
      { title: "Admit Card", path: "/exam/admit", icon: IdCard },
      { title: "Set Number", path: "/exam/setnumber", icon: Layers },
      { title: "Mark Submit", path: "/exam/marksubmit", icon: FileCheck },
      { title: "OMR Submit", path: "/exam/omrsubmit", icon: FileCheck },
      { title: "Result Find", path: "/exam/result", icon: BadgeCheck },
      { title: "Certificate", path: "/exam/certificate", icon: FileText },
    ],
  },

  {
    title: "Fee Management",
    icon: CreditCard,
    children: [
      { title: "Fee List", path: "/fee/list", icon: FileText },
      { title: "Pay Fee", path: "/fee/pay", icon: DollarSign },
      { title: "Pay Slip", path: "/fee/payslip", icon: FileText },
      { title: "Collection", path: "/fee/collection", icon: DollarSign },
    ],
  },
];


  // ================= Student Menu =================
 const studentMenu = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },

  {
    title: "Teacher",
    icon: GraduationCap,
    children: [
      { title: "Teacher List", path: "/teacher/list", icon: Users },
    ],
  },

  {
    title: "Student",
    icon: Users,
    children: [
      { title: "Student List", path: "/student/list", icon: Users },
      { title: "Student ID", path: "/student/id", icon: IdCard },
      { title: "Class Time", path: "/student/time", icon: Calendar },
      { title: "Class Promote", path: "/student/promote", icon: Layers },
      { title: "Assignment", path: "/student/assignment", icon: ClipboardList },
      { title: "Live Class", path: "/student/live", icon: Video },
    ],
  },

  {
    title: "Academic",
    icon: BookOpen,
    children: [
      { title: "Class", path: "/academic/class", icon: Layers },
      { title: "Group", path: "/academic/group", icon: Layers },
      { title: "Section", path: "/academic/section", icon: Layers },
      { title: "Session", path: "/academic/session", icon: Calendar },
      { title: "Subject", path: "/academic/subject", icon: BookOpen },
      { title: "Syllabus", path: "/academic/syllabus", icon: ClipboardList },
      { title: "Class Routine", path: "/academic/routine", icon: Calendar },
    ],
  },

  {
    title: "Examination",
    icon: BadgeCheck,
    children: [
      { title: "Exam Name", path: "/exam/name", icon: FileText },
      { title: "Exam Routine", path: "/exam/routine", icon: Calendar },
      { title: "Grade", path: "/exam/grade", icon: BadgeCheck },
      { title: "Admit Card", path: "/exam/admit", icon: IdCard },
      { title: "Set Number", path: "/exam/setnumber", icon: Layers },
      { title: "Result Find", path: "/exam/result", icon: BadgeCheck },
      { title: "Certificate", path: "/exam/certificate", icon: FileText },
    ],
  },

  {
    title: "Fee Management",
    icon: CreditCard,
    children: [
      { title: "Fee List", path: "/fee/list", icon: FileText },
      { title: "Pay Fee", path: "/fee/pay", icon: DollarSign },
      { title: "Pay Slip", path: "/fee/payslip", icon: FileText },
      { title: "Collection", path: "/fee/collection", icon: DollarSign },
    ],
  },

  {
    title: "Attendance",
    icon: FileCheck,
    children: [
      { title: "Student", path: "/attendance/student", icon: FileCheck },
    ],
  },

  {
    title: "Leaves",
    icon: FileText,
    children: [
      { title: "Leave", path: "/leaves/leave", icon: FileText },
    ],
  },

  { title: "Holiday", icon: Calendar, path: "/holiday" },

  {
    title: "Information",
    icon: Settings,
    children: [
      { title: "Forget", path: "/information/forget", icon: BadgeCheck },
    ],
  },

  {
    title: "Details Item",
    icon: Layers,
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
