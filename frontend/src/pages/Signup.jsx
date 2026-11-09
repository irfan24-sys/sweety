
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    diabetesType: "Type 1",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const passwordStrength = () => {
    const password = formData.password;

    if (!password) return 0;

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const strength = passwordStrength();

  const strengthLabel = ["Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      return setError("Please enter your full name.");
    }

    if (!formData.email.trim()) {
      return setError("Please enter your email address.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setError("Please enter a valid email address.");
    }

    if (formData.password.length < 8) {
      return setError("Password must contain at least 8 characters.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (!formData.agree) {
      return setError("Please accept the Terms of Service.");
    }

    try {
      setLoading(true);

      // Connect your signup API here.
      // Example:
      // await signupUser({
      //   name: formData.name,
      //   email: formData.email,
      //   password: formData.password,
      //   diabetesType: formData.diabetesType,
      // });

      console.log("Signup form data:", {
        name: formData.name,
        email: formData.email,
        diabetesType: formData.diabetesType,
      });

      setError(
        "Form validation successful. Connect your backend signup API to create the account."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: 43,
    padding: "0 14px",
    border: "1px solid #ECEDEF",
    borderRadius: 9,
    background: "#F2F3F5",
    outline: "none",
    fontSize: 12,
    color: "#303038",
    transition: "all .2s ease",
  };

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#343139",
    marginBottom: 6,
  };

  const primaryButton = {
    width: "100%",
    height: 43,
    border: "none",
    borderRadius: 25,
    background: "#98464F",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 5px 12px rgba(152,70,79,.16)",
    transition: "all .25s ease",
  };

  const focusInput = (e) => {
    e.currentTarget.style.borderColor = "#D7838B";
    e.currentTarget.style.background = "#fff";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(231,133,139,.10)";
  };

  const blurInput = (e) => {
    e.currentTarget.style.borderColor = "#ECEDEF";
    e.currentTarget.style.background = "#F2F3F5";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="signup-page">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .signup-page {
          min-height: 100vh;
          background: #F6F8FA;
          font-family: 'Poppins', sans-serif;
          color: #29272D;
          padding: 0 3%;
        }

        .signup-header {
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .signup-container {
          max-width: 1150px;
          min-height: 590px;
          margin: 0 auto 25px;
          display: grid;
          grid-template-columns: 42% 58%;
          background: #fff;
          border-radius: 19px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(40, 35, 40, .08);
          animation: signupEnter .6s ease both;
        }

        .signup-left {
          padding: 30px 35px;
          background: linear-gradient(145deg, #F8EFF0 0%, #FAF5F5 65%, #DDF9EC 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .signup-right {
          padding: 30px 42px;
          background: #fff;
        }

        .signup-field {
          margin-bottom: 11px;
        }

        .signup-input:focus {
          border-color: #D7838B !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(231,133,139,.10);
        }

        .signup-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 17px rgba(152,70,79,.25) !important;
          filter: brightness(1.06);
        }

        .signup-social:hover {
          border-color: #D7838B !important;
          background: #FFF8F9 !important;
          transform: translateY(-2px);
        }

        .signup-feature {
          transition: transform .25s ease, background .25s ease;
        }

        .signup-feature:hover {
          transform: translateX(5px);
          background: rgba(255,255,255,.95) !important;
        }

        .signup-footer {
          max-width: 1150px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 8px 0 12px;
          font-size: 9px;
          color: #777078;
        }

        @keyframes signupEnter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media(max-width: 850px) {
          .signup-container {
            grid-template-columns: 1fr;
            max-width: 550px;
          }

          .signup-left {
            min-height: 440px;
          }

          .signup-right {
            padding: 30px;
          }
        }

        @media(max-width: 500px) {
          .signup-page {
            padding: 0 12px;
          }

          .signup-header {
            height: 60px;
          }

          .signup-left {
            padding: 25px 20px;
            min-height: 400px;
          }

          .signup-right {
            padding: 25px 18px;
          }

          .signup-footer {
            flex-direction: column;
            text-align: center;
            align-items: center;
          }

          .signup-social-row {
            flex-direction: column;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="signup-header">

        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            textDecoration: "none",
            color: "#98464F",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "#F9E5E8",
              display: "grid",
              placeItems: "center",
              fontSize: 17,
            }}
          >
            🩺
          </span>

          <span>
            <strong style={{ display: "block", fontSize: 15 }}>
              Sweety
            </strong>
            <small
              style={{
                display: "block",
                fontSize: 7,
                letterSpacing: 1,
                color: "#777078",
              }}
            >
              GLUCOSE CARE
            </small>
          </span>
        </Link>

        <div
          style={{
            fontSize: 9,
            color: "#55515A",
          }}
        >
          <span style={{ color: "#169B76", marginRight: 5 }}>
            ◈
          </span>
          HIPAA & SOC2 Protected
        </div>

      </header>

      {/* MAIN CONTAINER */}
      <div className="signup-container">

        {/* LEFT PANEL */}
        <section className="signup-left">

          <div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#fff",
                color: "#98464F",
                borderRadius: 20,
                padding: "6px 11px",
                fontSize: 9,
                fontWeight: 700,
                marginBottom: 13,
              }}
            >
              ♥ SWEETY CLINICAL CARE
            </div>

            <h2
              style={{
                fontSize: 20,
                lineHeight: 1.35,
                margin: "0 0 7px",
                fontWeight: 700,
                color: "#29272D",
              }}
            >
              Your clinical companion for smarter glycemic control
            </h2>

            <p
              style={{
                fontSize: 10,
                lineHeight: 1.7,
                color: "#68646A",
                margin: 0,
              }}
            >
              Take the anxiety out of diabetes management with
              continuous monitoring, intelligent predictive curves,
              and real-time insights.
            </p>

          </div>

          {/* GLUCOSE ILLUSTRATION */}
          <div
            style={{
              position: "relative",
              width: 175,
              height: 175,
              margin: "18px auto",
              borderRadius: "50%",
              background: "rgba(235,164,174,.22)",
              display: "grid",
              placeItems: "center",
              animation: "signupPulse 4s infinite ease-in-out",
            }}
          >
            <div
              style={{
                width: 110,
                height: 125,
                borderRadius: 22,
                background: "#fff",
                boxShadow: "0 10px 30px rgba(160,80,100,.13)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                zIndex: 2,
              }}
            >
              <span style={{ fontSize: 8, color: "#169B76" }}>
                ● NORMAL
              </span>

              <strong style={{ fontSize: 28, color: "#333" }}>
                108
              </strong>

              <span style={{ fontSize: 8, color: "#888" }}>
                mg/dL
              </span>

              <svg width="65" height="25" viewBox="0 0 65 25">
                <path
                  d="M2 17 C12 16 15 7 24 12 S39 16 46 8 S55 7 63 4"
                  fill="none"
                  stroke="#169B76"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <span style={{ position: "absolute", left: 15, top: 72, color: "#EF8996", fontSize: 19 }}>
              ♥
            </span>

            <span style={{ position: "absolute", right: 15, top: 72, color: "#EF8996", fontSize: 19 }}>
              ♥
            </span>

            <span style={{ position: "absolute", bottom: 18, color: "#EF8996", fontSize: 18 }}>
              ♥
            </span>

            <span
              style={{
                position: "absolute",
                top: -3,
                right: -8,
                background: "#fff",
                padding: "6px 9px",
                borderRadius: 15,
                fontSize: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,.07)",
              }}
            >
              📈 96% In Range
            </span>

            <span
              style={{
                position: "absolute",
                bottom: -7,
                left: -8,
                background: "#fff",
                padding: "6px 9px",
                borderRadius: 15,
                fontSize: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,.07)",
              }}
            >
              ● Target 70–140 mg/dL
            </span>

          </div>

          {/* FEATURES */}
          <div style={{ display: "grid", gap: 8 }}>

            {[
              "Continuous glucose sync with Dexcom, FreeStyle Libre & manual logs",
              "Automated clinical target range classification & meal spike alerts",
              "Doctor-ready PDF telemetry reports formatted for your endocrinologist",
            ].map((feature, index) => (
              <div
                key={index}
                className="signup-feature"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "10px",
                  background: "rgba(255,255,255,.78)",
                  borderRadius: 10,
                  fontSize: 9,
                  lineHeight: 1.5,
                  color: "#55515A",
                }}
              >
                <span
                  style={{
                    width: 17,
                    height: 17,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "#D9F7EA",
                    color: "#169B76",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 10,
                  }}
                >
                  ✓
                </span>

                {feature}
              </div>
            ))}

          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 8,
              color: "#666",
              marginTop: 15,
            }}
          >
            ◈ Endocrinologist recommended • HIPAA & SOC2 Compliant
          </div>

        </section>

        {/* RIGHT PANEL */}
        <section className="signup-right">

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <span
              style={{
                fontSize: 8,
                color: "#A34E57",
                fontWeight: 700,
                letterSpacing: ".5px",
              }}
            >
              PATIENT PORTAL REGISTRATION
            </span>

            <span style={{ fontSize: 9, color: "#555" }}>
              <span style={{ color: "#169B76" }}>●</span> Step 1 of 2
            </span>
          </div>

          <h1
            style={{
              fontSize: 25,
              margin: "0 0 3px",
              color: "#29272D",
              fontWeight: 700,
            }}
          >
            Create your Sweety account
          </h1>

          <p
            style={{
              fontSize: 10,
              color: "#777078",
              margin: "0 0 15px",
            }}
          >
            Start monitoring your blood glucose with peace of mind in just 2 minutes.
          </p>

          {/* SOCIAL BUTTONS */}
          <div
            className="signup-social-row"
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <button
              type="button"
              className="signup-social"
              style={{
                flex: 1,
                height: 38,
                border: "1px solid #EDF0F2",
                borderRadius: 9,
                background: "#F2F3F5",
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s ease",
              }}
            >
              <span style={{ color: "#4285F4", fontWeight: 800 }}>G</span>
              {" "}Google
            </button>

            <button
              type="button"
              className="signup-social"
              style={{
                flex: 1,
                height: 38,
                border: "1px solid #EDF0F2",
                borderRadius: 9,
                background: "#F2F3F5",
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s ease",
              }}
            >
              <span style={{ color: "#98464F" }}>♥</span>
              {" "}Apple Health
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              margin: "10px 0 13px",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#E9E9EB" }} />
            <span style={{ fontSize: 8, color: "#777" }}>
              OR REGISTER WITH EMAIL
            </span>
            <div style={{ flex: 1, height: 1, background: "#E9E9EB" }} />
          </div>

          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}
            <div className="signup-field">
              <label style={labelStyle}>Full Name</label>

              <input
                className="signup-input"
                style={inputStyle}
                type="text"
                name="name"
                placeholder="♙  e.g. Sarah Jenkins"
                value={formData.name}
                onChange={updateField}
                onFocus={focusInput}
                onBlur={blurInput}
                autoComplete="name"
              />
            </div>

            {/* EMAIL */}
            <div className="signup-field">
              <label style={labelStyle}>Email Address</label>

              <input
                className="signup-input"
                style={inputStyle}
                type="email"
                name="email"
                placeholder="✉  e.g. sarah@example.com"
                value={formData.email}
                onChange={updateField}
                onFocus={focusInput}
                onBlur={blurInput}
                autoComplete="email"
              />
            </div>

            {/* DIABETES CLASSIFICATION */}
            <div className="signup-field">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  Diabetes Classification
                </label>

                <span style={{ fontSize: 8, color: "#777" }}>
                  Personalize your tracking
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 4,
                  padding: 3,
                  background: "#F2F3F5",
                  borderRadius: 9,
                }}
              >
                {["Type 1", "Type 2", "Gestational / Pre"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        diabetesType: type,
                      }))
                    }
                    style={{
                      padding: "9px 3px",
                      border: "none",
                      borderRadius: 7,
                      background:
                        formData.diabetesType === type ? "#fff" : "transparent",
                      color:
                        formData.diabetesType === type ? "#A84C55" : "#555",
                      fontSize: 9,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow:
                        formData.diabetesType === type
                          ? "0 2px 6px rgba(0,0,0,.05)"
                          : "none",
                      transition: "all .2s ease",
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* PASSWORD */}
            <div className="signup-field">
              <label style={labelStyle}>Create Password</label>

              <div style={{ position: "relative" }}>
                <input
                  className="signup-input"
                  style={{ ...inputStyle, paddingRight: 42 }}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={updateField}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    color: "#777",
                  }}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              {/* PASSWORD STRENGTH */}
              {formData.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        style={{
                          height: 4,
                          flex: 1,
                          borderRadius: 5,
                          background:
                            strength >= level
                              ? strength <= 1
                                ? "#E36B6B"
                                : strength <= 2
                                ? "#E8B45A"
                                : "#169B76"
                              : "#E7E8EA",
                        }}
                      />
                    ))}
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 8,
                      color: strength >= 3 ? "#169B76" : "#A77742",
                      marginTop: 3,
                    }}
                  >
                    {strengthLabel[strength - 1] || "Weak"}
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="signup-field">
              <label style={labelStyle}>Confirm Password</label>

              <div style={{ position: "relative" }}>
                <input
                  className="signup-input"
                  style={{ ...inputStyle, paddingRight: 42 }}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={updateField}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    color: "#777",
                  }}
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>
              </div>

              {formData.confirmPassword && (
                <small
                  style={{
                    display: "block",
                    marginTop: 5,
                    fontSize: 9,
                    color:
                      formData.password === formData.confirmPassword
                        ? "#169B76"
                        : "#D65F65",
                  }}
                >
                  {formData.password === formData.confirmPassword
                    ? "✓ Passwords match"
                    : "Passwords do not match"}
                </small>
              )}
            </div>

            {/* TERMS */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 7,
                margin: "12px 0",
              }}
            >
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={updateField}
                style={{
                  accentColor: "#98464F",
                  marginTop: 2,
                  cursor: "pointer",
                }}
              />

              <label
                style={{
                  fontSize: 9,
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                I agree to the{" "}
                <Link to="/terms" style={{ color: "#A84C55" }}>
                  Terms of Service
                </Link>{" "}
                and acknowledge the{" "}
                <Link to="/privacy" style={{ color: "#A84C55" }}>
                  Privacy Policy
                </Link>{" "}
                regarding health telemetry.
              </label>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                role="alert"
                style={{
                  padding: "9px 11px",
                  borderRadius: 8,
                  background: "#FFF0F0",
                  color: "#B23D49",
                  fontSize: 10,
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              className="signup-action"
              type="submit"
              disabled={loading}
              style={{
                ...primaryButton,
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? "Creating Account..." : "Create Patient Account  →"}
            </button>

          </form>

          {/* LOGIN LINK */}
          <p
            style={{
              textAlign: "center",
              fontSize: 9,
              color: "#777078",
              marginTop: 14,
            }}
          >
            Already have a Sweety account?{" "}
            <Link
              to="/login"
              style={{
                color: "#A84C55",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign in here
            </Link>
          </p>

        </section>
      </div>

      {/* FOOTER */}
      <footer className="signup-footer">
        <span>
          © 2026 Sweety Health Technologies Inc. All rights reserved.
        </span>

        <div style={{ display: "flex", gap: 15 }}>
          <Link to="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
            Privacy Policy
          </Link>

          <Link to="/terms" style={{ color: "inherit", textDecoration: "none" }}>
            Terms of Service
          </Link>

          <Link to="/guidelines" style={{ color: "inherit", textDecoration: "none" }}>
            Clinical Guidelines
          </Link>
        </div>
      </footer>

      <style>{`
        @keyframes signupPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(235,164,174,.10);
          }
          50% {
            box-shadow: 0 0 0 13px rgba(235,164,174,0);
          }
        }
      `}</style>

    </div>
  );
}
