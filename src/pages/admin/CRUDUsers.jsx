import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import echo from '../../utils/echo'; //
import Swal from 'sweetalert2';

const CRUDUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState([]);

    // Refs ສຳລັບການຍ້າຍ Focus ເວລາກົດ Enter
    const fullnameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const phoneInputRef = useRef(null);
    const roleInputRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalUserOpen, setIsModalUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // 🟢 ເກັບຂໍ້ມູນ User ທີ່ເລືອກເບິ່ງລາຍລະອຽດ
    const [searchTerm, setSearchTerm] = useState('');
    const [editId, setEditId] = useState(null);

    // 📝 State ສໍາລັບການແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [roleId, setRoleId] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await userService.getAll();
            const rolesResponse = await roleService.getAll();

            if (rolesResponse && Array.isArray(rolesResponse.data)) {
                setRoles(rolesResponse.data);
            } else if (rolesResponse && rolesResponse.data && Array.isArray(rolesResponse.data.data)) {
                setRoles(rolesResponse.data.data);
            } else if (Array.isArray(rolesResponse)) {
                setRoles(rolesResponse);
            } else {
                setRoles([]);
            }

            if (response && response.data && Array.isArray(response.data.data)) {
                setUsers(response.data.data);
            } else if (response && Array.isArray(response.data)) {
                setUsers(response.data);
            } else if (Array.isArray(response)) {
                setUsers(response);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            Toast.fire({ icon: 'error', title: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ງານໄດ້' });
        } finally {
            setIsLoading(false);
        }
    };

    // 🟢 2. ປັບປຸງ useEffect ໃຫ້ຮອງຮັບ Realtime WebSocket
    useEffect(() => {
        // ໂຫຼດຂໍ້ມູນຄັ້ງທຳອິດຈາກ API ປົກກະຕິ
        fetchUsers();

        // ເປີດການດັກຟັງ WebSocket ຈາກ Laravel Reverb
        const channel = echo.channel('users-channel')
            .listen('.user.registered', (e) => {
                console.log('ມີສະມາຊິກໃໝ່ສະໝັກເຂົ້າມາແບບ Realtime:', e.user);

                // 💡 ເອົາ User ໃໝ່ທີ່ສົ່ງມາຈາກ Backend ໄປຍັດໃສ່ທາງໜ້າສຸດຂອງຕາຕະລາງທັນທີ
                setUsers((prevUsers) => [e.user, ...prevUsers]);
            });

        // ⚠️ ລ້າງການເຊື່ອມຕໍ່ (Clean up) ເວລາຜູ້ໃຊ້ຍ້າຍໄປໜ້າອື່ນ ເພື່ອປ້ອງກັນບໍ່ໃຫ້ມັນ Listen ຊ້ຳຊ້ອນ
        return () => {
            channel.stopListening('.user.registered');
        };
    }, []); // ປ່ອຍໃຫ້ເປັນ Array ຫວ່າງຄືເກົ່າ ເພື່ອໃຫ້ມັນເຮັດວຽກຄັ້ງທຳອິດຄັ້ງດຽວຕອນໂຫຼດ Component

    const openUserModal = (user) => {
        setSelectedUser(user); // 🟢 ເຊັດຂໍ້ມູນຜູ້ໃຊ້ລົງ State ເພື່ອເອົາໄປໂຊໃນ Modal
        setIsModalUserOpen(true);
    };

    const openEditModal = (user) => {
        setEditId(user.id);
        setFullname(user.fullname || '');

        // 🔎 ດຶງຂໍ້ມູນ email ແລະ phone ຈາກ array providers ມາເຊັດລົງ State
        const emailProvider = user.providers?.find(p => p.provider_type === 'email');
        const phoneProvider = user.providers?.find(p => p.provider_type === 'phone');

        setEmail(emailProvider ? emailProvider.provider_name : '');
        setPhone(phoneProvider ? phoneProvider.provider_name : '');

        // 🟢 ລ້າງຄ່າ Error ເກົ່າອອກທຸກຄັ້ງທີ່ເປີດ Modal ແກ້ໄຂຜູ້ໃຊ້ຄົນໃໝ່
        setEmailError('');
        setPhoneError('');

        // ດຶງ id ຂອງ Role ຕົວທຳອິດມາສະແດງໃນ select option
        setRoleId(user.roles && user.roles.length > 0 ? user.roles[0].id : '');
        setIsModalOpen(true);
    };

    const handleKeyDown = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
            }
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

    // 📱 ຟັງຊັນກວດສອບເບີໂທລະສັບແບບ Real-time
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

    const handleSave = async (e) => {
        e.preventDefault();

        if (!fullname) {
            Toast.fire({ icon: 'warning', title: 'ກະລຸນາກອກຊື່ແລະນາມສະກຸນ' });
            return;
        }
        if (!email) {
            Toast.fire({ icon: 'warning', title: 'ກະລຸນາກອກອີເມວ' });
            return;
        }
        if (!roleId) {
            Toast.fire({ icon: 'warning', title: 'ກະລຸນາເລືອກບົດບາດ' });
            return;
        }

        const payload = {
            fullname: fullname,
            email: email,
            phone: phone,
            role_id: roleId
        };

        try {
            if (editId) {
                await userService.update(editId, payload);
                Toast.fire({ icon: 'success', title: 'ອັບເດດຂໍ້ມູນສຳເລັດແລ້ວ' });
                setIsModalOpen(false);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error saving user:', error);
            Swal.fire({
                icon: 'error',
                title: 'ເກີດຂໍ້ຜິດພາດ',
                text: error.response?.data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້',
                confirmButtonColor: '#0a7067'
            });
        }
    };

    // 🔴 ຟັງຊັນລະງັບ ຫຼື ເປີດການໃຊ້ງານບັນຊີ
    const handleToggleStatus = async (user) => {
        const isSuspended = user.status === 'suspended';

        // 🔎 ກວດສອບກ່ອນວ່າ Email ຂອງ User ຄົນນີ້ໄດ້ຢືນຢັນແລ້ວຫຼືບໍ່
        const emailProvider = user.providers?.find(p => p.provider_type === 'email');
        const isVerified = emailProvider?.is_verified === true;

        // 🛠️ ກຳນົດສະຖານະໃໝ່: ຖ້າປົດລັອກ ໃຫ້ເຊັກວ່າ verified ຫຼືຍັງ, ຖ້າລັອກ ກໍໃຫ້ເປັນ suspended
        let newStatus = 'suspended';
        if (isSuspended) {
            newStatus = isVerified ? 'active' : 'inactive'; // 💡 ຖ້າຍັງບໍ່ verified ໃຫ້ກັບໄປເປັນ 'inactive' (ຫຼືຄ່າທີ່ລະບົບເຈົ້າໃຊ້)
        }

        const actionText = isSuspended ? 'ເປີດໃຊ້ງານ' : 'ລະງັບການໃຊ້ງານ';

        Swal.fire({
            title: `ທ່ານແນ່ໃຈບໍ່?`,
            text: `ต้องการ ${actionText} ຂອງຜູ້ໃຊ້ ${user.fullname} ແທ້ຫຼືບໍ່?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isSuspended ? '#10b981' : '#d33',
            cancelButtonColor: '#f3f4f6',
            confirmButtonText: `ແນ່ໃຈ, ${actionText}!`,
            cancelButtonText: 'ຍົກເລີກ',
            customClass: { cancelButton: 'text-gray-600 font-bold', confirmButton: 'font-bold' }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // ສົ່ງສະຖານະໃໝ່ໄປອັບເດດຢູ່ Backend
                    await userService.updateUserStatus(user.id, { status: newStatus });
                    Toast.fire({ icon: 'success', title: `${actionText} ຮຽບຮ້ອຍແລ້ວ` });
                    setIsModalUserOpen(false);
                    fetchUsers(); // ໂຫຼດຂໍ້ມູນຕາຕະລາງໃໝ່
                } catch (error) {
                    console.error('Error updating status:', error);
                    Swal.fire({ icon: 'error', title: 'ຂໍ້ຜິດພາດ', text: 'ບໍ່ສາມາດປ່ຽນສະຖານະໄດ້', confirmButtonColor: '#0a7067' });
                }
            }
        });
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'ທ່ານແນ່ໃຈບໍ່?',
            text: "ຕ້ອງການລຶບຜູ້ໃຊ້ງານນີ້ແທ້ຫຼືບໍ່? ຂໍ້ມູນຈະບໍ່ສາມາດກູ້ຄືນໄດ້!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#f3f4f6',
            confirmButtonText: 'ແນ່ໃຈ, ລຶບເລີຍ!',
            cancelButtonText: 'ຍົກເລີກ',
            customClass: { cancelButton: 'text-gray-600 font-bold', confirmButton: 'font-bold' }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await userService.delete(id);
                    Toast.fire({ icon: 'success', title: 'ລຶບຂໍ້ມູນຜູ້ໃຊ້ງານຮຽບຮ້ອຍແລ້ວ' });
                    fetchUsers();
                } catch (error) {
                    console.error('Error deleting user:', error);
                    Swal.fire({ icon: 'error', title: 'ຂໍ້ຜິດພາດ', text: 'ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້', confirmButtonColor: '#0a7067' });
                }
            }
        });
    };

    const isInfoInvalid = !fullname || !email || !roleId || phoneError || emailError;

    const filteredUsers = users.filter(u =>
        (u.fullname && u.fullname.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0f2d37]">ຈັດການຂໍ້ມູນຜູ້ໃຊ້ງານ</h2>
                    <p className="text-xs text-gray-400 mt-1">ແກ້ໄຂ ແລະ ຕັ້ງຄ່າຂໍ້ມູນບົດບາດຂອງຜູ້ໃຊ້ງານ</p>
                </div>
            </div>

            {/* Stats & Search Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-400">ຜູ້ໃຊ້ງານທັງໝົດ</p>
                        <p className="text-xl font-bold text-[#0f2d37]">{users.length} ຄົນ</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex items-center px-4 gap-3">
                    <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="ຄົ້ນຫາດ້ວຍຊື່ ແລະ ນາມສະກຸນ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-sm focus:outline-none placeholder-gray-400 font-medium"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 text-sm">ລຶບ</button>
                    )}
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f4f6f8] text-[#0f2d37] text-base font-bold uppercase border-b border-gray-100">
                                <th className="p-4 w-20 text-center">ລຳດັບ</th>
                                <th className="p-4">ຊື່ແລະນາມສະກຸນ</th>
                                <th className="p-4">ອີເມວ</th>
                                <th className="p-4">ເບີໂທ</th>
                                <th className="p-4">ບົດບາດ (Role)</th>
                                <th className="p-4">ສະຖານະ</th>
                                <th className="p-4 w-32 text-center">ຈັດການ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-600">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400 font-medium">
                                        <i className="fa-solid fa-spinner animate-spin mr-2"></i> ກຳລັງໂຫຼດຂໍ້ມູນ...
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => {
                                    const emailProvider = user.providers?.find(p => p.provider_type === 'email');
                                    const phoneProvider = user.providers?.find(p => p.provider_type === 'phone');

                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50/70 transition">
                                            <td className="p-4 text-center text-gray-400">{index + 1}</td>
                                            <td className="p-4 text-[#0f2d37] font-bold">
                                                {user.fullname}
                                            </td>

                                            <td className="p-4 text-[#0f2d37] font-medium">
                                                {emailProvider ? emailProvider.provider_name : '—'}
                                            </td>

                                            <td className="p-4 text-[#0f2d37] font-medium">
                                                {phoneProvider ? phoneProvider.provider_name : '—'}
                                            </td>

                                            <td className="p-4">
                                                <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-indigo-50 text-indigo-600">
                                                    {user.roles && user.roles.length > 0 ? user.roles[0].name : 'no_role'}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                {user.status === 'suspended' ? (
                                                    <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-red-100 text-red-600">
                                                        ຖືກລະງັບ
                                                    </span>
                                                ) : (emailProvider?.is_verified == true && user.status === 'active') ? (
                                                    <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-green-50 text-green-600">
                                                        ປົກກະຕິ
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-yellow-50 text-yellow-600">
                                                        ຍັງບໍ່ຢືນຢັນ
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 flex justify-center gap-2">
                                                <button
                                                    onClick={() => openUserModal(user)}
                                                    className="w-8 h-8 rounded-lg bg-gray-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition flex items-center justify-center shadow-xs"
                                                    title="ລາຍລະອຽດ"
                                                >
                                                    <i className="fa-solid fa-eye text-[11px]"></i>
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="w-8 h-8 rounded-lg bg-gray-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition flex items-center justify-center shadow-xs"
                                                    title="ແກ້ໄຂ"
                                                >
                                                    <i className="fa-solid fa-pen text-[11px]"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-600 text-red-600 hover:text-white transition flex items-center justify-center shadow-xs"
                                                    title="ລຶບ"
                                                >
                                                    <i className="fa-solid fa-trash text-[11px]"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400 font-medium">
                                        ❌ ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ງານທີ່ທ່ານຄົ້ນຫາ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🟢 MODAL SHOW USER DETAILS & TOGGLE STATUS */}
            {isModalUserOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalUserOpen(false)}></div>

                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5 animate-in zoom-in-95 duration-200">

                        {/* 1. MODAL HEADER */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <i className="fa-solid fa-id-card text-sm"></i>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#0f2d37]">ລາຍລະອຽດຜູ້ໃຊ້ງານ</h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalUserOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-xl transition"
                            >
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                        </div>

                        {/* 2. MODAL CONTENT (ຂໍ້ມູນແທ້ຂອງ User) */}
                        <div className="space-y-4 text-sm font-bold text-gray-700">
                            <div className="bg-[#f4f6f8] p-4 rounded-2xl space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">ຊື່ແລະນາມສະກຸນ:</span>
                                    <span className="text-[#0f2d37]">{selectedUser.fullname}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">ອີເມວ:</span>
                                    <span className="text-[#0f2d37]">{selectedUser.providers?.find(p => p.provider_type === 'email')?.provider_name || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">ເບີໂທ:</span>
                                    <span className="text-[#0f2d37]">{selectedUser.providers?.find(p => p.provider_type === 'phone')?.provider_name || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">ບົດບາດ:</span>
                                    <span className="px-2 py-0.5 text-xs rounded-md bg-indigo-50 text-indigo-600 uppercase">
                                        {selectedUser.roles && selectedUser.roles.length > 0 ? selectedUser.roles[0].name : 'no_role'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">ສະຖານະບັນຊີ:</span>
                                    {/* {selectedUser.status === 'suspended' ? (
                                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-100 text-red-600">
                                            ຖືກລະງັບ
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-green-100 text-green-600">
                                            ປົກກະຕິ
                                        </span>
                                    )} */}
                                    {selectedUser.status === 'suspended' ? (
                                        <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-red-100 text-red-600">
                                            ຖືກລະງັບ
                                        </span>
                                    ) : (selectedUser.providers?.find(p => p.provider_type === 'email')?.is_verified == true && selectedUser.status === 'active') ? (
                                        <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-green-50 text-green-600">
                                            ປົກກະຕິ
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-yellow-50 text-yellow-600">
                                            ຍັງບໍ່ຢືນຢັນ
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. MODAL FOOTER (ປຸ່ມລະງັບການໃຊ້ງານ ແລະ ປິດ) */}
                        <div className="flex flex-col gap-2 pt-2">
                            {/* ປຸ່ມສະຫຼັບສະຖານະ */}
                            <button
                                type="button"
                                onClick={() => handleToggleStatus(selectedUser)}
                                className={`w-full font-bold py-2.5 rounded-xl transition duration-150 text-sm text-white ${selectedUser.status === 'suspended' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'}`}
                            >
                                {selectedUser.status === 'suspended' ? (
                                    <>
                                        <i className="fa-solid fa-unlock mr-2"></i> ປົດບລັອກ (ເປີດໃຊ້ງານບັນຊີ)
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-user-slash mr-2"></i> ລະງັບການໃຊ້ງານບັນຊີນີ້
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsModalUserOpen(false)}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition duration-150 text-sm"
                            >
                                ປິດໜ້າຕ່າງ
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MODAL POPUP FOR EDIT ONLY */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>

                    <form
                        onSubmit={handleSave}
                        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4"
                    >
                        <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                            <h3 className="text-xl font-bold text-[#0f2d37]">
                                📝 ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້
                            </h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* 1. Fullname Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#0f2d37]">ຊື່ແລະນາມສະກຸນ <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    ref={fullnameInputRef}
                                    placeholder="ກອກຊື່ ແລະ ນາມສະກຸນ..."
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, emailInputRef)}
                                    className="w-full bg-[#f4f6f8] border border-transparent focus:border-[#4f46e5] focus:bg-white text-sm font-bold px-4 py-2.5 rounded-xl focus:outline-none transition"
                                    autoFocus
                                />
                            </div>

                            {/* 2. Email Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#0f2d37]">ອີເມວ <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    ref={emailInputRef}
                                    placeholder="ຕົວຢ່າງ: info@example.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onKeyDown={(e) => handleKeyDown(e, phoneInputRef)}
                                    className={`w-full bg-[#f4f6f8] border text-sm font-bold px-4 py-2.5 rounded-xl focus:outline-none transition ${emailError ? 'border-red-500 focus:border-red-500 bg-red-50/20' : 'border-transparent focus:border-[#4f46e5] focus:bg-white'}`}
                                />
                                {emailError && (
                                    <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                        <i className="fa-solid fa-circle-exclamation"></i> {emailError}
                                    </p>
                                )}
                            </div>

                            {/* 3. Phone Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#0f2d37]">ເບີໂທ</label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    ref={phoneInputRef}
                                    placeholder="ຕົວຢ່າງ: 20XXXXXXXX"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    onKeyDown={(e) => handleKeyDown(e, roleInputRef)}
                                    className={`w-full bg-[#f4f6f8] border text-sm font-bold px-4 py-2.5 rounded-xl focus:outline-none transition ${phoneError ? 'border-red-500 focus:border-red-500 bg-red-50/20' : 'border-transparent focus:border-[#4f46e5] focus:bg-white'}`}
                                />
                                {phoneError && (
                                    <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                        <i className="fa-solid fa-circle-exclamation"></i> {phoneError}
                                    </p>
                                )}
                            </div>

                            {/* 4. Role Dropdown Selection */}
                            <div className="space-y-1">
                                <label className="text-sm font-black text-[#0f2d37]">ເລືອກບົດບາດ <span className="text-red-500">*</span></label>
                                <select
                                    ref={roleInputRef}
                                    value={roleId}
                                    onChange={(e) => setRoleId(e.target.value)}
                                    className="w-full bg-[#f4f6f8] border border-transparent focus:border-[#4f46e5] focus:bg-white text-sm font-bold px-4 py-3 rounded-xl focus:outline-none transition cursor-pointer"
                                >
                                    <option value="">-- ກະລຸນາເລືອກບົດບາດ --</option>
                                    {Array.isArray(roles) && roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold px-4 py-2.5 rounded-xl transition"
                            >
                                ຍົກເລີກ
                            </button>
                            <button
                                type="submit"
                                disabled={isInfoInvalid}
                                className={`text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm text-white ${isInfoInvalid ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#4f46e5] hover:bg-[#4338ca]'}`}
                            >
                                ອັບເດດຂໍ້ມູນ
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CRUDUsers;