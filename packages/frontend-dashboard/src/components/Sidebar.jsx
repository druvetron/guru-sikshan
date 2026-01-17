export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <h2>Guru Sikshan</h2>

      <nav>
        <ul style={styles.list}>
          <li>📊 Dashboard</li>
          <li>👩‍🏫 Teachers</li>
          <li>🎓 Students</li>
          <li>📝 Feedback</li>
        </ul>
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    background: "#0f172a",
    color: "#fff",
    padding: "20px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    lineHeight: "2.2rem",
    cursor: "pointer",
  },
};
