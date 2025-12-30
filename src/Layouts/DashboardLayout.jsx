import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";

export default function DasboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar></Sidebar>

      {/* Right Side (Navbar + Content) */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        TopNavbar 

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <Outlet></Outlet>
        </main>

      </div>
    </div>
  );
}
