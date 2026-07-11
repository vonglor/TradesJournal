import axiosInstance from './axiosInstance';

export const strategyService = {

    getAll: () => axiosInstance.get('/user/strategies'),  
                   // ດຶງສະເພາະຂອງຕົນເອງ
    getById: (id) => axiosInstance.get(`/user/strategies/${id}`),

    create: (formData) => axiosInstance.post('/user/strategies', formData),

    update: (id, formData) => axiosInstance.put(`/user/strategies/${id}`, formData),

    delete: (id) => axiosInstance.delete(`/user/strategies/${id}`),

    updateCapital: (id, formData) => axiosInstance.put(`/user/strategy_update_capital/${id}`, formData),

    updateTimespan: (id, formData) => axiosInstance.put(`/user/strategy_update_timespan/${id}`, formData),

    storeBacktestTrade: (formData) => axiosInstance.post('/user/backtest_trades', formData),
    
};