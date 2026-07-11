import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logoImg from '../../assets/favicon/favicon.svg';

let identityTimer;

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        identity: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [identityError, setIdentityError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const handleIdentityChange = (e) => {
        let value = e.target.value.trim();
        setFormData(prev => ({ ...prev, identity: value }));
        if (errors.identity) setErrors(prev => ({ ...prev, identity: '' }));

        if (value === '') {
            setIdentityError('');
            clearTimeout(identityTimer);
            return;
        }

        let currentError = '';
        let isValid = false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            currentError = 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: example@gmail.com)';
        } else {
            currentError = '';
            isValid = true;
        }

        setIdentityError(currentError);

        clearTimeout(identityTimer);
        if (isValid) {
            identityTimer = setTimeout(async () => {
                try {
                    const response = await api.post('/check-identity', { identity: value });
                    if (response.data.exists) {
                        setIdentityError('ອີເມວນີ້ມີຢູ່ໃນລະບົບແລ້ວ');
                    }
                } catch (error) {
                    console.error("Error checking identity:", error);
                }
            }, 500);
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, password: value }));
        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));

        if (value === '') {
            setPasswordError('');
        } else if (value.length < 6) {
            setPasswordError('ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ');
        } else {
            setPasswordError('');
        }

    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (identityError || passwordError) return;

        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await api.post('/register', {
                fullname: formData.name,
                identity: formData.identity,
                password: formData.password
            });

            setSuccessMessage('ສະໝັກສະມາຊິກສຳເລັດແລ້ວ! ກຳລັງພາທ່ານໄປໜ້າຢືນຢັນອີເມວ...');

            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
            }

            setFormData({ name: '', identity: '', password: '' });

            if (response.data.status === 'success') {
                navigate('/verify-email-notice', { state: { email: formData.identity } });
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ global: ['ເກີດຂໍ້ຜິດພາດຈາກລະບົບ Server, ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.'] });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] text-[#1f2937] flex flex-col justify-center items-center px-4 relative">
            <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-3xl shadow-xl relative z-10">
                <div className="flex flex-col items-center mb-6">
                    <Link to="/" className="flex flex-col items-center gap-2 group">
                        <div className="w-30 h-30 rounded-2xl overflow-hidden flex items-center justify-center transition-transform duration-200">
                            <img src={logoImg} alt="Lao Nest" className="w-full h-full object-contain" />
                        </div>
                    </Link>
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-xl font-black tracking-tight text-[#0f2d37]">ສ້າງບັນຊີໃໝ່</h2>
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
                        <label className="block text-sm font-bold text-[#0f2d37] mb-1.5">ຊື່ ແລະ ນາມສະກຸນ</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="ກະລຸນາປ້ອນຊື່ຂອງທ່ານ"
                            className={`w-full bg-white border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition duration-150`}
                        />
                        {errors.name && <p className="text-red-500 text-[11px] mt-1">*{errors.name[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0f2d37] mb-1.5">ອີເມວ</label>
                        <input
                            type="email"
                            name="identity"
                            value={formData.identity}
                            onChange={handleIdentityChange}
                            required
                            placeholder="example@gmail.com"
                            className={`w-full bg-white border ${errors.identity || identityError ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition duration-150`}
                        />
                        {errors.identity && (
                            <p className="text-red-500 text-[11px] mt-1">⚠️ {errors.identity[0]}</p>
                        )}
                        {identityError && (
                            <p className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">⚠️ {identityError}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0f2d37] mb-1.5">ລະຫັດຜ່ານ</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                required
                                onChange={handlePasswordChange}
                                placeholder="ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"
                                className={`w-full bg-white border ${errors.password || passwordError ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 pr-10 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition duration-150`}
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
                        {passwordError && <p className="text-xs text-red-500 font-bold mt-1">⚠️ {passwordError}</p>}
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="submit"
                            disabled={isLoading || identityError || passwordError}
                            className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3 rounded-xl transition duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? '⏳ ...' : 'ສ້າງບັນຊີ'}
                        </button>
                    </div>
                </form>

                <div className="mt-5 text-center text-sm text-gray-500">
                    ມີບັນຊີຢູ່ແລ້ວ?{' '}
                    <Link to="/login" className="text-[#4f46e5] hover:underline font-bold ml-1">ເຂົ້າສູ່ລະບົບທີ່ນີ້</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;