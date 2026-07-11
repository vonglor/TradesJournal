import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import Swal from 'sweetalert2';

const Profile = () => {
    // 👤 States ສໍາລັບຂໍ້ມູນທົ່ວໄປ
    const [id, setId] = useState('');
    const [fullname, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');

    // 🔒 States ສໍາລັບການປ່ຽນລະຫັດຜ່ານ
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // ⚠️ States ສໍາລັບເກັບຂໍ້ຄວາມເຕືອນລະຫັດຜ່ານ (Real-time Error)
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // 👁️ States ສໍາລັບເປີດ/ປິດ ຕາ
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await userService.getMe();
                const userData = response.data;

                if (userData) {
                    setId(userData.id || '');
                    setFullName(userData.fullname || '');
                    setEmail(userData.email || '');

                    let rawPhone = userData.phone || '';
                    if (rawPhone.startsWith('020')) {
                        rawPhone = rawPhone.substring(1);
                    }
                    setPhone(rawPhone);
                }

            } catch (error) {
                console.error("Error fetching profile:", error);
                Toast.fire({
                    icon: 'error',
                    title: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໂປຣໄຟລ໌ໄດ້'
                });
            }
        };

        fetchUserProfile();
    }, []);

    // 📱 ຟັງຊັນກວດສອບເບີໂທແບບ Real-time
    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setPhone(value);

        if (value === '') {
            setPhoneError('');
            return;
        }

        if (value.length >= 2 && !value.startsWith('20')) {
            setPhoneError('ເບີໂທລະສັບຕ້ອງຂຶ້ນຕົ້ນດ້ວຍ 20 ເທົ່ານັ້ນ');
            return;
        }

        if (value.length >= 3 && !['2', '5', '7', '9'].includes(value[2])) {
            setPhoneError('ຫຼັງຈາກ 20 ຕ້ອງຕາມດ້ວຍເລກ 2, 5, 7, 9 ເທົ່ານັ້ນ');
            return;
        }

        if (value.length < 10) {
            setPhoneError('ເບີໂທລະສັບຂອງທ່ານຍັງບໍ່ຄົບ (ຕ້ອງມີ 10 ຕົວເລກ)');
        } else {
            setPhoneError('');
        }
    };

    // 📧 ຟັງຊັນກວດສອບຮູບແບບອີເມວແບບ Real-time
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        if (value === '') {
            setEmailError('');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError('ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: example@domain.com)');
        } else {
            setEmailError('');
        }
    };

    // 🔑 ຟັງຊັນດັກການພިມ ແລະ ກວດສອບລະຫັດຜ່ານໃໝ່ (Real-time)
    const handleNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);

        if (value === '') {
            setPasswordError('');
        } else if (value.length < 6) {
            setPasswordError('ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ');
        } else {
            setPasswordError('');
        }

        if (confirmPassword && value !== confirmPassword) {
            setConfirmPasswordError('ລະຫັດຜ່ານຢືນຢັນບໍ່ຕົງກັບລະຫັດຜ່ານໃໝ່');
        } else {
            setConfirmPasswordError('');
        }
    };

    // 🔑 ຟັງຊັນດັກການພິມ ແລະ ກວດສອບການຢືນຢັນລະຫັດຜ່ານ (Real-time)
    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (value === '') {
            setConfirmPasswordError('');
        } else if (value !== newPassword) {
            setConfirmPasswordError('ລະຫັດຜ່ານຢືນຢັນບໍ່ຕົງກັບລະຫັດຜ່ານໃໝ່');
        } else {
            setConfirmPasswordError('');
        }
    };

    // 💾 1. ຟັງຊັນບັນທຶກຂໍ້ມູນທົ່ວໄປ
    const handleUpdateInfo = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('fullname', fullname);
        formData.append('email', email);
        formData.append('phone', phone);

        try {
            await userService.updateProfile(id, formData);
            const storedUser = localStorage.getItem('user_info');
            const currentUser = storedUser ? JSON.parse(storedUser) : {};
            const updatedUser = { ...currentUser, fullname, email, phone };
            localStorage.setItem('user_info', JSON.stringify(updatedUser));
            Toast.fire({ icon: 'success', title: 'ອັບເດດຂໍ້ມູນສ່ວນຕົວສຳເລັດ', background: '#fff', iconColor: '#0a7067' });
        } catch (error) {
            Toast.fire({ icon: 'error', title: error.response?.data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້' });
        }
    };

    // 🔑 2. ຟັງຊັນປ່ຽນລະຫັດຜ່ານ
    const handleChangePassword = async (e) => {
        e.preventDefault();

        try {
            await userService.changePassword({
                new_password: newPassword,
                new_password_confirmation: confirmPassword
            });

            Toast.fire({ icon: 'success', title: 'ປ່ຽນລະຫັດຜ່ານສຳເລັດ', background: '#fff', iconColor: '#0a7067' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ຜິດພາດ',
                text: error.response?.data?.message || 'ບໍ່ສາມາດປ່ຽນລະຫັດຜ່ານໄດ້'
            });
        }
    };

    const handleUpgrade = async (e) => {
        if (e) e.preventDefault(); // ປ້ອງກັນການລັນ Form (ຖ້າມີ)

        try {
            // 1. ເປີດ Swal ເພື່ອໃຫ້ User ກົດຢືນຢັນກ່ອນ
            const result = await Swal.fire({
                title: 'ຢືນຢັນການອັບເກຣດ?',
                text: 'ທ່ານຕ້ອງການອັບເກຣດຜູ້ໃຊ້ຄັ້ງສູງແທ້ ຫຼື ບໍ?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ຕົກລົງ',
                cancelButtonText: 'ຍົກເລີກ',
                confirmButtonColor: '#6366f1', // 🟢 ໃຊ້ສີ Indigo ໃຫ້ເຂົ້າກັບ Theme ປຸ່ມອັບເກຣດຂອງທ່ານ
                cancelButtonColor: '#ef4444',
            });

            // 2. ຖ້າ User ກົດ "ຕົກລົງ" (Confirmed) ຈຶ່ງຄ່ອຍຍິງ API
            if (result.isConfirmed) {

                // ສະແດງ Loading ຖ້າກໍລະນີ Backend ເຮັດວຽກຊ້າ
                Swal.fire({
                    title: 'ກຳລັງດຳເນີນການ...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                // ຍິງ API ອັບເກຣດ
                const response = await userService.upgradeUserRole({ id: id });

                // 🟢 ຖ້າ Backend ອັບເກຣດ ແລະ ສົ່ງ Token ໃໝ່ມາມາກຽມພ້ອມ
                if (response.data.status === 'success') {
                    const resData = response.data;

                    // 1. ເຊຟ Token ໃໝ່ ແລະ ຂໍ້ມູນ User ໃໝ່ລົງ LocalStorage (Format ດຽວກັນກັບຕອນ Login)
                    localStorage.setItem('auth_token', resData.token);
                    localStorage.setItem('user_info', JSON.stringify(resData.user));

                    Swal.close();

                    Toast.fire({
                        icon: 'success',
                        title: 'ອັບເກຣດເປັນເຈົ້າຂອງຫ້ອງແຖວສຳເລັດແລ້ວ!',
                        background: '#fff',
                        iconColor: '#6366f1'
                    });

                    // 2. ໜ່ວງເວລາໃຫ້ Toast ສະແດງ ແລ້ວ Reload ໜ້າຈໍເພື່ອເອົາ Token/Role ໃໝ່ໄປໃຊ້ງານ
                    setTimeout(() => {
                        window.location.reload();
                    }, 1800);
                }
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ຜິດພາດ',
                text: error.response?.data?.message || 'ບໍ່ສາມາດອັບເກຣດສະຖານະໄດ້, ກະລຸນາລອງໃໝ່'
            });
        }
    };

    // 🔍 ເງື່ອນໄຂການປິດ/ເປີດ ປຸ່ມຂໍ້ມູນທົ່ວໄປ
    const isInfoInvalid = !fullname || !email || phoneError || emailError;

    // 🔍 ເງື່ອນໄຂການປິດ/ເປີດ ປຸ່ມປ່ຽນລະຫັດຜ່ານ
    const isPasswordInvalid = !newPassword || !confirmPassword || passwordError || confirmPasswordError;

    // 1. ດຶງຂໍ້ມູນອອກມາ (ຂຽນໄວ້ດ້ານເທິງ ກ່ອນສ່ວນ return)
    const user = JSON.parse(localStorage.getItem('user_info'));

    return (
        <div className="space-y-6 animate-in fade-in duration-200">

            {/* ---------------- 1. ສ່ວນຫົວ (ຮັກສາຄວາມໜາສະເພາະຫົວຂໍ້ຫຼັກ) ---------------- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
                        <i className="fa-solid fa-arrow-left"></i>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#0f2d37]">👤 ຕັ້ງຄ່າຂໍ້ມູນສ່ວນຕົວ</h2>
                        <p className="text-sm text-gray-400 mt-0.5 font-normal">ຈັດການຂໍ້ມູນບັນຊີ ແລະ ຄວາມປອດໄພລະຫັດຜ່ານ</p>
                    </div>
                </div>
                {user?.role === "user" && (
                    <div className="w-full sm:w-auto flex justify-end">
                        <button
                            type="button"
                            onClick={handleUpgrade}
                            className="w-full sm:w-auto text-xs sm:text-sm font-medium px-5 py-3 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-200 animate-pulse">
                                <path d="M12 2c-.1 0-.2 0-.2.1l-.3.7c-1.3 3.7-4 6.4-7.7 7.7l-.7.3c-.1 0-.1.1-.1.2s0 .2.1.2l.7.3c3.7 1.3 6.4 4 7.7 7.7l.3.7c0 .1.1.1.2.1s.2 0 .2-.1l.3-.7c1.3-3.7 4-6.4 7.7-7.7l.7-.3c.1 0 .1-.1.1-.2s0-.2-.1-.2l-.7-.3c-3.7-1.3-6.4-4-7.7-7.7l-.3-.7c0-.1-.1-.1-.2-.1z" />
                            </svg>
                            <span>ອັບເກຣດເປັນຜູ້ໃຊ້ຄັ້ງສູງ</span>
                        </button>
                    </div>
                )}
            </div>

            {/* ---------------- 2. Form ແກ້ໄຂຂໍ້ມູນທົ່ວໄປ ---------------- */}
            <form onSubmit={handleUpdateInfo} className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-[#0f2d37] flex items-center gap-2 border-b border-gray-50 pb-2">
                        <i className="fa-regular fa-id-card text-[#0a7067]"></i> ຂໍ້ມູນທົ່ວໄປ
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* 🟢 ປ່ຽນປ້າຍ Label ແລະ Input ໃຫ້ເປັນ Font ປົກກະຕິ/ປານກາງ ບໍ່ໜາເກີນໄປ */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-500 uppercase">ຊື່ຜູ້ໃຊ້ບັນຊີ <span className="text-red-500">*</span></label>
                            <input type="text" required value={fullname} onChange={e => setFullName(e.target.value)}
                                placeholder="ຕົວຢ່າງ: John Doe"
                                className="w-full bg-gray-50/50 border border-gray-200 p-3 rounded-xl text-sm font-normal text-gray-800 focus:outline-none focus:border-[#0a7067] focus:bg-white transition" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-500 uppercase">ອີເມວ (Email) <span className="text-red-500">*</span></label>
                            <input type="email" required value={email} onChange={handleEmailChange}
                                placeholder="ຕົວຢ່າງ: example@email.com"
                                className={`w-full bg-gray-50/50 border p-3 rounded-xl text-sm font-normal text-gray-800 focus:outline-none focus:bg-white transition ${emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#0a7067]'}`} />
                            {emailError && (
                                <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                    <i className="fa-solid fa-circle-exclamation"></i> {emailError}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-500 uppercase">ເບີໂທລະສັບ (Phone) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                maxLength={10}
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="ຕົວຢ່າງ: 20XXXXXXXX"
                                className={`w-full bg-gray-50/50 border p-3 rounded-xl text-sm font-normal text-gray-800 focus:outline-none focus:bg-white transition ${phoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#0a7067]'}`}
                            />
                            {phoneError && (
                                <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                    <i className="fa-solid fa-circle-exclamation"></i> {phoneError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex justify-end">
                    <button
                        type="submit"
                        disabled={isInfoInvalid}
                        className={`text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 ${isInfoInvalid
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                            : 'bg-[#0a7067] hover:bg-[#085a53] text-white'
                            }`}
                    >
                        <i className="fa-solid fa-floppy-disk"></i> ບັນທຶກຂໍ້ມູນທົ່ວໄປ
                    </button>
                </div>
            </form>

            {/* ---------------- 3. Form ແຍກປ່ຽນລະຫັດຜ່ານ ---------------- */}
            <form onSubmit={handleChangePassword} className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-[#0f2d37] flex items-center gap-2 border-b border-gray-50 pb-2">
                        <i className="fa-solid fa-key text-amber-500"></i> ປ່ຽນລະຫັດຜ່ານໃໝ່ (Security)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 🟢 ປ່ຽນລະຫັດຜ່ານ Input ໃຫ້ເປັນ font-normal ເພື່ອຄວາມສະອາດ */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-500">ລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    placeholder="ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"
                                    value={newPassword}
                                    onChange={handleNewPasswordChange}
                                    className={`w-full bg-gray-50/50 border p-3 pr-10 rounded-xl text-sm font-normal text-gray-800 focus:outline-none focus:bg-white transition ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-amber-500'}`}
                                />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition">
                                    <i className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                            {passwordError && (
                                <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                    <i className="fa-solid fa-circle-exclamation"></i> {passwordError}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-500">ຢືນຢັນລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    placeholder="ຢືນຢັນລະຫັດຜ່ານໃໝ່"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className={`w-full bg-gray-50/50 border p-3 pr-10 rounded-xl text-sm font-normal text-gray-800 focus:outline-none focus:bg-white transition ${confirmPasswordError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-amber-500'}`}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition">
                                    <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                            {confirmPasswordError && (
                                <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                    <i className="fa-solid fa-circle-exclamation"></i> {confirmPasswordError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-amber-50/30 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPasswordInvalid}
                        className={`text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 ${isPasswordInvalid
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                    >
                        <i className="fa-solid fa-shield-halved"></i> ອັບເດດລະຫັດຜ່ານ
                    </button>
                </div>
            </form>

        </div>
    );
};

export default Profile;