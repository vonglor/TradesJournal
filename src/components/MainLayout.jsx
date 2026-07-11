import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/favicon/favicon.svg';

const MainLayout = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false); 
    const dropdownRef = useRef(null); 
    const navigate = useNavigate();
    const location = useLocation(); 

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user_info'));

    const handleLogout = () => {
        console.log("Logged out successfully");
        localStorage.removeItem('user_info');
        localStorage.removeItem('auth_token');
        setShowDropdown(false);
        setIsMobileSidebarOpen(false);
        navigate('/');
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-gray-50 text-gray-800'}`}>
            <nav className={`border-b transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-100'} sticky top-0 z-40 shadow-sm`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50">
                                    <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-sm tracking-tight text-[#0f2d37] dark:text-white">AI Trading </span>
                                    <span className="text-[9px] text-gray-400 dark:text-slate-400 font-bold leading-none">Journal</span>
                                </div>
                            </Link>

                            <div className="hidden md:flex items-center gap-1">
                                <Link to="/" className={`px-3 py-2 rounded-xl text-sm font-bold transition ${location.pathname === '/' ? 'bg-indigo-50 text-[#4f46e5] dark:bg-indigo-950/50 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                                    🏠 ໜ້າຫຼັກ
                                </Link>
                                <a href="#apartments" className="px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800 transition">
                                    🏢 ອາພາດເມັນ
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={toggleTheme} className={`p-2 rounded-xl border text-sm transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}>
                                {isDarkMode ? '☀️ Mode ແຈ້ງ' : '🌙 Mode ມືດ'}
                            </button>

                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button onClick={() => setShowDropdown(!showDropdown)} className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                        <div className="w-7 h-7 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center text-sm font-bold uppercase shadow-sm">
                                            {user.fullname ? user.fullname.charAt(0) : 'U'}
                                        </div>
                                        <div className="hidden md:flex flex-col text-left">
                                            <span className="text-sm font-bold leading-tight max-w-[100px] truncate">{user.fullname}</span>
                                            <span className="text-[10px] text-gray-400 font-medium capitalize">{user.role || 'User'}</span>
                                        </div>
                                        <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}></i>
                                    </button>

                                    {showDropdown && (
                                        <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150 ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200' : 'bg-white border-gray-100 text-gray-700'}`}>
                                                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-slate-700/50 mb-1">
                                                    <p className="text-sm font-bold truncate text-[#4f46e5] dark:text-white">{user.fullname}</p>
                                                </div>
                                                <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                                                    <i className="fa-solid fa-gauge-high text-gray-400 w-4"></i> ຂໍ້ມູນສ່ວນຕົວ
                                                </Link>
                                                <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                                                    <i className="fa-solid fa-gauge-high text-gray-400 w-4"></i> ລະບົບຫຼັງບ້ານ
                                                </Link>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left">
                                                <i className="fa-solid fa-arrow-right-from-bracket w-4"></i> ອອກຈາກລະບົບ
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <Link to="/login" className="px-3 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white transition">
                                        ເຂົ້າສູ່ລະບົບ
                                    </Link>
                                    <Link to="/register" className="px-3 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-bold rounded-xl shadow-sm transition">
                                        ສ້າງບັນຊີ
                                    </Link>
                                </div>
                            )}

                            <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                                <i className="fa-solid fa-bars text-sm"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </nav>

            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)}></div>
                    <div className={`fixed inset-y-0 right-0 w-64 p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">ເມນູທັງໝົດ</span>
                                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                                    <i className="fa-solid fa-xmark text-sm"></i>
                                </button>
                            </div>
                            <nav className="flex flex-col gap-1">
                                <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${location.pathname === '/' ? 'bg-indigo-50 text-[#4f46e5] dark:bg-indigo-950/50' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                                    <i className="fa-solid fa-house w-5"></i> ໜ້າຫຼັກ
                                </Link>
                                <a href="#apartments" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <i className="fa-solid fa-city w-5 text-gray-400"></i> ອາພາດເມັນ
                                </a>
                            </nav>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                            <p className="text-[10px] text-gray-400 text-center font-medium">AI Trading</p>
                        </div>
                    </div>
                </div>
            )}

            <main className="min-h-[calc(100vh-140px)]">
                <Outlet />
            </main>

            <footer className={`border-t text-center py-8 px-4 transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-500' : 'bg-white border-gray-100 text-gray-400'} text-xs font-medium space-y-1`}>
                <p>&copy; 2026 Vonglor Apartment. All rights reserved.</p>
                <p className="text-[10px] text-gray-300 dark:text-slate-600">Developed with ❤️ and React + Tailwind</p>
            </footer>
        </div>
    );
};

export default MainLayout;