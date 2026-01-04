import {
  Home,
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Settings,
  FileCheck,
  FilePlus,
  Calendar,
  DollarSign,
  UserCheck,
  UserMinus,
  Layers,
  Archive,
  Clipboard,
  Bell,
  Truck,
} from "lucide-react";

export const sidebarMenu = (role) => {
  // ================= Admin Menu =================
  const adminMenu = [
    {
      title: "Landing Page",
      icon: Home,
      children: [
        { title: "See", path: "/landing/see", icon: FileCheck },
        { title: "Edit", path: "/landing/edit", icon: FilePlus },
        { title: "Add", path: "/landing/add", icon: FilePlus },
      ],
    },
    {
      title: "Member Ship",
      icon: Users,
      children: [
        { title: "Member Ship Plan", path: "/membership/plan", icon: FileText },
        { title: "Active Plan", path: "/membership/active", icon: UserCheck },
        { title: "Unactive Plan", path: "/membership/unactive", icon: UserMinus },
      ],
    },
    {
      title: "School Details",
      icon: BookOpen,
      children: [
        { title: "School List", path: "/school/list", icon: FileText },
        { title: "Pending", path: "/school/pending", icon: Archive },
      ],
    },
    {
      title: "Transaction",
      icon: CreditCard,
      children: [
        { title: "Cash In History", path: "/transaction/cashin", icon: DollarSign },
        { title: "Cash Out History", path: "/transaction/cashout", icon: DollarSign },
        { title: "Profit History", path: "/transaction/profit", icon: DollarSign },
        { title: "Cash Out Request", path: "/transaction/request", icon: FileText },
        { title: "Cash Out", path: "/transaction/out", icon: DollarSign },
      ],
    },
    {
      title: "Financial & Profit",
      icon: DollarSign,
      children: [
        { title: "Our Profit", path: "/financial/profit", icon: DollarSign },
        { title: "Our Balance", path: "/financial/balance", icon: DollarSign },
        { title: "Member Balance", path: "/financial/memberbalance", icon: DollarSign },
      ],
    },
    {
      title: "Dashboard",
      icon: FileText,
      children: [
        { title: "School", path: "/dashboard/school", icon: Home },
        { title: "Teacher", path: "/dashboard/teacher", icon: Users },
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
      icon: Clipboard,
      children: [
        { title: "Category", path: "/ecommerce/category", icon: FileText },
        { title: "Product", path: "/ecommerce/product", icon: FileText },
        { title: "Product List", path: "/ecommerce/list", icon: FileText },
        { title: "Order Receive", path: "/ecommerce/order/receive", icon: FileCheck },
        { title: "Order Process", path: "/ecommerce/order/process", icon: FileText },
        { title: "Order Delivery", path: "/ecommerce/order/delivery", icon: Truck },
      ],
    },
    {
      title: "Profile Tool",
      icon: Settings,
      children: [
        { title: "Profile", path: "/profile", icon: UserCheck },
        { title: "Forget", path: "/profile/forget", icon: FileText },
        { title: "Reset", path: "/profile/reset", icon: FileText },
      ],
    },
  ];

  // ================= School Menu =================
  const schoolMenu = [
    {
      title: "Dashboard",
      icon: Home,
      path:"/dashboard"
    },
    {
      title:"Prnciple",
      icon: UserCheck,
      path: "/principle",
    },
    {
      title: "Teacher",
      icon: Users,
      children: [
        { title: "Teacher List", path: "/teacher/list", icon: Users },
        { title: "Teacher ID", path: "/teacher/id", icon: FileText },
        { title: "Class Permission", path: "/teacher/permission", icon: FileText },
        { title: "Assignment", path: "/teacher/assignment", icon: FileText },
        { title: "Live Class", path: "/teacher/live", icon: FileText },
        { title: "Attendance", path: "/teacher/attendance", icon: FileCheck },
      ],
    },
    {
      title: "Student",
      icon: Users,
      children: [
        { title: "Student List", path: "/student/list", icon: Users },
        { title: "Student ID", path: "/student/id", icon: FileText },
        { title: "Class Time", path: "/student/time", icon: Calendar },
        { title: "Class Promote", path: "/student/promote", icon: Layers },
        { title: "Assignment", path: "/student/assignment", icon: FileText },
        { title: "Live Class", path: "/student/live", icon: FileText },
      ],
    },
    {
      title: "Gurdian",
      icon: Users,
      children: [
        { title: "Gurdian List", path: "/gurdian/list", icon: Users },
        { title: "Complain", path: "/gurdian/complain", icon: FileText },
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
        { title: "Syllabus", path: "/academic/syllabus", icon: BookOpen },
        { title: "Class Rutin", path: "/academic/rutin", icon: Calendar },
      ],
    },
    {
      title: "Examination",
      icon: BookOpen,
      children: [
        { title: "Exam Name", path: "/exam/name", icon: FileText },
        { title: "Exam Rutin", path: "/exam/rutin", icon: Calendar },
        { title: "Grade", path: "/exam/grade", icon: FileText },
        { title: "Admid Card", path: "/exam/admid", icon: FileText },
        { title: "Set Number", path: "/exam/setnumber", icon: FileText },
        { title: "Mark Submit", path: "/exam/marksubmit", icon: FileText },
        { title: "OMR Submit", path: "/exam/omrsubmit", icon: FileText },
        { title: "Result Find", path: "/exam/result", icon: FileCheck },
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
      title: "HRM",
      icon: Users,
      children: [
        { title: "Employee", path: "/hrm/employee", icon: Users },
        { title: "Payroll", path: "/hrm/payroll", icon: DollarSign },
        { title: "Attendance Teacher", path: "/hrm/attendance/teacher", icon: FileCheck },
        { title: "Attendance Student", path: "/hrm/attendance/student", icon: FileCheck },
        { title: "Leaves", path: "/hrm/leaves", icon: FileText },
        { title: "Holiday", path: "/hrm/holiday", icon: Calendar },
      ],
    },
    {
      title: "Tool",
      icon: Settings,
      children: [
        { title: "Forget", path: "/tool/forget", icon: FileText },
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

  // ================= Teacher Menu =================
   const teacherMenu = [
   {
      title: "Dashboard",
      icon: Home,
      path:"/dashboard"
    },
   
    {
      title: "Teacher",
      icon: Users,
      children: [
        { title: "Teacher List", path: "/teacher/list", icon: Users },
        { title: "Teacher ID", path: "/teacher/id", icon: FileText },
        { title: "Class Permission", path: "/teacher/permission", icon: FileText },
        { title: "Assignment", path: "/teacher/assignment", icon: FileText },
        { title: "Live Class", path: "/teacher/live", icon: FileText },
        { title: "Attendance", path: "/teacher/attendance", icon: FileCheck },
      ],
    },
    {
      title: "Student",
      icon: Users,
      children: [
        { title: "Student List", path: "/student/list", icon: Users },
        { title: "Student ID", path: "/student/id", icon: FileText },
        { title: "Class Time", path: "/student/time", icon: Calendar },
        { title: "Attendance", path: "/student/attendance", icon: FileCheck },
      ],
    },
    {
      title: "Gurdian",
      icon: Users,
      children: [
        { title: "Gurdian List", path: "/gurdian/list", icon: Users },
        { title: "Complain", path: "/gurdian/complain", icon: FileText },
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
        { title: "Syllabus", path: "/academic/syllabus", icon: BookOpen },
        { title: "Class Rutin", path: "/academic/rutin", icon: Calendar },
      ],
    },
    {
      title: "Examination",
      icon: BookOpen,
      children: [
        { title: "Exam Name", path: "/exam/name", icon: FileText },
        { title: "Exam Rutin", path: "/exam/rutin", icon: Calendar },
        { title: "Grade", path: "/exam/grade", icon: FileText },
        { title: "Admid Card", path: "/exam/admid", icon: FileText },
        { title: "Set Number", path: "/exam/setnumber", icon: FileText },
        { title: "Mark Submit", path: "/exam/marksubmit", icon: FileText },
        { title: "OMR Submit", path: "/exam/omrsubmit", icon: FileText },
        { title: "Result Find", path: "/exam/result", icon: FileCheck },
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
      title: "HRM",
      icon: Users,
      children: [
        { title: "Employee", path: "/hrm/employee", icon: Users },
        { title: "Payroll", path: "/hrm/payroll", icon: DollarSign },
        { title: "Attendance Teacher", path: "/hrm/attendance/teacher", icon: FileCheck },
        { title: "Attendance Student", path: "/hrm/attendance/student", icon: FileCheck },
        { title: "Leaves", path: "/hrm/leaves", icon: FileText },
        { title: "Holiday", path: "/hrm/holiday", icon: Calendar },
      ],
    },
    {
      title: "Tool",
      icon: Settings,
      children: [
        { title: "Forget", path: "/tool/forget", icon: FileText },
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


  // ================= Student Menu =================
   const studentMenu = [
    {
      title: "Dashboard",
      icon: Home,
      children: [
        { title: "Dark & Light", path: "/dashboard/theme", icon: Settings },
      ],
    },
    {
      title: "Teacher",
      icon: Users,
      children: [
        { title: "Teacher List", path: "/teacher/list", icon: Users },
      ],
    },
    {
      title: "Student",
      icon: Users,
      children: [
        { title: "Student List", path: "/student/list", icon: Users },
        { title: "Student ID", path: "/student/id", icon: FileText },
        { title: "Class Time", path: "/student/time", icon: Calendar },
        { title: "Class Promote", path: "/student/promote", icon: Layers },
        { title: "Assignment", path: "/student/assignment", icon: FileText },
        { title: "Live Class", path: "/student/live", icon: FileText },
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
        { title: "Syllabus", path: "/academic/syllabus", icon: BookOpen },
        { title: "Class Rutin", path: "/academic/rutin", icon: Calendar },
      ],
    },
    {
      title: "Examination",
      icon: BookOpen,
      children: [
        { title: "Exam Name", path: "/exam/name", icon: FileText },
        { title: "Exam Rutin", path: "/exam/rutin", icon: Calendar },
        { title: "Grade", path: "/exam/grade", icon: FileText },
        { title: "Admid Card", path: "/exam/admid", icon: FileText },
        { title: "Set Number", path: "/exam/setnumber", icon: FileText },
        { title: "Result Find", path: "/exam/result", icon: FileCheck },
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
    {
      title: "Holiday",
      icon: Calendar,
      children: [],
    },
    {
      title: "Information",
      icon: Settings,
      children: [
        { title: "Forget", path: "/information/forget", icon: FileText },
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
