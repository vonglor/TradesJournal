import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('auth_token'); 
    const userInfo = JSON.parse(localStorage.getItem('user_info')); 

    // 🔒 1. ຖ້າບໍ່ມີ Token ຫຼື ບໍ່ມີຂໍ້ມູນ User (ຍັງບໍ່ໄດ້ Login) ໃຫ້ດີດໄປໜ້າ Login ທັນທີ
    if (!token || !userInfo) {
        return <Navigate to="/login" replace />;
    }

    // 🔒 2. ເພີ່ມເງື່ອນໄຂນີ້: ຖ້າ "ບໍ່ໄດ້ກຳນົດ allowedRoles" ມາ 
    // ໝາຍຄວາມວ່າຂໍແຕ່ Login ແລ້ວ ແມ່ນໃຫ້ຜ່ານໄປໄດ້ເລີຍ (ທຸກ Role ເຂົ້າໄດ້)
    if (!allowedRoles) {
        return <Outlet />;
    }

    // 🔒 3. ກວດເຊັກວ່າ Role ຂອງ User ຢູ່ໃນລາຍຊື່ທີ່ອະນຸຍາດ (allowedRoles) ບໍ
    const hasPermission = allowedRoles.includes(userInfo.role);

    if (!hasPermission) {
        // 🚫 ຖ້າສິດບໍ່ເຖິງ ໃຫ້ດີດໄປໜ້າຫຼັກ 
        return <Navigate to="/" replace />;
    }

    // 🔓 ຖ້າມີ Token ແລະ ສິດຖືກຕ້ອງ ໃຫ້ສະແດງໜ້າເວັບທີ່ຢູ່ທາງໃນ (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;