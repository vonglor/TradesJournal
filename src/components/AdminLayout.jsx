import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../assets/favicon/favicon.svg';
import echo from '../utils/echo'; 
import axios from 'axios'; // 💡 1. Import axios ເຂົ້າມາຈັດການ API (ຫຼື import instance ຂອງເຈົ້າ)

const AdminLayout = () => {
    const navigate = useNavigate(); 
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    
    // 💡 2. ຕັ້ງຄ່າເລີ່ມຕົ້ນເປັນ Array ຫວ່າງປຼົ່າ ເພື່ອລໍຖ້າໂຫຼດຈາກ Database
    const [notifications, setNotifications] = useState([]);
    
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user_info'));

    const profileRef = useRef(null);
    const notifyRef = useRef(null);

    // 🟢 3. ຟັງຊັນໂຫຼດແຈ້ງເຕືອນທີ່ຍັງບໍ່ທັນໄດ້ອ່ານມາຈາກ Database (Refresh ກໍຍັງຢູ່)
    const fetchUnreadNotifications = async () => {
        try {
            // ປ່ຽນ URL ໃຫ້ກົງກັບ API Endpoint ຂອງເຈົ້າ
            const response = await axios.get('https://trades-journal.onrender.com/api/notifications/unread', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        // ໂຫຼດຂໍ້ມູນຄັ້ງທຳອິດເມື່ອເປີດໜ້າເວັບ
        fetchUnreadNotifications();

        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
            if (notifyRef.current && !notifyRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 🟢 4. ດັກຟັງ WebSocket ຜ່ານ Laravel Reverb
    useEffect(() => {
        const channel = echo.channel('users-channel')
            .listen('.user.registered', (e) => {
                console.log('Realtime Notification:', e);
                
                // 💡 ຮັບ Object notification ທີ່ສົ່ງມາຈາກ Backend ແລ້ວເອົາມາສຽບໄວ້ທາງໜ້າສຸດ
                if (e.notification) {
                    setNotifications(prev => [e.notification, ...prev]);
                } else {
                    // ແຜນສຳຮອງ: ຖ້າ backend ບໍ່ໄດ້ແນບ object ມາ ກໍໃຫ້ກົດ fetch ໃໝ່ເລີຍ
                    fetchUnreadNotifications();
                }
            });

        return () => {
            channel.stopListening('.user.registered');
        };
    }, []);

    // 🟢 5. ຟັງຊັນຈັດການຕອນກົດທີ່ລາຍການແຈ້ງເຕືອນ
    const handleNotificationClick = async (notif) => {
        try {
            // 💡 ຍິງ API ໄປບອກ Backend ໃຫ້ໝາຍເປັນອ່ານແລ້ວ (is_read = true)
            await axios.put(`https://trades-journal.onrender.com/api/notifications/${notif.id}/read`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            // ລຶບແຈ້ງເຕືອນນີ້ອອກຈາກລາຍການໜ້າຈໍທັນທີ
            setNotifications(prev => prev.filter(item => item.id !== notif.id));
            setIsNotificationOpen(false);

            // ເຊັກປະເພດ ຖ້າແມ່ນຄົນສະໝັກໃໝ່ ໃຫ້ພາໄປໜ້າ users list
            if (notif.type === 'registration') {
                navigate('/dashboard/users');
            }
        } catch (error) {
            console.error("Error updating notification status:", error);
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('user_info'); 
        localStorage.removeItem('auth_token');
        setIsMobileSidebarOpen(false);
        setIsProfileDropdownOpen(false);
        navigate('/'); 
    };

    const getBorderColor = (type) => {
        switch (type) {
            case 'registration': return 'border-l-indigo-500 bg-indigo-50/30';
            case 'system': return 'border-l-green-500';
            default: return 'border-l-gray-400';
        }
    };

    // ຟັງຊັນຊ່ວຍແປງວັນທີເປັນຂໍ້ຄວາມເວລາແບບງ່າຍໆ (ຫຼືຈະໃຊ້ library ເຊັ່ນ moment, date-fns ກໍໄດ້)
    const formatTime = (dateString) => {
        if (!dateString) return 'ຕອນນີ້';
        const date = new Date(dateString);
        return date.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });
    };

    const menuItems = [
        { path: '/dashboard', name: 'ພາບລວມລະບົບ', icon: 'fa-chart-pie', roles: ['admin', 'user', 'super_user'] },
        { path: '/dashboard/trades_journal', name: 'ບັນທຶກການເທຣດປະຈຳວັນ', icon: 'fa-city', roles: ['admin', 'user', 'super_user'] },
        { path: '/dashboard/strategies', name: 'ຈັດການກົນລະຍຸດ', icon: 'fa-city', roles: ['admin', 'user', 'super_user'] },
        { path: '/dashboard/users', name: 'ຈັດການຜູ້ໃຊ້ງານ', icon: 'fa-users', roles: ['admin'] },
        { 
            name: 'ຕັ້ງຄ່າລະບົບ', 
            icon: 'fa-gear', 
            roles: ['admin'], 
            submenu: [
                { path: '/dashboard/settings/roles', name: 'ບົດບາດ/ໜ້າທີ່' },
                { path: '/dashboard/settings/security', name: 'ຄວາມປອດໄພ' }
            ]
        }
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

    const renderNavLinks = (isMobile = false) => {
        return filteredMenu.map((item) => {
            if (item.submenu) {
                const isSubmenuActive = item.submenu.some(sub => location.pathname === sub.path);
                return (
                    <div key={item.name} className="space-y-1">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition duration-150 ${isSubmenuActive ? 'bg-indigo-50/50 text-[#4f46e5]' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <i className={`fa-solid ${item.icon} text-sm ${isSubmenuActive ? 'text-[#4f46e5]' : 'text-gray-400'}`}></i>
                                {item.name}
                            </div>
                            <i className={`fa-solid fa-chevron-down text-sm transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        
                        {isSettingsOpen && (
                            <div className="pl-9 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                {item.submenu.map((sub) => {
                                    const isSubActive = location.pathname === sub.path;
                                    return (
                                        <Link
                                            key={sub.path}
                                            to={sub.path}
                                            onClick={() => isMobile && setIsMobileSidebarOpen(false)}
                                            className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-bold transition duration-150 ${isSubActive ? 'text-[#4f46e5] bg-indigo-50/70' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {sub.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            }

            const isActive = location.pathname === item.path;
            return (
                <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobile && setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 ${isActive ? 'bg-indigo-50 text-[#4f46e5]' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <i className={`fa-solid ${item.icon} text-sm ${isActive ? 'text-[#4f46e5]' : 'text-gray-400'}`}></i>
                    {item.name}
                </Link>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex text-gray-800 font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 p-5 sticky top-0 h-screen justify-between z-30">
                <div className="space-y-6 w-full">
                    <Link to="/" className="flex items-center gap-2.5 px-2 group">
                        <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm">
                            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tight text-[#0f2d37]">Trades Journal</span>
                        </div>
                    </Link>
                    <nav className="space-y-1 w-full">{renderNavLinks(false)}</nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="bg-white border-b border-gray-100 h-16 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-50 transition">
                            <i className="fa-solid fa-bars text-lg text-gray-600"></i>
                        </button>
                    </div>

                    <div className="lg:hidden flex items-center gap-2">
                        <span className="font-black text-xl text-[#0f2d37] tracking-tight">Trades Journal</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        
                        {/* 🔔 ກະດິ່ງແຈ້ງເຕືອນ */}
                        <div className="relative" ref={notifyRef}>
                            <button 
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 transition relative"
                            >
                                <i className="fa-solid fa-bell text-base"></i>
                                {notifications.length > 0 && (
                                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown ຍ່ອຍຂອງແຈ້ງເຕືອນ */}
                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="font-black text-sm text-slate-800">ການແຈ້ງເຕືອນລ່າສຸດ</span>
                                    </div>
                                    
                                    <div className="space-y-2.5 max-h-60 overflow-y-auto text-sm font-bold text-gray-500 pr-1">
                                        {notifications.length === 0 ? (
                                            <p className="text-center text-xs py-4 text-gray-400">ບໍ່ມີການແຈ້ງເຕືອນໃໝ່</p>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div 
                                                    key={notif.id} 
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition border-l-4 ${getBorderColor(notif.type)}`}
                                                >
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-black ${
                                                            notif.type === 'registration' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                                                        }`}>
                                                            {notif.type === 'registration' ? 'ສະມາຊິກໃໝ່' : 'ລະບົບ'}
                                                        </span>
                                                        {/* 💡 ສະແດງເວລາທີ່ດຶງມາຈາກ db (`created_at`) */}
                                                        <span className="text-[10px] text-gray-400 font-normal">{formatTime(notif.created_at)}</span>
                                                    </div>
                                                    <p className="text-slate-700 text-xs leading-snug">{notif.title}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-6 w-px bg-gray-100 hidden sm:block"></div>

                        {/* 👤 ເມນູໂປຣໄຟລ໌ */}
                        {user && (
                            <div className="relative" ref={profileRef}>
                                <button 
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center gap-2 bg-gray-50 p-1 pr-2.5 rounded-xl border border-gray-100/70 hover:bg-gray-100/50 transition duration-150"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
                                        {user.fullname ? user.fullname.charAt(0) : 'A'}
                                    </div>
                                    <i className="fa-solid fa-chevron-down text-[10px] text-gray-400 hidden sm:block"></i>
                                </button>

                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <Link 
                                            to="/dashboard/profile" 
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition"
                                        >
                                            <i className="fa-solid fa-circle-user text-sm text-gray-400"></i> ໂປຣໄຟລ໌ຂອງຂ້ອຍ
                                        </Link>
                                        <hr className="border-gray-50 my-1" />
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition text-left"
                                        >
                                            <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i> ອອກຈາກລະບົບ
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 animate-in fade-in duration-200">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileSidebarOpen(false)} />
                    <aside className="fixed inset-y-0 left-0 w-64 bg-white p-5 flex flex-col justify-between shadow-xl animate-in slide-in-from-left duration-200">
                        <div className="space-y-6 w-full">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm">
                                        <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm tracking-tight text-[#0f2d37]">Trades Journal</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                                    <i className="fa-solid fa-xmark text-lg text-gray-500"></i>
                                </button>
                            </div>
                            <nav className="space-y-1 w-full">{renderNavLinks(true)}</nav>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;