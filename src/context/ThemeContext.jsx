import { createContext, useContext, useState } from "react";
const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  // Toggle function
  const toggleTheme = () => setDarkMode(!darkMode);
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);
