import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getAllResources() {
  const response = await api.get("/api/resources");
  return Array.isArray(response.data) ? response.data : [];
}

export async function createResource(payload) {
  const response = await api.post("/api/resources", payload);
  return response.data;
}

export async function deleteResource(id) {
  await api.delete(`/api/resources/${id}`);
}

export async function searchResources(filters) {
  const params = {};

  if (filters?.type) {
    params.type = filters.type;
  }
  if (filters?.location) {
    params.location = filters.location;
  }
  if (filters?.capacity) {
    params.capacity = filters.capacity;
  }

  const response = await api.get("/api/resources", { params });
  return Array.isArray(response.data) ? response.data : [];
}
