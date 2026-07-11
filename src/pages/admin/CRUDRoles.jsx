import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { roleService } from '../../services/roleService'; // 💡 ທ່ານສາມາດປ່ຽນຊື່ service ໃຫ້ກົງກັບຫຼັງບ້ານໄດ້ໃນພາຍຫຼັງ
import Swal from 'sweetalert2';

const CRUDRoles = () => {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Refs ສຳລັບການຍ້າຍ Focus ເວລາກົດ Enter
    const nameInputRef = useRef(null);
    const descriptionInputRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editId, setEditId] = useState(null); 
    
    // 📝 ປະກາດ State ໃໝ່ໃຫ້ກົງກັບຟິວຂອງກົນລະຍຸດການເທີດ
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

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

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response = await roleService.getAll();
            
            // 💡 ເພີ່ມການ Console.log ເພື່ອເບິ່ງໂຄງສ້າງທີ່ແທ້ຈິງໃນ DevTools
            console.log("ຜົນຮັບຈາກ API:", response); 

            // 🛠️ ປັບປ່ຽນການເຊັກເງື່ອນໄຂໃຫ້ຮອງຮັບ response.data.data
            if (response && response.data && Array.isArray(response.data.data)) {
                // ຖ້າ Laravel ສົ່ງມາເປັນ { data: [...] } ແລະ Axios ຫໍ່ໄວ້ອີກຊັ້ນ
                setRoles(response.data.data);
            } else if (response && Array.isArray(response.data)) {
                // ຖ້າ Axios ຫໍ່ໄວ້ ແຕ່ Laravel ສົ່ງມາເປັນອາເຣຊື່ໆ [...]
                setRoles(response.data);
            } else if (Array.isArray(response)) {
                // ຖ້າ Service ດຶງ response.data ອອກມາໃຫ້ແລ້ວ
                setRoles(response);
            } else {
                setRoles([]);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            Toast.fire({ icon: 'error', title: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນກົນລະຍຸດໄດ້' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);
 
    const openAddModal = () => {
        setEditId(null);
        setName('');
        setDescription(''),
        setIsModalOpen(true);
    };

    const openEditModal = (role) => {
        setEditId(role.id);
        setName(role.name || '');
        setDescription(role.description || '');
        setIsModalOpen(true);
    };

    // ຟັງຊັນຄວບຄຸມປຸ່ມ Enter ເພື່ອ Focus ໄປ Input ຖັດໄປ
    const handleKeyDown = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
            }
        }
    };

    const handleRRChange = (e) => {
        const value = e.target.value;
        
        // Regular Expression: ອະນຸຍາດສະເພາະຕົວເລກ ແລະ ຈຸດທົດສະນິຍົມໄດ້ພຽງຈຸດດຽວເທົ່ານັ້ນ
        const cleanedValue = value.replace(/[^0-9.]/g, '');
        
        // ປ້ອງກັນບໍ່ໃຫ້ມີຈຸດທົດສະນິຍົມຊ້ຳກັນ ເຊັ່ນ 2..5 ຫຼື 2.5.5
        const parts = cleanedValue.split('.');
        if (parts.length > 2) {
            return; // ຖ້າມີຈຸດຫຼາຍກວ່າ 1 ຕົວ ແມ່ນບໍ່ໃຫ້ອັບເດດຄ່າ
        }
        
        setStrategyRR(cleanedValue);
    };

    const handleSave = async (e) => {
        e.preventDefault();
      
        // 1. ກວດສອບຂໍ້ມູນວ່າກອກຄົບຫຼືບໍ່
        if (!name) {
            Toast.fire({ icon: 'warning', title: 'ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບຖ້ວນທຸກຟິວ' });
            return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        // 2. ກຽມ Payload ຕາມທີ່ຕ້ອງການ

        try {
            if (editId) {
                await roleService.update(editId, formData);
                Toast.fire({ icon: 'success', title: 'ອັບເດດຂໍ້ມູນສຳເລັດແລ້ວ', background: '#fff', iconColor: '#0a7067' });
            } else {
                await roleService.create(formData);
                Toast.fire({ icon: 'success', title: 'ເພີ່ມສະເພາະໃໝ່ສຳເລັດແລ້ວ', background: '#ffffff', iconColor: '#0a7067' });
            }
            
            setIsModalOpen(false);
            fetchRoles(); 
        } catch (error) {
            console.error('Error saving role:', error);
            Swal.fire({
                icon: 'error',
                title: 'ເກີດຂໍ້ຜິດພາດ',
                text: error.response?.data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້',
                confirmButtonColor: '#0a7067'
            });
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'ທ່ານແນ່ໃຈບໍ່?',
            text: "ຕ້ອງການລຶບກົນລະຍຸດນີ້ແທ້ຫຼືບໍ່? ຂໍ້ມູນຈະບໍ່ສາມາດກູ້ຄືນໄດ້!",
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
                    await roleService.delete(id);
                    Toast.fire({ icon: 'success', title: 'ລຶບຂໍ້ມູນກົນລະຍຸດຮຽບຮ້ອຍແລ້ວ', background: '#fff', iconColor: '#0a7067' });
                    fetchRoles(); 
                } catch (error) {
                    console.error('Error deleting role:', error);
                    Swal.fire({ icon: 'error', title: 'ຂໍ້ຜິດພາດ', text: 'ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້', confirmButtonColor: '#0a7067' });
                }
            }
        });
    };

    // ຄົ້ນຫາຂໍ້ມູນຈາກ ຊື່, ຄູ່ເງິນ ຫຼື Timeframe
    const filteredRoles = roles.filter(r => 
        (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0f2d37]">ຈັດການຂໍ້ມູນບົດບາດ/ໜ້າທີ່ (Roles)</h2>
                    <p className="text-xs text-gray-400 mt-1">ເພີ່ມ, ແກ້ໄຂ, ຕັ້ງຄ່າຂໍ້ມູນບົດບາດ/ໜ້າທີ່</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="w-full sm:w-auto bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-bold px-5 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                    <i className="fa-solid fa-plus"></i> ເພີ່ມສິດທິໃຊ້ງານໃໝ່
                </button>
            </div>

            {/* Stats & Search Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-400">ບົດບາດ/ໜ້າທີ່ໃຊ້ງານທັງໝົດ</p>
                        <p className="text-xl font-bold text-[#0f2d37]">{roles.length} ບົດບາດ/ໜ້າທີ່</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex items-center px-4 gap-3">
                    <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
                    <input 
                        type="text" 
                        placeholder="ຄົ້ນຫາດ້ວຍຊື່ກົນລະຍຸດ, ຄູ່ເງິນ (Symbol) ຫຼື Timeframe..." 
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
                                <th className="p-4">ຊື່</th>
                                <th className="p-4">ລາຍລະອຽດ</th>
                                <th className="p-4 w-32 text-center">ຈັດການ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-600">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">
                                        <i className="fa-solid fa-spinner animate-spin mr-2"></i> ກຳລັງໂຫຼດຂໍ້ມູນ...
                                    </td>
                                </tr>
                            ) : filteredRoles.length > 0 ? (
                                filteredRoles.map((role, index) => (
                                    <tr key={role.id} className="hover:bg-gray-50/70 transition">
                                        <td className="p-4 text-center text-gray-400">{index + 1}</td>
                                        <td className="p-4 text-[#0f2d37] font-bold">{role.name}</td>
                                        <td className="p-4 font-mono">{role.description}</td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button 
                                                onClick={() => openEditModal(role)}
                                                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-teal-700 hover:text-white transition flex items-center justify-center shadow-xs"
                                                title="ແກ້ໄຂ"
                                            >
                                                <i className="fa-solid fa-pen text-[11px]"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(role.id)}
                                                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-600 text-red-600 hover:text-white transition flex items-center justify-center shadow-xs"
                                                title="ລຶບ"
                                            >
                                                <i className="fa-solid fa-trash text-[11px]"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">
                                        ❌ ບໍ່ພົບຂໍ້ມູນກົນລະຍຸດທີ່ທ່ານຄົ້ນຫາ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL POPUP FOR ADD/EDIT */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
                    
                    <form 
                        onSubmit={handleSave}
                        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4"
                    >
                        <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                            <h3 className="text-xl font-bold text-[#0f2d37]">
                                {editId ? '📝 ແກ້ໄຂກົນລະຍຸດ' : '✨ ເພີ່ມກົນລະຍຸດໃໝ່'}
                            </h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="space-y-3.5">
                            {/* 1. Name Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#0f2d37]">ຊື່ບົດບາດ <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    placeholder="ຕົວຢ່າງ: admin, user..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, nameInputRef)} 
                                    className="w-full bg-[#f4f6f8] border border-transparent focus:border-[#4f46e5] focus:bg-white text-sm font-normal px-4 py-2.5 rounded-xl focus:outline-none transition"
                                    autoFocus
                                />
                            </div>

                               <div className="space-y-1">
                                    <label className="text-sm font-bold text-[#0f2d37]">ລາຍລະອຽດເພີ່ມເຕີມ</label>
                                    <textarea 
                                    value={description}
                                    ref={descriptionInputRef} 
                                    onChange={e => setDescription(e.target.value)} 
                                    onKeyDown={(e) => handleKeyDown(e, descriptionInputRef)} 
                                    className="w-full bg-gray-50/50 border border-gray-200 p-3 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4f46e5] focus:bg-white transition" placeholder="ບອກສິ່ງອຳນວຍຄວາມສະດວກ ເຊິ່ງຈະຊ່ວຍໃຫ້ລູກຄ້າຕັດສິນໃຈງ່າຍຂຶ້ນ..." rows="2" />
                                </div> 
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-normal px-4 py-2.5 rounded-xl transition"
                            >
                                ຍົກເລີກ
                            </button>
                            <button 
                                type="submit"
                                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-normal px-5 py-2.5 rounded-xl transition shadow-sm"
                            >
                                {editId ? 'ອັບເດດຂໍ້ມູນ' : 'ບັນທຶກຂໍ້ມູນ'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CRUDRoles;