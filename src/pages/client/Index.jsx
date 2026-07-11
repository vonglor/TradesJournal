import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 🟢 1. ເພີ່ມ Import Link ເຂົ້າມາ

const Index = () => {
    // 🟢 States ສໍາລັບຄວບຄຸມ UI ໃຫ້ຄືໜ້າ Home
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentLang, setCurrentLang] = useState('LA');
    const user = null; // ປ່ຽນເປັນ { name: 'Somchit', role: 'renter' } ເພື່ອທົດສອບໄດ້

    // ຂໍ້ມູນຈໍາລອງ (Mockup Data) ສໍາລັບສະແດງອາພາດເມັນຍອດນິຍົມ
    const featuredApartments = [
        {
            id: 1,
            name: "vonglor ສຸຍທ໌ ອາພາດເມັນ",
            location: "ບ້ານສີຫອມ, ເມືອງຈັນທະບູລີ, นครหลวงเวียงจันทน์",
            price: "1,500,000 ກີບ / ເດືອນ",
            rooms: "🟢 ຍັງມີຫ້ອງວ່າງ",
            image: "🏢"
        },
        {
            id: 2,
            name: "ພັດທະນາ ວິວ ເຮົາສ໌",
            location: "ບ້ານທົ່ງກາງ, ເມືອງສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ",
            price: "2,000,000 ກີບ / ເດືອນ",
            rooms: "🟢 ຍັງມີຫ້ອງວ່າງ",
            image: "🏡"
        },
        {
            id: 3,
            name: "ໄອຄອນນິກ ເຣສຊິເດນຊ໌",
            location: "ບ້ານໂພນທັນ, ເມືອງໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ",
            price: "2,500,000 ກີບ / ເດືອນ",
            rooms: "❌ ຫ້ອງເຕັມແລ້ວ",
            image: "🏙️"
        }
    ];

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        // 🟢 4. ໃຊ້ Fragment (<> ... </>) ຫໍ່ຫຸ້ມ sections ທັງໝົດໄວ້ຕາມຫຼັກ JSX
        <>
            {/* ══════════════════════════════════════════════════════════════
                2. HERO SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-28 text-center relative overflow-hidden">
                <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                    <span className="inline-block bg-[#e6f4ea] dark:bg-[#0a7067]/20 text-[#0a7067] dark:text-[#2dd4bf] px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
                        ⚡ ລະບົບຈອງອາພາດເມັນ Real-time ຄົບວົງຈອນ
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0f2d37] dark:text-white leading-tight">
                        ຊອກຫາ ແລະ ຈອງຫ້ອງພັກ <br />
                        <span className="text-[#0a7067] dark:text-[#2dd4bf]">ໄດ້ງ່າຍໆ ພາຍໃນ 1 ນາທີ</span>
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto px-2 leading-relaxed">
                        ໝົດບັນຫາການຍາດຫ້ອງພັກ! ລະບົບລັອກຫ້ອງອັດຕະໂນມັດ 15 ນາທີ ພ້ອມອັບເດດສະຖານະແບບ Real-time ສົ່ງກົງຫາເຈົ້າຂອງຫໍພັກທັນທີ ໂດຍບໍ່ຕ້ອງກົດ Refresh.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 px-4 sm:px-0">
                        <Link to="/home" className="bg-[#0a7067] hover:bg-[#085a53] text-white font-black px-7 py-4 rounded-2xl text-sm sm:text-base transition shadow-md shadow-[#0a7067]/20 text-center">
                            ເລີ່ມຕົ້ນໃຊ້ງານ (ເບິ່ງຜັງຫ້ອງ)
                        </Link>
                        <a href="#features" className={`border font-bold px-7 py-4 rounded-2xl text-sm sm:text-base transition text-center ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            ເບິ່ງຟີເຈີລະບົບ
                        </a>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                3. FEATURES SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section id="features" className={`border-y transition-colors py-16 ${isDarkMode ? 'bg-[#1e293b]/40 border-slate-800' : 'bg-white border-gray-100'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-black text-[#0f2d37] dark:text-white">ເປັນຫຍັງຕ້ອງເລືອກລະບົບພວກເຮົາ?</h2>
                        <p className="text-xs text-gray-400 mt-1.5">ລະບົບທີ່ຄິດຄົ້ນມາເພື່ອຕອບໂຈດທັງຜູ້ເຊົ່າ ແລະ ເຈົ້າຂອງຫໍພັກ</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        <div className={`p-8 rounded-3xl border transition duration-200 space-y-4 ${isDarkMode ? 'bg-[#1e293b]/80 border-slate-700/50' : 'bg-[#f4f7f6]/60 border-gray-100/70'}`}>
                            <div className="w-12 h-12 rounded-2xl bg-[#0a7067] text-white flex items-center justify-center text-xl shadow-md shadow-[#0a7067]/10">
                                <i className="fa-solid fa-clock-rotate-left"></i>
                            </div>
                            <h3 className="text-lg font-black text-[#0f2d37] dark:text-white">ລັອກຫ້ອງ 15 ນາທີ</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                                ເມື່ອທ່ານກົດຈອງ, ລະບົບຈະທຳການລັອກຫ້ອງໃຫ້ທ່ານເປັນເວລາ 15 ນາທີທັນທີ ເພື່ອໃຫ້ທ່ານມີເວລາອັບໂຫຼດສະລິບການໂອນເງິນຢ່າງສະບາຍໃຈ.
                            </p>
                        </div>
                        <div className={`p-8 rounded-3xl border transition duration-200 space-y-4 ${isDarkMode ? 'bg-[#1e293b]/80 border-slate-700/50' : 'bg-[#f4f7f6]/60 border-gray-100/70'}`}>
                            <div className="w-12 h-12 rounded-2xl bg-[#0a7067] text-white flex items-center justify-center text-xl shadow-md shadow-[#0a7067]/10">
                                <i className="fa-solid fa-bolt"></i>
                            </div>
                            <h3 className="text-lg font-black text-[#0f2d37] dark:text-white">ອັບເດດຜັງ Real-time</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                                ໃຊ້ເທັກໂນໂລຢີ WebSockets / Firebase ເຮັດໃຫ້ແຜນຜັງສະຖານةຫ້ອງອັບເດດທັນທີເມື່ອມີຄົນຈອງ ໂດຍບໍ່ຕ້ອງກົດ Refresh ໃຫ້ເສຍເວລາ.
                            </p>
                        </div>
                        <div className={`p-8 rounded-3xl border transition duration-200 space-y-4 sm:col-span-2 md:col-span-1 ${isDarkMode ? 'bg-[#1e293b]/80 border-slate-700/50' : 'bg-[#f4f7f6]/60 border-gray-100/70'}`}>
                            <div className="w-12 h-12 rounded-2xl bg-[#0a7067] text-white flex items-center justify-center text-xl shadow-md shadow-[#0a7067]/10">
                                <i className="fa-solid fa-sliders"></i>
                            </div>
                            <h3 className="text-lg font-black text-[#0f2d37] dark:text-white">ຈັດການງ່າຍຄົບວົງຈອນ</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                                ມີລະບົບ Admin Panel ສາມາດຈັດການຂໍ້ມູນຫ້ອງພັກ, ຂໍ້ມູນອາພາດເມັນ, ກວດເຊັກລາຍຮັບ ແລະ ໃບຈອງໄດ້ຢ່າງງ່າຍດາຍໃນບ່ອນດຽວ.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                4. FEATURED APARTMENTS SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section id="apartments" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-black text-[#0f2d37] dark:text-white">ອາພາດເມັນຍອດນິຍົມ</h2>
                    <p className="text-xs text-gray-400 mt-1.5">ເລືອກອາພາດເມັນທີ່ທ່ານສົນໃຈເພື່ອເຂົ້າໄປເບິ່ງຜັງຫ້ອງວ່າງຕົວຈິງ</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {featuredApartments.map((apt) => (
                        <div key={apt.id} className={`border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'}`}>
                            <div className="h-44 sm:h-52 bg-gradient-to-br from-[#e6f4ea] to-[#bbf7d0] dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-5xl select-none">
                                {apt.image}
                            </div>
                            <div className="p-6 space-y-4">
                                <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase ${apt.rooms.includes('ວ່າງ') ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 text-gray-400'}`}>
                                    {apt.rooms}
                                </span>
                                <div className="space-y-1.5">
                                    <h3 className="font-black text-base text-[#0f2d37] dark:text-white">{apt.name}</h3>
                                    <p className="text-xs text-gray-400 dark:text-slate-400 flex items-center gap-1.5 truncate">
                                        <i className="fa-solid fa-location-dot text-[#0a7067]"></i> {apt.location}
                                    </p>
                                </div>
                                <div className="border-t border-gray-50 dark:border-slate-700/50 pt-4 flex justify-between items-center">
                                    <span className="text-sm font-black text-[#0a7067] dark:text-[#2dd4bf]">{apt.price}</span>
                                    <Link to={`/home?apartment_id=${apt.id}`} className="text-xs font-bold bg-[#0a7067]/10 dark:bg-[#2dd4bf]/10 text-[#0a7067] dark:text-[#2dd4bf] px-3 py-1.5 rounded-xl hover:bg-[#0a7067] hover:text-white dark:hover:bg-[#2dd4bf] dark:hover:text-slate-900 transition duration-200">
                                        ເບິ່ງຜັງຫ້ອງວ່າງ →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Index;