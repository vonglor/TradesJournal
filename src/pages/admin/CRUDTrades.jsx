import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { tradeService } from '../../services/tradeService';
import { formatCapital, formatPercent } from '../../utils/format';
import Swal from 'sweetalert2';

const CRUDStrades = () => {
    const [stats, setStats] = useState({
        total_win: 0,
        total_loss: 0,
        total_pending: 0,
        total_trades: 0,
        net_risk_reward: 0,
        profit_factor: 0
    });
    const [trades, setTrades] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfitFactorModalOpen, setIsProfitFactorModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editId, setEditId] = useState(null);

    // 📝 Form States (ບໍ່ມີ Status)
    const [pair, setPair] = useState('');
    const [action, setAction] = useState('');
    const [entry_price, setEntry_price] = useState('');
    const [exit_price, setExit_price] = useState('');
    const [risk_reward, setRisk_reward] = useState('');
    const [notes, setNotes] = useState('');

    // 📸 Image States
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    // Refs ສຳລັບ Enter Key Navigation (ປ່ຽນຈາກ statusInputRef ໄປຫາ notesInputRef ໂດຍຕົງ)
    const pairInputRef = useRef(null);
    const actionInputRef = useRef(null);
    const entry_priceInputRef = useRef(null);
    const exit_priceInputRef = useRef(null);
    const risk_rewardInputRef = useRef(null);
    const notesInputRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user_info'));
    const userId = user?.id || user?.user_id;

    // 🔄 Fetch Trades (ດຶງຂໍ້ມູນຄັ້ງດຽວ ຕັດບັນຫາ Infinite Loop)
    const fetchTrades = async () => {
        if (!userId) {
            console.warn("❌ No userId found in localStorage");
            return;
        }

        setIsLoading(true);
        try {
            const response = await tradeService.getAllById(userId);

            // 🟢 ອ້າງອີງຕາມໂຄງສ້າງ response.data ທີ່ໄດ້ຈາກ Laravel response()->json([...])
            const resData = response?.data;

            if (resData) {
                // 1. ອັບເດດສະຖິຕິ Win, Loss, Pending (ໃສ່ || 0 ປ້ອງກັນຄ່າເປັນ null/undefined)
                setStats({
                    total_win: resData.total_win || 0,
                    total_loss: resData.total_loss || 0,
                    total_pending: resData.total_pending || 0,
                    total_trades: resData.total_trades || 0,
                    net_risk_reward: resData.net_risk_reward || 0,
                    profit_factor: resData.profit_factor || 0
                });

                // 2. ເຊັກ ແລະ ເກັບຂໍ້ມູນລາຍການ Trades
                // ຖ້າ Laravel ສົ່ງມາໃນ response.data.data ໃຫ້ເອົາຄ່ານັ້ນ, ຖ້າສົ່ງມາເປັນ Array ໂດຍກົງໃຫ້ເອົາ resData
                if (Array.isArray(resData.data)) {
                    setTrades(resData.data);
                } else if (Array.isArray(resData)) {
                    setTrades(resData);
                } else {
                    setTrades([]); // ປ້ອງກັນ Error ຖ້າບໍ່ມີຂໍ້ມູນ
                }
            }
        } catch (error) {
            console.error("❌ Fetch error:", error.response || error);
            Toast.fire({ icon: 'error', title: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [userId]);

    // 🎯 ເຄຼຍ Memory URL ຮູບພາບເພື່ອປ້ອງກັນ Memory Leak
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // ➕ ເປີດ Modal ເພີ່ມຂໍ້ມູນ
    const openAddModal = () => {
        setEditId(null);
        setPair(''); setAction(''); setEntry_price('');
        setExit_price(''); setRisk_reward(''); setNotes('');
        setSelectedImage(null);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    // ✏️ ເປີດ Modal ແກ້ໄຂຂໍ້ມູນ
    const openEditModal = (trade) => {
        setEditId(trade.id);
        setPair(trade.pair || '');
        setAction(trade.action || '');
        setEntry_price(trade.entry_price || '');
        setExit_price(trade.exit_price || '');
        setRisk_reward(trade.risk_reward || '');
        setNotes(trade.notes || '');
        setImagePreview(trade.screenshot_url || trade.screenshot || null);
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    // 📸 Handle ການປ່ຽນແປງຮູບພາບ
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            Toast.fire({ icon: 'error', title: 'ຮູບພາບຕ້ອງບໍ່ເກີນ 2MB' });
            return;
        }
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // ❌ ເອົາຮູບ Preview ອອກ
    const removeCurrentImage = () => {
        setSelectedImage(null);
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
    };

    // 💾 ບັນທຶກຂໍ້ມູນ (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pair || !action || !entry_price) {
            Toast.fire({ icon: 'warning', title: 'ກະລຸນາປ້ອນ ສິນຊັບ, Action ແລະ ລາຄາເຂົ້າ' });
            return;
        }

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('pair', pair.toUpperCase());
        formData.append('action', action);
        formData.append('entry_price', entry_price);

        if (exit_price) formData.append('exit_price', exit_price);
        if (risk_reward) formData.append('risk_reward', risk_reward);
        if (notes) formData.append('notes', notes);
        if (selectedImage) formData.append('image', selectedImage);

        try {
            if (editId) {
                formData.append('_method', 'PUT'); // Method Spoofing ສຳລັບ Laravel Update
                await tradeService.update(editId, formData);
            } else {
                await tradeService.create(formData);
            }
            Toast.fire({ icon: 'success', title: editId ? 'ອັບເດດສຳເລັດ' : 'ເພີ່ມຂໍ້ມູນສຳເລັດ' });
            setIsModalOpen(false);
            fetchTrades();
        } catch (error) {
            console.error(error);
            Toast.fire({ icon: 'error', title: 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ' });
        }
    };

    // ❌ ລົບຂໍ້ມູນ
    const handleDelete = async (id) => {
        Swal.fire({
            title: 'ต้องการລົບຂໍ້ມູນນີ້ແທ້ບໍ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'ຢືນຢັນ',
            cancelButtonText: 'ຍົກເລີກ'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await tradeService.delete(id);
                    Toast.fire({ icon: 'success', title: 'ລົບຂໍ້ມູນສຳເລັດ' });
                    fetchTrades();
                } catch (error) {
                    Toast.fire({ icon: 'error', title: 'ລົບບໍ່ສຳເລັດ' });
                }
            }
        });
    };

    // ⚡ ອັບເດດສະຖານະດ່ວນຜ່ານປຸ່ມ WIN / LOSS ຢູ່ໜ້າຕາຕະລາງ
    // ⚡ ຟັງຊັນອັບເດດສະຖານະດ່ວນສຳລັບໄມ້ທີ່ Pending
    const handleUpdateStatus = async (tradeId, newStatus) => {
        Swal.fire({
            title: `ຢືນຢັນການປ່ຽນສະຖານະ?`,
            text: `ເຈົ້າຕ້ອງການປ່ຽນສະຖານະເປັນ ${newStatus === 'win' ? '🏆 ຊະນະ (WIN)' : '❌ ແພ້ (LOSS)'} ແທ້ບໍ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'win' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ຢືນຢັນ',
            cancelButtonText: 'ຍົກເລີກ'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // ຍິງ API ໄປອັບເດດສະຖານະ (ສົ່ງເປັນ FormData ຫຼື JSON ຕາມ API ຂອງເຈົ້າ)
                    // ປົກກະຕິສ່ວນຫຼາຍການ Update ສະຖານະດ່ວນ ຈະແນະນຳໃຫ້ສົ່ງເປັນ PATCH/PUT ຫຼື ສົ່ງຜ່ານ service ທີ່ເຈົ້າມີ
                    const formData = new FormData();
                    formData.append('status', newStatus);
                    formData.append('_method', 'PUT'); // ກັນພາດສຳລັບ Laravel FormData ທີ່ຕ້ອງການ Method Spoofing

                    await tradeService.updateStatus(tradeId, formData);

                    Toast.fire({ icon: 'success', title: 'ອັບເດດສະຖານະສຳເລັດແລ້ວ' });
                    fetchTrades(); // ໂຫຼດຂໍ້ມູນຕາຕະລາງໃໝ່
                } catch (error) {
                    console.error(error);
                    Toast.fire({ icon: 'error', title: 'ເກີດຂໍ້ຜິດພາດ ໃນການອັບເດດສະຖານະ' });
                }
            }
        });
    };

    const handleKeyDown = (e, nextRef) => {
        if (e.key === 'Enter' && nextRef?.current) {
            e.preventDefault();
            nextRef.current.focus();
        }
    };

    const handleNumberChange = (e, setValue) => {
        const value = e.target.value;
        const cleanedValue = value.replace(/[^0-9.]/g, '');
        const parts = cleanedValue.split('.');
        if (parts.length > 2) {
            return;
        }
        setValue(cleanedValue);
    };

    // Search Filter
    const filteredTrades = trades.filter(trade =>
        trade.pair?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-gray-800">🛠️ ບັນທຶກການເທຣດປະຈຳວັນ</h2>
                    <p className="text-xs text-gray-400 mt-1">ເພີ່ມ, ແກ້ໄຂ ຫຼື ລົບ ບັນທຶກການເທຣດ</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> ເພີ່ມການເທຣດ
                </button>
            </div>

            {/* Search */}
            <div className="max-w-md">
                <input
                    type="text"
                    placeholder="🔍 ຄົ້ນຫາ Asset Pair, Action ຫຼື Status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm focus:outline-none focus:border-[#0a7067]"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-sm py-1 font-bold text-emerald-700 uppercase tracking-wider"><i className="fa-solid fa-circle-check text-sm"></i> ຊະນະ: {stats.total_win} ໄມ້ </p>
                        <p className="text-sm py-1 font-bold text-rose-600 uppercase tracking-wider"><i className="fa-solid fa-circle-xmark text-sm"></i> ແພ້: {stats.total_loss} ໄມ້ </p>
                        <p className="text-sm py-1 font-bold text-amber-500 uppercase tracking-wider"><i className="fa-solid fa-hourglass-half text-sm"></i> ຍັງດຳເນີນຢູ່: {stats.total_pending} ໄມ້ </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">ອັດຕາຊະນະ</p>
                        <p className="text-xl font-black text-emerald-800 mt-1">{formatPercent((stats.total_win / stats.total_trades) * 100)}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><i className="fa-solid fa-arrow-up text-sm"></i></div>
                </div>
                {/* 📊 Card 1: Profit Factor */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Profit Factor</p>
                        {/* 🎨 ປ່ຽນສີຕົວເລກຕາມເກນປະສິດທິພາບ */}
                        <p className={`text-xl font-black mt-1 ${stats.profit_factor < 1.0 ? 'text-red-600' :
                                stats.profit_factor <= 1.5 ? 'text-amber-500' :
                                    stats.profit_factor <= 2.0 ? 'text-emerald-600' : 'text-indigo-600'
                            }`}>
                            {stats.profit_factor}
                        </p>
                    </div>

                    {/* 🔄 ປ່ຽນສີພື້ນຫຼັງ ແລະ ໄອຄອນ ຕາມເກນ Profit Factor */}
                    <Link onClick={() => setIsProfitFactorModalOpen(true)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.profit_factor < 1.0 ? 'bg-red-50 text-red-600' :
                            stats.profit_factor <= 1.5 ? 'bg-amber-50 text-amber-500' :
                                stats.profit_factor <= 2.0 ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                        <i className={`fa-solid ${stats.profit_factor < 1.0 ? 'fa-triangle-exclamation' : // ຂາດທຶນ/ອັນຕະລາຍ
                                stats.profit_factor <= 1.5 ? 'fa-scale-balanced' :       // ພໍຕົວ/ສະເໝີຕົວ
                                    stats.profit_factor <= 2.0 ? 'fa-arrow-up-right-dots' :  // ລະບົບທີ່ດີ
                                        'fa-crown'                                               // ດີເລີດ / Excellent
                            } text-sm`}></i>
                    </Link>
                </div>

                {/* 📊 Card 2: Net Risk Reward */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Net Risk Reward</p>
                        {/* 🟢 ຫຼາຍກວ່າ 0 ເປັນສີຂຽວ | 🔴 ໜ້ອຍກວ່າ 0 ເປັນສີແດງ */}
                        <p className={`text-xl font-black mt-1 ${stats.net_risk_reward >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {stats.net_risk_reward >= 0 ? `+${stats.net_risk_reward}` : stats.net_risk_reward}R
                        </p>
                    </div>

                    {/* 🔄 ປ່ຽນສີພື້ນຫຼັງ ແລະ ໄອຄອນ (ລູກສອນຂຶ້ນ-ລົງ) ຕາມຄ່າ Net R */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.net_risk_reward >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                        <i className={`fa-solid ${stats.net_risk_reward >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-sm`}></i>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-sm font-black uppercase tracking-wider border-b">
                                <th className="p-4 w-16 text-center">ລຳດັບ</th>
                                <th className="p-4">ສິນຊັບ</th>
                                <th className="p-4 text-center">ACTION</th>
                                <th className="p-4 text-right">ລາຄາເຂົ້າ</th>
                                <th className="p-4 text-right">ລາຄາອອກ</th>
                                <th className="p-4 text-center">ຜົນຕອບແທນ</th>
                                <th className="p-4 text-center">ຮູບພາບ</th>
                                <th className="p-4 text-center">ສະຖານະ</th>
                                <th className="p-4 text-center">ຈັດການ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-xs font-bold text-gray-600">
                            {isLoading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-400 animate-pulse">ກຳລັງໂຫຼດ...</td></tr>
                            ) : filteredTrades.length > 0 ? (
                                filteredTrades.map((trade, index) => (
                                    <tr key={trade.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-center text-gray-400 font-mono">{index + 1}</td>
                                        <td className="p-4 font-black text-gray-800">{trade.pair?.toUpperCase()}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded text-xs ${trade.action === 'BUY' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                • {trade.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono">{Number(trade.entry_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-right font-mono">{Number(trade.exit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-center font-mono">{Number(trade.risk_reward).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>

                                        {/* ຮູບພາບ Screenshot */}
                                        <td className="p-4 text-center">
                                            {trade.screenshot_url ? (
                                                <div className="flex justify-center">
                                                    <img
                                                        src={trade.screenshot_url.replace('http://127.0.0.1:8000', 'http://localhost:8000')}
                                                        alt="Screenshot"
                                                        className="w-12 h-8 object-cover rounded border border-gray-200 cursor-pointer hover:scale-110 transition duration-200"
                                                        onError={(e) => {
                                                            e.target.src = `http://localhost:8000/storage/${trade.screenshot_url.split('/storage/')[1]}`;
                                                        }}
                                                        onClick={() => {
                                                            Swal.fire({
                                                                imageUrl: trade.screenshot_url.replace('http://127.0.0.1:8000', 'http://localhost:8000'),
                                                                imageAlt: 'Trading View Screenshot',
                                                                showCloseButton: true,
                                                                showConfirmButton: false,
                                                                width: '80%'
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-[10px]">No Image</span>
                                            )}
                                        </td>

                                        {/* ສະຖານະ & ປຸ່ມກົດ WIN / LOSS */}
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center justify-center gap-1.5">
                                                {trade.status?.toLowerCase() === 'pending' ? (
                                                    <>
                                                        {trade.id && (
                                                            <div className="flex gap-1 mt-1 animate-fade-in">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(trade.id, 'win')}
                                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1.5 rounded shadow-sm transition flex items-center gap-0.5"
                                                                >
                                                                    WIN
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(trade.id, 'loss')}
                                                                    className="bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded shadow-sm transition flex items-center gap-0.5"
                                                                >
                                                                    LOSS
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded text-sm font-bold ${trade.status?.toLowerCase() === 'win' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                        {trade.status?.toLowerCase() === 'win' ? 'ຊະນະ' : 'ແພ້'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* ຈັດການ ແກ້ໄຂ / ລົບ */}
                                        <td className="p-4 text-center flex justify-center gap-3">
                                            <button onClick={() => openEditModal(trade)} className="text-blue-600 hover:text-blue-700">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button onClick={() => handleDelete(trade.id)} className="text-rose-600 hover:text-rose-700">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-400">ຍັງບໍ່ມີຂໍ້ມູນ</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 📜 MODAL FORM (ບໍ່ມີ Status) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3 mb-5">
                            <h3 className="text-lg font-black text-gray-800">
                                {editId ? '✏️ ແກ້ໄຂຂໍ້ມູນການເທຣດ' : '➕ ເພີ່ມລາຍການເທຣດໃໝ່'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* 1. Pair + Action */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 mb-1">ສິນຊັບ *</label>
                                    <input
                                        ref={pairInputRef}
                                        type="text"
                                        value={pair}
                                        required
                                        onChange={(e) => setPair(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, actionInputRef)}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:border-[#0a7067] focus:bg-white transition text-sm font-bold"
                                        placeholder="Symbol"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 mb-1">Action : BUY/SELL *</label>
                                    <select
                                        ref={actionInputRef}
                                        value={action}
                                        required
                                        onChange={(e) => setAction(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, entry_priceInputRef)}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:border-[#0a7067] focus:bg-white transition text-sm font-bold"
                                    >
                                        <option value="">-- ເລືອກ Action --</option>
                                        <option value="BUY">🟢 Buy Order</option>
                                        <option value="SELL">🔴 Sell Order</option>
                                    </select>
                                </div>
                            </div>

                            {/* 2. Prices */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 mb-1">ລາຄາເຂົ້າ *</label>
                                    <input
                                        ref={entry_priceInputRef}
                                        type="text"
                                        required
                                        value={entry_price}
                                        onChange={(e) => handleNumberChange(e, setEntry_price)}
                                        onKeyDown={(e) => handleKeyDown(e, exit_priceInputRef)}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-mono focus:border-[#0a7067] focus:bg-white transition text-sm font-bold"
                                        placeholder="0.00000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 mb-1">ລາຄາອອກ</label>
                                    <input
                                        ref={exit_priceInputRef}
                                        type="text"
                                        value={exit_price}
                                        onChange={(e) => handleNumberChange(e, setExit_price)}
                                        onKeyDown={(e) => handleKeyDown(e, risk_rewardInputRef)}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-mono focus:border-[#0a7067] focus:bg-white transition text-sm font-bold"
                                        placeholder="0.00000"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 mb-1">P&L / R:R Ratio</label>
                                    <input
                                        ref={risk_rewardInputRef}
                                        type="text"
                                        value={risk_reward}
                                        // onChange={(e) => setRisk_reward(e.target.value)}
                                        onChange={(e) => handleNumberChange(e, setRisk_reward)}
                                        onKeyDown={(e) => handleKeyDown(e, notesInputRef)}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-mono focus:border-[#0a7067] focus:bg-white transition text-sm font-bold"
                                        placeholder="1.5, 2..."
                                    />
                                </div>
                            </div>

                            {/* 4. Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 mb-1">ອັບໂລດຮູບບັນທຶກການເຂົ້າ</label>
                                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition bg-gray-50">
                                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-400 mb-1"></i>
                                    <p className="text-xs text-gray-500 font-bold">ອັບໂລດຮູບບັນທຶກການເຂົ້າ</p>
                                    <p className="text-[10px] text-gray-400">ຮອງຮັບໄຟລ໌ຮູບພາບບໍ່ເກີນ 2MB</p>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>

                                {imagePreview && (
                                    <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex flex-col items-center">
                                        <img src={imagePreview} alt="preview" className="max-h-40 object-contain rounded-lg shadow-2xs" />
                                        <button
                                            type="button"
                                            onClick={removeCurrentImage}
                                            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow transition font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 5. Notes */}
                            <div>
                                <label className="block text-xs font-black text-gray-500 mb-1">ເຫດຜົນການເຂົ້າ</label>
                                <textarea
                                    ref={notesInputRef}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:border-[#0a7067] focus:bg-white transition text-sm font-bold"
                                    rows="2"
                                    placeholder="ປ້ອນບັນທຶກ..."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition text-sm"
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
                </div>
            )}

            {isProfitFactorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop ພື້ນຫຼັງເບຼີຫຼູຫຼາ */}
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsProfitFactorModalOpen(false)}></div>

                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5 animate-in zoom-in-95 duration-200">

                        {/* ══════════════════════════════════════════════════════════════
                1. MODAL HEADER
               ══════════════════════════════════════════════════════════════ */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <i className="fa-solid fa-chart-line text-sm"></i>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#0f2d37]">ການແປຜົນຄ່າ Profit Factor</h3>
                                    <p className="text-[12px] text-gray-500 font-medium">ເກນວັດແທກປະສິດທິພາບຂອງລະບົບເທຣດ</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsProfitFactorModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-xl transition"
                            >
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                        </div>

                        {/* ══════════════════════════════════════════════════════════════
                2. MODAL CONTENT (LIST CARDS)
               ══════════════════════════════════════════════════════════════ */}
                        <div className="space-y-3">

                            {/* 🔴 ລະດັບ 1: ຕ່ຳກວ່າ 1.0 */}
                            <div className="flex gap-3.5 p-3.5 bg-red-50/40 border border-red-100/70 rounded-2xl">
                                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-triangle-exclamation text-xs"></i>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-red-700 font-mono">ລາຍຮັບຕ່ຳກວ່າ 1.0</p>
                                    <p className="text-sm font-bold text-gray-800">ລະບົບຂາດທຶນ</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">ມີຄວາມສ່ຽງສູງທີ່ຈະເຮັດໃຫ້ລ້າງພອດໃນໄລຍະຍາວ ຄວນປັບປຸງກົນລະຍຸດ.</p>
                                </div>
                            </div>

                            {/* 🟡 ລະດັບ 2: 1.0 - 1.5 */}
                            <div className="flex gap-3.5 p-3.5 bg-amber-50/40 border border-amber-100/70 rounded-2xl">
                                <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-scale-balanced text-xs"></i>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-amber-600 font-mono">1.0 - 1.5</p>
                                    <p className="text-sm font-bold text-gray-800">ພໍມີກຳໄລ ແຕ່ຍັງມີຄວາມສ່ຽງ</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">ຢູ່ໃນເກນສະເໝີຕົວ (Breakeven / Slightly Profitable) ຍັງມີຄວາມຜັນຜວນຢູ່.</p>
                                </div>
                            </div>

                            {/* 🟢 ລະດັບ 3: 1.5 - 2.0 */}
                            <div className="flex gap-3.5 p-3.5 bg-emerald-50/40 border border-emerald-100/70 rounded-2xl">
                                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-arrow-up-right-dots text-xs"></i>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-emerald-600 font-mono">1.5 - 2.0</p>
                                    <p className="text-sm font-bold text-gray-800">ລະບົບທີ່ດີ ແລະ ເຮັດກຳໄລສະໝໍ່າສະເໝີ</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">ເກນມາດຕະຖານຂອງລະບົບເທຣດທີ່ມີປະສິດທິພາບ (Good & Healthy).</p>
                                </div>
                            </div>

                            {/* 🟣 ລະດັບ 4: ຫຼາຍກວ່າ 2.0 */}
                            <div className="flex gap-3.5 p-3.5 bg-indigo-50/40 border border-indigo-100/70 rounded-2xl">
                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-crown text-xs"></i>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-indigo-600 font-mono">ຫຼາຍກວ່າ 2.0</p>
                                    <p className="text-sm font-bold text-gray-800">ລະບົບທີ່ດີເລີດ</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">ລະບົບມີຄວາມໄດ້ປຽບສູງຫຼາຍ (Excellent) ສາມາດສ້າງກຳໄລໄດ້ຢ່າງໂດດເດັ່ນ.</p>
                                </div>
                            </div>

                        </div>

                        {/* ══════════════════════════════════════════════════════════════
                3. MODAL FOOTER
               ══════════════════════════════════════════════════════════════ */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setIsProfitFactorModalOpen(false)}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition duration-150 text-sm"
                            >
                                ຮັບຊາບ ແລະ ປິດໜ້າຕ່າງ
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default CRUDStrades;