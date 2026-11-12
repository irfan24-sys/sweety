
import React, { useEffect, useMemo, useState } from "react";
import { getReadings } from "../api/readingApi";


const TARGET_MIN = 70;
const TARGET_MAX = 140;

const SLOTS = [
  "Morning (Fasting)",
  "After Breakfast",
  "After Lunch",
  "After Dinner",
];

const getToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const getDateObject = (date) => {
  if (!date) return new Date(NaN);
  const [year, month, day] = date.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const formatDate = (date) => {
  if (!date) return "--";
  return getDateObject(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatShortDate = (date) => {
  if (!date) return "";
  return getDateObject(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const getStatus = (value) => {
  if (value < TARGET_MIN) {
    return {
      label: "Below target",
      color: "#C65F65",
      background: "#FCE9E9",
    };
  }

  if (value > TARGET_MAX) {
    return {
      label: "Above target",
      color: "#B78130",
      background: "#FFF3DC",
    };
  }

  return {
    label: "In target",
    color: "#27966A",
    background: "#E4F5EB",
  };
};

const getPreviousMonthRange = () => {
  const now = new Date();

  const firstDay = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const lastDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    0
  );

  const toISO = (date) => {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return {
    start: toISO(firstDay),
    end: toISO(lastDay),
  };
};

const getMonthRange = () => {
  const now = new Date();

  return {
    start: `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-01`,
    end: getToday(),
  };
};

const calculateStats = (items) => {
  const values = items
    .map((item) => Number(item.value))
    .filter(Number.isFinite);

  const count = values.length;

  if (!count) {
    return {
      count: 0,
      highest: "--",
      lowest: "--",
      average: "--",
      inTarget: 0,
      percentage: 0,
    };
  }

  const inTarget = values.filter(
    (value) => value >= TARGET_MIN && value <= TARGET_MAX
  ).length;

  return {
    count,
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: (
      values.reduce((sum, value) => sum + value, 0) / count
    ).toFixed(1),
    inTarget,
    percentage: Math.round((inTarget / count) * 100),
  };
};

function Reports() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");
  const [shareMessage, setShareMessage] = useState("");

  const today = getToday();

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
      console.error("Reports API error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your glucose reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  

  const monthRange = getMonthRange();
  const previousRange = getPreviousMonthRange();

  const todayReadings = useMemo(
    () => readings.filter((item) => item.date === today),
    [readings, today]
  );

  const monthReadings = useMemo(
    () =>
      readings.filter(
        (item) =>
          item.date >= monthRange.start &&
          item.date <= monthRange.end
      ),
    [readings, monthRange.start, monthRange.end]
  );

  const previousMonthReadings = useMemo(
    () =>
      readings.filter(
        (item) =>
          item.date >= previousRange.start &&
          item.date <= previousRange.end
      ),
    [readings, previousRange.start, previousRange.end]
  );

  const selectedReadings =
    period === "daily"
      ? todayReadings
      : period === "previous"
      ? previousMonthReadings
      : monthReadings;

  const selectedStats = calculateStats(selectedReadings);
  const dailyStats = calculateStats(todayReadings);
  const monthStats = calculateStats(monthReadings);
  const previousStats = calculateStats(previousMonthReadings);

  // Time slot averages

  const slotStats = useMemo(() => {
    return SLOTS.map((slot) => {
      const slotReadings = selectedReadings.filter(
        (reading) => reading.slot === slot
      );

      const values = slotReadings.map((item) =>
        Number(item.value)
      );

      const average = values.length
        ? (
            values.reduce((sum, value) => sum + value, 0) /
            values.length
          ).toFixed(1)
        : "--";

      return {
        slot,
        count: values.length,
        average,
      };
    });
  }, [selectedReadings]);

  // Prepare individual readings for chart
  
  const chartData = useMemo(() => {
    return [...selectedReadings]
      .filter((reading) => Number.isFinite(Number(reading.value)))
      .sort((a, b) => {
        const dateCompare = (a.date || "").localeCompare(b.date || "");
        if (dateCompare !== 0) return dateCompare;
        return (a.time || "").localeCompare(b.time || "");
      })
      .slice(-20)
      .map((reading) => ({
        date: reading.date,
        time: reading.time || "",
        slot: reading.slot || "Glucose reading",
        value: Number(reading.value),
      }));
  }, [selectedReadings]);

  // SVG chart coordinates
  const chartWidth = 700;
  const chartHeight = 230;
  const chartPadding = {
    left: 45,
    right: 20,
    top: 25,
    bottom: 35,
  };

  const chartPoints = chartData.map((item, index) => {
    const usableWidth =
      chartWidth -
      chartPadding.left -
      chartPadding.right;

    const usableHeight =
      chartHeight -
      chartPadding.top -
      chartPadding.bottom;

    const x =
      chartData.length === 1
        ? chartWidth / 2
        : chartPadding.left +
          (index / (chartData.length - 1)) * usableWidth;

    // Keep chart values within a visible range.
    const value = Math.max(40, Math.min(300, item.value));

    const y =
      chartPadding.top +
      ((300 - value) / 260) * usableHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const linePoints = chartPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const targetTop =
    chartPadding.top +
    ((300 - TARGET_MAX) / 260) *
      (chartHeight - chartPadding.top - chartPadding.bottom);

  const targetBottom =
    chartPadding.top +
    ((300 - TARGET_MIN) / 260) *
      (chartHeight - chartPadding.top - chartPadding.bottom);



  const todaySlotsRecorded = SLOTS.filter((slot) =>
    todayReadings.some((reading) => reading.slot === slot)
  ).length;

  const missingSlots = SLOTS.filter(
    (slot) =>
      !todayReadings.some((reading) => reading.slot === slot)
  );

  const handlePDFExport = () => {
    window.print();
  };

  const getReportSummary = () => {
    return [
      "SWEETY - GLUCOSE HEALTH REPORT",
      `Report period: ${
        period === "daily"
          ? "Today"
          : period === "previous"
          ? "Previous month"
          : "Month to date"
      }`,
      `Total readings: ${selectedStats.count}`,
      `Highest: ${selectedStats.highest} mg/dL`,
      `Lowest: ${selectedStats.lowest} mg/dL`,
      `Average: ${selectedStats.average} mg/dL`,
      `In configured target range: ${selectedStats.percentage}%`,
    ].join("\n");
  };

  const handleShare = async () => {
    const summary = getReportSummary();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Sweety Glucose Health Report",
          text: summary,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        setShareMessage("Report summary copied to clipboard.");
      } else {
        setShareMessage("Sharing is not supported in this browser.");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setShareMessage("Unable to share the report.");
      }
    }
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
      gap: "13px",
      marginBottom: "15px",
    },

    eyebrow: {
      color: "#B85C68",
      fontSize: "9px",
      fontWeight: "700",
      letterSpacing: "0.8px",
      margin: "0 0 5px",
    },

    title: {
      color: "#252B32",
      fontSize: "clamp(19px, 2vw, 23px)",
      fontWeight: "700",
      letterSpacing: "-0.5px",
      margin: "0 0 5px",
    },

    subtitle: {
      color: "#858B91",
      fontSize: "10px",
      lineHeight: 1.6,
      margin: 0,
    },

    button: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      border: "none",
      borderRadius: "22px",
      background: "#E98791",
      color: "#FFFFFF",
      padding: "10px 15px",
      fontSize: "10px",
      fontWeight: "600",
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 4px 12px rgba(233,135,145,0.18)",
    },

    secondaryButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "7px",
      border: "1px solid #ECEDEF",
      borderRadius: "22px",
      background: "#FFFFFF",
      color: "#525B62",
      padding: "9px 13px",
      fontSize: "10px",
      fontWeight: "600",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },

    periodBar: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "6px",
      background: "#FFFFFF",
      padding: "8px",
      border: "1px solid #ECEDEF",
      borderRadius: "11px",
      marginBottom: "13px",
    },

    periodButton: {
      border: "none",
      padding: "9px 12px",
      borderRadius: "7px",
      fontSize: "9px",
      cursor: "pointer",
      fontWeight: "600",
    },

    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
      gap: "9px",
      marginBottom: "14px",
    },

    kpiCard: {
      background: "#FFFFFF",
      border: "1px solid #ECEDEF",
      borderRadius: "11px",
      padding: "13px",
      minWidth: 0,
      boxShadow: "0 3px 10px rgba(30,40,50,0.025)",
    },

    kpiLabel: {
      color: "#858B91",
      fontSize: "8px",
      fontWeight: "700",
      letterSpacing: "0.4px",
      margin: "0 0 9px",
    },

    kpiValue: {
      color: "#30343B",
      fontSize: "25px",
      fontWeight: "700",
      lineHeight: 1.1,
      margin: "0 0 6px",
    },

    unit: {
      fontSize: "9px",
      color: "#92999E",
      fontWeight: "400",
    },

    smallText: {
      color: "#858B91",
      fontSize: "9px",
      lineHeight: 1.5,
      margin: 0,
    },

    card: {
      background: "#FFFFFF",
      border: "1px solid #ECEDEF",
      borderRadius: "12px",
      padding: "14px",
      boxShadow: "0 3px 12px rgba(30,40,50,0.025)",
      minWidth: 0,
    },

    cardTitle: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#30343B",
      margin: "0 0 5px",
    },

    chartCard: {
      background: "#FFFFFF",
      border: "1px solid #ECEDEF",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "13px",
      boxShadow: "0 3px 12px rgba(30,40,50,0.025)",
    },

    lowerGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "11px",
      marginBottom: "13px",
    },

    slotRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
      padding: "9px 0",
      borderBottom: "1px solid #F0F1F2",
      fontSize: "9px",
    },

    progressTrack: {
      width: "100%",
      height: "5px",
      background: "#EEF0F1",
      borderRadius: "10px",
      overflow: "hidden",
      marginTop: "5px",
    },

    bottomBanner: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
      padding: "16px",
      background: "linear-gradient(110deg,#FFFFFF,#FFF4F4)",
      border: "1px solid #F1E9E9",
      borderRadius: "12px",
      marginTop: "13px",
    },
  };

  const renderStatCard = (
    label,
    value,
    unit,
    description,
    color
  ) => (
    <div style={styles.kpiCard}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <p style={styles.kpiLabel}>{label}</p>
        <span
          style={{
            background: color,
            width: "18px",
            height: "18px",
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            color: "#FFFFFF",
            fontSize: "10px",
          }}
        >
          ●
        </span>
      </div>

      <div style={styles.kpiValue}>
        {value}
        {unit && <span style={styles.unit}> {unit}</span>}
      </div>

      <p style={styles.smallText}>{description}</p>
    </div>
  );

  if (loading) {
    return (
      <div style={styles.card}>
        <p style={styles.subtitle}>Loading your glucose reports...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADING */}
      <section style={styles.heading}>
        <div>
          <p style={styles.eyebrow}>
            ◉ &nbsp; CHRONIC CONDITION MANAGEMENT
          </p>

          <h2 style={styles.title}>Glucose Health Reports</h2>

          <p style={styles.subtitle}>
            Detailed clinical trends, averages, and time-in-range
            analysis formatted for discussion with your healthcare
            professional.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "7px",
          }}
        >
          <button
            style={styles.secondaryButton}
            onClick={handlePDFExport}
          >
            ▤ &nbsp; Clinical PDF Export
          </button>

          <button
            style={styles.button}
            onClick={handleShare}
          >
            ↗ &nbsp; Share Report
          </button>
        </div>
      </section>

      {error && (
        <div
          style={{
            ...styles.card,
            color: "#B94D58",
            marginBottom: "12px",
            fontSize: "11px",
          }}
        >
          {error}
          <button
            onClick={fetchReadings}
            style={styles.secondaryButton}
          >
            Retry
          </button>
        </div>
      )}

      {shareMessage && (
        <p style={{ ...styles.smallText, marginBottom: "10px" }}>
          {shareMessage}
        </p>
      )}

      {/* REPORT PERIOD SELECTOR */}
      <section style={styles.periodBar}>
        {[
          ["month", "Month-to-Date (MTD)"],
          ["daily", "Daily Report"],
          ["previous", "Previous Month"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            style={{
              ...styles.periodButton,
              background:
                period === value ? "#F9E8EA" : "#F5F6F7",
              color:
                period === value ? "#B85C68" : "#667078",
            }}
          >
            {label}
          </button>
        ))}

        <div
          style={{
            marginLeft: "auto",
            fontSize: "9px",
            color: "#858B91",
          }}
        >
          Target: {TARGET_MIN}–{TARGET_MAX} mg/dL
        </div>
      </section>

      {/* KPI CARDS */}
      <section style={styles.kpiGrid}>
        {renderStatCard(
          "HIGHEST READING",
          selectedStats.highest,
          selectedStats.highest === "--" ? "" : "mg/dL",
          "Maximum recorded value",
          "#F2A5A5"
        )}

        {renderStatCard(
          "LOWEST READING",
          selectedStats.lowest,
          selectedStats.lowest === "--" ? "" : "mg/dL",
          "Minimum recorded value",
          "#B9EBD2"
        )}

        {renderStatCard(
          "AVERAGE GLUCOSE",
          selectedStats.average,
          selectedStats.average === "--" ? "" : "mg/dL",
          "Average of selected readings",
          "#B9EBD2"
        )}

        {renderStatCard(
          "TOTAL READINGS",
          selectedStats.count,
          "",
          "Saved readings in this period",
          "#E9DCEB"
        )}

        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>TIME IN TARGET RANGE</p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: `conic-gradient(#36A77B ${selectedStats.percentage * 3.6}deg, #E9ECEE 0deg)`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "#FFFFFF",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "9px",
                  fontWeight: "700",
                }}
              >
                {selectedStats.percentage}%
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "#27966A",
                  fontWeight: "700",
                  fontSize: "15px",
                }}
              >
                {selectedStats.percentage}%
              </div>
              <p style={styles.smallText}>In configured range</p>
            </div>
          </div>
        </div>
      </section>

      {/* GLUCOSE TREND CHART */}
      <section style={styles.chartCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <div>
            <h3 style={styles.cardTitle}>
              Glucose Reading Trend
            </h3>

            <p style={styles.smallText}>
              Individual glucose readings across the selected period.
            </p>
          </div>

          <span
            style={{
              background: "#E5F5EC",
              color: "#27966A",
              padding: "6px 9px",
              borderRadius: "15px",
              fontSize: "8px",
              fontWeight: "600",
              height: "fit-content",
            }}
          >
            ● Healthy range guide
          </span>
        </div>

        {chartPoints.length === 0 ? (
          <div
            style={{
              height: "180px",
              display: "grid",
              placeItems: "center",
              color: "#92999E",
              fontSize: "11px",
            }}
          >
            No glucose readings available for this period.
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              width="100%"
              style={{
                display: "block",
                minWidth: "300px",
                fontFamily: "Poppins, Arial, sans-serif",
              }}
              role="img"
              aria-label="Individual glucose readings trend chart"
            >
              {/* Target range area */}
              <rect
                x={chartPadding.left}
                y={targetTop}
                width={
                  chartWidth -
                  chartPadding.left -
                  chartPadding.right
                }
                height={targetBottom - targetTop}
                fill="#E6F5ED"
                opacity="0.8"
              />

              {/* Horizontal grid lines */}
              {[40, 100, 140, 200, 300].map((value) => {
                const y =
                  chartPadding.top +
                  ((300 - value) / 260) *
                    (chartHeight -
                      chartPadding.top -
                      chartPadding.bottom);

                return (
                  <g key={value}>
                    <line
                      x1={chartPadding.left}
                      y1={y}
                      x2={chartWidth - chartPadding.right}
                      y2={y}
                      stroke="#E9ECEE"
                      strokeDasharray="3 4"
                    />

                    <text
                      x="8"
                      y={y + 3}
                      fontSize="9"
                      fill="#899198"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Trend line */}
              {chartPoints.length > 1 && (
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#E98791"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* One point for every actual glucose reading */}
              {chartPoints.map((point, index) => (
                <g key={`${point.date}-${point.time}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="#FFFFFF"
                    stroke="#E98791"
                    strokeWidth="2.5"
                  >
                    <title>
                      {formatDate(point.date)} | {point.time} | {point.slot}: {point.value} mg/dL
                    </title>
                  </circle>
                </g>
              ))}

              {/* Date and time labels */}
              {chartPoints.map((point, index) => (
                <text
                  key={`label-${point.date}-${point.time}-${index}`}
                  x={point.x}
                  y={chartHeight - 9}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#858B91"
                >
                  {index % Math.max(
                    1,
                    Math.ceil(chartPoints.length / 6)
                  ) === 0
                    ? `${formatShortDate(point.date)}${point.time ? ` ${point.time}` : ""}`
                    : ""}
                </text>
              ))}
            </svg>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            fontSize: "9px",
            color: "#858B91",
            marginTop: "8px",
          }}
        >
          <span>● Individual glucose readings</span>
          <span style={{ color: "#27966A" }}>
            ■ Configured target band
          </span>
          <span>Range: {TARGET_MIN}–{TARGET_MAX} mg/dL</span>
        </div>
      </section>

      {/* DAILY / MONTHLY / PREVIOUS MONTH REPORTS */}
      <section style={styles.lowerGrid}>
        {/* Daily report */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <h3 style={styles.cardTitle}>Daily Report</h3>

            <span
              style={{
                ...styles.smallText,
                background: "#F5F6F7",
                padding: "5px 7px",
                borderRadius: "12px",
              }}
            >
              {formatDate(today)}
            </span>
          </div>

          <p style={styles.smallText}>
            Today's glucose readings by time slot.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "5px",
              margin: "12px 0",
              background: "#F7F8F9",
              borderRadius: "8px",
              padding: "9px 5px",
              textAlign: "center",
            }}
          >
            <div>
              <p style={styles.kpiLabel}>READINGS</p>
              <strong style={{ fontSize: "14px" }}>
                {dailyStats.count}
              </strong>
            </div>

            <div>
              <p style={styles.kpiLabel}>AVERAGE</p>
              <strong style={{ fontSize: "14px" }}>
                {dailyStats.average}
              </strong>
            </div>

            <div>
              <p style={styles.kpiLabel}>IN RANGE</p>
              <strong
                style={{
                  fontSize: "14px",
                  color: "#27966A",
                }}
              >
                {dailyStats.percentage}%
              </strong>
            </div>
          </div>

          {SLOTS.map((slot) => {
            const reading = todayReadings.find(
              (item) => item.slot === slot
            );

            const status = reading
              ? getStatus(Number(reading.value))
              : null;

            return (
              <div
                key={slot}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "6px",
                  padding: "8px 0",
                  borderBottom: "1px solid #F0F1F2",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "9px",
                      fontWeight: "600",
                      margin: 0,
                      color: "#424A50",
                    }}
                  >
                    {slot}
                  </p>
                  <p style={styles.smallText}>
                    {reading ? reading.time : "Not recorded"}
                  </p>
                </div>

                {reading ? (
                  <div style={{ textAlign: "right" }}>
                    <strong style={{ fontSize: "12px" }}>
                      {reading.value}
                    </strong>
                    <span style={styles.smallText}> mg/dL</span>
                    <div
                      style={{
                        fontSize: "8px",
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </div>
                  </div>
                ) : (
                  <span style={styles.smallText}>Pending</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Month to date */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Month-to-Date (MTD)</h3>

          <p style={styles.smallText}>
            Aggregated readings for the current month.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "4px",
              background: "#F7F8F9",
              borderRadius: "8px",
              padding: "10px 5px",
              margin: "12px 0",
              textAlign: "center",
            }}
          >
            <div>
              <p style={styles.kpiLabel}>HIGHEST</p>
              <strong style={{ fontSize: "13px" }}>
                {monthStats.highest}
              </strong>
            </div>

            <div>
              <p style={styles.kpiLabel}>LOWEST</p>
              <strong style={{ fontSize: "13px" }}>
                {monthStats.lowest}
              </strong>
            </div>

            <div>
              <p style={styles.kpiLabel}>AVERAGE</p>
              <strong style={{ fontSize: "13px" }}>
                {monthStats.average}
              </strong>
            </div>
          </div>

          <p
            style={{
              fontSize: "9px",
              color: "#858B91",
              fontWeight: "700",
              margin: "12px 0 6px",
            }}
          >
            TIME SLOT AVERAGES
          </p>

          {slotStats.map((item) => (
            <div key={item.slot} style={{ marginBottom: "10px" }}>
              <div style={styles.slotRow}>
                <span>{item.slot}</span>
                <strong>
                  {item.average === "--"
                    ? "--"
                    : `${item.average} mg/dL`}
                </strong>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    width:
                      item.average === "--"
                        ? "0%"
                        : `${Math.min(
                            100,
                            (Number(item.average) / 300) * 100
                          )}%`,
                    height: "100%",
                    background: "#54AE87",
                    borderRadius: "10px",
                  }}
                />
              </div>
            </div>
          ))}

          <div
            style={{
              background: "#E4F8ED",
              color: "#28885E",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "9px",
              marginTop: "12px",
            }}
          >
            ✓ &nbsp; {monthStats.count} readings recorded this month.
          </div>
        </div>

        {/* Previous month */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Previous Monthly Report</h3>

          <p style={styles.smallText}>
            Complete readings from the previous calendar month.
          </p>

          <div
            style={{
              background: "#F7F8F9",
              borderRadius: "8px",
              padding: "10px",
              margin: "12px 0",
            }}
          >
            <p style={styles.kpiLabel}>TOTAL READINGS</p>
            <h3
              style={{
                fontSize: "23px",
                margin: "0 0 5px",
              }}
            >
              {previousStats.count}
            </h3>

            <p style={styles.smallText}>
              Average: {previousStats.average} mg/dL
            </p>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <p style={styles.kpiLabel}>PREVIOUS MONTH SUMMARY</p>

            {[
              ["Highest", previousStats.highest],
              ["Lowest", previousStats.lowest],
              ["Average", previousStats.average],
              ["In target range", `${previousStats.percentage}%`],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "8px",
                  padding: "8px 0",
                  borderBottom: "1px solid #F0F1F2",
                  fontSize: "9px",
                }}
              >
                <span style={{ color: "#777F86" }}>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPeriod("previous")}
            style={{
              ...styles.secondaryButton,
              width: "100%",
              justifyContent: "center",
            }}
          >
            View Previous Month
          </button>
        </div>
      </section>

      {/* DATA COVERAGE */}
      <section style={styles.bottomBanner}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: "1 1 220px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "9px",
              background: "#F7E4E7",
              color: "#B85C68",
              display: "grid",
              placeItems: "center",
              fontSize: "17px",
              flexShrink: 0,
            }}
          >
            ▤
          </div>

          <div>
            <h3
              style={{
                fontSize: "12px",
                margin: "0 0 5px",
                color: "#30343B",
              }}
            >
              Daily Data Coverage
            </h3>

            <p style={styles.smallText}>
              {todaySlotsRecorded} of 4 time slots have readings recorded
              today.
              {missingSlots.length > 0
                ? ` Missing slots: ${missingSlots.join(", ")}.`
                : " All four slots have entries."}
            </p>
          </div>
        </div>

        
      </section>
    </div>
  );
}

export default Reports;
