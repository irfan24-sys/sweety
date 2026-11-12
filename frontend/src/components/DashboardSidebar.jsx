
import { NavLink, useNavigate } from "react-router-dom";

function DashboardSidebar() {
  const navigate = useNavigate();

  const styles = {
    sidebar: {
      width: "170px",
      minWidth: "170px",
      height: "100vh",
      position: "sticky",
      top: 0,
      boxSizing: "border-box",
      background: "#FFFFFF",
      borderRight: "1px solid #ECEDEF",
      padding: "18px 10px 14px",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Poppins, Arial, sans-serif",
      flexShrink: 0,
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "0 7px",
      marginBottom: "35px",
    },

    brandIcon: {
      width: "25px",
      height: "25px",
      borderRadius: "8px",
      background: "#FCEAEC",
      color: "#C65F6B",
      display: "grid",
      placeItems: "center",
      fontSize: "13px",
    },

    brandName: {
      fontSize: "16px",
      fontWeight: "800",
      color: "#B85C68",
      margin: 0,
      letterSpacing: "-0.4px",
    },

    navigation: {
      display: "flex",
      flexDirection: "column",
      gap: "5px",
    },

    link: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      textDecoration: "none",
      color: "#687078",
      fontSize: "10px",
      fontWeight: "500",
      padding: "11px 10px",
      borderRadius: "8px",
      transition: "all 0.2s ease",
    },

    linkIcon: {
      width: "15px",
      textAlign: "center",
      fontSize: "13px",
      flexShrink: 0,
    },

    bottom: {
      marginTop: "auto",
    },

    help: {
      background: "#FBF3F3",
      border: "1px solid #F5E8E8",
      borderRadius: "9px",
      padding: "11px 9px",
      marginBottom: "12px",
    },

    helpTitle: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: "#424A50",
      fontSize: "9px",
      fontWeight: "700",
      margin: "0 0 5px",
    },

    helpText: {
      color: "#858B91",
      fontSize: "9px",
      lineHeight: 1.6,
      margin: 0,
    },

    logout: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "9px",
      padding: "10px",
      border: "none",
      background: "transparent",
      color: "#747B81",
      fontSize: "10px",
      fontWeight: "600",
      cursor: "pointer",
      borderRadius: "7px",
      textAlign: "left",
    },
  };

  const linkStyle = ({ isActive }) => ({
    ...styles.link,
    background: isActive ? "#E98791" : "transparent",
    color: isActive ? "#FFFFFF" : "#687078",
    fontWeight: isActive ? "700" : "500",
    boxShadow: isActive
      ? "0 3px 8px rgba(233,135,145,0.18)"
      : "none",
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.brandIcon}>♥</div>
        <h2 style={styles.brandName}>Sweety</h2>
      </div>

      {/* Navigation */}
      <nav style={styles.navigation}>
        <NavLink to="/dashboard" end style={linkStyle}>
          <span style={styles.linkIcon}>▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/dashboard/readings" style={linkStyle}>
          <span style={styles.linkIcon}>▤</span>
          My Readings
        </NavLink>

        <NavLink to="/dashboard/reports" style={linkStyle}>
          <span style={styles.linkIcon}>▥</span>
          Reports
        </NavLink>

        <NavLink to="/dashboard/profile" style={linkStyle}>
          <span style={styles.linkIcon}>◉</span>
          Profile
        </NavLink>
      </nav>

      {/* Bottom section */}
      <div style={styles.bottom}>
       

        <button
          type="button"
          style={styles.logout}
          onClick={handleLogout}
        >
          <span style={{ fontSize: "14px" }}>↪</span>
          Log out
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
