
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SweetyLandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const colors = {
    coral: "#E9858B",
    coralDark: "#A84C55",
    ink: "#242326",
    muted: "#68646A",
    border: "#EEE8EB",
    green: "#169B76",
  };

  const navItems = [
    ["Features", "#features"],
    ["How It Works", "#how-it-works"],
    ["Clinical Accuracy", "#clinical-accuracy"],
    ["Pricing", "#pricing"],
    ["Reviews", "#reviews"],
  ];

  const trustItems = [
    { icon: "◉", name: "Dexcom", detail: "G6 / G7 Direct Sync", color: "#D96A79" },
    { icon: "◉", name: "FreeStyle Libre", detail: "Libre 2 & 3 Continuous", color: "#159C78" },
    { icon: "♡", name: "Apple Health", detail: "Bi-directional Kit", color: "#F17B89" },
    { icon: "✣", name: "Health Connect", detail: "Android Unified API", color: "#23A981" },
    { icon: "✿", name: "ADA Protocol", detail: "Clinical Standard TIR", color: "#C85E68" },
  ];

  const pillButton = {
    border: "none",
    borderRadius: 30,
    padding: "14px 23px",
    background: "linear-gradient(135deg, #E9858B, #D96F7B)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(210,112,123,.22)",
    transition: "all .25s ease",
  };

  const card = {
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 14px 38px rgba(65,47,57,.075)",
  };

  const hoverButton = (e, active) => {
    e.currentTarget.style.transform = active
      ? "translateY(-3px) scale(1.02)"
      : "translateY(0) scale(1)";

    e.currentTarget.style.boxShadow = active
      ? "0 13px 25px rgba(190,91,105,.30)"
      : "0 8px 20px rgba(210,112,123,.22)";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        background: "#F7F8FA",
        color: colors.ink,
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        html {
          scroll-behavior: smooth;
        }

        * {
          box-sizing: border-box;
        }

        .sweety-nav-link {
          color: #55515A;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          position: relative;
          transition: color .2s ease;
        }

        .sweety-nav-link:after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -7px;
          width: 0;
          height: 2px;
          border-radius: 4px;
          background: #E9858B;
          transition: width .25s ease;
        }

        .sweety-nav-link:hover {
          color: #A84C55;
        }

        .sweety-nav-link:hover:after {
          width: 100%;
        }

        .sweety-trust-card {
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .sweety-trust-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 25px rgba(50,40,50,.09);
        }

        .sweety-float-top {
          animation: sweetyFloat 4s ease-in-out infinite;
        }

        .sweety-float-bottom {
          animation: sweetyFloat 4.5s ease-in-out infinite reverse;
        }

        .sweety-dashboard {
          animation: sweetyRise .8s ease both;
        }

        .sweety-copy {
          animation: sweetyFade .8s ease both;
        }

        .sweety-glow {
          animation: sweetyPulse 4s ease-in-out infinite;
        }

        .sweety-demo {
          animation: sweetyRise .35s ease both;
        }

        @keyframes sweetyFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes sweetyRise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sweetyFade {
          from {
            opacity: 0;
            transform: translateX(-18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes sweetyPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(233,133,139,.12);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(233,133,139,0);
          }
        }

        .sweety-primary:hover {
          transform: translateY(-3px) scale(1.02);
          filter: brightness(1.05);
        }

        .sweety-secondary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(168,76,85,.13);
        }

        @media (max-width: 900px) {
          .sweety-desktop-nav {
            gap: 14px !important;
          }

          .sweety-hero {
            padding-top: 48px !important;
          }

          .sweety-hero-inner {
            gap: 38px !important;
          }
        }

        @media (max-width: 680px) {
          .sweety-header {
            padding: 12px 5% !important;
          }

          .sweety-desktop-nav {
            display: none !important;
          }

          .sweety-mobile-menu {
            display: flex !important;
          }

          .sweety-signin {
            display: none !important;
          }

          .sweety-hero {
            padding: 42px 5% 55px !important;
          }

          .sweety-hero-inner {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .sweety-copy {
            min-width: 0 !important;
          }

          .sweety-copy h1 {
            font-size: clamp(31px, 9vw, 43px) !important;
          }

          .sweety-dashboard-wrap {
            min-width: 0 !important;
            width: 100%;
            margin-top: 8px !important;
          }

          .sweety-floating-left {
            left: -5px !important;
          }

          .sweety-floating-right {
            right: -5px !important;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <header
        className="sweety-header"
        style={{
          minHeight: 68,
          padding: "10px 3.5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 22,
          background: "rgba(255,255,255,.91)",
          borderBottom: `1px solid ${colors.border}`,
          boxShadow: "0 3px 18px rgba(40,30,40,.035)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(14px)",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            textDecoration: "none",
            color: colors.coralDark,
            minWidth: 145,
          }}
        >
          <span
            style={{
              width: 39,
              height: 35,
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              background: "#FFF0F1",
              fontSize: 22,
            }}
          >
            🩺
          </span>

          <span>
            <strong style={{ display: "block", fontSize: 19 }}>
              Sweety
            </strong>
            <small
              style={{
                display: "block",
                marginTop: 4,
                color: "#777078",
                fontSize: 8,
                letterSpacing: 1.5,
                fontWeight: 700,
              }}
            >
              GLUCOSE CARE
            </small>
          </span>
        </Link>

        <nav
          className="sweety-desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 25,
            flex: "1 1 300px",
          }}
        >
          {navItems.map(([label, href]) => (
            <a key={label} href={href} className="sweety-nav-link">
              {label}
            </a>
          ))}
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
          }}
        >
          <button
            className="sweety-signin"
            onClick={() => navigate("/login")}
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              color: "#55515A",
              fontSize: 12,
            }}
          >
            Sign In
          </button>

          <button
            className="sweety-primary"
            onClick={() => navigate("/signup")}
            onMouseEnter={(e) => hoverButton(e, true)}
            onMouseLeave={(e) => hoverButton(e, false)}
            style={pillButton}
          >
            Get Started Free
          </button>

          <button
            aria-label="Open login"
            onClick={() => navigate("/login")}
            style={{
              width: 32,
              height: 32,
              border: "none",
              borderRadius: "50%",
              background: "#A64F59",
              color: "#fff",
              cursor: "pointer",
              fontSize: 15,
              transition: "transform .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotate(12deg) scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotate(0) scale(1)";
            }}
          >
            ♟
          </button>

          <button
            className="sweety-mobile-menu"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((open) => !open)}
            style={{
              display: "none",
              border: 0,
              background: "#FFF0F1",
              color: colors.coralDark,
              borderRadius: 9,
              padding: "8px 11px",
              fontSize: 19,
              cursor: "pointer",
            }}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              padding: 18,
              background: "#fff",
              boxShadow: "0 12px 20px rgba(30,20,30,.08)",
              display: "grid",
              gap: 16,
            }}
          >
            {navItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="sweety-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}

            <button
              onClick={() => navigate("/login")}
              style={{
                border: 0,
                background: "transparent",
                textAlign: "left",
                padding: 0,
                color: colors.coralDark,
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <main
        id="home"
        className="sweety-hero"
        style={{
          padding: "68px 5.2% 62px",
          background:
            "radial-gradient(ellipse at 72% 42%, rgba(249,225,230,.78) 0%, rgba(249,225,230,.35) 24%, transparent 54%), linear-gradient(110deg,#F8FAFB 0%,#F8F5F6 58%,#F7F9FA 100%)",
        }}
      >
        <div
          className="sweety-hero-inner"
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
          }}
        >
          {/* LEFT CONTENT */}
          <section
            className="sweety-copy"
            style={{
              flex: "1 1 430px",
              minWidth: 280,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 13px",
                borderRadius: 30,
                background: "#fff",
                boxShadow: "0 5px 18px rgba(50,40,50,.055)",
                marginBottom: 27,
                fontSize: 10,
                color: "#4F4B50",
              }}
            >
              <span style={{ color: "#F2A22E", letterSpacing: 1 }}>
                ★★★★★
              </span>
              <strong>4.9/5</strong> by 24,000+ Diabetic Patients
              <span style={{ color: colors.green }}>
                ✚ Health tracking
              </span>
            </div>

            <h1
              style={{
                margin: "0 0 13px",
                maxWidth: 650,
                fontSize: "clamp(31px, 4vw, 48px)",
                lineHeight: 1.13,
                letterSpacing: -1.7,
                fontWeight: 800,
                color: colors.ink,
              }}
            >
              Take the anxiety out of diabetes.

              <span
                style={{
                  display: "block",
                  color: colors.coralDark,
                }}
              >
                Meet your daily glucose companion.
              </span>
            </h1>

            <p
              style={{
                maxWidth: 590,
                margin: "0 0 25px",
                color: colors.muted,
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              Seamless glucose tracking, intelligent post-meal insights,
              and easy-to-read reports designed to help you understand
              your daily readings and discuss them with your healthcare professional.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                className="sweety-primary"
                onClick={() => navigate("/signup")}
                onMouseEnter={(e) => hoverButton(e, true)}
                onMouseLeave={(e) => hoverButton(e, false)}
                style={{
                  ...pillButton,
                  padding: "15px 25px",
                }}
              >
                Get Started Free
                <span style={{ marginLeft: 12 }}>➜</span>
              </button>

              <button
                className="sweety-secondary"
                onClick={() => setShowDemo((value) => !value)}
                style={{
                  border: "none",
                  borderRadius: 24,
                  padding: "14px 22px",
                  background: "#F3E2E4",
                  color: "#8F4650",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all .25s ease",
                }}
              >
                ▶ {showDemo ? "Hide Dashboard Demo" : "Patient Dashboard Demo"}
              </button>
            </div>

            <div
              style={{
                marginTop: 22,
                color: "#656169",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <span style={{ color: colors.green }}>▣</span>
              Record readings manually and review your trends in one place.
            </div>
          </section>

          {/* RIGHT DASHBOARD PREVIEW */}
          <section
            className="sweety-dashboard-wrap sweety-dashboard"
            style={{
              flex: "1 1 390px",
              minWidth: 280,
              maxWidth: 520,
              position: "relative",
              padding: "18px 0 20px",
              margin: "0 auto",
            }}
          >
            <div
              className="sweety-float-top sweety-floating-left"
              style={{
                ...card,
                position: "absolute",
                zIndex: 2,
                top: 0,
                left: -28,
                padding: "15px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 190,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#F9E8EA",
                  color: colors.coralDark,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                }}
              >
                ☀
              </div>

              <div>
                <div style={{ color: "#777078", fontSize: 10 }}>
                  Morning Fasting
                </div>
                <strong style={{ fontSize: 20 }}>88</strong>
                <span style={{ color: "#777078", fontSize: 10 }}>
                  {" "}mg/dL
                </span>
                <span
                  style={{
                    marginLeft: 7,
                    color: colors.green,
                    background: "#E9F8F2",
                    borderRadius: 8,
                    padding: "3px 6px",
                    fontSize: 9,
                  }}
                >
                  Sample
                </span>
              </div>
            </div>

            <div
              style={{
                ...card,
                marginLeft: 18,
                marginTop: 25,
                padding: "26px 24px 22px",
                minHeight: 340,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    background: "#F5F5F6",
                    color: "#777078",
                    padding: "5px 9px",
                    borderRadius: 7,
                    fontSize: 9,
                  }}
                >
                  Sample dashboard
                </span>
              </div>

              <div
                className="sweety-glow"
                style={{
                  width: 155,
                  height: 155,
                  margin: "18px auto 20px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle,#FFF1F2 0%,#FCE6E9 58%,#FFF 59%)",
                  display: "grid",
                  placeItems: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 92,
                    borderRadius: 19,
                    background: "#fff",
                    border: "1px solid #F1E6E8",
                    boxShadow: "0 8px 20px rgba(180,100,115,.10)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <small style={{ color: colors.green, fontSize: 8 }}>
                    ● SAMPLE
                  </small>
                  <strong style={{ fontSize: 26, color: "#343139" }}>
                    108
                  </strong>

                  <svg width="55" height="20" viewBox="0 0 55 20">
                    <path
                      d="M2 14 C10 14 12 7 20 10 S31 14 37 8 S47 7 53 4"
                      fill="none"
                      stroke="#25A982"
                      strokeWidth="2"
                    />
                  </svg>

                  <small style={{ color: "#8A858B", fontSize: 7 }}>
                    mg/dL
                  </small>
                </div>

                <span style={{ position: "absolute", left: 8, top: 65, color: "#F18B98" }}>
                  ♥
                </span>
                <span style={{ position: "absolute", right: 9, top: 65, color: "#F18B98" }}>
                  ♥
                </span>
                <span style={{ position: "absolute", bottom: 13, color: "#F18B98" }}>
                  ♥
                </span>
              </div>

              <div
                style={{
                  background: "#F4F5F6",
                  borderRadius: 13,
                  padding: "13px 15px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <small style={{ color: "#5E5961", fontSize: 9, fontWeight: 700 }}>
                    READING TREND
                  </small>
                  <small style={{ color: colors.green, fontSize: 9, fontWeight: 700 }}>
                    Sample data
                  </small>
                </div>

                <svg
                  width="100%"
                  height="70"
                  viewBox="0 0 360 70"
                  preserveAspectRatio="none"
                  style={{ display: "block", marginTop: 7 }}
                >
                  <rect
                    x="0"
                    y="10"
                    width="360"
                    height="45"
                    rx="5"
                    fill="#E4F2ED"
                  />
                  <path
                    d="M0 39 C35 38 48 30 75 31 S120 35 150 25 S205 24 230 20 S285 22 310 16 S340 18 360 11"
                    fill="none"
                    stroke="#159B75"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M0 39 C35 38 48 30 75 31 S120 35 150 25 S205 24 230 20 S285 22 310 16 S340 18 360 11 L360 65 L0 65Z"
                    fill="rgba(21,155,117,.08)"
                  />
                </svg>
              </div>
            </div>

            <div
              className="sweety-float-bottom sweety-floating-right"
              style={{
                ...card,
                position: "absolute",
                zIndex: 3,
                right: -12,
                bottom: 0,
                padding: "13px 17px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 37,
                  height: 37,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: "#DDF8EF",
                  color: colors.green,
                  fontSize: 18,
                }}
              >
                ◉
              </span>

              <div>
                <small style={{ display: "block", color: "#777078", fontSize: 9 }}>
                  Daily Overview
                </small>
                <strong style={{ fontSize: 20 }}>4 slots</strong>
                <small style={{ color: colors.green, fontSize: 9, marginLeft: 5 }}>
                  per day
                </small>
              </div>
            </div>
          </section>
        </div>

        {showDemo && (
          <div
            className="sweety-demo"
            style={{
              maxWidth: 900,
              margin: "30px auto 0",
              padding: 22,
              borderRadius: 16,
              background: "#fff",
              boxShadow: "0 8px 25px rgba(40,30,40,.07)",
              color: colors.muted,
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <strong style={{ color: colors.ink, fontSize: 16 }}>
                Patient dashboard preview
              </strong>

              <span
                style={{
                  color: colors.green,
                  background: "#E9F8F2",
                  padding: "5px 10px",
                  borderRadius: 20,
                  fontSize: 10,
                }}
              >
                Demo data only
              </span>
            </div>

            <p style={{ marginBottom: 0, lineHeight: 1.7 }}>
              Morning (fasting): 88 mg/dL · After breakfast: 108 mg/dL ·
              After lunch: Not recorded · After dinner: Not recorded.
              These are illustrative values, not medical advice or real patient records.
            </p>
          </div>
        )}
      </main>

      {/* TRUST / INTEGRATIONS */}
      <section
        style={{
          background: "#fff",
          padding: "30px 4% 34px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 22px",
            color: "#5C555D",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.1,
          }}
        >
          DESIGNED FOR SIMPLE, CONSISTENT GLUCOSE TRACKING
        </p>

        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {trustItems.map((item) => (
            <div
              key={item.name}
              className="sweety-trust-card"
              style={{
                flex: "1 1 150px",
                maxWidth: 220,
                minWidth: 135,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "13px 10px",
                borderRadius: 12,
                background: "#F8F9FA",
              }}
            >
              <span style={{ color: item.color, fontSize: 19 }}>
                {item.icon}
              </span>

              <span style={{ textAlign: "left" }}>
                <strong style={{ display: "block", fontSize: 12, color: "#343139" }}>
                  {item.name}
                </strong>
                <small style={{ display: "block", marginTop: 4, color: "#777078", fontSize: 9 }}>
                  {item.detail}
                </small>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Anchor sections for navbar links */}
      <div id="features" />
      <div id="how-it-works" />
      <div id="clinical-accuracy" />
      <div id="pricing" />
      <div id="reviews" />
    </div>
  );
}
