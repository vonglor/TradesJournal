import axiosInstance from './axiosInstance';

export const roomService = {

    getByApartment: (aptId) => axiosInstance.get(`/owner/apartments/${aptId}/rooms`), // ດຶງຫ້ອງແຖວຂອງອາພາດເມັນເທົ່ານັ້ນ

    // getAll: () => axiosInstance.get('/owner/rooms'),  
    // ດຶງສະເພາະຂອງຕົນເອງ
    getById: (id) => axiosInstance.get(`/owner/rooms/${id}`),

    create: (aptId, formData) => axiosInstance.post(`/owner/apartments/${aptId}/rooms`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data' // 🌟 ບັງຄັບໃຫ້ສົ່ງແບບ multipart
        }
    }),

    update: (id, formData) => axiosInstance.put(`/owner/rooms/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    delete: (id) => axiosInstance.delete(`/owner/rooms/${id}`),

};
