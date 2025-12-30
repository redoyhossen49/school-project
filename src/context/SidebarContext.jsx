import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(true);         // desktop
  const [mobileOpen, setMobileOpen] = useState(false); // mobile

  const toggleSidebar = () => setOpen(prev => !prev);
  const toggleMobileSidebar = () => setMobileOpen(prev => !prev);

  return (
    <SidebarContext.Provider
      value={{
        open,
        toggleSidebar,
        mobileOpen,
        toggleMobileSidebar,
        setMobileOpen
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
