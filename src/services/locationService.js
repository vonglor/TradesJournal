// src/services/locationService.js
import axiosInstance from './axiosInstance';

export const locationService = {

    getProvinces: () => axiosInstance.get('/provinces'),

    getDistricts: () => axiosInstance.get('/districts'),

};  