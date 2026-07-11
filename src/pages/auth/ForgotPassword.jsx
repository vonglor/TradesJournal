import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            Swal.fire({ title: 'ກຳລັງປະມວນຜົນ...', didOpen: () => Swal.showLoading() });
            
            const response = await api.post('/forgot-password', { email });
            
            Swal.fire({
                title: 'ສຳເລັດ!',
                text: response.data.message,
                icon: 'success',
                confirmButtonColor: '#4f46e5'
            });
            setEmail('');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່.';
            Swal.fire({
                title: 'ຜິດພາດ!',
                text: errorMsg,
                icon: 'error',
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] text-[#1f2937] flex flex-col justify-center items-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-3xl shadow-xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-[#0f2d37]">ລືມລະຫັດຜ່ານ</h2>
                    <p className="text-xs text-gray-400 mt-1">ລະບົບຈະສົ່ງ Link ສຳລັບຕັ້ງລະຫັດຜ່ານໃໝ່ໄປຫາອີເມວຂອງທ່ານ</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#0f2d37] mb-1.5">ອີເມວບັນຊີຂອງທ່ານ</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="example@gmail.com"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition duration-150"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3 rounded-xl transition duration-150 text-sm disabled:opacity-50"
                    >
                        {isLoading ? '⏳ ກຳລັງສົ່ງ...' : '📩 ສົ່ງ Link ຕັ້ງລະຫັດຜ່ານໃໝ່'}
                    </button>
                </form>

                <div className="mt-5 text-center text-sm">
                    <Link to="/login" className="text-[#4f46e5] hover:underline font-bold">
                        ⬅️ ກັບໄປໜ້າເຂົ້າສູ່ລະບົບ
                    </Link>
                </div>
            </div>
        </div>
    );
}