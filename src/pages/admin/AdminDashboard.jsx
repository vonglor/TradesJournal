import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ setActiveTab }) => {
    const stats = [
        { id: 1, title: 'ອາພາດເມັນທັງໝົດ', value: '2 ແຫ່ງ', icon: 'fa-hotel', bg: 'bg-indigo-50 text-[#4f46e5]' },
        { id: 2, title: 'ห້ອງພັກທັງໝົດ', value: '32 ຫ້ອງ', icon: 'fa-door-open', bg: 'bg-blue-50 text-blue-600' },
        { id: 3, title: 'ຫ້ອງວ່າງຂະນະນີ້', value: '12 ຫ້ອງ', icon: 'fa-circle-check', bg: 'bg-emerald-50 text-emerald-600' },
        { id: 4, title: 'ລໍຖ້າຍືນຢັນການໂອນ', value: '3 ລາຍການ', icon: 'fa-clock', bg: 'bg-amber-50 text-amber-600' },
    ];

    const recentBookings = [
        { id: 'BK-9021', name: 'ສົມຊາຍ ພອນປະເສີດ', room: 'ຫ້ອງ 202', date: 'ມື້ນີ້, 14:30', amount: '1,300,000 LAK', status: 'pending', statusText: 'ລໍຖ້າກວດສະລິບ' },
        { id: 'BK-8944', name: 'ຈັນທະວີ ສີສຸວັນ', room: 'ຫ້ອງ 104', date: 'ມື້ນີ້, 11:15', amount: '1,500,000 LAK', status: 'success', statusText: 'ຈອງສຳເລັດ' },
        { id: 'BK-8812', name: 'ມານີວອນ ແກ້ວມະນີ', room: 'ຫ້ອງ 301', date: 'ມື້ວານ, 18:20', amount: '1,200,000 LAK', status: 'success', statusText: 'ຈອງສຳເລັດ' }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-black text-[#0f2d37] tracking-tight">ພາບລວມລະບົບ</h1>
                <p className="text-xs text-gray-400 mt-0.5">ລາຍງານສະຖິຕິ ແລະ ຂໍ້ມູນການຈອງຫ້ອງພັກທັງໝົດ</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((st) => (
                    <div key={st.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${st.bg} text-sm`}>
                            <i className={`fa-solid ${st.icon}`}></i>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 leading-tight">{st.title}</p>
                            <p className="text-base font-black text-gray-800 mt-0.5">{st.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-64 flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                        <p className="text-xs font-black text-gray-700">📊 ສະຖິຕິລາຍຮັບເດືອນນີ້</p>
                        <span className="text-[10px] bg-indigo-50 text-[#4f46e5] px-2 py-0.5 rounded-full font-bold">ອັບເດດ Real-time</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-gray-300 text-xs font-medium">
                        [ 📈 ບ່ອນວາງກຣາຟລາຍຮັບ ]
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-64">
                    <div>
                        <div className="border-b border-gray-50 pb-3">
                            <p className="text-xs font-black text-gray-700">🔔 ການຈອງຫຼ້າສຸດ</p>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-40 overflow-y-auto pr-1">
                            {recentBookings.map((bk) => (
                                <div key={bk.id} className="py-3 flex justify-between items-center text-xs">
                                    <div className="space-y-0.5">
                                        <p className="font-black text-gray-800">{bk.name}</p>
                                        <p className="text-[10px] text-gray-400">{bk.room} • {bk.date}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-bold text-[#0f2d37]">{bk.amount}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${bk.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>\n                                            {bk.statusText}\n                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => alert('ກຳລັງພາໄປໜ້າລາຍງານທັງໝົດ...')}
                        className="w-full text-center text-xs font-bold text-[#4f46e5] hover:underline pt-4 border-t border-gray-50 block"
                    >
                        ເບິ່ງປະຫວັດການຈອງທັງໝົດ →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;