import { useSidebar } from "../context/SidebarContext";


export default function TopNavbar() {
  const { toggleMobileSidebar } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-300 border-b flex items-center px-4 z-40">
      {/* Mobile menu button */}
      <button
        className=" text-2xl"
        onClick={toggleMobileSidebar}
      >
        ☰
      </button>

      <h1 className="ml-4 font-semibold">Dashboard</h1>
    </header>
  );
}