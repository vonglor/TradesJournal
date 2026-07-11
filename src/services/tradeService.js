import axiosInstance from './axiosInstance';

export const tradeService = {

    getAll: () => axiosInstance.get('/user/trades'),  
                   // ດຶງສະເພາະຂອງຕົນເອງ
    getAllById: (userId) => axiosInstance.get(`/user/trades/${userId}`),

    create: (formData) => axiosInstance.post('/user/trades', formData, {
         headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    update: (editId, formData) => axiosInstance.put(`/user/trades/${editId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    updateStatus: (tradeId, formData) => axiosInstance.put(`/user/trades/update_status/${tradeId}`, formData),

    delete: (id) => axiosInstance.delete(`/user/trades/${id}`),
    
};