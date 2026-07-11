import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../services/axiosInstance';

export default function VerifyEmailNotice() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const email = location.state?.email || 'ອີເມວຂອງທ່ານ';

    const handleResend = async () => {
        try {
            Swal.fire({ title: 'ກຳລັງສົ່ງ...', didOpen: () => Swal.showLoading() });
            
            await axiosInstance.post('/email/verification-notification', { email });
            
            Swal.fire({
                title: 'ສຳເລັດ!',
                text: 'ລະບົບໄດ້ສົ່ງ Link ໃໝ່ໄປຫາອີເມວຂອງທ່ານແລ້ວ.',
                icon: 'success',
                confirmButtonColor: '#4f46e5'
            });
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                Swal.fire({
                    title: 'ແຈ້ງເຕືອນ!',
                    text: error.response.data.message || 'ອີເມວນີ້ໄດ້ຮັບການຢືນຢັນແລ້ວ.',
                    icon: 'info',
                    confirmButtonColor: '#4f46e5'
                }).then(() => navigate('/login'));
            } else {
                Swal.fire({
                    title: 'ຜິດພາດ!',
                    text: 'ບໍ່ສາມາດສົ່ງອີເມວໄດ້ໃນຂະນະນີ້, ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.',
                    icon: 'error',
                    confirmButtonColor: '#4f46e5'
                });
            }
        }
    };

    const handleLogoutBack = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6', padding: '20px', fontFamily: 'inherit' }}>
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
                
                <div style={{ fontSize: '60px', color: '#4f46e5', marginBottom: '20px' }}>✉️</div>
                
                <h2 style={{ marginBottom: '16px', color: '#1f2937', fontWeight: '900' }}>ກວດສອບອີເມວຂອງທ່ານ</h2>
                
                <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.6' }}>
                    ລະບົບໄດ້ສົ່ງ Link ຢືນຢັນການສະໝັກສະມາຊິກໄປຫາ <strong style={{ color: '#4f46e5' }}>{email}</strong> ແລ້ວ.
                </p>
                
                <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '10px' }}>
                    ກະລຸນາກົດ Link ໃນອີເມວເພື່ອເປີດໃຊ້ງານບັນຊີ ກ່ອນເຂົ້າສູ່ລະບົບ.
                </p>

                <hr style={{ border: '0', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

                <button onClick={handleResend} style={{ width: '100%', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '12px', fontSize: '14px', transition: '0.2s' }}>
                    🔄 ສົ່ງອີເມວຢືນຢັນອີກຄັ້ງ
                </button>

                <button onClick={handleLogoutBack} style={{ width: '100%', padding: '14px', background: '#fff', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                    ⬅️ ກັບໄປໜ້າເຂົ້າສູ່ລະບົບ
                </button>
            </div>
        </div>
    );
}