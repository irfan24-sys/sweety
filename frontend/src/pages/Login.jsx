
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  // LOGIN API INTEGRATION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password: formData.password,
      });

      if (!response.token || !response.user) {
        throw new Error("Invalid login response from server.");
      }

      // Save JWT token
      localStorage.setItem("token", response.token);

      // Save logged-in user details
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: 43,
    padding: "0 13px",
    border: "1px solid #ECEDEF",
    borderRadius: 9,
    background: "#F2F3F5",
    outline: "none",
    fontSize: 11,
    color: "#303038",
    transition: "all .2s ease",
  };

  const focusInput = (e) => {
    e.currentTarget.style.borderColor = "#D7838B";
    e.currentTarget.style.background = "#fff";
    e.currentTarget.style.boxShadow =
      "0 0 0 3px rgba(231,133,139,.10)";
  };

  const blurInput = (e) => {
    e.currentTarget.style.borderColor = "#ECEDEF";
    e.currentTarget.style.background = "#F2F3F5";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="sweety-login-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .sweety-login-page {
          min-height: 100vh;
          padding: 0 3%;
          background: #F6F8FA;
          color: #29272D;
          font-family: 'Poppins', Arial, sans-serif;
        }

        .login-header {
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .login-container {
          width: 100%;
          max-width: 1150px;
          min-height: 535px;
          margin: 13px auto 25px;
          display: grid;
          grid-template-columns: 42% 58%;
          overflow: hidden;
          border-radius: 19px;
          background: #fff;
          box-shadow: 0 10px 30px rgba(40,35,40,.09);
          animation: loginEnter .6s ease both;
        }

        .login-left {
          padding: 30px 35px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(145deg,#F8EDEF 0%,#FAF5F5 62%,#DDF9EC 100%);
        }

        .login-right {
          padding: 30px 42px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #fff;
        }

        .login-input:focus {
          border-color: #D7838B !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(231,133,139,.10);
        }

        .login-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 9px 20px rgba(152,70,79,.25) !important;
          filter: brightness(1.05);
        }

        .login-social:hover {
          transform: translateY(-2px);
          border-color: #D7838B !important;
          background: #FFF8F9 !important;
        }

        .login-feature {
          transition: transform .25s ease, background .25s ease;
        }

        .login-feature:hover {
          transform: translateX(5px);
          background: rgba(255,255,255,.98) !important;
        }

        @keyframes loginEnter {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes loginPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(235,164,174,.10); }
          50% { box-shadow: 0 0 0 13px rgba(235,164,174,0); }
        }

        @media(max-width: 850px) {
          .login-container {
            grid-template-columns: 1fr;
            max-width: 560px;
          }
          .login-left { min-height: 420px; }
          .login-right { padding: 32px; }
        }

        @media(max-width: 500px) {
          .sweety-login-page { padding: 0 12px; }
          .login-header { height: 60px; }
          .login-left { padding: 24px 20px; min-height: 400px; }
          .login-right { padding: 27px 19px; }
          .login-footer {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="login-header">
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

        <div style={{ fontSize: 9, color: "#55515A" }}>
          <span style={{ color: "#169B76", marginRight: 5 }}>
            ◈
          </span>
          Secure Login
        </div>
      </header>

      {/* MAIN CARD */}
      <main className="login-container">

        {/* LEFT PANEL */}
        <section className="login-left">
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 11px",
                borderRadius: 20,
                background: "#fff",
                color: "#98464F",
                fontSize: 9,
                fontWeight: 700,
                marginBottom: 13,
              }}
            >
              ♥ CONTINUOUS CARE
            </div>

            <h2
              style={{
                margin: "0 0 7px",
                color: "#29272D",
                fontSize: 20,
                lineHeight: 1.35,
                fontWeight: 700,
              }}
            >
              Empowering daily diabetes wellness
            </h2>

            <p
              style={{
                margin: 0,
                color: "#68646A",
                fontSize: 10,
                lineHeight: 1.7,
              }}
            >
              A simple way to track your glucose readings
              and support your daily health journey.
            </p>
          </div>

          {/* GLUCOSE VISUAL */}
          <div
            style={{
              position: "relative",
              width: 166,
              height: 166,
              margin: "18px auto",
              borderRadius: 18,
              background: "#fff",
              boxShadow: "0 8px 22px rgba(60,50,60,.12)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              animation: "loginPulse 4s ease-in-out infinite",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 13,
                right: 13,
                padding: "4px 8px",
                borderRadius: 20,
                background: "#DDF8EC",
                color: "#169B76",
                fontSize: 8,
                fontWeight: 700,
              }}
            >
              ● GLUCOSE TRACKING
            </span>

            <strong
              style={{
                marginTop: 13,
                fontSize: 37,
                color: "#29272D",
              }}
            >
              108
            </strong>

            <small style={{ color: "#777078", fontSize: 9 }}>
              mg / dL
            </small>

            <svg
              width="90"
              height="28"
              viewBox="0 0 90 28"
              style={{ marginTop: 13 }}
            >
              <path
                d="M2 17 C16 17 19 14 30 16 S48 18 58 15 S73 15 88 11"
                fill="none"
                stroke="#169B76"
                strokeWidth="2"
              />
              <circle cx="88" cy="11" r="2.5" fill="#169B76" />
            </svg>

            <div
              style={{
                width: "100%",
                position: "absolute",
                bottom: 13,
                left: 0,
                padding: "0 14px",
                display: "flex",
                justifyContent: "space-between",
                color: "#A84C55",
                fontSize: 7,
              }}
            >
              <span>♦ Daily tracking</span>
              <span style={{ color: "#169B76" }}>
                Stay consistent
              </span>
            </div>

            <span
              style={{
                position: "absolute",
                top: -7,
                right: -7,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#A3F1D0",
                color: "#168A69",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
              }}
            >
              ↻
            </span>
          </div>

          {/* INFORMATION */}
          <div
            style={{
              padding: 13,
              borderRadius: 11,
              background: "rgba(255,255,255,.8)",
              color: "#656169",
              fontSize: 9,
              lineHeight: 1.6,
            }}
          >
            Keep track of your daily glucose readings,
            understand your patterns and stay connected
            with your health journey.

            <div
              style={{
                marginTop: 8,
                fontSize: 8,
                fontStyle: "normal",
                fontWeight: 600,
              }}
            >
              ♥ Your health matters
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              color: "#55515A",
              fontSize: 8,
              marginTop: 12,
            }}
          >
            <span>♙ Personal Account</span>
            <span>♧ Secure Access</span>
          </div>
        </section>

        {/* RIGHT LOGIN FORM */}
        <section className="login-right">
          <div style={{ marginBottom: 17 }}>
            <div
              style={{
                color: "#A84C55",
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: ".5px",
                marginBottom: 6,
              }}
            >
              ♥ PATIENT PORTAL ACCESS
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 25,
                lineHeight: 1.3,
                color: "#29272D",
              }}
            >
              Welcome back to Sweety
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: 10,
                color: "#777078",
                lineHeight: 1.6,
              }}
            >
              Please enter your email and password to
              access your glucose readings and reports.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              margin: "8px 0 15px",
            }}
          >
            <div
              style={{
                height: 1,
                flex: 1,
                background: "#E9E9EB",
              }}
            />
            <span
              style={{
                color: "#777078",
                fontSize: 8,
                fontWeight: 600,
              }}
            >
              SIGN IN WITH EMAIL
            </span>
            <div
              style={{
                height: 1,
                flex: 1,
                background: "#E9E9EB",
              }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label
                  htmlFor="login-email"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  Email Address
                </label>
              </div>

              <input
                id="login-email"
                className="login-input"
                style={inputStyle}
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={updateField}
                onFocus={focusInput}
                onBlur={blurInput}
                autoComplete="email"
                required
              />
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label
                  htmlFor="login-password"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  Password
                </label>
              </div>

              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  className="login-input"
                  style={{
                    ...inputStyle,
                    paddingRight: 43,
                  }}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={updateField}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() =>
                    setShowPassword((visible) => !visible)
                  }
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    color: "#777078",
                    fontSize: 14,
                  }}
                >
                  {showPassword ? "🙈" : "◉"}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                margin: "12px 0 15px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 9,
                  color: "#55515A",
                }}
              >
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={updateField}
                  style={{
                    accentColor: "#98464F",
                    cursor: "pointer",
                  }}
                />
                Remember me
              </label>

              <span
                style={{
                  padding: "5px 9px",
                  borderRadius: 15,
                  background: "#E5F8EF",
                  color: "#169B76",
                  fontSize: 8,
                  fontWeight: 600,
                }}
              >
                ◉ Secure login
              </span>
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
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="login-primary"
              style={{
                width: "100%",
                height: 43,
                border: "none",
                borderRadius: 25,
                background: "#E9858B",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 5px 12px rgba(152,70,79,.16)",
                transition: "all .25s ease",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing In..." : "Sign In to Sweety ➜"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: 9,
              color: "#777078",
              margin: "14px 0 17px",
            }}
          >
            Don't have an account yet?{" "}
            <Link
              to="/signup"
              style={{
                color: "#A84C55",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign up now
            </Link>
          </p>

          {/* MEDICAL SAFETY NOTE */}
          <div
            style={{
              padding: "11px 13px",
              borderRadius: 9,
              background: "#FFF0F0",
              color: "#A84C55",
              fontSize: 8,
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            <strong>Clinical Note:</strong> If you are
            experiencing severe symptoms or a medical
            emergency, seek immediate medical care.
            Do not use this application as a substitute
            for professional medical advice.
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        className="login-footer"
        style={{
          maxWidth: 1150,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: 15,
          padding: "8px 0 12px",
          fontSize: 9,
          color: "#777078",
        }}
      >
        <span>© 2026 Sweety. All rights reserved.</span>

        <div style={{ display: "flex", gap: 15 }}>
          <Link
            to="/privacy"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Privacy Policy
          </Link>

          <Link
            to="/terms"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
