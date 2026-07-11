// src/services/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://trades-journal.onrender.com/api', // URL ຂອງ Laravel Backend
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// 🔒 ດຶງ Token ຈາກ localStorage ແນບໄປກັບທຸກໆ Request ອັດຕະໂນມັດ
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;