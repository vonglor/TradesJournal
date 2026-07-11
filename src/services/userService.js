import axiosInstance from './axiosInstance';

export const userService = {

    getAll: () => axiosInstance.get('/user/users'),

    update: (id, data) => axiosInstance.put(`/user/users/${id}`, data),

    delete: (id) => axiosInstance.delete(`/user/users/${id}`),

    getMe: () => axiosInstance.get('/me'),

    updateProfile: (id, formData) => axiosInstance.put(`/users/${id}/profile`, formData),

    // 🟢 ເພີ່ມຟັງຊັນນີ້ເຂົ້າໄປໃນ userService
    changePassword: async (data) => axiosInstance.post('/users/password_change', data),

    // 🟢 ຟັງຊັນສຳລັບສົ່ງ URL ຢືນຢັນອີເມວໄປຫາ Laravel
    verifyEmail: (id, hash, searchParams) => {
        // searchParams ແມ່ນສ່ວນຂອງ ?expires=...&signature=...
        return axiosInstance.get(`/email/verify/${id}/${hash}${searchParams}`);
    },

    upgradeUserRole: (data) => axiosInstance.put('/users/upgrade-role', data),

    updateUserStatus: (id, data) => axiosInstance.put(`/user/users/${id}/status`, data), 

};
