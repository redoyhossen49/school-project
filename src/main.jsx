import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import DashboardLayout from "./Layouts/DashboardLayout";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SchoolForm from "./components/SchoolForm";
import AdmissionForm from "./components/AdmissionForm";
import StudentSuccess from "./pages/StudentSuccess";
import SchoolSuccess from "./pages/SchoolSuccess";
import SettingsPage from "./pages/SettingsPage";
import DashboardPage from "./pages/DashboardPage";
import StudentList from "./pages/StudentList";
import AddStudentPage from "./pages/AddStudentPage";
import GuardianList from "./pages/GuardianList";
import TeacherList from "./pages/TeacherList";
import AddTeacherPage from "./pages/AddTeacherPage";
import AddGuardianPage from "./pages/AddGuardianPage";
import ClassTimeList from "./pages/ClassTimeList";
import AddClassTimePage from "./pages/AddClassTimePage";
import AddPromoteRequestPage from "./pages/AddPromoteRequestPage";
import PromoteRequestList from "./pages/PromoteRequestList";
import ClassPermissionList from "./pages/ClassPermissionList";
import AddClassPermissionPage from "./pages/AddClassPermissionPage";

const router = createBrowserRouter([
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
          { path: "addpromoterequest", element: <AddPromoteRequestPage/> },
          { path: "addclasstime", element: <AddClassTimePage /> },
        { path: "addteacher", element: <AddTeacherPage/> },
        { path: "addguardian", element: <AddGuardianPage/> },
        { path: "guardianlist", element: <GuardianList /> },
        { path: "teacherlist", element: <TeacherList /> },
        { path: "classtimelist", element: <ClassTimeList /> },
        { path: "permissionlist", element: <ClassPermissionList /> },
        { path: "addclasspermission", element: <AddClassPermissionPage/> },
    ],
  },
  
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
