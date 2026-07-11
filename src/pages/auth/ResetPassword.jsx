import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';

export default function ResetPassword() {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [validation, setValidation] = useState({
        isMinLength: false,
        isMatched: false,
        isTouched: false
    });

    useEffect(() => {
        const { password, password_confirmation } = formData;
        
        if (password || password_confirmation) {
            setValidation({
                isMinLength: password.length >= 6,
                isMatched: password === password_confirmation && password !== '',
                isTouched: true
            });
        }
    }, [formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isButtonDisabled = !validation.isMinLength || !validation.isMatched || isLoading;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            Swal.fire({ title: 'ກຳລັງອັບເດດ...', didOpen: () => Swal.showLoading() });

            const response = await api.post('/reset-password', {
                token,
                email,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });

            Swal.fire({
                title: 'ສຳເລັດ!',
                text: response.data.message || 'ປ່ຽນລະຫັດຜ່ານໃໝ່ສຳເລັດແລ້ວ',
                icon: 'success',
                confirmButtonColor: '#4f46e5'
            }).then(() => {
                navigate('/login');
            });

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
                    <h2 className="text-xl font-black tracking-tight text-[#0f2d37]">ຕັ້ງລະຫັດຜ່ານໃໝ່</h2>
                    <p className="text-xs text-gray-500 mt-1">ບັນຊີ: {email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#0f2d37] mb-1.5">ລະຫັດຜ່ານໃໝ່</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 pr-10 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition duration-150"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                            >
                                <span>{showPassword ? "🙈" : "👁️"}</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0f2d37] mb-1.5">ຢືນຢັນລະຫັດຜ່ານໃໝ່</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                required
                                placeholder="ຢືນຢັນລະຫັດຜ່ານ"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 pr-10 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition duration-150"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                            >
                                <span>{showConfirmPassword ? "🙈" : "👁️"}</span>
                            </button>
                        </div>
                    </div>

                    {validation.isTouched && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5 font-medium animate-in fade-in duration-300">
                            <div className="flex items-center gap-2">
                                <span className={validation.isMinLength ? "text-indigo-600" : "text-gray-400"}>
                                    {validation.isMinLength ? "🟢" : "🔴"} ລະຫັດຜ່ານມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={validation.isMatched ? "text-indigo-600" : "text-gray-400"}>
                                    {validation.isMatched ? "🟢" : "🔴"} ລະຫັດຜ່ານທັງສອງຊ່ອງກົງກັນ
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isButtonDisabled}
                        className={`w-full font-bold py-3 rounded-xl transition duration-150 text-sm flex items-center justify-center gap-2 ${
                            isButtonDisabled 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-md'
                        }`}
                    >
                        {isLoading ? '⏳ ກຳລັງບັນທຶກ...' : '🔄 ອັບເດດລະຫັດຜ່ານ'}
                    </button>
                </form>
            </div>
        </div>
    );
}