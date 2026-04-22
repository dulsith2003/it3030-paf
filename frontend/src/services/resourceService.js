import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/resources"
});

export const getAllResources = async () => {
  const response = await api.get("");
  return response.data;
};

export const createResource = async (data) => {
  const response = await api.post("", data);
  return response.data;
};

export const updateResource = async (id, data) => {
  const response = await api.put(`/${id}`, data);
  return response.data;
};

export const deleteResource = async (id) => {
  await api.delete(`/${id}`);
};

export const searchResources = async (params) => {
  const query = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query[key] = value;
    }
  });

  const response = await api.get("/search", { params: query });
  return response.data;
};
