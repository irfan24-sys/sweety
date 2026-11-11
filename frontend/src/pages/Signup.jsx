import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { signupUser } from "../api/authApi";
import * as Yup from "yup";

const signupSchema = Yup.object({
  name: Yup.string().trim().required("Please enter your full name."),
  email: Yup.string().trim().email("Please enter a valid email address.")
    .required("Please enter your email address."),
  phone: Yup.string().test(
    "valid-phone",
    "Please enter a valid phone number.",
    (value) => !value || /^[+]?[0-9\\s()-]{7,15}$/.test(value.trim())
  ),
  dob: Yup.string().test(
    "valid-dob",
    "Date of birth cannot be in the future.",
    (value) => {
      if (!value) return true;
      const today = new Date();
      const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");
      return value <= localToday;
    }
  ),
  diabetesType: Yup.string().required(
    "Please select your diabetes classification."
  ),
  password: Yup.string().required("Password is required.")
    .min(8, "Password must contain at least 8 characters.")
    .matches(/[A-Z]/, "Password must contain one uppercase letter.")
    .matches(/[a-z]/, "Password must contain one lowercase letter.")
    .matches(/[0-9]/, "Password must contain one number.")
    .matches(/[^A-Za-z0-9]/, "Password must contain one special character."),
  confirmPassword: Yup.string().required("Please confirm your password.")
    .oneOf([Yup.ref("password")], "Passwords do not match."),
  agree: Yup.boolean().oneOf([true], "Please accept the Terms of Service."),
});



export default function Signup() {

  const navigate = useNavigate();



  const [formData, setFormData] = useState({

    name: "",

    email: "",

    phone: "",

    dob: "",

    sex: "",

    diabetesType: "Type 1",

    password: "",

    confirmPassword: "",

    agree: false,

  });



  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);



  // Handle form inputs

  const updateField = (e) => {

    const { name, value, type, checked } = e.target;



    setFormData((prev) => ({

      ...prev,

      [name]: type === "checkbox" ? checked : value,

    }));



    setError("");

  };



  // Live password requirement checks
  const passwordRules = {
    minLength: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const strength = Object.values(passwordRules).filter(Boolean).length;
  const strengthLabel = ["Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];

  // Get today's date in local time

  const today = new Date();

  const maxDate = [

    today.getFullYear(),

    String(today.getMonth() + 1).padStart(2, "0"),

    String(today.getDate()).padStart(2, "0"),

  ].join("-");



  // SIGNUP SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const validatedData = await signupSchema.validate(
        {
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
        },
        { abortEarly: true }
      );

      setLoading(true);

      const response = await signupUser({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        dob: validatedData.dob,
        sex: validatedData.sex,
        password: validatedData.password,
        diabetesType: validatedData.diabetesType,
      });

      if (!response?.success || !response?.token) {
        throw new Error(response?.message || "Registration failed.");
      }

      localStorage.setItem("token", response.token);

      const registeredUser = response.user || {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        dob: validatedData.dob,
        sex: validatedData.sex,
        diabetesType: validatedData.diabetesType,
      };

      localStorage.setItem("user", JSON.stringify(registeredUser));

      navigate("/Dashboard", {
        replace: true,
        state: {
          message: "Welcome to Sweety! Your account has been created.",
        },
      });
    } catch (err) {
      console.error("Signup Error:", err.response?.data || err.message);
      setError(
        err.name === "ValidationError"
          ? err.message
          : err.response?.data?.message ||
            err.message ||
            "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Common input styling

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

    boxSizing: "border-box",

    fontFamily: "Poppins, sans-serif",

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

    cursor: loading ? "not-allowed" : "pointer",

    boxShadow: "0 5px 12px rgba(152,70,79,.16)",

    transition: "all .25s ease",

    opacity: loading ? 0.7 : 1,

    fontFamily: "Poppins, sans-serif",

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



  const fieldStyle = {

    marginBottom: 11,

  };



  const diabetesTypes = ["Type 1", "Type 2", "Gestational / Pre"];



  return (

    <div className="signup-page">

      <style>{`

        @import url('https\://fonts.googleapis.com/css2?family=Poppins:wght\@400;500;600;700;800&display=swap');



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

          margin: 0 auto 25px;

          display: grid;

          grid-template-columns: 42% 58%;

          background: #fff;

          border-radius: 19px;

          overflow: hidden;

          box-shadow: 0 10px 30px rgba(40,35,40,.08);

          animation: signupEnter .6s ease both;

        }



        .signup-left {

          padding: 30px 35px;

          background: linear-gradient(

            145deg,

            #F8EFF0 0%,

            #FAF5F5 65%,

            #DDF9EC 100%

          );

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

          box-shadow: 0 8px 17px rgba(152,70,79,.25);

          filter: brightness(1.06);

        }



        .signup-social:hover {

          border-color: #D7838B !important;

          background: #FFF8F9 !important;

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



        @keyframes signupPulse {

          0%, 100% {

            box-shadow: 0 0 0 0 rgba(235,164,174,.10);

          }

          50% {

            box-shadow: 0 0 0 13px rgba(235,164,174,0);

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



          .signup-type-grid {

            grid-template-columns: 1fr !important;

          }



          .signup-personal-grid {

            grid-template-columns: 1fr !important;

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

            <strong style={{ display: "block", fontSize: 15 }}>Sweety</strong>

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

          <span style={{ color: "#169B76", marginRight: 5 }}>◈</span>

          Secure Account Registration

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

              ♥ SWEETY GLUCOSE CARE

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

              Your companion for smarter glucose tracking

            </h2>



            <p

              style={{

                fontSize: 10,

                lineHeight: 1.7,

                color: "#68646A",

                margin: 0,

              }}

            >

              Track your blood glucose readings, understand your daily patterns

              and take an active role in your health journey.

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

                ● SAMPLE READING

              </span>



              <strong style={{ fontSize: 28, color: "#333" }}>108</strong>



              <span style={{ fontSize: 8, color: "#888" }}>mg/dL</span>



              <svg width="65" height="25" viewBox="0 0 65 25">

                <path

                  d="M2 17 C12 16 15 7 24 12 S39 16 46 8 S55 7 63 4"

                  fill="none"

                  stroke="#169B76"

                  strokeWidth="2"

                />

              </svg>

            </div>



            <span

              style={{

                position: "absolute",

                left: 15,

                top: 72,

                color: "#EF8996",

                fontSize: 19,

              }}

            >

              ♥

            </span>



            <span

              style={{

                position: "absolute",

                right: 15,

                top: 72,

                color: "#EF8996",

                fontSize: 19,

              }}

            >

              ♥

            </span>



            <span

              style={{

                position: "absolute",

                bottom: 18,

                color: "#EF8996",

                fontSize: 18,

              }}

            >

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

              📈 Daily Tracking

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

              ● Health Records

            </span>

          </div>



          {/* FEATURES */}

          <div style={{ display: "grid", gap: 8 }}>

            {[

              "Record and manage daily glucose readings",

              "View your glucose history and reports",

              "Monitor your glucose trends over time",

            ].map((feature, index) => (

              <div

                key={index}

                className="signup-feature"

                style={{

                  display: "flex",

                  alignItems: "center",

                  gap: 9,

                  padding: 10,

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

            ◈ Your health matters • Your data is personal

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

              <span style={{ color: "#169B76" }}>●</span> Create Account

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

            Start monitoring your blood glucose with peace of mind.

          </p>



          {/* SOCIAL BUTTONS - UI ONLY */}

          <div

            className="signup-social-row"

            style={{

              display: "flex",

              gap: 10,

              marginBottom: 10,

            }}

          ></div>



          <div

            style={{

              display: "flex",

              alignItems: "center",

              gap: 9,

              margin: "10px 0 13px",

            }}

          >





            <div style={{ flex: 1, height: 1, background: "#E9E9EB" }} />

          </div>



          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}

            <div className="signup-field">

              <label htmlFor="signup-name" style={labelStyle}>

                Full Name *

              </label>



              <input

                id="signup-name"

                className="signup-input"

                style={inputStyle}

                type="text"

                name="name"

                placeholder="Enter your full name"

                value={formData.name}

                onChange={updateField}

                onFocus={focusInput}

                onBlur={blurInput}

                autoComplete="name"

                required

              />

            </div>



            {/* EMAIL */}

            <div className="signup-field">

              <label htmlFor="signup-email" style={labelStyle}>

                Email Address *

              </label>



              <input

                id="signup-email"

                className="signup-input"

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



            {/* PHONE NUMBER */}

            <div className="signup-field">

              <label htmlFor="signup-phone" style={labelStyle}>

                Phone Number

              </label>



              <input

                id="signup-phone"

                className="signup-input"

                style={inputStyle}

                type="tel"

                name="phone"

                placeholder="Enter your phone number"

                value={formData.phone}

                onChange={updateField}

                onFocus={focusInput}

                onBlur={blurInput}

                autoComplete="tel"

                maxLength={15}

              />

            </div>



            {/* DATE OF BIRTH AND SEX */}

            <div

              className="signup-personal-grid"

              style={{

                display: "grid",

                gridTemplateColumns: "1fr 1fr",

                gap: 12,

              }}

            >

              <div className="signup-field">

                <label htmlFor="signup-dob" style={labelStyle}>

                  Date of Birth

                </label>



                <input

                  id="signup-dob"

                  className="signup-input"

                  style={inputStyle}

                  type="date"

                  name="dob"

                  value={formData.dob}

                  onChange={updateField}

                  onFocus={focusInput}

                  onBlur={blurInput}

                  max={maxDate}

                />

              </div>



              <div className="signup-field">

                <label htmlFor="signup-sex" style={labelStyle}>

                  Sex

                </label>



                <select

                  id="signup-sex"

                  className="signup-input"

                  style={inputStyle}

                  name="sex"

                  value={formData.sex}

                  onChange={updateField}

                  onFocus={focusInput}

                  onBlur={blurInput}

                >

                  <option value="">Select sex</option>

                  <option value="Male">Male</option>

                  <option value="Female">Female</option>

                  <option value="Other">Other</option>

                  <option value="Prefer not to say">Prefer not to say</option>

                </select>

              </div>

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

                  Diabetes Classification *

                </label>



                <span style={{ fontSize: 8, color: "#777" }}>

                  Select your type

                </span>

              </div>



              <div

                className="signup-type-grid"

                style={{

                  display: "grid",

                  gridTemplateColumns: "repeat(3, 1fr)",

                  gap: 4,

                  padding: 3,

                  background: "#F2F3F5",

                  borderRadius: 9,

                }}

              >

                {diabetesTypes.map((type) => (

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

              <label htmlFor="signup-password" style={labelStyle}>

                Create Password *

              </label>



              <div style={{ position: "relative" }}>

                <input

                  id="signup-password"

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

                  required

                  minLength={8}

                />



                <button

                  type="button"

                  aria-label={showPassword ? "Hide password" : "Show password"}

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



              {/* PASSWORD REQUIREMENTS */}
              {formData.password && (
                <div style={{ marginTop: 9 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                    {[
                      ["minLength", "At least 8 characters"],
                      ["uppercase", "One uppercase letter"],
                      ["lowercase", "One lowercase letter"],
                      ["number", "One number"],
                      ["special", "One special character"],
                    ].map(([key, label]) => (
                      <div
                        key={key}
                        style={{
                          fontSize: 9,
                          color: passwordRules[key] ? "#169B76" : "#999",
                        }}
                      >
                        {passwordRules[key] ? "✓" : "○"} {label}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 4, marginTop: 9 }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          height: 4,
                          flex: 1,
                          borderRadius: 5,
                          background:
                            strength >= level
                              ? strength <= 2
                                ? "#E36B6B"
                                : strength <= 3
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
                      color: strength >= 5 ? "#169B76" : "#A77742",
                      marginTop: 3,
                    }}
                  >
                    {strengthLabel[strength]}
                  </div>
                </div>
              )}
            </div>



            {/* CONFIRM PASSWORD */}

            <div className="signup-field">

              <label htmlFor="signup-confirm-password" style={labelStyle}>

                Confirm Password *

              </label>



              <div style={{ position: "relative" }}>

                <input

                  id="signup-confirm-password"

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

                  required

                />



                <button

                  type="button"

                  aria-label={

                    showConfirmPassword

                      ? "Hide confirm password"

                      : "Show confirm password"

                  }

                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}

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

                id="signup-agree"

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

                htmlFor="signup-agree"

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

                regarding my personal information.

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

              style={primaryButton}

            >

              {loading ? "Creating Account..." : "Create Patient Account →"}

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
