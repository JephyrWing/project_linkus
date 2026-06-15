import axios from 'axios';
//api 선언부 json형태로 받아서 사용할것
const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;