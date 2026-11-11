import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import {
  getCareNetwork,
  addSpecialist,
  deleteSpecialist,
  updateEmergencyContact,
} from "../api/careNetworkApi";
const profileEmailSchema = Yup.string()
  .trim()
  .email("Please enter a valid email address.")
  .required("Email address is required.");
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
  const [personalEditing, setPersonalEditing] = useState(false);
  const [personalSnapshot, setPersonalSnapshot] = useState(null);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [emergencyEditing, setEmergencyEditing] = useState(false);

const [savedEmergencyContact, setSavedEmergencyContact] = useState({
  name: "",
  phone: "",
});
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
      diabetesType: ({
        "Type 1": "Type 1 Diabetes",
        "Type 2": "Type 2 Diabetes",
        "Gestational / Pre": "Gestational Diabetes",
      }[user.diabetesType] || user.diabetesType || "Type 2 Diabetes"),
      dob: user.dob
        ? String(user.dob).slice(0, 10)
        : user.dateOfBirth
          ? String(user.dateOfBirth).slice(0, 10)
          : "",
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
  // Load profile and the separate Care Network document
  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const [profileResult, careResult] = await Promise.allSettled([
          getUserProfile(),
          getCareNetwork(),
        ]);
        if (!active) return;
        if (profileResult.status === "rejected") {
          throw profileResult.reason;
        }
        const profileResponse = profileResult.value;
        const user =
          profileResponse?.data?.user ||
          profileResponse?.user ||
          profileResponse?.data ||
          profileResponse;
        setSettings(mapUserToSettings(user));
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
        if (careResult.status === "fulfilled") {
          const careResponse = careResult.value;
          const network =
            careResponse?.data?.careNetwork ||
            careResponse?.careNetwork ||
            careResponse?.data ||
            careResponse ||
            {};
          setDoctors(
            Array.isArray(network.specialists) ? network.specialists : []
          );
          setSettings((previous) => ({
            ...previous,
            emergencyName: network.emergencyContact?.name || "",
            emergencyPhone: network.emergencyContact?.phone || "",
          }));
        } else {
          console.error("Care Network loading error:", careResult.reason);
          setDoctors([]);
        }
      } catch (error) {
        console.error("Profile loading error:", error);
        if (active) {
          notify(
            error.response?.data?.message || "Unable to load your profile.",
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
  const saveField = async (field) => {
    const value = String(drafts[field] ?? "").trim();
    if (!value) {
      notify(`${field} cannot be empty.`, "error");
      return;
    }
    if (field === "email") {
      try {
        await profileEmailSchema.validate(value);
      } catch (validationError) {
        notify(validationError.message, "error");
        return;
      }
    }
    setSettings((previous) => ({
      ...previous,
      [field]: field === "email" ? value.toLowerCase() : value,
    }));
    setEditing((previous) => ({
      ...previous,
      [field]: false,
    }));
    setMessage("");
  };
  // Save profile
  const handleSave = async () => {
    if (!settings.name.trim()) {
      notify("Name is required.", "error");
      return;
    }
    try {
      await profileEmailSchema.validate(settings.email);
    } catch (validationError) {
      notify(validationError.message, "error");
      return;
    }
    try {
      setSaving(true);
      const diabetesTypeMap = {
        "Type 1 Diabetes": "Type 1",
        "Type 2 Diabetes": "Type 2",
        "Gestational Diabetes": "Gestational / Pre",
        "Pre-diabetes": "Gestational / Pre",
      };
      const payload = {
        name: settings.name.trim(),
        email: settings.email.trim().toLowerCase(),
        phone: settings.phone.trim(),
        dob: settings.dob || null,
        sex: settings.sex || "Not specified",
        diabetesType:
          diabetesTypeMap[settings.diabetesType] || settings.diabetesType,
        profileImage: settings.profileImage || "",
      };
      const response = await updateUserProfile(payload);
      const user = response?.data?.user || response?.user || response?.data || response || {};
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
      setPersonalEditing(false);
      setPersonalSnapshot(null);
      notify(response?.data?.message || response?.message || "Profile saved successfully.");
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
  // Personal details stay read-only until the user selects Edit.
  const startPersonalEdit = () => {
    setPersonalSnapshot({ ...settings });
    setPersonalEditing(true);
  };
  const cancelPersonalEdit = () => {
    if (personalSnapshot) setSettings(personalSnapshot);
    setPersonalEditing(false);
    setPersonalSnapshot(null);
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
  // Healthcare contacts - saved in the separate CareNetwork collection
  const handleDoctorChange = (event) => {
    const { name, value } = event.target;
    setNewDoctor((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  const handleAddDoctor = async () => {
    if (!newDoctor.name.trim()) {
      notify("Enter the specialist's name.", "error");
      return;
    }
    try {
      const response = await addSpecialist({
        name: newDoctor.name.trim(),
        specialty: newDoctor.specialty.trim(),
        phone: newDoctor.phone.trim(),
      });
      const network =
        response?.data?.careNetwork ||
        response?.careNetwork ||
        response?.data ||
        {};
      if (Array.isArray(network.specialists)) {
        setDoctors(network.specialists);
      } else {
        // Fallback if the API returns only the newly created specialist.
        const specialist =
          response?.data?.specialist || response?.specialist;
        if (specialist) {
          setDoctors((previous) => [...previous, specialist]);
        }
      }
      setNewDoctor({ name: "", specialty: "", phone: "" });
      setShowDoctorForm(false);
      notify(
        response?.data?.message ||
          response?.message ||
          "Specialist added successfully."
      );
    } catch (error) {
      console.error("Add specialist error:", error);
      notify(
        error.response?.data?.message || "Unable to add specialist.",
        "error"
      );
    }
  };
  const removeDoctor = async (id) => {
    if (!id) {
      notify("Specialist ID is missing. Refresh the page and try again.", "error");
      return;
    }
    if (!window.confirm("Remove this specialist?")) return;
    try {
      const response = await deleteSpecialist(id);
      const network =
        response?.data?.careNetwork ||
        response?.careNetwork ||
        response?.data ||
        {};
      if (Array.isArray(network.specialists)) {
        setDoctors(network.specialists);
      } else {
        setDoctors((previous) =>
          previous.filter((doctor) => (doctor._id || doctor.id) !== id)
        );
      }
      notify(
        response?.data?.message ||
          response?.message ||
          "Specialist removed successfully."
      );
    } catch (error) {
      console.error("Remove specialist error:", error);
      notify(
        error.response?.data?.message || "Unable to remove specialist.",
        "error"
      );
    }
  };
 
const handleSaveEmergencyContact = async () => {
  const name = settings.emergencyName.trim();
  const phone = settings.emergencyPhone.trim();

  if (!name || !phone) {
    notify("Enter contact name and phone number.", "error");
    return;
  }

  try {
    setSaving(true);

    const response = await updateEmergencyContact({ name, phone });

    const network =
      response?.data?.careNetwork ||
      response?.careNetwork ||
      response?.data ||
      response;

    const emergency = network?.emergencyContact;

    if (!emergency) {
      throw new Error("Emergency contact was not returned by the server.");
    }

    const saved = {
      name: emergency.name || "",
      phone: emergency.phone || "",
    };

    setSavedEmergencyContact(saved);

    setSettings((previous) => ({
      ...previous,
      emergencyName: saved.name,
      emergencyPhone: saved.phone,
    }));

    setEmergencyEditing(false);
    notify("Emergency contact saved successfully.");
  } catch (error) {
    console.error("Emergency save error:", error);
    notify(
      error.response?.data?.message ||
        error.message ||
        "Unable to save emergency contact.",
      "error"
    );
  } finally {
    setSaving(false);
  }
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
  // Reusable personal detail field.
  const InlineField = ({ label, name, placeholder, type = "text", icon = "✎" }) => (
    <div className="patient-detail">
      <div className="patient-detail-icon">{icon}</div>
      <div className="patient-detail-content">
        <span>{label}</span>
        {personalEditing ? (
          <input
            className="personal-detail-input"
            type={type}
            value={settings[name] || ""}
            onChange={(event) =>
              setSettings((previous) => ({ ...previous, [name]: event.target.value }))
            }
            placeholder={placeholder}
          />
        ) : (
          <strong>{settings[name] || placeholder}</strong>
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
          color: #888b95;
          font-size: 11px;
          margin: 6px 0 0;
        }
        .profile-save-main {
          border: none;
          border-radius: 8px;
          background: #e98b96;
          color: white;
          padding: 11px 17px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .profile-save-main:disabled { opacity: .5; cursor: not-allowed; }
        .profile-message {
          padding: 11px 14px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 11px;
        }
        .profile-message.success {
          background: #e7f7ef;
          color: #25895c;
        }
        .profile-message.error {
          background: #fff0f0;
          color: #bd414b;
        }
        .patient-profile-grid {
          display: grid;
          grid-template-columns: 310px minmax(0, 1fr);
          gap: 17px;
          align-items: start;
        }
        .profile-left-column {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .patient-card {
          background: white;
          border-radius: 13px;
          padding: 17px;
          box-shadow: 0 3px 15px rgba(30, 40, 60, .04);
          min-width: 0;
        }
        .patient-profile-summary {
          text-align: center;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f1f3;
        }
        .patient-avatar-wrap {
          width: 70px;
          height: 70px;
          margin: 0 auto 10px;
          position: relative;
        }
        .patient-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9e7ea;
          color: #a15b65;
          font-size: 25px;
          font-weight: 700;
          overflow: hidden;
        }
        .patient-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .patient-avatar-edit {
          position: absolute;
          bottom: 0;
          right: -2px;
          border: 2px solid white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e98b96;
          color: white;
          cursor: pointer;
        }
        .patient-profile-summary h2 {
          font-size: 15px;
          margin: 0;
          color: #30323b;
        }
        .patient-diabetes-type {
          display: inline-block;
          margin-top: 7px;
          background: #f9e7ea;
          color: #a15b65;
          border-radius: 20px;
          padding: 5px 10px;
          font-size: 9px;
          font-weight: 700;
        }
        .patient-description {
          font-size: 9px;
          color: #999ba3;
          margin-top: 8px;
        }
        .patient-detail-list {
          padding-top: 10px;
        }
        .patient-detail {
          display: flex;
          gap: 9px;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid #f1f1f2;
          min-width: 0;
        }
        .patient-detail-icon {
          width: 27px;
          height: 27px;
          border-radius: 8px;
          background: #f8edf0;
          color: #a15b65;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }
        .patient-detail-content {
          min-width: 0;
          flex: 1;
        }
        .patient-detail-content span {
          display: block;
          font-size: 8px;
          color: #999ba3;
          margin-bottom: 4px;
        }
        .patient-detail-content strong {
          display: block;
          font-size: 10px;
          color: #454751;
          overflow-wrap: anywhere;
        }
        .personal-detail-input {
          width: 100%;
          min-width: 0;
          padding: 8px 9px;
          border: 1px solid #e5d9dc;
          border-radius: 7px;
          background: #fff;
          color: #454751;
          font: inherit;
          font-size: 10px;
          outline: none;
        }
        .personal-detail-input:focus {
          border-color: #e98b96;
          box-shadow: 0 0 0 2px rgba(233, 139, 150, .12);
        }
        .personal-detail-readonly {
          padding: 8px 0;
          color: #454751;
          font-size: 10px;
          overflow-wrap: anywhere;
        }
        .device-panel {
          margin-top: 13px;
          background: #f8f5f6;
          border-radius: 9px;
          padding: 12px;
        }
        .device-panel > strong {
          font-size: 10px;
          color: #454751;
        }
        .device-status {
          float: right;
          color: #27895e;
          font-size: 9px;
          font-weight: 700;
        }
        .device-panel p {
          font-size: 9px;
          color: #888b95;
          line-height: 1.6;
          margin: 7px 0 0;
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
        .profile-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .profile-section {
          background: white;
          border-radius: 13px;
          padding: 18px;
          box-shadow: 0 3px 15px rgba(30, 40, 60, .04);
          min-width: 0;
        }
        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }
        .section-heading h2 {
          font-size: 14px;
          margin: 0;
          color: #30323b;
        }
        .section-heading p {
          color: #999ba3;
          font-size: 9px;
          margin: 5px 0 0;
        }
        .section-kicker {
          display: block;
          color: #b16c78;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .8px;
          margin-bottom: 5px;
        }
        .profile-primary-btn {
          border: none;
          background: #e98b96;
          color: white;
          border-radius: 7px;
          padding: 9px 13px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .profile-secondary-btn {
          border: 1px solid #e6dadd;
          background: white;
          color: #777;
          border-radius: 7px;
          padding: 9px 13px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }
        .profile-edit-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .personal-details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }
        .personal-detail-item {
          min-width: 0;
          background: #faf8f8;
          border-radius: 9px;
          padding: 11px;
        }
        .personal-detail-item label {
          display: block;
          color: #92949c;
          font-size: 9px;
          margin-bottom: 6px;
        }
        .health-settings-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .health-setting-card {
          background: #f5f6f8;
          border-radius: 9px;
          padding: 11px;
        }
        .health-setting-card label {
          display: block;
          color: #777a84;
          font-size: 9px;
          margin-bottom: 7px;
        }
        .health-setting-card input {
          width: 100%;
          border: 1px solid #e5e6e9;
          background: white;
          border-radius: 7px;
          padding: 9px;
          font-size: 10px;
        }
        .routine-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }
        .routine-box {
          background: #f5f6f8;
          border-radius: 9px;
          padding: 11px;
        }
        .routine-box span {
          display: block;
          color: #999ba3;
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
                    disabled={!personalEditing}
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
                    <span>Date of Birth</span>
                    {personalEditing ? (
                      <input
                        className="personal-detail-input"
                        type="date"
                        value={settings.dob || ""}
                        onChange={(event) => setSettings((previous) => ({ ...previous, dob: event.target.value }))}
                      />
                    ) : (
                      <strong>{settings.dob || "Not provided"}</strong>
                    )}
                  </div>
                </div>
                <div className="patient-detail">
                  <div className="patient-detail-icon">♙</div>
                  <div className="patient-detail-content">
                    <span>Sex</span>
                    {personalEditing ? (
                      <select
                        className="personal-detail-input"
                        value={settings.sex}
                        onChange={(event) => setSettings((previous) => ({ ...previous, sex: event.target.value }))}
                      >
                        {["Not specified", "Male", "Female", "Other"].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <strong>{settings.sex || "Not specified"}</strong>
                    )}
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
                    disabled={!personalEditing}
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    className="profile-small-button"
                    style={{ marginLeft: 6, background: "white" }}
                    onClick={removeImage}
                    disabled={!personalEditing}
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
                  {personalEditing ? (
                    <select
                      value={settings.diabetesType}
                      onChange={(event) => setSettings((previous) => ({ ...previous, diabetesType: event.target.value }))}
                      className="personal-detail-input"
                    >
                      {diabetesOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="personal-detail-readonly">{settings.diabetesType || "Not specified"}</div>
                  )}
                </div>
              </div>
              <div className="glucose-save-row">
                {!personalEditing ? (
                  <button
                    type="button"
                    className="pink-action"
                    onClick={startPersonalEdit}
                  >
                    ✎ Edit Personal Details
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="profile-secondary-btn"
                      onClick={cancelPersonalEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="pink-action"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Details"}
                    </button>
                  </>
                )}
              </div>
            </section>
            {/* Glucose overview */}
            <section className="patient-card">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">HEALTH OVERVIEW</span>
                  <h2>Glucose targets</h2>
                </div>
              </div>
              <div className="standard-range-pill">
                <i className="fa-solid fa-circle-check"></i>
                Personal target ranges
              </div>
              <div className="range-scale">
                <div className="range-scale-labels">
                  <span>Low</span>
                  <span>Below target</span>
                  <span>In range</span>
                  <span>High</span>
                </div>
                <div className="range-track">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="range-numbers">
                  <span>Below 70</span>
                  <span>70–100</span>
                  <span>100–140</span>
                  <span>Above 180</span>
                </div>
              </div>
              <div className="routine-grid">
                <div className="routine-box">
                  <span>Target minimum</span>
                  <strong>{settings.targetMin}</strong>
                  <small>mg/dL</small>
                </div>
                <div className="routine-box">
                  <span>Target maximum</span>
                  <strong>{settings.targetMax}</strong>
                  <small>mg/dL</small>
                </div>
                <div className="routine-box">
                  <span>Urgent low</span>
                  <strong>{settings.urgentLow}</strong>
                  <small>mg/dL</small>
                </div>
              </div>
            </section>
          </div>
          {/* RIGHT COLUMN */}
          <div className="profile-main">
            {/* Glucose settings */}
            <section className="profile-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">HEALTH CONFIGURATION</span>
                  <h2>Glucose settings</h2>
                  <p>Configure your preferred glucose thresholds.</p>
                </div>
              </div>
              <div className="glucose-settings-grid">
                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">Target minimum</span>
                    <span className="glucose-setting-status green">LOWER LIMIT</span>
                  </div>
                  <div className="glucose-setting-value">
                    <strong>{settings.targetMin}</strong>
                    <small>mg/dL</small>
                  </div>
                </div>
                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">Target maximum</span>
                    <span className="glucose-setting-status green">UPPER LIMIT</span>
                  </div>
                  <div className="glucose-setting-value">
                    <strong>{settings.targetMax}</strong>
                    <small>mg/dL</small>
                  </div>
                </div>
                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">Urgent low threshold</span>
                    <span className="glucose-setting-status red">LOW ALERT</span>
                  </div>
                  <div className="glucose-setting-value">
                    <strong>{settings.urgentLow}</strong>
                    <small>mg/dL</small>
                  </div>
                </div>
                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">Fasting minimum</span>
                    <span className="glucose-setting-status green">FASTING</span>
                  </div>
                  <div className="glucose-setting-value">
                    <strong>{settings.fastingMin}</strong>
                    <small>mg/dL</small>
                  </div>
                </div>
                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">Fasting maximum</span>
                    <span className="glucose-setting-status green">FASTING</span>
                  </div>
                  <div className="glucose-setting-value">
                    <strong>{settings.fastingMax}</strong>
                    <small>mg/dL</small>
                  </div>
                </div>
                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">Post-meal maximum</span>
                    <span className="glucose-setting-status green">AFTER MEAL</span>
                  </div>
                  <div className="glucose-setting-value">
                    <strong>{settings.postMealMax}</strong>
                    <small>mg/dL</small>
                  </div>
                </div>
                <div className="glucose-setting">
                  <div className="glucose-setting-top">
                    <span className="glucose-setting-title">High glucose threshold</span>
                    <span className="glucose-setting-status red">HIGH ALERT</span>
                  </div>
                  <div className="glucose-setting-value">
                    <strong>{settings.highThreshold}</strong>
                    <small>mg/dL</small>
                  </div>
                </div>
              </div>
              <div className="glucose-save-row">
                <span style={{ fontSize: 8, color: "#999" }}>
                  Contact your healthcare professional before changing targets.
                </span>
              </div>
            </section>
            {/* CARE NETWORK */}
            <section className="profile-section" id="care-network">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">YOUR HEALTHCARE TEAM</span>
                  <h2>Care Network</h2>
                  <p>Keep your specialists and emergency contact details handy.</p>
                </div>
                <button
                  type="button"
                  className="profile-primary-btn"
                  onClick={() => setShowDoctorForm((previous) => !previous)}
                >
                  {showDoctorForm ? "Close" : "+ Add specialist"}
                </button>
              </div>
              {showDoctorForm && (
                <div className="contact-form">
                  <input
                    type="text"
                    name="name"
                    value={newDoctor.name}
                    onChange={handleDoctorChange}
                    placeholder="Specialist name"
                  />
                  <input
                    type="text"
                    name="specialty"
                    value={newDoctor.specialty}
                    onChange={handleDoctorChange}
                    placeholder="Specialty (e.g. Endocrinologist)"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={newDoctor.phone}
                    onChange={handleDoctorChange}
                    placeholder="Phone number"
                  />
                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-secondary-btn"
                      onClick={() => setShowDoctorForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="profile-primary-btn"
                      onClick={handleAddDoctor}
                    >
                      Save specialist
                    </button>
                  </div>
                </div>
              )}
              {doctors.length > 0 ? (
                <div className="contact-grid">
                  {doctors.map((doctor) => (
                    <div className="contact-box" key={doctor._id || doctor.id}>
                      <div className="contact-box-heading">
                        <div className="contact-icon">
                          <i className="fa-solid fa-user-doctor"></i>
                        </div>
                        <div>
                          <span>HEALTHCARE SPECIALIST</span>
                          <strong>{doctor.name}</strong>
                          <p>{doctor.specialty || "Specialist"}</p>
                        </div>
                      </div>
                      <div className="contact-phone">
                        <i className="fa-solid fa-phone"></i>{" "}
                        {doctor.phone || "Phone not provided"}
                      </div>
                      <div className="contact-actions">
                        <span>Saved in your care network</span>
                        <button
                          type="button"
                          className="contact-remove"
                          onClick={() => removeDoctor(doctor._id || doctor.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#999", fontSize: 10 }}>
                  No specialists added yet.
                </p>
              )}
              
<div style={{ marginTop: 18 }}>
  <div className="section-heading">
    <div>
      <h2>Emergency contact</h2>
      <p>Someone to contact when you need help.</p>
    </div>

    {savedEmergencyContact.name && !emergencyEditing && (
      <button
        type="button"
        className="profile-primary-btn"
        onClick={() => setEmergencyEditing(true)}
      >
        ✎ Edit
      </button>
    )}
  </div>

  {emergencyEditing || !savedEmergencyContact.name ? (
    <div className="contact-form">
      <input
        type="text"
        value={settings.emergencyName}
        onChange={(event) =>
          setSettings((previous) => ({
            ...previous,
            emergencyName: event.target.value,
          }))
        }
        placeholder="Enter contact name"
      />

      <input
        type="tel"
        value={settings.emergencyPhone}
        onChange={(event) =>
          setSettings((previous) => ({
            ...previous,
            emergencyPhone: event.target.value,
          }))
        }
        placeholder="Enter contact phone"
      />

      <div className="profile-form-actions">
        {savedEmergencyContact.name && (
          <button
            type="button"
            className="profile-secondary-btn"
            onClick={() => {
              setSettings((previous) => ({
                ...previous,
                emergencyName: savedEmergencyContact.name,
                emergencyPhone: savedEmergencyContact.phone,
              }));
              setEmergencyEditing(false);
            }}
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          className="profile-primary-btn"
          onClick={handleSaveEmergencyContact}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save emergency contact"}
        </button>
      </div>
    </div>
  ) : (
    <div className="contact-grid">
      <div className="contact-box">
        <div className="contact-box-heading">
          <div className="contact-icon">♡</div>
          <div>
            <span>EMERGENCY CONTACT</span>
            <strong>{savedEmergencyContact.name}</strong>
            <p>Emergency contact person</p>
          </div>
        </div>

        <div className="contact-phone">
          ☎ {savedEmergencyContact.phone}
        </div>

        <div className="contact-actions">
          <span>Saved in your care network</span>
          <span style={{ color: "#31936e" }}>✓ Saved</span>
        </div>
      </div>
    </div>
  )}
</div>

            </section>
            {/* Account Security */}
<section className="patient-card">
  <div className="patient-card-heading">
    <div>
      <div className="card-kicker">Privacy & Data Governance</div>
      <h2>Account Security & Archival</h2>
    </div>
  </div>

  {/* Change Password Button */}
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

  {/* Change Password Form */}
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
          ["hasCurrent", "Current password entered"],
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

  {/* Export Readings */}
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

  {/* Logout */}
  <div className="security-danger">
    <div>
      <strong>⚠ Critical Account Operations</strong>
      <p>Sign out of your account.</p>
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