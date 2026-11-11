import api from "./axios";

// GET PROFILE
export const getUserProfile = async () => {
  const response = await api.get("/user/profile");
  return response.data;
};

// UPDATE PROFILE
export const updateUserProfile = async (profileData) => {
  const response = await api.put("/user/profile", profileData);
  return response.data;
};

// CHANGE PASSWORD
export const changeUserPassword = async (passwordData) => {
  const response = await api.put(
    "/user/change-password",
    passwordData
  );

  return response.data;
};