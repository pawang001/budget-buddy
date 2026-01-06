import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiSun,
  FiMoon,
  FiLogOut,
  FiCalendar,
  FiMenu,
  FiX,
} from "react-icons/fi";
import api from "../../API/API";
import "./Header.css";

const getDefaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);

  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
};

const Header = ({ theme, onToggleTheme, onDateChange }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [dateRange, setDateRange] = useState(getDefaultRange());

  useEffect(() => {
    onDateChange?.(dateRange);
  }, []);

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.clear();
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="dashboard-header">
      {/* ===== TOP BAR ===== */}
      <div className="header-top">
        {/* LEFT */}
        <div className="header-left">
          <button className="hamburger" onClick={() => setMobileNav((p) => !p)}>
            {mobileNav ? <FiX /> : <FiMenu />}
          </button>

          <div className="logo">
            <span>Budget Buddy</span>
          </div>
        </div>

        {/* NAV */}
        <nav className={`nav-pills ${mobileNav ? "open" : ""}`}>
          <NavLink to="/dashboard" onClick={() => setMobileNav(false)}>
            Overview
          </NavLink>
          <NavLink to="/transactions" onClick={() => setMobileNav(false)}>
            Transactions
          </NavLink>
        </nav>

        {/* ACTIONS */}
        <div className="header-actions">
          <button className="icon-btn" onClick={onToggleTheme}>
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              className="avatar"
              onClick={() => setOpenProfile((p) => !p)}
            >
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </button>

            {openProfile && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="avatar lg">
                    {user?.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="details">
                    <strong>{user?.username}</strong>
                    <small>{user?.email}</small>
                  </div>
                </div>

                <button
                  className="dropdown-btn danger"
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                >
                  <FiLogOut />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== BOTTOM ===== */}
      <div className="header-bottom">
        <div className="welcome">
          <h1>Welcome Back, {user?.username || "User"}👋🏼</h1>
          <p>Your financial overview</p>
        </div>

        <div className="filters">
          <div className="date-picker">
            <FiCalendar />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
            />
            <span>—</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
            />
          </div>

          <button
            className="apply-btn"
            onClick={() => onDateChange?.(dateRange)}
          >
            Apply
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
