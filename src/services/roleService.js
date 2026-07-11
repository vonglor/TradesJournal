import axiosInstance from './axiosInstance';

export const roleService = {

    getAll: () => axiosInstance.get('/user/roles'),  
                   // ດຶງສະເພາະຂອງຕົນເອງ
    getById: (id) => axiosInstance.get(`/user/roles/${id}`),

    create: (formData) => axiosInstance.post('/user/roles', formData),

    update: (id, formData) => axiosInstance.put(`/user/roles/${id}`, formData),

    delete: (id) => axiosInstance.delete(`/user/roles/${id}`),

    updateCapital: (id, formData) => axiosInstance.put(`/user/role_update_capital/${id}`, formData),

    updateTimespan: (id, formData) => axiosInstance.put(`/user/role_update_timespan/${id}`, formData),

    storeBacktestTrade: (formData) => axiosInstance.post('/user/backtest_trades', formData),
    
};