import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function apiFetch(path, options = {}) {
  try {
    const response = await api.request({
      url: path,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: options.headers || {}
    });

    return response.status === 204 ? null : response.data;
  } catch (error) {
    const response = error.response;
    const payload = response?.data;
    const message = payload?.message || payload?.error || error.message || 'Request failed';

    const wrappedError = new Error(message);
    wrappedError.status = response?.status;
    wrappedError.payload = payload;
    throw wrappedError;
  }
}

export const backendOrigin = 'http://localhost:8080';
