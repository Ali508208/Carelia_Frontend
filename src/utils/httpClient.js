import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:5000/api";

export const ADMIN_TOKEN_COOKIE_KEY = "admin_jwt";

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

http.interceptors.request.use(
  (config) => {
    const token = Cookies.get(ADMIN_TOKEN_COOKIE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const get = (url, config = {}) => http.get(url, config);
export const post = (url, data = {}, config = {}) =>
  http.post(url, data, config);
export const put = (url, data = {}, config = {}) => http.put(url, data, config);
export const del = (url, config = {}) => http.delete(url, config);
