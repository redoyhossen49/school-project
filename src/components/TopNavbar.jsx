import { useState ,useEffect} from "react";
import { FiBell, FiChevronDown, FiUser, FiLogOut,FiSearch, FiX, } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { Link } from "react-router-dom";

export default function TopNavbar() {

  const [profileOpen, setProfileOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
 const { darkMode, toggleTheme } = useTheme();
  const { toggleMobileSidebar, open, hovered } = useSidebar();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktopExpanded = open || hovered;
  const sidebarWidth = isDesktopExpanded ? 256 : 80;

  return (
    
    <nav
      className={`fixed top-0 z-20 h-16 border-b border-amber-100  flex items-center justify-between px-4
                 transition-all duration-300 ${darkMode? "bg-slate-900 text-white": "bg-white text-gray-800"}`}
      style={{
        left: isDesktop ? sidebarWidth : 0,
        width: isDesktop
          ? `calc(100% - ${sidebarWidth}px)`
          : "100%",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button className="md:hidden text-xl" onClick={toggleMobileSidebar}>
          ☰
        </button>

        

       <div className="hidden md:flex items-center relative ml-6">
          <FiSearch
            size={18}
            className="absolute left-3 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-9 pr-3 py-2 rounded-md
              bg-white border border-gray-300
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
       {/* Mobile Search Overlay */}
        <div
        className={`absolute top-0 left-0 right-0 z-50 md:hidden bg-white flex items-center
          transition-all duration-300 ease-in-out
          ${mobileSearchOpen ? "h-16 opacity-100 py-2 px-4" : "h-0 opacity-0 py-0 px-0 pointer-events-none"}
        `}
      >
        {/* Input container with icons inside */}
        <div className="relative flex-1">
          <input
            autoFocus={mobileSearchOpen}
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-300
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Search icon inside input (left) */}
          <FiSearch
            size={18}
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-600`}
          />

          {/* Cross icon inside input (right) */}
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-100 text-black rounded-full hover:bg-gray-100"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 md:gap-4">
        
         {/* ================= Mobile Search Icon ================= */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden p-2 border rounded-full hover:bg-gray-100 hover:text-black"
          >
            <FiSearch size={24} />
          </button>
        <button onClick={toggleTheme} className="p-2 border rounded-full">
          {darkMode ? "☀️" : "🌙"}
        </button>

        <div className="relative">
           <div className="border rounded-full p-2 ">
                <FiBell size={24}  />
           </div>
          <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1 rounded">
            3
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2"
          >
            <img
              src="https://i.pravatar.cc/40"
              className="w-8 h-8 rounded-full"
            />
            <FiChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-400 rounded shadow">
              <div className="px-4 py-2 flex gap-2 hover:bg-gray-100 cursor-pointer">
                <FiUser /> Profile
              </div>
              <div className="px-4 py-2 flex gap-2 text-red-600 hover:bg-red-50 cursor-pointer">
                <Link to="/" className="flex gap-2 items-center"><FiLogOut /><span> Logout</span></Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
