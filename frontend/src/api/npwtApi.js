import axios from "axios";

const API_BASE_URL = "http://backend:8080/api/device";
const api = axios.create({ baseURL: API_BASE_URL });

export const sendCommand = (command) => api.post("/command", command);

export const getStatus = () => api.get("/status");

export default api;
