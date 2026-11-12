
import React, { useState, useEffect, useCallback } from "react";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notificationApi";

function DashboardHeader() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "User";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);

      const data = await getNotifications();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(
        "Notification Fetch Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // MARK SINGLE NOTIFICATION AS READ
  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      await fetchNotifications();
    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error.response?.data || error.message
      );
    }
  };

 
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      await fetchNotifications();
    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error.response?.data || error.message
      );
    }
  };

  

  const styles = {
    header: {
      width: "100%",
      minHeight: "64px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "14px",
      padding: "10px 24px",
      boxSizing: "border-box",
      background: "#FFFFFF",
      borderBottom: "1px solid #F0F0F1",
      fontFamily: "Poppins, Arial, sans-serif",
      position: "relative",
      zIndex: 20,
    },

    greeting: {
      minWidth: "180px",
    },

    title: {
      fontSize: "17px",
      fontWeight: "700",
      color: "#30343B",
      margin: 0,
      lineHeight: 1.4,
    },

    subtitle: {
      fontSize: "9px",
      color: "#4D9A7A",
      letterSpacing: "0.7px",
      fontWeight: "700",
      margin: "3px 0 0",
    },

    actions: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      flexWrap: "wrap",
      gap: "12px",
    },

    date: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      padding: "9px 12px",
      border: "1px solid #EEEEF0",
      borderRadius: "9px",
      background: "#FFFFFF",
      color: "#697078",
      fontSize: "10px",
      whiteSpace: "nowrap",
    },

    addButton: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      background: "#E98791",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "22px",
      padding: "10px 17px",
      fontSize: "11px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(233,135,145,0.2)",
      whiteSpace: "nowrap",
    },

    notificationWrapper: {
      position: "relative",
    },

    iconButton: {
      width: "38px",
      height: "38px",
      border: "none",
      borderRadius: "50%",
      background: "#FFF5F5",
      color: "#A64F5D",
      fontSize: "19px",
      cursor: "pointer",
      position: "relative",
      display: "grid",
      placeItems: "center",
    },

    notificationBadge: {
      position: "absolute",
      top: "-3px",
      right: "-4px",
      minWidth: "17px",
      height: "17px",
      padding: "0 4px",
      boxSizing: "border-box",
      borderRadius: "20px",
      background: "#E74C3C",
      color: "#FFFFFF",
      fontSize: "10px",
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid #FFFFFF",
    },

    dropdown: {
      position: "absolute",
      top: "48px",
      right: "0",
      width: "350px",
      maxWidth: "calc(100vw - 30px)",
      maxHeight: "420px",
      overflowY: "auto",
      background: "#FFFFFF",
      border: "1px solid #EEEEF0",
      borderRadius: "13px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.13)",
      zIndex: 1000,
    },

    dropdownHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px",
      borderBottom: "1px solid #F0F0F1",
      gap: "8px",
    },

    dropdownTitle: {
      margin: 0,
      color: "#30343B",
      fontSize: "14px",
      fontWeight: "700",
    },

    markAllButton: {
      border: "none",
      background: "transparent",
      color: "#A64F5D",
      fontSize: "11px",
      cursor: "pointer",
      fontWeight: "600",
    },

    notificationItem: {
      padding: "13px 15px",
      borderBottom: "1px solid #F2F2F2",
    },

    unreadItem: {
      background: "#FFF5F5",
    },

    notificationTitle: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#30343B",
      margin: "0 0 6px",
    },

    notificationMessage: {
      fontSize: "11px",
      lineHeight: 1.6,
      color: "#697078",
      margin: "0 0 7px",
    },

    notificationDate: {
      fontSize: "10px",
      color: "#999999",
    },

    markReadButton: {
      display: "block",
      marginTop: "8px",
      padding: 0,
      border: "none",
      background: "transparent",
      color: "#A64F5D",
      fontSize: "11px",
      fontWeight: "600",
      cursor: "pointer",
    },

    emptyMessage: {
      padding: "25px 15px",
      textAlign: "center",
      fontSize: "12px",
      color: "#999999",
    },

    avatar: {
      width: "35px",
      height: "35px",
      borderRadius: "50%",
      background: "#A64F5D",
      color: "#FFFFFF",
      display: "grid",
      placeItems: "center",
      fontSize: "13px",
      fontWeight: "700",
      position: "relative",
      flexShrink: 0,
    },

    online: {
      position: "absolute",
      width: "8px",
      height: "8px",
      background: "#40B982",
      border: "2px solid #FFFFFF",
      borderRadius: "50%",
      right: "-1px",
      bottom: "0",
    },
  };

  return (
    <header style={styles.header}>
      {/* GREETING */}
      <div style={styles.greeting}>
        <h2 style={styles.title}>Hello, {name}!</h2>
        <p style={styles.subtitle}>
          YOUR DAILY HEALTH MANAGEMENT
        </p>
      </div>

      {/* HEADER ACTIONS */}
      <div style={styles.actions}>
        {/* DATE */}
        <div style={styles.date}>
          <span>▦</span>
          {today}
        </div>

       

        {/* NOTIFICATION BELL */}
        <div style={styles.notificationWrapper}>
          <button
            type="button"
            style={styles.iconButton}
            aria-label="Notifications"
            aria-expanded={showNotifications}
            title="Notifications"
            onClick={() => {
              setShowNotifications((previous) => !previous);
              fetchNotifications();
            }}
          >
            ♧

            {unreadCount > 0 && (
              <span style={styles.notificationBadge}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          {showNotifications && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <h3 style={styles.dropdownTitle}>
                  Notifications ({unreadCount})
                </h3>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    style={styles.markAllButton}
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {loadingNotifications && notifications.length === 0 ? (
                <p style={styles.emptyMessage}>
                  Loading notifications...
                </p>
              ) : notifications.length === 0 ? (
                <p style={styles.emptyMessage}>
                  No notifications yet.
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    style={{
                      ...styles.notificationItem,
                      ...(notification.isRead
                        ? {}
                        : styles.unreadItem),
                    }}
                  >
                    <h4 style={styles.notificationTitle}>
                      {notification.type === "low" ? "⚠️ " : "🔔 "}
                      {notification.title}
                    </h4>

                    <p style={styles.notificationMessage}>
                      {notification.message}
                    </p>

                    <span style={styles.notificationDate}>
                      {notification.date} | {notification.time}
                    </span>

                    {!notification.isRead && (
                      <button
                        type="button"
                        style={styles.markReadButton}
                        onClick={() =>
                          handleMarkRead(notification._id)
                        }
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* USER AVATAR */}
        <div style={styles.avatar} title={name}>
          {name.charAt(0).toUpperCase()}
          <span style={styles.online} />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
