import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const GuestRoute = () => {
    // ກວດສອບສະຖານະການ Login (ອ້າງອີງຕາມວິທີທີ່ເຈົ້າໃຊ້ໃນ ProtectedRoute)
    const token = localStorage.getItem('auth_token'); 
    const user = JSON.parse(localStorage.getItem('user_info'));

    // ຖ້າມີ Token ຫຼື ເຂົ້າສູ່ລະບົບແລ້ວ ໃຫ້ເຕະໄປໜ້າ /dashboard 
    if (token && user) {
        return <Navigate to="/dashboard" replace />;
    }

    // ຖ້າບໍ່ທັນໄດ້ Login ໃຫ້ປ່ອຍຜ່ານເຂົ້າໜ້າ Login/Register ໄດ້ປົກກະຕິ
    return <Outlet />;
};

export default GuestRoute;