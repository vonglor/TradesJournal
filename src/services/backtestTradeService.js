import axiosInstance from './axiosInstance';

export const backtestTradeService = {

    getAllById: (id) => axiosInstance.get(`/user/backtest_trades/${id}`),
    
};