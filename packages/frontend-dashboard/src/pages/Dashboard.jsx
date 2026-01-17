import DashboardLayout from "../layout/DashboardLayout";
import StatCard from "../components/StatCard";
import React from "react";
export default function Dashboard() {
  return (
    <DashboardLayout>
      <div style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" , color : 'white' }}>
          Dashboard 
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <StatCard title="Students" value="1,245" />
          <StatCard title="Teachers" value="84" />
          <StatCard title="Courses" value="32" />
          <StatCard title="Revenue" value="₹1.2L" />
        </div>
      </div>
    </DashboardLayout>
  );
}
