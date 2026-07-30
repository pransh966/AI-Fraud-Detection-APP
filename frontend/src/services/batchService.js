import api from "./api";

export const predictBatch = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/predict/batch", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const getBatchHistory = async () => {
  const response = await api.get("/batch-history/");
  return response.data;
};

export const getBatchHistoryById = async (id) => {
  const response = await api.get(`/batch-history/${id}`);
  return response.data;
};

export const deleteBatchHistoryItem = async (id) => {
  const response = await api.delete(`/batch-history/${id}`);
  return response.data;
};

export const deleteAllBatchHistory = async () => {
  const response = await api.delete("/batch-history/");
  return response.data;
};

export const downloadBatchFile = async (filename) => {
  const response = await api.get(`/predict/download/${filename}`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
