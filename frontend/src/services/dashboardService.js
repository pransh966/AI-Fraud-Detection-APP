import api from "./api";

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/");
  return response.data;
};

export const getDashboardStatistics = async () => {
  const response = await api.get("/dashboard/statistics");
  return response.data;
};

export const getRecentPredictions = async () => {
  const response = await api.get("/dashboard/recent-predictions");
  return response.data;
};
