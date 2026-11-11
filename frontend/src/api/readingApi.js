
import api from "./axios";

// ADD READING
export const addReading = async (readingData) => {
  const response = await api.post("/readings", readingData);
  return response.data;
};

// GET ALL READINGS FOR LOGGED-IN USER
export const getReadings = async () => {
  const response = await api.get("/readings");
  return response.data;
};

// GET SINGLE READING
export const getReading = async (id) => {
  const response = await api.get(`/readings/${id}`);
  return response.data;
};

// UPDATE READING
export const updateReading = async (id, readingData) => {
  const response = await api.put(`/readings/${id}`, readingData);
  return response.data;
};

// DELETE READING
export const deleteReading = async (id) => {
  const response = await api.delete(`/readings/${id}`);
  return response.data;
};
