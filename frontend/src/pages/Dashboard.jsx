
import React, { useState, useEffect } from "react";
import { addReading, getReadings } from "../api/readingApi";

function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const slots = [
    "Morning (Fasting)",
    "After Breakfast",
    "After Lunch",
    "After Dinner",
  ];

  const todayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const today = todayDate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "User";

  const [form, setForm] = useState({
    date: today,
    time: "08:30",
    slot: slots[0],
    value: "",
    notes: "",
  });

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getReadings();

      setReadings(
        Array.isArray(response.readings) ? response.readings : []
      );
    } catch (err) {
      console.error("Fetching readings error:", err);
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

  const todayReadings = readings.filter(
    (reading) => reading.date === today
  );

  const displayReadings = slots.map((slot) => {
    const reading = todayReadings.find(
      (item) => item.slot === slot
    );

    return {
      id: reading?._id,
      slot,
      time: reading?.time || "--:--",
      value: reading?.value ?? null,
      note: reading?.notes || "No notes added.",
    };
  });

  const loggedReadings = displayReadings.filter(
    (item) => item.value !== null
  );

  const values = loggedReadings.map((item) => item.value);

  const highest = values.length ? Math.max(...values) : "--";
  const lowest = values.length ? Math.min(...values) : "--";

  const average = values.length
    ? (
        values.reduce((total, value) => total + value, 0) /
        values.length
      ).toFixed(1)
    : "--";

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const openModal = (slot = slots[0]) => {
    setForm({
      date: today,
      time: new Date().toTimeString().slice(0, 5),
      slot,
      value: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const value = Number(form.value);

    if (!Number.isInteger(value) || value < 40 || value > 600) {
      alert("Enter a whole number between 40 and 600 mg/dL.");
      return;
    }

    if (form.date > todayDate()) {
      alert("Future dates are not allowed.");
      return;
    }

    const alreadyExists = readings.some(
      (reading) =>
        reading.date === form.date &&
        reading.slot === form.slot
    );

    if (alreadyExists) {
      alert("A reading already exists for this slot on this date.");
      return;
    }

    try {
      setSaving(true);

      const response = await addReading({
        date: form.date,
        time: form.time,
        slot: form.slot,
        value,
        notes: form.notes,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to save reading.");
      }

      setShowModal(false);
      setForm({
        date: todayDate(),
        time: "08:30",
        slot: slots[0],
        value: "",
        notes: "",
      });

      await fetchReadings();
    } catch (err) {
      console.error("Add reading error:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Unable to save reading."
      );
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    page: {
      width: "100%",
      minHeight: "100%",
      boxSizing: "border-box",
      color: "#30343B",
      fontFamily: "Poppins, Arial, sans-serif",
    },

    welcome: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "20px",
      padding: "24px",
      marginBottom: "20px",
      background: "linear-gradient(110deg, #FFF5F4, #FFFFFF)",
      border: "1px solid #F4E8E7",
      borderRadius: "14px",
    },

    target: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      background: "#E5F5EC",
      color: "#27845B",
      borderRadius: "20px",
      padding: "6px 10px",
      fontSize: "10px",
      fontWeight: "600",
    },

    welcomeTitle: {
      fontSize: "clamp(17px, 2vw, 21px)",
      lineHeight: 1.4,
      color: "#30343B",
      margin: "12px 0 7px",
      fontWeight: "700",
    },

    muted: {
      color: "#92979D",
      fontSize: "11px",
      lineHeight: 1.7,
      margin: 0,
    },

    primaryButton: {
      border: "none",
      borderRadius: "25px",
      background: "#C65F6B",
      color: "#FFFFFF",
      padding: "11px 18px",
      fontSize: "11px",
      fontWeight: "600",
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 4px 12px rgba(198,95,107,0.16)",
    },

    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
      gap: "12px",
      marginBottom: "25px",
    },

    summaryCard: {
      background: "#FFFFFF",
      border: "1px solid #ECEDEF",
      borderRadius: "12px",
      padding: "16px",
      minWidth: 0,
      boxShadow: "0 3px 10px rgba(35,40,50,0.025)",
    },

    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "5px",
    },

    label: {
      fontSize: "9px",
      color: "#858B91",
      fontWeight: "700",
      letterSpacing: "0.4px",
    },

    summaryValue: {
      fontSize: "29px",
      fontWeight: "700",
      color: "#252B32",
      margin: "12px 0 3px",
      lineHeight: 1.1,
    },

    unit: {
      fontSize: "10px",
      color: "#92979D",
      fontWeight: "400",
    },

    section: {
      marginTop: "24px",
    },

    sectionHeading: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
      marginBottom: "13px",
    },

    sectionTitle: {
      color: "#30343B",
      fontSize: "16px",
      fontWeight: "700",
      margin: "0 0 4px",
    },

    smallButton: {
      border: "1px solid #ECEDEF",
      borderRadius: "20px",
      background: "#FFFFFF",
      color: "#555D65",
      padding: "7px 12px",
      fontSize: "10px",
      cursor: "pointer",
      fontWeight: "600",
    },

    readingGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "12px",
    },

    readingCard: {
      background: "#FFFFFF",
      border: "1px solid #ECEDEF",
      borderRadius: "12px",
      padding: "15px",
      minWidth: 0,
      minHeight: "185px",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      boxShadow: "0 3px 10px rgba(35,40,50,0.025)",
    },

    pill: {
      fontSize: "9px",
      borderRadius: "20px",
      padding: "5px 8px",
      fontWeight: "600",
      whiteSpace: "nowrap",
    },

    readingValue: {
      fontSize: "27px",
      fontWeight: "700",
      color: "#252B32",
      margin: "12px 0 5px",
    },

    note: {
      background: "#F7F7F8",
      borderRadius: "7px",
      padding: "9px",
      fontSize: "10px",
      color: "#777F86",
      lineHeight: 1.6,
      margin: "8px 0 12px",
      flex: 1,
    },

    bottomGrid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.6fr) minmax(220px, 1fr)",
      gap: "13px",
      marginTop: "22px",
    },

    bottomCard: {
      background: "#FFFFFF",
      border: "1px solid #ECEDEF",
      borderRadius: "12px",
      padding: "17px",
      boxSizing: "border-box",
    },
  };

  return (
    <div style={styles.page}>
      {/* Welcome section */}
      <section style={styles.welcome}>
        <div style={{ flex: "1 1 250px" }}>
          <span style={styles.target}>
            ♥ &nbsp; Your personal glucose tracker
          </span>

          <h2 style={styles.welcomeTitle}>
            {greeting()}, {name}! <br />
            Let's keep track of your health today.
          </h2>

          <p style={styles.muted}>
            Monitor your readings and understand your daily patterns.
            Follow the target range recommended by your healthcare professional.
          </p>
        </div>

        <button
          style={styles.primaryButton}
          onClick={() => openModal()}
        >
          + &nbsp; Log Blood Glucose
        </button>
      </section>

      {/* Error and loading */}
      {loading && (
        <p style={styles.muted}>Loading your glucose readings...</p>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            borderRadius: "9px",
            background: "#FFF0F0",
            color: "#B94D58",
            fontSize: "12px",
            marginBottom: "15px",
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

      {/* Summary cards */}
      <section style={styles.summaryGrid}>
        {[
          {
            label: "TODAY'S READINGS",
            value: `${loggedReadings.length} / 4`,
            description: "Recorded time slots",
            color: "#C65F6B",
            badge: `${Math.round((loggedReadings.length / 4) * 100)}%`,
          },
          {
            label: "HIGHEST READING",
            value: highest,
            description: "Today's maximum",
            color: "#C17A64",
            badge: "Highest",
          },
          {
            label: "LOWEST READING",
            value: lowest,
            description: "Today's minimum",
            color: "#32936C",
            badge: "Lowest",
          },
          {
            label: "AVERAGE READING",
            value: average,
            description: "Today's average",
            color: "#568D9A",
            badge: "Average",
          },
        ].map((item) => (
          <div style={styles.summaryCard} key={item.label}>
            <div style={styles.cardTop}>
              <span style={styles.label}>{item.label}</span>
              <span
                style={{
                  ...styles.pill,
                  background: "#F9EEEE",
                  color: item.color,
                }}
              >
                {item.badge}
              </span>
            </div>

            <div style={styles.summaryValue}>
              {item.value}
              {item.label !== "TODAY'S READINGS" && (
                <span style={styles.unit}> mg/dL</span>
              )}
            </div>

            <p style={styles.muted}>{item.description}</p>
          </div>
        ))}
      </section>

      {/* Today's readings */}
      <section style={styles.section}>
        <div style={styles.sectionHeading}>
          <div>
            <h3 style={styles.sectionTitle}>
              Today's Blood Glucose Readings
            </h3>
            <p style={styles.muted}>
              Your daily readings across four time slots · {formattedDate}
            </p>
          </div>

          <button
            style={styles.smallButton}
            onClick={() => openModal()}
          >
            + New Entry
          </button>
        </div>

        <div style={styles.readingGrid}>
          {displayReadings.map((reading, index) => {
            const recorded = reading.value !== null;

            const slotNames = [
              "Morning (Fasting)",
              "After Breakfast",
              "After Lunch",
              "After Dinner",
            ];

            return (
              <article style={styles.readingCard} key={reading.slot}>
                <div style={styles.cardTop}>
                  <span style={styles.label}>
                    TIME SLOT {index + 1}
                  </span>

                  <span
                    style={{
                      ...styles.pill,
                      background: recorded ? "#E5F5EC" : "#F1F1F2",
                      color: recorded ? "#27845B" : "#858B91",
                    }}
                  >
                    {recorded ? "● Recorded" : "● Pending"}
                  </span>
                </div>

                <h4
                  style={{
                    fontSize: "12px",
                    margin: "12px 0 3px",
                    color: "#343A40",
                  }}
                >
                  {reading.slot}
                </h4>

                <p style={styles.muted}>
                  {recorded ? `Recorded at ${reading.time}` : "Not recorded yet"}
                </p>

                {recorded ? (
                  <>
                    <div style={styles.readingValue}>
                      {reading.value}
                      <span style={styles.unit}> mg/dL</span>
                    </div>

                    <p style={styles.note}>{reading.note}</p>

                    <div
                      style={{
                        fontSize: "10px",
                        color: "#27845B",
                        marginTop: "auto",
                      }}
                    >
                      ✓ &nbsp; Reading saved
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "auto",
                      paddingTop: "18px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        margin: "0 auto 8px",
                        borderRadius: "50%",
                        background: "#F5F1F1",
                        color: "#A2A2A2",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "16px",
                      }}
                    >
                      +
                    </div>

                    <p
                      style={{
                        fontSize: "12px",
                        color: "#626A70",
                        fontWeight: "600",
                        margin: "0 0 10px",
                      }}
                    >
                      Not Logged
                    </p>

                    <button
                      style={{
                        ...styles.primaryButton,
                        padding: "8px 12px",
                        fontSize: "10px",
                      }}
                      onClick={() => openModal(reading.slot)}
                    >
                      + Record Reading
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Bottom information cards */}
      <section style={styles.bottomGrid}>
        <div style={styles.bottomCard}>
          <div style={styles.cardTop}>
            <span style={styles.label}>HEALTH REMINDER</span>
            <span
              style={{
                ...styles.pill,
                background: "#F9EEEE",
                color: "#BD626B",
              }}
            >
              Daily
            </span>
          </div>

          <h4
            style={{
              fontSize: "14px",
              color: "#30343B",
              margin: "13px 0 6px",
            }}
          >
            Stay consistent with your tracking
          </h4>

          <p style={styles.muted}>
            Recording your readings regularly can help you and your
            healthcare professional review patterns over time.
          </p>
        </div>

        <div
          style={{
            ...styles.bottomCard,
            background: "#F0F7F4",
            borderColor: "#E4EFEA",
          }}
        >
          <div style={{ color: "#27845B", fontSize: "12px", fontWeight: "700" }}>
            ◈ &nbsp; Daily Insight
          </div>

          <p
            style={{
              color: "#59666A",
              fontSize: "11px",
              lineHeight: 1.7,
              margin: "12px 0 0",
            }}
          >
            Review your readings over time. Share any concerns or
            unusual patterns with your healthcare professional.
          </p>
        </div>
      </section>

      {/* Add reading modal */}
      {showModal && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(35, 40, 43, 0.42)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "15px",
          }}
        >
          <form
            onSubmit={handleSave}
            style={{
              background: "#FFFFFF",
              width: "100%",
              maxWidth: "440px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              borderRadius: "16px",
              boxSizing: "border-box",
              boxShadow: "0 15px 50px rgba(0,0,0,0.15)",
            }}
          >
            <div style={styles.cardTop}>
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#30343B",
                    fontSize: "18px",
                  }}
                >
                  Record Glucose Reading
                </h3>
                <p style={{ ...styles.muted, marginTop: "5px" }}>
                  Add your blood glucose details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  border: "none",
                  background: "#F5F5F6",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  color: "#555",
                }}
              >
                ✕
              </button>
            </div>

            <label style={fieldLabel}>Date</label>
            <input
              style={fieldStyle}
              type="date"
              name="date"
              value={form.date}
              max={todayDate()}
              onChange={handleChange}
              required
            />

            <label style={fieldLabel}>Time</label>
            <input
              style={fieldStyle}
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />

            <label style={fieldLabel}>Time Slot</label>
            <select
              style={fieldStyle}
              name="slot"
              value={form.slot}
              onChange={handleChange}
              required
            >
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>

            <label style={fieldLabel}>Glucose Value (mg/dL)</label>
            <input
              style={fieldStyle}
              type="number"
              name="value"
              min="40"
              max="600"
              step="1"
              placeholder="Enter glucose value"
              value={form.value}
              onChange={handleChange}
              required
            />

            <label style={fieldLabel}>
              Notes / Food Intake (Optional)
            </label>
            <textarea
              style={{
                ...fieldStyle,
                minHeight: "85px",
                resize: "vertical",
              }}
              name="notes"
              maxLength="500"
              placeholder="Add food intake or other notes..."
              value={form.notes}
              onChange={handleChange}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  ...styles.smallButton,
                  padding: "10px 16px",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.primaryButton,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : "✓ Save Reading"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const fieldLabel = {
  display: "block",
  fontSize: "11px",
  fontWeight: "600",
  margin: "15px 0 7px",
  color: "#4F5B60",
};

const fieldStyle = {
  display: "block",
  width: "100%",
  padding: "11px",
  border: "1px solid #E7EAEC",
  borderRadius: "8px",
  fontSize: "12px",
  outlineColor: "#C65F6B",
  background: "#FAFBFB",
  boxSizing: "border-box",
  color: "#30343B",
};

export default Dashboard;
