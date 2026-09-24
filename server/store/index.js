import axios from "axios";

export const BASE_URL = "http://localhost:5000";

export const clientServer = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

clientServer.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

