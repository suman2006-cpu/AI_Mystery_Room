import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
export const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 70_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.error?.message
      || error?.response?.data?.message
      || (error?.code === "ECONNABORTED" ? "The server took too long to respond. Please try again." : null)
      || (error?.message === "Network Error" ? "Cannot reach the API. Check that the server is running and VITE_API_URL is correct." : null)
      || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  },
);

export const getCase = (id) => api.get(`/cases/${id}`).then((response) => response.data.case);
export const createCase = (payload) => api.post("/cases", payload).then((response) => response.data);
export const discoverClue = (id, clueId) => api.post(`/cases/${id}/clues/${clueId}/discover`).then((response) => response.data.case);
export const requestHint = (id) => api.post(`/cases/${id}/hints`).then((response) => response.data);
export const accuse = (id, suspectId) => api.post(`/cases/${id}/accuse`, { suspectId }).then((response) => response.data);
export const getResult = (id) => api.get(`/cases/${id}/result`).then((response) => response.data);
export const createPlayer = (name) => api.post("/players", { name }).then((response) => response.data.player);
export const getPlayer = (id) => api.get(`/players/${id}`).then((response) => response.data.player);
export const timeoutCase = (id) => api.post(`/cases/${id}/timeout`).then((response) => response.data.case);
