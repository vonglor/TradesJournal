import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { strategyService } from '../../services/strategyService'; // 💡 ທ່ານສາມາດປ່ຽນຊື່ service ໃຫ້ກົງກັບຫຼັງບ້ານໄດ້ໃນພາຍຫຼັງ
import Swal from 'sweetalert2';

const CRUDStrategies = () => {
    const [strategies, setStrategies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Refs ສຳລັບການຍ້າຍ Focus ເວລາກົດ Enter
    const symbolInputRef = useRef(null);
    const rrInputRef = useRef(null);
    const tfInputRef = useRef(null);
    const descriptionRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editId, setEditId] = useState(null); 
    
    // 📝 ປະກາດ State ໃໝ່ໃຫ້ກົງກັບຟິວຂອງກົນລະຍຸດການເທີດ
    const [name, setStrategyName] = useState('');
    const [symbol, setStrategySymbol] = useState('');
    const [rr_ratio, setStrategyRR] = useState('');
    const [timeframe, setStrategyTimeframe] = useState('');
    const [description, setStrategyDescription] = useState('');

    // ດຶງຂໍ້ມູນ User ທີ່ Login ເພື່ອເອົາ user_id
    const user = JSON.parse(localStorage.getItem('user_info'));
    const userId = user?.id || user?.user_id; // ປ້ອງກັນໄວ້ ຖ້າບໍ່ມີໃຫ້ເປັນ 1 ກ່ອນ

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

    const fetchStrategies = async () => {
        setIsLoading(true);
        try {
            const response = await strategyService.getAll();
            
            // 💡 ເພີ່ມການ Console.log ເພື່ອເບິ່ງໂຄງສ້າງທີ່ແທ້ຈິງໃນ DevTools
            console.log("ຜົນຮັບຈາກ API:", response); 

            // 🛠️ ປັບປ່ຽນການເຊັກເງື່ອນໄຂໃຫ້ຮອງຮັບ response.data.data
            if (response && response.data && Array.isArray(response.data.data)) {
                // ຖ້າ Laravel ສົ່ງມາເປັນ { data: [...] } ແລະ Axios ຫໍ່ໄວ້ອີກຊັ້ນ
                setStrategies(response.data.data);
            } else if (response && Array.isArray(response.data)) {
                // ຖ້າ Axios ຫໍ່ໄວ້ ແຕ່ Laravel ສົ່ງມາເປັນອາເຣຊື່ໆ [...]
                setStrategies(response.data);
            } else if (Array.isArray(response)) {
                // ຖ້າ Service ດຶງ response.data ອອກມາໃຫ້ແລ້ວ
                setStrategies(response);
            } else {
                setStrategies([]);
            }
        } catch (error) {
            console.error('Error fetching strategies:', error);
            Toast.fire({ icon: 'error', title: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນກົນລະຍຸດໄດ້' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStrategies();
    }, []);

    const openAddModal = () => {
        setEditId(null);
        setStrategyName('');
        setStrategySymbol('');
        setStrategyRR('');
        setStrategyTimeframe('');
        setStrategyDescription(''),
        setIsModalOpen(true);
    };

    const openEditModal = (strategy) => {
        setEditId(strategy.id);
        setStrategyName(strategy.name || '');
        setStrategySymbol(strategy.symbol || '');
        setStrategyRR(strategy.rr_ratio || '');
        setStrategyTimeframe(strategy.timeframe || '');
        setStrategyDescription(strategy.description || '');
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
        if (!name || !symbol || !rr_ratio || !timeframe) {
            Toast.fire({ icon: 'warning', title: 'ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບຖ້ວນທຸກຟິວ' });
            return;
        }
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('name', name);
        formData.append('rr_ratio', rr_ratio);
        formData.append('symbol', symbol);
        formData.append('timeframe', timeframe);
        formData.append('description', description);
        // 2. ກຽມ Payload ຕາມທີ່ຕ້ອງການ

        try {
            if (editId) {
                await strategyService.update(editId, formData);
                Toast.fire({ icon: 'success', title: 'ອັບເດດຂໍ້ມູນກົນລະຍຸດສຳເລັດແລ້ວ', background: '#fff', iconColor: '#0a7067' });
            } else {
                await strategyService.create(formData);
                Toast.fire({ icon: 'success', title: 'ເພີ່ມກົນລະຍຸດໃໝ່ສຳເລັດແລ້ວ', background: '#ffffff', iconColor: '#0a7067' });
            }
            
            setIsModalOpen(false);
            fetchStrategies(); 
        } catch (error) {
            console.error('Error saving strategy:', error);
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
                    await strategyService.delete(id);
                    Toast.fire({ icon: 'success', title: 'ລຶບຂໍ້ມູນກົນລະຍຸດຮຽບຮ້ອຍແລ້ວ', background: '#fff', iconColor: '#0a7067' });
                    fetchStrategies(); 
                } catch (error) {
                    console.error('Error deleting strategy:', error);
                    Swal.fire({ icon: 'error', title: 'ຂໍ້ຜິດພາດ', text: 'ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້', confirmButtonColor: '#0a7067' });
                }
            }
        });
    };

    // ຄົ້ນຫາຂໍ້ມູນຈາກ ຊື່, ຄູ່ເງິນ ຫຼື Timeframe
    const filteredStrategies = strategies.filter(s => 
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (s.symbol && s.symbol.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.timeframe && s.timeframe.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0f2d37]">ຈັດການຂໍ້ມູນກົນລະຍຸດ (Strategies)</h2>
                    <p className="text-xs text-gray-400 mt-1">ເພີ່ມ, ແກ້ໄຂ, ຕັ້ງຄ່າຂໍ້ມູນກົນລະຍຸດການເທີດຂອງທ່ານ</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="w-full sm:w-auto bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-bold px-5 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                    <i className="fa-solid fa-plus"></i> ເພີ່ມກົນລະຍຸດໃໝ່
                </button>
            </div>

            {/* Stats & Search Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-400">ກົນລະຍຸດທັງໝົດ</p>
                        <p className="text-xl font-bold text-[#0f2d37]">{strategies.length} ກົນລະຍຸດ</p>
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
                                <th className="p-4">ຊື່ກົນລະຍຸດ</th>
                                <th className="p-4">ຄູ່ເງິນ (ສິນຊັບ)</th>
                                <th className="p-4 text-center">R:R Ratio</th>
                                <th className="p-4 text-center">Timeframe</th>
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
                            ) : filteredStrategies.length > 0 ? (
                                filteredStrategies.map((strategy, index) => (
                                    <tr key={strategy.id} className="hover:bg-gray-50/70 transition">
                                        <td className="p-4 text-center text-gray-400">{index + 1}</td>
                                        <td className="p-4 text-[#0f2d37] font-bold">{strategy.name}</td>
                                        <td className="p-4">
                                            <span className="bg-indigo-50 text-[#4f46e5] px-2.5 py-1 rounded-md font-mono uppercase">
                                                {strategy.symbol}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-mono text-emerald-600">1 : {strategy.rr_ratio}</td>
                                        <td className="p-4 text-center">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm font-mono text-xs">
                                                {strategy.timeframe}
                                            </span>
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                             {/* <Link to={`/dashboard/strategy_details/${strategy.id}`}
                                                className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <i className="fa-solid fa-play"></i>Forward testing
                                            </Link> */}
                                             <Link to={`/dashboard/strategy_details/${strategy.id}`}
                                                className="w-full sm:w-auto bg-[#0a7067] hover:bg-[#085a53] text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <i className="fa-solid fa-play"></i>Backtesting
                                            </Link>
                                            <button 
                                                onClick={() => openEditModal(strategy)}
                                                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-teal-700 hover:text-white transition flex items-center justify-center shadow-xs"
                                                title="ແກ້ໄຂ"
                                            >
                                                <i className="fa-solid fa-pen text-[11px]"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(strategy.id)}
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
                                <label className="text-sm font-bold text-[#0f2d37]">ຊື່ກົນລະຍຸດ <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    placeholder="ຕົວຢ່າງ: Breakout, ICT, SMC..."
                                    value={name}
                                    onChange={(e) => setStrategyName(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, symbolInputRef)} 
                                    className="w-full bg-[#f4f6f8] border border-transparent focus:border-[#4f46e5] focus:bg-white text-sm font-normal px-4 py-2.5 rounded-xl focus:outline-none transition"
                                    autoFocus
                                />
                            </div>

                            {/* 2. Symbol Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#0f2d37]">ຄູ່ເງິນ / ສິນຊັບ <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    ref={symbolInputRef}
                                    placeholder="ຕົວຢ່າງ: EURUSD, XAUUSD, BTCUSD..."
                                    value={symbol}
                                    onChange={(e) => setStrategySymbol(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, rrInputRef)} 
                                    className="w-full bg-[#f4f6f8] border border-transparent focus:border-[#4f46e5] focus:bg-white text-sm font-normal px-4 py-2.5 rounded-xl focus:outline-none transition font-mono uppercase"
                                />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-bold text-[#0f2d37]">R:R Ratio <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        ref={rrInputRef}
                                        placeholder="ຕົວຢ່າງ: 2, 3.5"
                                        value={rr_ratio}
                                        onChange={handleRRChange} // 👈 ປ່ຽນມາໃຊ້ຟັງຊັນນີ້
                                        inputMode="decimal"       // 👈 ບັງຄັບໃຫ້ມືຖືຂຶ້ນຄີບອດຕົວເລກ
                                        onKeyDown={(e) => handleKeyDown(e, tfInputRef)} 
                                        className="w-full bg-[#f4f6f8] border border-transparent focus:border-[#4f46e5] focus:bg-white text-sm font-normal px-4 py-2.5 rounded-xl focus:outline-none transition font-mono"
                                    />
                            </div>


                                {/* 4. Timeframe Input */}
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-[#0f2d37]">Timeframe <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        ref={tfInputRef}
                                        placeholder="ຕົວຢ່າງ: 15m, 1H, 4H..."
                                        value={timeframe}
                                        onChange={(e) => setStrategyTimeframe(e.target.value)}
                                        className="w-full bg-[#f4f6f8] border border-transparent focus:border-[#4f46e5] focus:bg-white text-sm font-normal px-4 py-2.5 rounded-xl focus:outline-none transition font-mono"
                                    />
                                </div>

                               <div className="space-y-1">
                                    <label className="text-sm font-bold text-[#0f2d37]">ລາຍລະອຽດເພີ່ມເຕີມ</label>
                                    <textarea 
                                    value={description}
                                    ref={descriptionRef} 
                                    onChange={e => setStrategyDescription(e.target.value)} 
                                    onKeyDown={(e) => handleKeyDown(e, descriptionRef)} 
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

export default CRUDStrategies;