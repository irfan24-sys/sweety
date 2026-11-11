import React from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

function DashboardLayout() {
  const styles = {
    layout: {
      display: "flex",
      minHeight: "100vh",
      background: "#F7F8FA",
      fontFamily: "Arial, sans-serif",
    },
    main: {
      flex: 1,
      minWidth: 0,
      padding: "25px 30px",
    },
  };

  return (
    <div style={styles.layout}>
      <DashboardSidebar />

      <main style={styles.main}>
        <DashboardHeader />
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;