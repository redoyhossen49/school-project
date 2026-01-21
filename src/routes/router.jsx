import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../Layouts/DashboardLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SchoolForm from "../components/SchoolForm";
import AdmissionForm from "../components/AdmissionForm";
import StudentSuccess from "../pages/StudentSuccess";
import SchoolSuccess from "../pages/SchoolSuccess";
import SettingsPage from "../pages/SettingsPage";
import DashboardPage from "../pages/DashboardPage";
import StudentList from "../pages/StudentList";
import AddStudentPage from "../pages/AddStudentPage";
import GuardianList from "../pages/GuardianList";
import TeacherList from "../pages/TeacherList";
import AddTeacherPage from "../pages/AddTeacherPage";
import AddGuardianPage from "../pages/AddGuardianPage";
import ClassTimeList from "../pages/ClassTimeList";
import AddClassTimePage from "../pages/AddClassTimePage";
import AddPromoteRequestPage from "../pages/AddPromoteRequestPage";
import PromoteRequestList from "../pages/PromoteRequestList";
import ClassPermissionList from "../pages/ClassPermissionList";
import AddClassPermissionPage from "../pages/AddClassPermissionPage";
import ClassListPage from "../pages/ClassListPage";
import GroupListPage from "../pages/GroupListpage";
import SectionListPage from "../pages/SectionListPage";
import SessionListPage from "../pages/SessionListPage";
import SubjectListPage from "../pages/SubjectListPage";
import SyllabusPage from "../pages/SyllabusPage";
import ClassRoutinePage from "../pages/ClassRoutinePage";
import Examlist from "../pages/Examlist";
import ExamRoutineList from "../pages/ExamRoutineList";
import GradeList from "../pages/GradeList";
import AddmitCardPage from "../pages/AdmitCardPage";
import SitNumberPage from "../pages/SitNumberPage";
import FeeGroupList from "../pages/FeeGroupList";
import AddFeeGroupPage from "../pages/AddFeeGroupPage";
import FeeTypeList from "../pages/FeeTypeList";
import AddFeeTypePage from "../pages/AddFeeTypePage";
import DiscountList from "../pages/DiscountList";
import AddDiscountPage from "../pages/AddDiscountPage";
import CollectionList from "../pages/CollectionList";
import AddCollectionPage from "../pages/AddCollectionPage";
import EmployeeList from "../pages/EmployeeList";
import AddEmployeePage from "../pages/AddEmployeePage";
import PayrollList from "../pages/PayrollList";
import AddPayrollPage from "../pages/AddPayrollPage";
import ScheduleList from "../pages/ScheduleList";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login></Login>,
  },

  {
    path: "/success",
    element: <StudentSuccess />,
  },
  {
    path: "/schoolsuccess",
    element: <SchoolSuccess />,
  },

  {
    path: "/register",
    element: <Register></Register>,
    children: [
      {
        index: true,
        element: <SchoolForm />,
      },
      {
        path: "admission",
        element: <AdmissionForm />,
      },
    ],
  },
  {
    path: "/admin/dashboard",
    element: <DashboardLayout />,
    children: [
      // default page in dashboard
      { path: "settings", element: <SettingsPage /> }, // /admin/dashboard/settings
      { index: true, element: <DashboardPage></DashboardPage> },
    ],
  },
  {
    path: "/teacher/dashboard",
    element: <DashboardLayout />,
    children: [
      { path: "settings", element: <SettingsPage /> },
      { index: true, element: <DashboardPage></DashboardPage> },
      { path: "studentlist", element: <StudentList /> },
      // fee management routes
      { path: "feegrouplist", element: <FeeGroupList /> },
      { path: "addfeegroup", element: <AddFeeGroupPage /> },
      { path: "fee/list", element: <FeeTypeList /> },
      { path: "fee/payment", element: <CollectionList /> },
      { path: "exam/admit", element: <AddmitCardPage /> },
      { path: "exam/sitnumber", element: <SitNumberPage /> },
    ],
  },
  {
    path: "/student/dashboard",
    element: <DashboardLayout />,
    children: [
      { path: "settings", element: <SettingsPage /> },
      { index: true, element: <DashboardPage></DashboardPage> },
      { path: "studentlist", element: <StudentList /> },

      // other student routes
    ],
  },
  {
    path: "/school/dashboard",
    element: <DashboardLayout />,
    children: [
      { path: "settings", element: <SettingsPage /> },
      { index: true, element: <DashboardPage></DashboardPage> },
      { path: "studentlist", element: <StudentList /> },
      { path: "addstudent", element: <AddStudentPage /> },
      { path: "promoterequest", element: <PromoteRequestList /> },
      { path: "addpromoterequest", element: <AddPromoteRequestPage /> },
      { path: "addclasstime", element: <AddClassTimePage /> },
      { path: "addteacher", element: <AddTeacherPage /> },
      { path: "addguardian", element: <AddGuardianPage /> },
      { path: "guardianlist", element: <GuardianList /> },
      { path: "teacherlist", element: <TeacherList /> },
      { path: "classtimelist", element: <ClassTimeList /> },
      { path: "classlist", element: <ClassListPage /> },
      { path: "grouplist", element: <GroupListPage /> },
      { path: "sectionlist", element: <SectionListPage /> },
      { path: "sessionlist", element: <SessionListPage /> },
      { path: "subjectlist", element: <SubjectListPage /> },
      { path: "syllabus", element: <SyllabusPage /> },
      { path: "routine", element: <ClassRoutinePage /> },
      { path: "permissionlist", element: <ClassPermissionList /> },
      { path: "addclasspermission", element: <AddClassPermissionPage /> },

      { path: "examlist", element: <Examlist /> },
      { path: "examroutine", element: <ExamRoutineList /> },
      { path: "examgrade", element: <GradeList /> },
      { path: "examadmit", element: <AddmitCardPage /> },
      { path: "examsitnumber", element: <SitNumberPage /> },
      { path: "examschedule", element: <ScheduleList /> },

      // fee management routes
      { path: "fee/feegrouplist", element: <FeeGroupList /> },
      { path: "fee/addfeegroup", element: <AddFeeGroupPage /> },
      { path: "fee/type", element: <FeeTypeList /> },
      { path: "fee/addfeetype", element: <AddFeeTypePage /> },


      // discount routes
      { path: "fee/discount", element: <DiscountList /> },
      { path: "fee/adddiscount", element: <AddDiscountPage /> },

      // collection routes
      { path: "fee/collection", element: <CollectionList /> },
      { path: "fee/addcollection", element: <AddCollectionPage /> },

      // employee routes
      { path: "hrm/employee", element: <EmployeeList /> },
      { path: "hrm/addemployee", element: <AddEmployeePage /> },

      // payroll routes
      { path: "hrm/payroll", element: <PayrollList /> },
      { path: "hrm/addpayroll", element: <AddPayrollPage /> },
      

    ],
  },

]);