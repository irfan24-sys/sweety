
import React, { useEffect, useMemo, useState } from "react";
import {
  getReadings,
  addReading,
  updateReading,
  deleteReading,
} from "../api/readingApi";

const SLOTS = [
  "Morning (Fasting)",
  "After Breakfast",
  "After Lunch",
  "After Dinner",
];

// Example display range only. Configure this according to
// the individual's healthcare professional's recommendation.
const TARGET_MIN = 70;
const TARGET_MAX = 140;

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createEmptyForm = () => ({
  date: getToday(),
  time: new Date().toTimeString().slice(0, 5),
  slot: SLOTS[0],
  value: "",
  notes: "",
});

const getStatus = (value) => {
  if (value < TARGET_MIN) {
    return {
      label: "Below target",
      color: "#C65F65",
      background: "#FCE9E9",
      icon: "↓",
    };
  }

  if (value > TARGET_MAX) {
    return {
      label: "Above target",
      color: "#B78130",
      background: "#FFF3DC",
      icon: "↑",
    };
  }

  return {
    label: "In target",
    color: "#27966A",
    background: "#E4F5EB",
    icon: "✓",
  };
};

const formatDate = (date) => {
  if (!date) return "--";

  const [year, month, day] = date.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "--";

  const [hour, minute] = time.split(":");

  return new Date(
    2000,
    0,
    1,
    Number(hour),
    Number(minute)
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function MyReadings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("30");
  const [slotFilter, setSlotFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(createEmptyForm());

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch readings

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getReadings();

      setReadings(
        Array.isArray(response.readings)
          ? response.readings
          : []
      );
    } catch (err) {
      console.error("Fetch readings error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your readings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);


  // -----------------------------
  // Search and filters
  // -----------------------------

  const filteredReadings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return readings
      .filter((reading) => {
        const searchText = [
          reading.date,
          reading.time,
          reading.slot,
          reading.value,
          reading.notes,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchText.includes(
          search.trim().toLowerCase()
        );

        const readingDate = new Date(
          `${reading.date}T00:00:00`
        );

        let matchesDate = true;

        if (dateFilter !== "all") {
          const start = new Date(today);

          if (dateFilter === "7") {
            start.setDate(start.getDate() - 6);
          } else if (dateFilter === "30") {
            start.setDate(start.getDate() - 29);
          } else if (dateFilter === "month") {
            start.setDate(1);
          }

          matchesDate =
            readingDate >= start && readingDate <= today;
        }

        const matchesSlot =
          slotFilter === "All" ||
          reading.slot === slotFilter;

        const status = getStatus(Number(reading.value));

        const matchesStatus =
          statusFilter === "All" ||
          status.label === statusFilter;

        return (
          matchesSearch &&
          matchesDate &&
          matchesSlot &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          `${a.date}T${a.time || "00:00"}`
        );

        const dateB = new Date(
          `${b.date}T${b.time || "00:00"}`
        );

        return dateB - dateA;
      });
  }, [
    readings,
    search,
    dateFilter,
    slotFilter,
    statusFilter,
  ]);

  useEffect(() => {
    setPage(1);
  }, [search, dateFilter, slotFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReadings.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedReadings = filteredReadings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  // Summary calculations
  const values = readings.map((item) => Number(item.value));

  const inTarget = values.filter(
    (value) =>
      value >= TARGET_MIN && value <= TARGET_MAX
  ).length;

  const compliance = values.length
    ? Math.round((inTarget / values.length) * 100)
    : 0;

  const average = values.length
    ? (
        values.reduce((total, value) => total + value, 0) /
        values.length
      ).toFixed(1)
    : "--";

  const highest = values.length
    ? Math.max(...values)
    : "--";
  // Add / edit modal

  const openAddModal = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (reading) => {
    setEditingId(reading._id);

    setForm({
      date: reading.date,
      time: reading.time,
      slot: reading.slot,
      value: String(reading.value),
      notes: reading.notes || "",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setFormError("");
  };

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const value = Number(form.value);

    if (!Number.isInteger(value) || value < 40 || value > 600) {
      setFormError(
        "Enter a whole number between 40 and 600 mg/dL."
      );
      return;
    }

    if (form.date > getToday()) {
      setFormError("Future dates are not allowed.");
      return;
    }

    const duplicate = readings.some(
      (reading) =>
        reading._id !== editingId &&
        reading.date === form.date &&
        reading.slot === form.slot
    );

    if (duplicate) {
      setFormError(
        "A reading already exists for this time slot and date."
      );
      return;
    }

    const payload = {
      date: form.date,
      time: form.time,
      slot: form.slot,
      value,
      notes: form.notes,
    };

    try {
      setSaving(true);
      setFormError("");

      if (editingId) {
        await updateReading(editingId, payload);
      } else {
        await addReading(payload);
      }

      setShowModal(false);
      setEditingId(null);
      setForm(createEmptyForm());

      await fetchReadings();
    } catch (err) {
      console.error("Save reading error:", err);

      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save your reading."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Delete reading
  // -----------------------------

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);

      await deleteReading(deleteId);

      setDeleteId(null);
      await fetchReadings();
    } catch (err) {
      console.error("Delete reading error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete this reading."
      );
    } finally {
      setDeleting(false);
    }
  };
  // CSV export

  const exportCSV = () => {
    if (!filteredReadings.length) {
      alert("There are no readings to export.");
      return;
    }

    const headers = [
      "Date",
      "Time",
      "Time Slot",
      "Glucose Value (mg/dL)",
      "Status",
      "Notes",
    ];

    const rows = filteredReadings.map((reading) => [
      reading.date,
      reading.time,
      reading.slot,
      reading.value,
      getStatus(Number(reading.value)).label,
      reading.notes || "",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sweety-glucose-readings.csv";
    link.click();

    URL.revokeObjectURL(url);
  };
 
  const styles = {
    page: {
      width: "100%",
      color: "#30343B",
      fontFamily: "Poppins, Arial, sans-serif",
    },

    heading: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "15px",
      marginBottom: "18px",
    },

    eyebrow: {
      fontSize: "9px",
      color: "#B85C68",
      fontWeight: "700",
      letterSpacing: "1px",
      margin: "0 0 6px",
    },

    title: {
      fontSize: "clamp(19px, 2vw, 23px)",
      fontWeight: "700",
      margin: "0 0 5px",
      color: "#252B32",
      letterSpacing: "-0.5px",
    },

    subtitle: {
      fontSize: "10px",
      color: "#858B91",
      margin: 0,
      lineHeight: 1.7,
    },

    primaryButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      background: "#E98791",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "24px",
      padding: "10px 17px",
      fontSize: "10px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(233,135,145,0.2)",
      whiteSpace: "nowrap",
    },

    totalBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 12px",
      background: "#FFFFFF",
      border: "1px solid #EDF0F1",
      borderRadius: "25px",
      fontSize: "9px",
      color: "#525B62",
      marginBottom: "9px",
      boxShadow: "0 3px 9px rgba(0,0,0,0.025)",
    },

    toolbar: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "7px",
      padding: "9px",
      background: "#FFFFFF",
      border: "1px solid #ECEDEF",
      borderRadius: "12px",
      marginBottom: "14px",
      boxShadow: "0 3px 12px rgba(30,40,50,0.025)",
    },

    search: {
      flex: "1 1 170px",
      minWidth: "130px",
      border: "1px solid transparent",
      outline: "none",
      background: "#F5F6F7",
      padding: "11px 12px",
      borderRadius: "8px",
      fontSize: "10px",
      color: "#30343B",
      boxSizing: "border-box",
    },

    select: {
      flex: "1 1 110px",
      minWidth: "100px",
      border: "1px solid transparent",
      outline: "none",
      background: "#F5F6F7",
      padding: "11px 8px",
      borderRadius: "8px",
      fontSize: "10px",
      color: "#4F5960",
      boxSizing: "border-box",
      cursor: "pointer",
    },

    exportButton: {
      border: "1px solid #ECEDEF",
      background: "#FFFFFF",
      borderRadius: "8px",
      padding: "10px 12px",
      fontSize: "10px",
      color: "#596168",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },

    tableCard: {
      background: "#FFFFFF",
      border: "1px solid #ECEDEF",
      borderRadius: "13px",
      overflow: "hidden",
      boxShadow: "0 4px 14px rgba(30,40,50,0.03)",
    },

    tableScroll: {
      width: "100%",
      overflowX: "auto",
    },

    table: {
      width: "100%",
      minWidth: "800px",
      borderCollapse: "collapse",
      textAlign: "left",
    },

    th: {
      background: "#F7F8F9",
      color: "#727B82",
      padding: "14px 12px",
      fontSize: "9px",
      fontWeight: "700",
      letterSpacing: "0.35px",
      whiteSpace: "nowrap",
    },

    td: {
      padding: "13px 12px",
      borderBottom: "1px solid #F0F1F2",
      fontSize: "10px",
      color: "#454D53",
      verticalAlign: "middle",
    },

    status: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "5px 9px",
      borderRadius: "20px",
      fontSize: "9px",
      fontWeight: "600",
      whiteSpace: "nowrap",
    },

    slotBadge: {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: "20px",
      background: "#F4E6E8",
      color: "#A95864",
      fontSize: "9px",
      fontWeight: "600",
      whiteSpace: "nowrap",
    },

    actionButton: {
      border: "none",
      background: "transparent",
      color: "#747C83",
      cursor: "pointer",
      fontSize: "15px",
      padding: "5px 7px",
      borderRadius: "6px",
    },

    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
      padding: "13px 15px",
      fontSize: "9px",
      color: "#737B81",
    },

    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "11px",
      marginTop: "14px",
    },

    summaryCard: {
      background: "#FFFFFF",
      border: "1px solid #ECEDEF",
      borderRadius: "12px",
      padding: "15px",
      display: "flex",
      alignItems: "flex-start",
      gap: "11px",
      boxShadow: "0 3px 12px rgba(30,40,50,0.025)",
      minWidth: 0,
    },

    summaryIcon: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      fontSize: "16px",
    },

    summaryLabel: {
      color: "#858B91",
      fontSize: "9px",
      fontWeight: "700",
      margin: "0 0 6px",
    },

    summaryValue: {
      fontSize: "17px",
      color: "#30343B",
      fontWeight: "700",
      margin: "0 0 5px",
    },

    summaryText: {
      fontSize: "9px",
      color: "#858B91",
      lineHeight: 1.6,
      margin: 0,
    },
  };

  return (
    <div style={styles.page}>
      {/* PAGE HEADING */}
      <section style={styles.heading}>
        <div>
          <p style={styles.eyebrow}>
            BIOMETRIC LOG &nbsp; • &nbsp; ● CONTINUOUS SYNC
          </p>

          <h2 style={styles.title}>My Readings Logbook</h2>

          <p style={styles.subtitle}>
            Review, filter, and manage your complete historical glucose logs
            with automated clinical range categorization.
          </p>
        </div>

        <div>
          <div style={styles.totalBadge}>
            <span style={{ color: "#26966A" }}>●</span>
            <strong>{readings.length}</strong> total logs recorded
            <span style={{ color: "#B8BEC2" }}>•</span>
            <strong style={{ color: "#26966A" }}>
              {compliance}% in target range
            </strong>
          </div>

          <div>
            <button
              style={styles.primaryButton}
              onClick={openAddModal}
            >
              + &nbsp; Add New Reading
            </button>
          </div>
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section style={styles.toolbar}>
        <input
          type="search"
          placeholder="⌕  Search notes, tags, fasting..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={styles.search}
        />

        <select
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          style={styles.select}
        >
          <option value="30">Last 30 Days</option>
          <option value="7">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>

        <select
          value={slotFilter}
          onChange={(event) => setSlotFilter(event.target.value)}
          style={styles.select}
        >
          <option value="All">All Time Slots</option>
          {SLOTS.map((slot) => (
            <option value={slot} key={slot}>
              {slot}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={styles.select}
        >
          <option value="All">All Statuses</option>
          <option value="In target">In Target</option>
          <option value="Below target">Below Target</option>
          <option value="Above target">Above Target</option>
        </select>

        <button
          style={styles.exportButton}
          onClick={exportCSV}
        >
          ↓ &nbsp; Export CSV
        </button>
      </section>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "#FFF0F0",
            color: "#B94D58",
            padding: "12px",
            borderRadius: "9px",
            marginBottom: "12px",
            fontSize: "11px",
          }}
        >
          {error}
          <button
            onClick={fetchReadings}
            style={{
              border: "none",
              background: "transparent",
              color: "#B94D58",
              fontWeight: "700",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* READINGS TABLE */}
      <section style={styles.tableCard}>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>DATE & TIME</th>
                <th style={styles.th}>TIME SLOT</th>
                <th style={styles.th}>GLUCOSE VALUE</th>
                <th style={styles.th}>CLINICAL STATUS</th>
                <th style={styles.th}>MEAL & ACTIVITY NOTES</th>
                <th style={styles.th}>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      padding: "35px",
                    }}
                  >
                    Loading your glucose readings...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      padding: "25px",
                    }}
                  >
                    Unable to display readings.
                  </td>
                </tr>
              ) : paginatedReadings.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      padding: "45px 15px",
                    }}
                  >
                    <div style={{ fontSize: "25px", marginBottom: "8px" }}>
                      ♡
                    </div>
                    <strong>No readings found</strong>
                    <p style={styles.summaryText}>
                      Try changing your filters or add a new reading.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedReadings.map((reading) => {
                  const status = getStatus(Number(reading.value));

                  return (
                    <tr key={reading._id}>
                      <td style={styles.td}>
                        <strong
                          style={{
                            color: "#30343B",
                            fontSize: "10px",
                          }}
                        >
                          {formatDate(reading.date)}
                        </strong>

                        <div
                          style={{
                            ...styles.summaryText,
                            marginTop: "5px",
                          }}
                        >
                          ◷ &nbsp; {formatTime(reading.time)}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.slotBadge}>
                          {reading.slot}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <strong
                          style={{
                            fontSize: "14px",
                            color: "#30343B",
                          }}
                        >
                          {reading.value}
                        </strong>
                        <span style={styles.summaryText}>
                          {" "}mg/dL
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.status,
                            color: status.color,
                            background: status.background,
                          }}
                        >
                          {status.icon} &nbsp; {status.label}
                        </span>
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          maxWidth: "190px",
                        }}
                      >
                        <div
                          title={reading.notes || "No notes"}
                          style={{
                            color: "#414950",
                            fontSize: "10px",
                            lineHeight: 1.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {reading.notes || "No notes added"}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <button
                          type="button"
                          title="Edit reading"
                          aria-label="Edit reading"
                          style={styles.actionButton}
                          onClick={() => openEditModal(reading)}
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          title="Delete reading"
                          aria-label="Delete reading"
                          style={styles.actionButton}
                          onClick={() => setDeleteId(reading._id)}
                        >
                          ♲
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={styles.footer}>
          <span>
            Showing{" "}
            {filteredReadings.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" "}to{" "}
            {Math.min(
              currentPage * pageSize,
              filteredReadings.length
            )}
            {" "}of {filteredReadings.length} readings
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setPage((previous) => Math.max(1, previous - 1))
              }
              style={pageButton}
            >
              ‹
            </button>

            <span
              style={{
                background: "#A64F5D",
                color: "#FFFFFF",
                padding: "6px 11px",
                borderRadius: "7px",
                fontWeight: "600",
              }}
            >
              {currentPage}
            </span>

            <span style={{ color: "#858B91" }}>
              of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((previous) =>
                  Math.min(totalPages, previous + 1)
                )
              }
              style={pageButton}
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* BOTTOM SUMMARY CARDS */}
      <section style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#DDF7EB",
              color: "#27966A",
            }}
          >
            ◉
          </div>

          <div>
            <p style={styles.summaryLabel}>TARGET RANGE LOGS</p>
            <h3 style={styles.summaryValue}>
              {inTarget} / {readings.length}
            </h3>
            <p style={styles.summaryText}>
              {compliance}% of recorded readings are in the configured range.
            </p>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#F0E8F1",
              color: "#87638E",
            }}
          >
            ▤
          </div>

          <div>
            <p style={styles.summaryLabel}>AVERAGE GLUCOSE</p>
            <h3 style={styles.summaryValue}>
              {average}
              <span style={{ fontSize: "10px", fontWeight: "400" }}>
                {" "}mg/dL
              </span>
            </h3>
            <p style={styles.summaryText}>
              Average across all recorded readings.
            </p>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#FCEAEC",
              color: "#C65F6B",
            }}
          >
            ♡
          </div>

          <div>
            <p style={styles.summaryLabel}>HIGHEST RECORDED</p>
            <h3 style={styles.summaryValue}>
              {highest}
              {highest !== "--" && (
                <span style={{ fontSize: "10px", fontWeight: "400" }}>
                  {" "}mg/dL
                </span>
              )}
            </h3>
            <p style={styles.summaryText}>
              Highest value in your saved readings.
            </p>
          </div>
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div
          style={overlay}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <form onSubmit={handleSubmit} style={modal}>
            <div style={modalHeader}>
              <div>
                <h3 style={modalTitle}>
                  {editingId ? "Edit Reading" : "Add New Reading"}
                </h3>
                <p style={styles.subtitle}>
                  Enter your glucose reading details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                style={closeButton}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={formErrorStyle}>
                {formError}
              </div>
            )}

            <label style={fieldLabel}>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              max={getToday()}
              onChange={handleChange}
              style={fieldStyle}
              required
            />

            <label style={fieldLabel}>Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              style={fieldStyle}
              required
            />

            <label style={fieldLabel}>Time Slot</label>
            <select
              name="slot"
              value={form.slot}
              onChange={handleChange}
              style={fieldStyle}
              required
            >
              {SLOTS.map((slot) => (
                <option value={slot} key={slot}>
                  {slot}
                </option>
              ))}
            </select>

            <label style={fieldLabel}>
              Glucose Value (mg/dL)
            </label>
            <input
              type="number"
              name="value"
              min="40"
              max="600"
              step="1"
              value={form.value}
              onChange={handleChange}
              placeholder="Enter glucose value"
              style={fieldStyle}
              required
            />

            <label style={fieldLabel}>
              Meal & Activity Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              maxLength="500"
              placeholder="Add your notes..."
              style={{
                ...fieldStyle,
                minHeight: "85px",
                resize: "vertical",
              }}
            />

            <div style={modalActions}>
              <button
                type="button"
                onClick={closeModal}
                style={cancelButton}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  ...styles.primaryButton,
                  opacity: saving ? 0.6 : 1,
                }}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Reading"
                  : "Save Reading"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth: "370px" }}>
            <div style={{ fontSize: "25px", marginBottom: "10px" }}>
              ♲
            </div>

            <h3 style={{ fontSize: "17px", margin: "0 0 8px" }}>
              Delete this reading?
            </h3>

            <p style={styles.subtitle}>
              This action cannot be undone. Are you sure you want to
              permanently delete this reading?
            </p>

            <div style={modalActions}>
              <button
                onClick={() => setDeleteId(null)}
                style={cancelButton}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  ...styles.primaryButton,
                  background: "#C65F6B",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete Reading"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------
// Shared styles
// -----------------------------

const pageButton = {
  border: "1px solid #ECEDEF",
  background: "#FFFFFF",
  color: "#697078",
  borderRadius: "6px",
  padding: "6px 10px",
  cursor: "pointer",
};

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(30,35,40,0.42)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "15px",
};

const modal = {
  width: "100%",
  maxWidth: "440px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxSizing: "border-box",
  background: "#FFFFFF",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 15px 45px rgba(0,0,0,0.15)",
  fontFamily: "Poppins, Arial, sans-serif",
};

const modalHeader = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "15px",
};

const modalTitle = {
  margin: "0 0 5px",
  fontSize: "18px",
  color: "#30343B",
};

const closeButton = {
  border: "none",
  background: "#F5F5F6",
  borderRadius: "50%",
  width: "31px",
  height: "31px",
  cursor: "pointer",
  color: "#555D65",
};

const fieldLabel = {
  display: "block",
  margin: "13px 0 6px",
  fontSize: "11px",
  color: "#4F5960",
  fontWeight: "600",
};

const fieldStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #E7EAEC",
  borderRadius: "8px",
  background: "#FAFBFB",
  padding: "11px",
  fontSize: "12px",
  color: "#30343B",
  outlineColor: "#E98791",
};

const formErrorStyle = {
  background: "#FFF0F0",
  color: "#B94D58",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "11px",
  lineHeight: 1.5,
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "9px",
  marginTop: "20px",
};

const cancelButton = {
  border: "1px solid #ECEDEF",
  background: "#FFFFFF",
  color: "#596168",
  borderRadius: "20px",
  padding: "9px 15px",
  fontSize: "10px",
  cursor: "pointer",
};

export default MyReadings;
