import axios from "axios";
import config from "./config";
const axiosFormData = axios.create({
  baseURL: config.api,
  headers: {
    "Content-Type": "multipart/form-data",
    appVersion: "1.0"
  }
});

axiosFormData.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token != null) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

axiosFormData.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (error.response.status === 401) {
      localStorage.removeItem("token");
    } else if (error.response.data.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default axiosFormData;
