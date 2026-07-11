import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import Swal from 'sweetalert2';

const VerifyEmail = () => {
    const { id, hash } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const triggerVerification = async () => {
            try {
                const response = await userService.verifyEmail(id, hash, location.search);
                setStatus('success');
                
                Swal.fire({
                    icon: 'success',
                    title: 'ຢືນຢັນອີເມວສຳເລັດ!',
                    text: response.data.message || 'ບັນຊີຂອງທ່ານເປີດໃຊ້ງານແລ້ວ, ກະລຸນາເຂົ້າສູ່ລະບົບ',
                    confirmButtonColor: '#4f46e5'
                }).then(() => {
                    navigate('/login');
                });

            } catch (error) {
                setStatus('error');
                console.error("Verification error:", error);
                
                Swal.fire({
                    icon: 'error',
                    title: 'ຢືນຢັນບໍ່ສຳເລັດ',
                    text: error.response?.data?.message || 'Link ອາດຈະໝົດອາຍຸ ຫຼື ບໍ່ຖືກຕ້ອງ',
                    confirmButtonColor: '#4f46e5'
                });
            }
        };

        if (id && hash) {
            triggerVerification();
        }
    }, [id, hash, location.search, navigate]);

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-center items-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-3xl shadow-xl text-center">
                
                {status === 'loading' && (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <h2 className="text-lg font-black text-gray-700">ກຳລັງກວດສອບ Link ຢືນຢັນອີເມວ...</h2>
                        <p className="text-xs text-gray-400">ກະລຸນາລໍຖ້າແປັບໜຶ່ງ ລະບົບກຳລັງປະມວນຜົນ</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-[#4f46e5] text-3xl">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <h2 className="text-xl font-black text-[#0f2d37]">ຢືນຢັນອີເມວສຳເລັດແລ້ວ!</h2>
                        <p className="text-sm text-gray-400">ທ່ານສາມາດເຂົ້າສູ່ລະບົບເພື່ອໃຊ້ງານໄດ້ທັນທີ</p>
                        <Link to="/login" className="block w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3 rounded-xl transition text-sm">
                            ໄປໜ້າເຂົ້າສູ່ລະບົບ
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 text-3xl">
                            <i className="fa-solid fa-circle-xmark"></i>
                        </div>
                        <h2 className="text-xl font-black text-red-600">Link ໝົດອາຍຸ ຫຼື ບໍ່ຖືກຕ້ອງ</h2>
                        <p className="text-sm text-gray-400">ກະລຸນາລົງທະບຽນໃໝ່ ຫຼື ຕິດຕໍ່ Admin ເພື່ອຂໍ Link ໃໝ່</p>
                        <Link to="/register" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition text-sm">
                            🔄 ກັບໄປໜ້າລົງທະບຽນ
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyEmail;