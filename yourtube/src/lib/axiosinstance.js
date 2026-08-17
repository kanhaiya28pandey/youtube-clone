import axios from "axios";

console.log(
  "Backend URL:",
  process.env.NEXT_PUBLIC_BACKEND_URL
);
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (userData._id) {
        config.headers["x-user-id"] = userData._id;
      }
    } catch (e) {
      console.log("Error parsing user from localStorage");
    }
  }
  return config;
});

export default axiosInstance;
