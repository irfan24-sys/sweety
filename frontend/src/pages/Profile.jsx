import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReadings } from "../api/readingApi";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../api/userApi";

const DEFAULT_SETTINGS = {
  name: "",
  email: "",
  phone: "",
  diabetesType: "Type 2 Diabetes",
  dob: "",
  sex: "Not specified",
  profileImage: "",
  targetMin: 70,
  targetMax: 140,
  urgentLow: 70,
  fastingMin: 70,
  fastingMax: 100,
  postMealMax: 140,
  highThreshold: 180,
  doctorName: "",
  doctorPhone: "",
  emergencyName: "",
  emergencyPhone: "",
  autoSync: true,
  weeklyReminder: true,
  emergencyAlerts: true,
};

const diabetesOptions = [
  "Type 1 Diabetes",
  "Type 2 Diabetes",
  "Gestational Diabetes",
  "Pre-diabetes",
  "Other",
];

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [doctors, setDoctors] = useState([]);
  const [editing, setEditing] = useState({});
  const [drafts, setDrafts] = useState({});

  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [exporting, setExporting] = useState(false);

  const notify = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  // Password validation
  const passwordChecks = {
    hasCurrent: passwords.currentPassword.trim().length > 0,
    minLength: passwords.newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(passwords.newPassword),
    hasLowercase: /[a-z]/.test(passwords.newPassword),
    hasNumber: /[0-9]/.test(passwords.newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(passwords.newPassword),
    isDifferent:
      passwords.newPassword.length > 0 &&
      passwords.newPassword !== passwords.currentPassword,
    matches:
      passwords.confirmPassword.length > 0 &&
      passwords.newPassword === passwords.confirmPassword,
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  // Map backend user to frontend settings
  const mapUserToSettings = (user) => {
    const glucose = user.glucoseSettings || {};
    const preferences = user.preferences || {};

    return {
      ...DEFAULT_SETTINGS,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      diabetesType: user.diabetesType || "Type 2 Diabetes",
      dob: user.dob || user.dateOfBirth || "",
      sex: user.sex || "Not specified",
      profileImage: user.profileImage || "",
      doctorName: user.doctorName || "",
      doctorPhone: user.doctorPhone || "",
      emergencyName: user.emergencyName || "",
      emergencyPhone: user.emergencyPhone || "",
      targetMin: glucose.targetMin ?? DEFAULT_SETTINGS.targetMin,
      targetMax: glucose.targetMax ?? DEFAULT_SETTINGS.targetMax,
      urgentLow: glucose.urgentLow ?? DEFAULT_SETTINGS.urgentLow,
      fastingMin: glucose.fastingMin ?? DEFAULT_SETTINGS.fastingMin,
      fastingMax: glucose.fastingMax ?? DEFAULT_SETTINGS.fastingMax,
      postMealMax: glucose.postMealMax ?? DEFAULT_SETTINGS.postMealMax,
      highThreshold: glucose.highThreshold ?? DEFAULT_SETTINGS.highThreshold,
      autoSync: preferences.autoSync ?? DEFAULT_SETTINGS.autoSync,
      weeklyReminder:
        preferences.weeklyReminder ?? DEFAULT_SETTINGS.weeklyReminder,
      emergencyAlerts:
        preferences.emergencyAlerts ?? DEFAULT_SETTINGS.emergencyAlerts,
    };
  };

  // Load profile
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await getUserProfile();
        if (!active) return;

        const user = response.user || response;

        setSettings(mapUserToSettings(user));
        setDoctors(Array.isArray(user.specialists) ? user.specialists : []);

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id || user._id,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            diabetesType: user.diabetesType || "",
          })
        );
      } catch (error) {
        console.error("Profile loading error:", error);
        if (active) {
          notify(
            error.response?.data?.message ||
              "Unable to load your profile.",
            "error"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // Inline editing
  const handleDraftChange = (field, value) => {
    setDrafts((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const startEdit = (field) => {
    setDrafts((previous) => ({
      ...previous,
      [field]: settings[field] || "",
    }));

    setEditing((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  const cancelEdit = (field) => {
    setEditing((previous) => ({
      ...previous,
      [field]: false,
    }));
  };

  const saveField = (field) => {
    const value = String(drafts[field] ?? "").trim();

    if (!value) {
      notify(`${field} cannot be empty.`, "error");
      return;
    }

    if (
      field === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      notify("Please enter a valid email address.", "error");
      return;
    }

    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setEditing((previous) => ({
      ...previous,
      [field]: false,
    }));

    setMessage("");
  };

  // Save profile
  const handleSave = async () => {
    if (!settings.name.trim() || !settings.email.trim()) {
      notify("Name and email are required.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      notify("Please enter a valid email address.", "error");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: settings.name.trim(),
        email: settings.email.trim().toLowerCase(),
        phone: settings.phone,
        diabetesType: settings.diabetesType,
        dob: settings.dob,
        sex: settings.sex,
        profileImage: settings.profileImage,
        doctorName: settings.doctorName,
        doctorPhone: settings.doctorPhone,
        emergencyName: settings.emergencyName,
        emergencyPhone: settings.emergencyPhone,
        specialists: doctors,
        preferences: {
          autoSync: settings.autoSync,
          weeklyReminder: settings.weeklyReminder,
          emergencyAlerts: settings.emergencyAlerts,
        },
      };

      const response = await updateUserProfile(payload);
      const user = response.user || {};

      setSettings((previous) => ({
        ...previous,
        ...mapUserToSettings({ ...previous, ...user }),
      }));

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id || user._id,
          name: user.name || settings.name,
          email: user.email || settings.email,
          phone: user.phone || settings.phone,
          diabetesType: user.diabetesType || settings.diabetesType,
        })
      );

      notify(response.message || "Profile saved successfully.");
    } catch (error) {
      console.error("Save profile error:", error);
      notify(
        error.response?.data?.message || "Unable to save profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // Profile image
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Please select a valid image.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      notify("Image size must be less than 1 MB.", "error");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setSettings((previous) => ({
        ...previous,
        profileImage: String(reader.result),
      }));
      notify("Image selected. Save your profile to confirm.");
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSettings((previous) => ({
      ...previous,
      profileImage: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    notify("Image removed. Save your profile to confirm.");
  };

  // Healthcare contacts
  const handleDoctorChange = (event) => {
    const { name, value } = event.target;

    setNewDoctor((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddDoctor = () => {
    if (!newDoctor.name.trim()) {
      notify("Enter the specialist's name.", "error");
      return;
    }

    setDoctors((previous) => [
      ...previous,
      {
        id: `${Date.now()}`,
        name: newDoctor.name.trim(),
        specialty: newDoctor.specialty.trim(),
        phone: newDoctor.phone.trim(),
      },
    ]);

    setNewDoctor({
      name: "",
      specialty: "",
      phone: "",
    });

    setShowDoctorForm(false);
    notify("Contact added. Save your profile to confirm.");
  };

  const removeDoctor = (id) => {
    if (!window.confirm("Remove this specialist?")) return;

    setDoctors((previous) =>
      previous.filter((doctor) => (doctor.id || doctor._id) !== id)
    );

    notify("Contact removed. Save your profile to confirm.");
  };

  // Change password
  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (!isPasswordValid) {
      notify("Please complete all password requirements.", "error");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await changeUserPassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      notify(response.message || "Password changed successfully.");

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);
    } catch (error) {
      console.error("Change password error:", error);
      notify(
        error.response?.data?.message ||
          "Unable to change password. Please try again.",
        "error"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // Export readings
  const handleExport = async (format) => {
    try {
      setExporting(true);

      const response = await getReadings();
      const readings = Array.isArray(response.readings)
        ? response.readings
        : [];

      if (!readings.length) {
        notify("No readings available to export.", "error");
        return;
      }

      let content;
      let mimeType;
      let extension;

      if (format === "json") {
        content = JSON.stringify(readings, null, 2);
        mimeType = "application/json";
        extension = "json";
      } else {
        const headers = [
          "Date",
          "Time",
          "Time Slot",
          "Glucose Value (mg/dL)",
          "Notes",
        ];

        const rows = readings.map((reading) => [
          reading.date,
          reading.time,
          reading.slot,
          reading.value,
          reading.notes || "",
        ]);

        const escapeCSV = (value) =>
          `"${String(value ?? "").replace(/"/g, '""')}"`;

        content = [headers, ...rows]
          .map((row) => row.map(escapeCSV).join(","))
          .join("\n");

        mimeType = "text/csv;charset=utf-8;";
        extension = "csv";
      }

      const blob = new Blob(
        [format === "csv" ? "\uFEFF" + content : content],
        { type: mimeType }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `sweety-readings.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      notify(`${format.toUpperCase()} export completed.`);
    } catch (error) {
      console.error("Export error:", error);
      notify("Unable to export readings.", "error");
    } finally {
      setExporting(false);
    }
  };

  // Logout
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const initials = (settings.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  // Reusable inline field
  const InlineField = ({
    label,
    name,
    placeholder,
    type = "text",
    icon = "✎",
  }) => (
    <div className="patient-detail">
      <div className="patient-detail-icon">{icon}</div>

      <div className="patient-detail-content">
        <span>{label}</span>

        {editing[name] ? (
          <div className="patient-inline-edit">
            <input
              type={type}
              value={drafts[name] ?? ""}
              onChange={(event) =>
                handleDraftChange(name, event.target.value)
              }
              placeholder={placeholder}
            />

            <button type="button" onClick={() => saveField(name)}>
              Save
            </button>

            <button type="button" onClick={() => cancelEdit(name)}>
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{settings[name] || placeholder}</strong>

            <button
              type="button"
              className="patient-detail-edit"
              onClick={() => startEdit(name)}
            >
              ✎
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="profile-loading">
        Loading your profile...
      </div>
    );
  }
    return (
    <div className="patient-profile-page">
      <style>{`
        .patient-profile-page {
          min-height: 100vh;
          padding: 22px 25px;
          background: #f5f7fa;
          color: #30323b;
          font-family: 'Poppins', sans-serif;
        }

        .patient-profile-page * { box-sizing: border-box; }

        .patient-profile-container {
          max-width: 1250px;
          margin: auto;
        }

        .profile-topline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .profile-eyebrow {
          font-size: 9px;
          letter-spacing: 1px;
          color: #a15b65;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .profile-title {
          font-size: 25px;
          font-weight: 750;
          margin: 0;
          color: #292b33;
        }

        .profile-subtitle {
          font-size: 11px;
          color: #858793;
          margin-top: 5px;
        }

        .profile-save-main {
          border: none;
          background: #e98b96;
          color: white;
          border-radius: 30px;
          padding: 11px 19px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 12px #e98b9630;
        }

        .profile-save-main:hover { background: #dc7885; }
        .profile-save-main:disabled { opacity: .6; cursor: not-allowed; }

        .profile-message {
          padding: 11px 15px;
          border-radius: 9px;
          margin-bottom: 15px;
          font-size: 12px;
        }

        .profile-message.success { background: #e5f6ec; color: #27875a; }
        .profile-message.error { background: #fff0f0; color: #bd4242; }

        .patient-profile-grid {
          display: grid;
          grid-template-columns: minmax(280px, .85fr) minmax(0, 1.45fr);
          align-items: start;
          gap: 17px;
        }

        .profile-left-column,
        .profile-right-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }

        .patient-card {
          background: #fff;
          border: 1px solid #edf0f3;
          border-radius: 14px;
          padding: 17px;
          box-shadow: 0 3px 12px rgba(30,40,60,.035);
          min-width: 0;
        }

        .patient-card-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 15px;
        }

        .patient-card-heading h2 {
          font-size: 14px;
          font-weight: 750;
          margin: 0 0 4px;
          color: #30323b;
        }

        .patient-card-heading p {
          font-size: 10px;
          color: #92949e;
          margin: 0;
        }

        .card-kicker {
          color: #b16c78;
          font-size: 8px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .8px;
          margin-bottom: 4px;
        }

        .patient-profile-summary {
          text-align: center;
          padding: 5px 0 14px;
        }

        .patient-avatar-wrap {
          position: relative;
          width: 65px;
          height: 65px;
          margin: 0 auto 10px;
        }

        .patient-avatar {
          width: 65px;
          height: 65px;
          border-radius: 13px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          background: #f3e5e9;
          color: #9b6873;
          font-size: 20px;
          font-weight: 750;
        }

        .patient-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .patient-avatar-edit {
          position: absolute;
          right: -6px;
          bottom: -6px;
          width: 23px;
          height: 23px;
          border: 2px solid white;
          border-radius: 50%;
          background: #a85c6b;
          color: white;
          font-size: 11px;
          cursor: pointer;
        }

        .patient-profile-summary h2 {
          font-size: 16px;
          margin: 0 0 4px;
          font-weight: 750;
        }

        .patient-diabetes-type {
          font-size: 10px;
          font-weight: 700;
          color: #b96e78;
          margin-bottom: 7px;
        }

        .patient-description {
          font-size: 10px;
          color: #888b95;
          line-height: 1.6;
        }

        .patient-detail-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .patient-detail {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #f3f5f7;
          border-radius: 9px;
          padding: 10px;
          min-width: 0;
        }

        .patient-detail-icon {
          width: 25px;
          height: 25px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 7px;
          color: #a66c76;
          font-size: 12px;
        }

        .patient-detail-content { flex: 1; min-width: 0; }

        .patient-detail-content span {
          display: block;
          color: #92949c;
          font-size: 8px;
          text-transform: uppercase;
          margin-bottom: 3px;
        }

        .patient-detail-content strong {
          display: block;
          color: #444650;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .patient-detail-edit {
          border: none;
          background: transparent;
          color: #bb7781;
          cursor: pointer;
          font-size: 12px;
        }

        .patient-inline-edit {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .patient-inline-edit input {
          min-width: 0;
          width: 100%;
          padding: 6px;
          border: 1px solid #e5d4d8;
          border-radius: 5px;
          font-size: 10px;
        }

        .patient-inline-edit button {
          border: none;
          border-radius: 5px;
          padding: 5px 9px;
          background: #e98b96;
          color: white;
          font-size: 9px;
          cursor: pointer;
        }

        .device-panel {
          background: #f9f1f3;
          padding: 12px;
          border-radius: 10px;
          margin-top: 10px;
        }

        .device-panel strong { font-size: 11px; }

        .device-panel p {
          font-size: 9px;
          color: #85828a;
          margin: 5px 0 0;
          line-height: 1.5;
        }

        .device-status {
          display: inline-block;
          background: #d9f3e7;
          color: #25875a;
          padding: 3px 7px;
          border-radius: 20px;
          font-size: 8px;
          margin-left: 5px;
        }

        .routine-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .routine-box {
          background: #f2f4f6;
          border-radius: 9px;
          padding: 12px;
          min-height: 85px;
        }

        .routine-box span {
          display: block;
          color: #898c96;
          font-size: 8px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .routine-box strong { font-size: 16px; color: #353741; }

        .routine-box small {
          display: block;
          color: #999ba3;
          font-size: 9px;
          margin-top: 5px;
        }

        .standard-range-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 20px;
          background: #dcf5e9;
          color: #21895c;
          font-size: 9px;
          font-weight: 700;
          margin-bottom: 14px;
        }

        .range-scale {
          background: #f4f5f7;
          padding: 12px;
          border-radius: 9px;
          margin-bottom: 12px;
        }

        .range-scale-labels {
          display: flex;
          justify-content: space-between;
          gap: 5px;
          margin-bottom: 8px;
          font-size: 8px;
          font-weight: 650;
          color: #858791;
        }

        .range-track {
          height: 7px;
          display: flex;
          overflow: hidden;
          border-radius: 20px;
          background: #ddd;
        }

        .range-track span:nth-child(1) { width: 18%; background: #e16e77; }
        .range-track span:nth-child(2) { width: 20%; background: #e7bd76; }
        .range-track span:nth-child(3) { width: 37%; background: #50b88d; }
        .range-track span:nth-child(4) { flex: 1; background: #9e5966; }

        .range-numbers {
          display: flex;
          justify-content: space-between;
          margin-top: 7px;
          color: #858791;
          font-size: 8px;
        }

        .glucose-settings-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .glucose-setting {
          background: #f1f3f5;
          border-radius: 10px;
          padding: 12px;
          min-width: 0;
        }

        .glucose-setting-top {
          display: flex;
          justify-content: space-between;
          gap: 5px;
          align-items: center;
          margin-bottom: 12px;
        }

        .glucose-setting-title {
          font-size: 9px;
          font-weight: 700;
          color: #4a4c56;
        }

        .glucose-setting-status {
          font-size: 8px;
          font-weight: 700;
          text-align: right;
        }

        .glucose-setting-status.green { color: #26966a; }
        .glucose-setting-status.red { color: #d75d67; }

        .glucose-setting-value {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .glucose-setting-value strong {
          background: white;
          border-radius: 7px;
          padding: 8px 12px;
          min-width: 60px;
          text-align: center;
          font-size: 16px;
          color: #373943;
        }

        .glucose-setting-value small {
          color: #888b94;
          font-size: 9px;
        }

        .glucose-save-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 13px;
        }

        .pink-action {
          background: #e98b96;
          color: white;
          border: none;
          border-radius: 25px;
          padding: 10px 16px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .contact-box {
          padding: 12px;
          border-radius: 10px;
          background: #f1f3f5;
          min-width: 0;
        }

        .contact-box-heading {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .contact-icon {
          width: 31px;
          height: 31px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5e5e9;
          color: #a56b78;
          flex-shrink: 0;
        }

        .contact-box-heading span {
          display: block;
          color: #31936e;
          font-size: 8px;
          font-weight: 750;
          text-transform: uppercase;
        }

        .contact-box-heading strong {
          display: block;
          font-size: 10px;
          margin-top: 4px;
          overflow-wrap: anywhere;
        }

        .contact-box-heading p {
          color: #888b95;
          font-size: 8px;
          margin: 3px 0 0;
        }

        .contact-phone {
          border-top: 1px solid #e3e5e8;
          padding-top: 9px;
          color: #6e717b;
          font-size: 9px;
          overflow-wrap: anywhere;
        }

        .contact-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 5px;
          margin-top: 12px;
          font-size: 8px;
          color: #777a84;
        }

        .contact-remove {
          border: none;
          color: #bf5965;
          background: transparent;
          cursor: pointer;
          font-size: 9px;
        }

        .contact-add {
          border: none;
          background: transparent;
          color: #b56d78;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .security-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          background: #f2f4f6;
          border-radius: 9px;
          padding: 11px;
          margin-bottom: 9px;
        }

        .security-info {
          display: flex;
          gap: 9px;
          align-items: center;
          min-width: 0;
        }

        .security-icon {
          width: 27px;
          height: 27px;
          border-radius: 8px;
          background: white;
          color: #92737b;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }

        .security-info strong { display: block; font-size: 10px; }

        .security-info p {
          color: #92949c;
          font-size: 8px;
          margin: 3px 0 0;
        }

        .security-button {
          background: white;
          border: none;
          border-radius: 7px;
          padding: 8px 10px;
          font-size: 8px;
          font-weight: 700;
          color: #53545d;
          cursor: pointer;
          white-space: nowrap;
        }

        .security-button:disabled { opacity: .5; }

        .security-danger {
          background: #fff0f0;
          border-radius: 9px;
          padding: 11px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .security-danger strong { color: #bd414b; font-size: 10px; }

        .security-danger p {
          color: #a77c80;
          font-size: 8px;
          margin: 4px 0 0;
        }

        .security-danger button {
          background: #c62828;
          color: white;
          border: none;
          padding: 8px 10px;
          border-radius: 7px;
          font-size: 8px;
          cursor: pointer;
        }

        .password-panel {
          margin-top: 12px;
          padding: 14px;
          border: 1px solid #f0dfe3;
          border-radius: 10px;
          background: #fffafa;
        }

        .password-panel label {
          display: block;
          font-size: 10px;
          font-weight: 650;
          margin-bottom: 5px;
        }

        .password-panel input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e6e1e2;
          border-radius: 7px;
          margin-bottom: 12px;
          font-size: 11px;
          outline: none;
        }

        .password-panel input:focus { border-color: #e98b96; }

        .password-rules {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 7px;
          margin: 0 0 13px;
        }

        .password-rule { font-size: 9px; color: #999; }
        .password-rule.valid { color: #25895c; }
        .password-hint { font-size: 9px; margin: -7px 0 10px; }

        .profile-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .profile-small-button {
          padding: 9px 13px;
          border: none;
          border-radius: 7px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .profile-small-button.primary {
          background: #e98b96;
          color: white;
        }

        .profile-small-button:disabled { opacity: .5; }

        .contact-form {
          background: #faf5f6;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .contact-form input {
          width: 100%;
          padding: 9px;
          margin-bottom: 8px;
          border: 1px solid #e8dfe1;
          border-radius: 7px;
          font-size: 10px;
        }

        .profile-bottom-save {
          display: flex;
          justify-content: flex-end;
          margin-top: 15px;
          margin-bottom: 25px;
        }

        .profile-loading {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b56d78;
          font-family: 'Poppins', sans-serif;
        }

        @media(max-width: 850px) {
          .patient-profile-grid { grid-template-columns: 1fr; }

          .profile-left-column {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            align-items: start;
          }
        }

        @media(max-width: 560px) {
          .patient-profile-page { padding: 15px 10px; }

          .profile-topline {
            align-items: flex-start;
            flex-direction: column;
          }

          .profile-title { font-size: 21px; }
          .profile-left-column { display: flex; }

          .glucose-settings-grid,
          .contact-grid { grid-template-columns: 1fr; }

          .routine-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }

          .patient-card { padding: 14px; }
        }
      `}</style>

      <div className="patient-profile-container">

        {/* Page heading */}
        <div className="profile-topline">
          <div>
            <div className="profile-eyebrow">
              Account & Clinical Configuration
            </div>

            <h1 className="profile-title">
              Patient Profile & Care Settings
            </h1>

            <p className="profile-subtitle">
              Manage personal details, glucose settings, and healthcare contacts.
            </p>
          </div>

          <button
            className="profile-save-main"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "✓ Save All Changes"}
          </button>
        </div>

        {message && (
          <div className={`profile-message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="patient-profile-grid">

          {/* LEFT COLUMN */}
          <div className="profile-left-column">

            {/* Patient profile */}
            <section className="patient-card">
              <div className="patient-profile-summary">
                <div className="patient-avatar-wrap">
                  <div className="patient-avatar">
                    {settings.profileImage ? (
                      <img src={settings.profileImage} alt="Patient profile" />
                    ) : (
                      initials
                    )}
                  </div>

                  <button
                    className="patient-avatar-edit"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile photo"
                  >
                    ✎
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />

                <h2>{settings.name || "Patient Name"}</h2>

                <div className="patient-diabetes-type">
                  {settings.diabetesType}
                </div>

                <div className="patient-description">
                  Manage your patient information and care preferences.
                </div>
              </div>

              <div className="patient-detail-list">
                <InlineField
                  label="Email Address"
                  name="email"
                  placeholder="Add email address"
                  type="email"
                  icon="✉"
                />

                <InlineField
                  label="Primary Phone"
                  name="phone"
                  placeholder="Add phone number"
                  icon="☎"
                />

                <div className="patient-detail">
                  <div className="patient-detail-icon">♙</div>
                  <div className="patient-detail-content">
                    <span>Date of Birth & Sex</span>
                    <strong>
                      {settings.dob || "Not provided"} ({settings.sex})
                    </strong>
                  </div>
                </div>
              </div>

              <div className="device-panel">
                <strong>Patient Account</strong>
                <span className="device-status">Active</span>

                <p>
                  Your profile information and glucose records are managed
                  through your Sweety account.
                </p>

                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="profile-small-button primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </button>

                  <button
                    type="button"
                    className="profile-small-button"
                    style={{ marginLeft: 6, background: "white" }}
                    onClick={removeImage}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 13 }}>
                <InlineField
                  label="Patient Name"
                  name="name"
                  placeholder="Enter patient name"
                  icon="👤"
                />

                <div style={{ marginTop: 10 }}>
                  <label style={{ display: "block", fontSize: 9, color: "#92949c", marginBottom: 5 }}>
                    Diabetes Type
                  </label>

                  <select
                    value={settings.diabetesType}
                    onChange={(event) =>
                      setSettings((previous) => ({
                        ...previous,
                        diabetesType: event.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: 9,
                      border: "1px solid #e9e9ed",
                      borderRadius: 7,
                      fontSize: 10,
                    }}
                  >
                    {diabetesOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ display: "block", fontSize: 9, color: "#92949c", marginBottom: 5 }}>
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    value={settings.dob}
                    onChange={(event) =>
                      setSettings((previous) => ({
                        ...previous,
                        dob: event.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: 9,
                      border: "1px solid #e9e9ed",
                      borderRadius: 7,
                      fontSize: 10,
                    }}
                  />
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ display: "block", fontSize: 9, color: "#92949c", marginBottom: 5 }}>
                    Sex
                  </label>

                  <select
                    value={settings.sex}
                    onChange={(event) =>
                      setSettings((previous) => ({
                        ...previous,
                        sex: event.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: 9,
                      border: "1px solid #e9e9ed",
                      borderRadius: 7,
                      fontSize: 10,
                    }}
                  >
                    {["Not specified", "Male", "Female", "Other"].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="glucose-save-row">
                <button
                  type="button"
                  className="pink-action"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </section>

            {/* Basics and therapy routine */}
            <section className="patient-card">
              <div className="patient-card-heading">
                <div>
                  <h2>▣ Basics & Therapy Routine</h2>
                  <p>Your saved profile and care information</p>
                </div>
              </div>

              <div className="routine-grid">
                <div className="routine-box">
                  <span>Diabetes Type</span>
                  <strong style={{ fontSize: 12 }}>{settings.diabetesType}</strong>
                  <small>Patient information</small>
                </div>

                <div className="routine-box">
                  <span>Primary Contact</span>
                  <strong style={{ fontSize: 12 }}>{settings.phone || "Not added"}</strong>
                  <small>Phone number</small>
                </div>

                <div className="routine-box">
                  <span>Healthcare Provider</span>
                  <strong style={{ fontSize: 12 }}>{settings.doctorName || "Not added"}</strong>
                  <small>Doctor information</small>
                </div>

                <div className="routine-box">
                  <span>Emergency Contact</span>
                  <strong style={{ fontSize: 12 }}>{settings.emergencyName || "Not added"}</strong>
                  <small>Emergency information</small>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="profile-right-column">

            {/* Glucose settings */}
            <section className="patient-card">
              <div className="patient-card-heading">
                <div>
                  <div className="card-kicker">Clinical Safeguards</div>
                  <h2>Target Range & Thresholds</h2>
                  <p>Informational glucose notification thresholds.</p>
                </div>
              </div>

              <div className="standard-range-pill">
                ● Standard reference settings
              </div>

              <div className="range-scale">
                <div className="range-scale-labels">
                  <span>Hypo (Low)</span>
                  <span>Fasting</span>
                  <span>Post-Meal</span>
                  <span>Hyper (High)</span>
                </div>

                <div className="range-track">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="range-numbers">
                  <span>Low</span>
                  <span>{settings.fastingMin}</span>
                  <span>{settings.fastingMax}</span>
                  <span>{settings.postMealMax}</span>
                  <span>{settings.highThreshold}+</span>
                </div>
              </div>

              <div className="glucose-settings-grid">
                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">● Hypoglycemia Warning</span>
                    <span className="glucose-setting-status red">Urgent Low</span>
                  </div>

                  <div className="glucose-setting-value">
                    <strong>{settings.urgentLow}</strong>
                    <small>mg/dL<br />Low reference</small>
                  </div>
                </div>

                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">● Target Fasting Range</span>
                    <span className="glucose-setting-status green">Fasting</span>
                  </div>

                  <div className="glucose-setting-value">
                    <strong>{settings.fastingMin}</strong>
                    <small>–</small>
                    <strong>{settings.fastingMax}</strong>
                    <small>mg/dL</small>
                  </div>
                </div>

                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">● Target Post-Meal</span>
                    <span className="glucose-setting-status green">Postprandial</span>
                  </div>

                  <div className="glucose-setting-value">
                    <strong>{settings.postMealMax}</strong>
                    <small>mg/dL<br />Reference</small>
                  </div>
                </div>

                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">● Hyperglycemia Alert</span>
                    <span className="glucose-setting-status red">Elevated</span>
                  </div>

                  <div className="glucose-setting-value">
                    <strong>{settings.highThreshold}</strong>
                    <small>mg/dL<br />Reference</small>
                  </div>
                </div>
              </div>

              <div className="glucose-save-row">
                <button
                  type="button"
                  className="pink-action"
                  onClick={() =>
                    notify(
                      "Glucose reference settings are read-only in this version.",
                      "error"
                    )
                  }
                >
                  ☷ Glucose Preferences
                </button>
              </div>

              <p style={{ fontSize: 9, color: "#92949c", marginTop: 10 }}>
                Reference values are informational only. Confirm personal
                glucose targets with your healthcare professional.
              </p>
            </section>

            {/* Healthcare contacts */}
            <section className="patient-card">
              <div className="patient-card-heading">
                <div>
                  <div className="card-kicker">Care Network</div>
                  <h2>Healthcare Team & Emergency Contacts</h2>
                </div>

                <button
                  type="button"
                  className="contact-add"
                  onClick={() => setShowDoctorForm((previous) => !previous)}
                >
                  {showDoctorForm ? "Cancel" : "+ Add Specialist"}
                </button>
              </div>

              {showDoctorForm && (
                <div className="contact-form">
                  <input
                    name="name"
                    value={newDoctor.name}
                    onChange={handleDoctorChange}
                    placeholder="Specialist name"
                  />

                  <input
                    name="specialty"
                    value={newDoctor.specialty}
                    onChange={handleDoctorChange}
                    placeholder="Specialty"
                  />

                  <input
                    name="phone"
                    value={newDoctor.phone}
                    onChange={handleDoctorChange}
                    placeholder="Phone number"
                  />

                  <button
                    type="button"
                    className="profile-small-button primary"
                    onClick={handleAddDoctor}
                  >
                    Add Contact
                  </button>
                </div>
              )}

              <div className="contact-grid">
                {doctors.length > 0 ? (
                  doctors.map((doctor, index) => (
                    <div
                      className="contact-box"
                      key={doctor.id || doctor._id || index}
                    >
                      <div className="contact-box-heading">
                        <div className="contact-icon">♙</div>
                        <div>
                          <span>Healthcare Specialist</span>
                          <strong>{doctor.name}</strong>
                          <p>{doctor.specialty || "Healthcare provider"}</p>
                        </div>
                      </div>

                      <div className="contact-phone">
                        ☎ {doctor.phone || "Phone not added"}
                      </div>

                      <div className="contact-actions">
                        <span>Healthcare contact</span>
                        <button
                          type="button"
                          className="contact-remove"
                          onClick={() => removeDoctor(doctor.id || doctor._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="contact-box">
                    <div className="contact-box-heading">
                      <div className="contact-icon">♙</div>
                      <div>
                        <span>Primary Doctor</span>
                        <strong>{settings.doctorName || "No doctor added"}</strong>
                        <p>Healthcare provider</p>
                      </div>
                    </div>

                    <div className="contact-phone">
                      ☎ {settings.doctorPhone || "Phone not added"}
                    </div>
                  </div>
                )}

                <div className="contact-box">
                  <div className="contact-box-heading">
                    <div className="contact-icon">♡</div>
                    <div>
                      <span>Emergency Contact</span>
                      <strong>{settings.emergencyName || "Not added"}</strong>
                      <p>Emergency contact person</p>
                    </div>
                  </div>

                  <div className="contact-phone">
                    ☎ {settings.emergencyPhone || "Phone not added"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 13 }}>
                <label style={{ display: "block", fontSize: 9, marginBottom: 5, color: "#858791" }}>
                  Emergency Contact Name
                </label>

                <input
                  value={settings.emergencyName}
                  onChange={(event) =>
                    setSettings((previous) => ({
                      ...previous,
                      emergencyName: event.target.value,
                    }))
                  }
                  placeholder="Enter emergency contact name"
                  style={{
                    width: "100%",
                    padding: 9,
                    border: "1px solid #e8e8ed",
                    borderRadius: 7,
                    fontSize: 10,
                  }}
                />

                <label style={{ display: "block", fontSize: 9, margin: "9px 0 5px", color: "#858791" }}>
                  Emergency Contact Phone
                </label>

                <input
                  value={settings.emergencyPhone}
                  onChange={(event) =>
                    setSettings((previous) => ({
                      ...previous,
                      emergencyPhone: event.target.value,
                    }))
                  }
                  placeholder="Enter emergency contact phone"
                  style={{
                    width: "100%",
                    padding: 9,
                    border: "1px solid #e8e8ed",
                    borderRadius: 7,
                    fontSize: 10,
                  }}
                />
              </div>

              <div className="glucose-save-row">
                <button
                  type="button"
                  className="pink-action"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Contacts"}
                </button>
              </div>
            </section>

            {/* Account security */}
            <section className="patient-card">
              <div className="patient-card-heading">
                <div>
                  <div className="card-kicker">Privacy & Data Governance</div>
                  <h2>Account Security & Archival</h2>
                </div>
              </div>

              <div className="security-row">
                <div className="security-info">
                  <div className="security-icon">♧</div>
                  <div>
                    <strong>Account Credentials</strong>
                    <p>Manage your account password securely.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="security-button"
                  onClick={() => setShowPasswordForm((previous) => !previous)}
                >
                  {showPasswordForm ? "Close" : "Change Password"}
                </button>
              </div>

              {showPasswordForm && (
                <form
                  className="password-panel"
                  onSubmit={handlePasswordChange}
                  noValidate
                >
                  <label>Current Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={passwords.currentPassword}
                    onChange={(event) =>
                      setPasswords((previous) => ({
                        ...previous,
                        currentPassword: event.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                  />

                  <label>New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwords.newPassword}
                    onChange={(event) =>
                      setPasswords((previous) => ({
                        ...previous,
                        newPassword: event.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                  />

                  <div className="password-rules">
                    {[
                      ["minLength", "At least 8 characters"],
                      ["hasUppercase", "One uppercase letter"],
                      ["hasLowercase", "One lowercase letter"],
                      ["hasNumber", "One number"],
                      ["hasSpecial", "One special character"],
                      ["isDifferent", "Different from current password"],
                    ].map(([key, label]) => (
                      <div
                        key={key}
                        className={`password-rule ${
                          passwordChecks[key] ? "valid" : ""
                        }`}
                      >
                        {passwordChecks[key] ? "✓" : "○"} {label}
                      </div>
                    ))}
                  </div>

                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwords.confirmPassword}
                    onChange={(event) =>
                      setPasswords((previous) => ({
                        ...previous,
                        confirmPassword: event.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />

                  {passwords.confirmPassword && (
                    <p
                      className="password-hint"
                      style={{
                        color: passwordChecks.matches ? "#25895c" : "#bd4242",
                      }}
                    >
                      {passwordChecks.matches
                        ? "✓ Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}

                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-small-button"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="profile-small-button primary"
                      disabled={!isPasswordValid || changingPassword}
                    >
                      {changingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}

              <div className="security-row">
                <div className="security-info">
                  <div className="security-icon">▤</div>
                  <div>
                    <strong>Export Readings</strong>
                    <p>Download your glucose records.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 5 }}>
                  <button
                    type="button"
                    className="security-button"
                    disabled={exporting}
                    onClick={() => handleExport("csv")}
                  >
                    CSV
                  </button>

                  <button
                    type="button"
                    className="security-button"
                    disabled={exporting}
                    onClick={() => handleExport("json")}
                  >
                    JSON
                  </button>
                </div>
              </div>

              <div className="security-danger">
                <div>
                  <strong>⚠ Critical Account Operations</strong>
                  <p>Sign out of your account or manage account removal.</p>
                </div>

                <button type="button" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            </section>
          </div>
        </div>

        <div className="profile-bottom-save">
          <button
            type="button"
            className="profile-save-main"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "✓ Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;