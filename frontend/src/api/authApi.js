
import api from "./axios";

// USER SIGNUP API
export const signupUser = async (userData) => {
  try {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Signup API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// USER LOGIN API
export const loginUser = async (userData) => {
  try {
    const response = await api.post("/auth/login", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Login API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get("/user/profile");
    return response.data;
  } catch (error) {
    console.error(
      "Get Profile API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// UPDATE USER PROFILE API
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put("/user/profile", profileData);
    return response.data;
  } catch (error) {
    console.error(
      "Update Profile API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// CHANGE PASSWORD API
export const changeUserPassword = async (passwordData) => {
  try {
    const response = await api.put(
      "/user/change-password",
      passwordData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Change Password API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// USER LOGOUT
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
