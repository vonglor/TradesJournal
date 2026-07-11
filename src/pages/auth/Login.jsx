import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import logoImg from '../../assets/favicon/favicon.svg';

const Login = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        identity: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    useEffect(() => {
        // 🔍 ເຊັກຖ້າຢືນຢັນສຳເລັດ
        if (searchParams.get('verified') === 'true') {
            Swal.fire({
                title: 'ຢືນຢັນອີເມວສຳເລັດ!',
                text: 'ບັນຊີຂອງທ່ານເປີດໃຊ້ງານແລ້ວ ກະລຸນາເຂົ້າສູ່ລະບົບ.',
                icon: 'success',
                confirmButtonColor: '#4f46e5'
            });
            setSearchParams({});
        }

        // 🔍 🟢 ເພີ່ມບ່ອນນີ້: ເຊັກຖ້າ Link ໝົດອາຍຸ
        if (searchParams.get('error') === 'expired') {
            Swal.fire({
                title: 'Link ໝົດອາຍຸແລ້ວ!',
                text: 'Link ຢືນຢັນນີ້ໝົດອາຍຸແລ້ວ (ເກີນ 30 ນາທີ). ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອສົ່ງ Link ໃໝ່ອີກຄັ້ງ.',
                icon: 'error',
                confirmButtonColor: '#4f46e5'
            });
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await api.post('/login', {
                identity: formData.identity,
                password: formData.password
            });

            setSuccessMessage('ເຂົ້າສູ່ລະບົບສຳເລັດແລ້ວ! ກຳລັງພາໄປໜ້າຫຼັກ...');

            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
            }
            if (response.data.user) {
                localStorage.setItem('user_info', JSON.stringify(response.data.user));
            }

            setFormData({ identity: '', password: '' });

            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else if (error.response && error.response.status === 403) {
                setErrors({ global: [error.response.data.message] });

                // 🟢 ກວດເຊັກ status ທີ່ສົ່ງມາຈາກ Backend
                if (error.response.data.status === 'unverified') {
                    const targetEmail = error.response.data.email; // ດຶງອີເມວຈາກ backend ໂດຍກົງ
                    setTimeout(() => {
                        // 🎯 ຢ່າລືມເຊັກຊື່ Route ຂອງທ່ານເດີ້ວ່າແມ່ນ '/verify-email-notice' ຫຼື '/verify-email'
                        navigate('/verify-email-notice', { state: { email: targetEmail } });
                    }, 2000);
                }
            } else {
                setErrors({ global: ['ລະຫັດຜ່ານ ຫຼື ບັນຊີຜູ້ໃຊ້ບໍ່ຖືກຕ້ອງ, ກະລຸນາລອງໃໝ່.'] });
            }
        } finally {
            // 🟢 ປົດລັອກປຸ່ມຢູ່ບ່ອນນີ້! ບໍ່ວ່າຈະຖືກ ຫຼື ຜິດ ມັນຈະແລ່ນມາບ່ອນນີ້ສະເໝີ ເພື່ອຄືນສະຖານະປຸ່ມໃຫ້ກົດໃໝ່ໄດ້
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] text-[#1f2937] flex flex-col justify-center items-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-3xl shadow-xl">
                <div className="flex flex-col items-center mb-6">
                    <Link to="/" className="flex flex-col items-center gap-2 group">
                        <div className="w-30 h-30 rounded-2xl overflow-hidden flex items-center justify-center transition-transform duration-200">
                            <img src={logoImg} alt="Lao Nest" className="w-full h-full object-contain" />
                        </div>
                    </Link>
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-xl font-black tracking-tight text-[#0f2d37]">ເຂົ້າສູ່ລະບົບ</h2>
                </div>

                {successMessage && (
                    <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm rounded-xl font-medium">
                        {successMessage}
                    </div>
                )}
                {errors.global && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
                        {errors.global[0]}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#0f2d37] mb-1.5">ອີເມວ</label>
                        <input
                            type="text"
                            name="identity"
                            value={formData.identity}
                            onChange={handleChange}
                            required
                            placeholder="example@gmail.com"
                            className={`w-full bg-white border ${errors.identity ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition duration-150`}
                        />
                        {errors.identity && <p className="text-red-500 text-[11px] mt-1">*{errors.identity[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0f2d37] mb-1.5">ລະຫັດຜ່ານ</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                required
                                onChange={handleChange}
                                placeholder="ປ້ອນລະຫັດຜ່ານຂອງທ່ານ"
                                className={`w-full bg-white border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 pr-10 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition duration-150`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                            >
                                <span>{showPassword ? "🙈" : "👁️"}</span>
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-[11px] mt-1">*{errors.password[0]}</p>}

                        <div className="text-right mt-1.5">
                            <Link to="/forgot-password" className="text-xs text-[#4f46e5] hover:underline font-medium">
                                ລືມລະຫັດຜ່ານ?
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3 rounded-xl transition duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? '⏳ ...' : 'ເຂົ້າສູ່ລະບົບ'}
                        </button>
                    </div>
                </form>

                <div className="mt-5 text-center text-sm text-gray-500">
                    ຍັງບໍ່ມີບັນຊີ?{' '}
                    <Link to="/register" className="text-[#4f46e5] hover:underline font-bold ml-1">ສ້າງບັນຊີໃໝ່ທີ່ນີ້</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;