import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import "./Layout.css";

const Layout = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="app-layout">
      <Header
        theme={theme}
        onToggleTheme={() =>
          setTheme((p) => (p === "dark" ? "light" : "dark"))
        }
        onDateChange={setDateRange}
      />
      <main className="app-content">
        <Outlet context={{ dateRange }} />
      </main>
    </div>
  );
};

export default Layout;
