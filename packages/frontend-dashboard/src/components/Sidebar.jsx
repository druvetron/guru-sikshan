// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkStyles = ({ isActive }) => ({
    display: "block",
    padding: "10px 20px",
    margin: "5px 0",
    textDecoration: "none",
    color: isActive ? "#fff" : "#333",
    backgroundColor: isActive ? "#007bff" : "transparent",
    borderRadius: "5px",
  });

  return (
    <div
      className="sidebar"
      style={{
        width: "200px",
        height: "100vh",
        background: "#f5f5f5",
        padding: "20px",
      }}
    >
      <h2>Guru Sikshan</h2>
      <NavLink to="/dashboard" style={linkStyles}>
        Dashboard
      </NavLink>
      <NavLink to="/teachers" style={linkStyles}>
        Teachers
      </NavLink>
      <NavLink to="/feedback" style={linkStyles}>
        Feedback
      </NavLink>
    </div>
  );
};

export default Sidebar;
