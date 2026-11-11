import api from "./axios";

export const getCareNetwork = () =>
  api.get("/care-network");

export const addSpecialist = (data) =>
  api.post("/care-network/specialists", data);

export const deleteSpecialist = (id) =>
  api.delete(`/care-network/specialists/${id}`);

export const updateEmergencyContact = (data) =>
  api.put("/care-network/emergency-contact", data);