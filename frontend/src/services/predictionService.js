import api from "./api";

export const predictTransaction = async (data) => {
  const response = await api.post("/predict/", { data });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get("/history/");
  return response.data;
};

export const getHistoryById = async (id) => {
  const response = await api.get(`/history/${id}`);
  return response.data;
};

export const deleteHistoryItem = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};

export const deleteAllHistory = async () => {
  const response = await api.delete("/history/");
  return response.data;
};
