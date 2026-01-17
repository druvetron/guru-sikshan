export default function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#1f1f1f",
        padding: "16px",
        borderRadius: "10px",
        color: "white",
      }}
    >
      <p style={{ opacity: 0.7 }}>{title}</p>
      <h2 style={{ fontSize: "22px", marginTop: "8px" }}>{value}</h2>
    </div>
  );
}
