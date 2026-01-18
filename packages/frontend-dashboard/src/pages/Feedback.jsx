// src/pages/Feedback.jsx
import React, { useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Feedback submitted successfully!");
    setFeedback("");
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ margin: 0, color: "#000" }}>Platform Feedback</h1>
        <p style={{ color: "#666" }}>Help us improve the Guru Sikshan experience</p>
      </div>

      <div style={{ 
        backgroundColor: "#fff", 
        padding: "40px", 
        borderRadius: "20px", 
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        maxWidth: "600px" 
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Subject</label>
            <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}>
              <option>Dashboard Performance</option>
              <option>Updated modules</option>
              <option>Module Suggestion</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Your Message</label>
            <textarea 
              rows="5"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type your feedback here..."
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontFamily: "inherit" }}
              required
            />
          </div>

          <button type="submit" style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#003d82",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            alignSelf: "flex-start",
            paddingLeft: "30px",
            paddingRight: "30px"
          }}>
            Submit Feedback
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Feedback;