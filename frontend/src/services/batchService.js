import api from "./api";

export const predictBatch = async (file, threshold) => {
  const formData = new FormData();
  formData.append("file", file);
  if (threshold !== undefined && threshold !== null) {
    formData.append("threshold", threshold);
  }

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

// Fetches the raw result file as an ArrayBuffer — used both to let the user
// download it and to parse it client-side for the live results table, so we
// don't have to hit the backend twice for the same file.
export const fetchBatchResultBuffer = async (filename) => {
  const response = await api.get(`/predict/download/${filename}`, {
    responseType: "arraybuffer",
  });
  return response.data;
};

export const downloadBatchFile = async (filename) => {
  const buffer = await fetchBatchResultBuffer(filename);
  const url = window.URL.createObjectURL(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
