import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import VerifyEmail from './components/VerifyEmail';
import MainLayout from './components/MainLayout';
import Index from './pages/client/Index';

import Register from './pages/auth/Register';
import VerifyEmailNotice from './pages/auth/VerifyEmailNotice';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AdminLayout from './components/AdminLayout';
import Profile from './pages/admin/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import CRUDStratgies from './pages/admin/CRUDStratgies';
import StrategyDetail from './pages/admin/StrategyDetail';
import BacktestTrades from './pages/admin/BacktestTrades';
import CRUDRoles from './pages/admin/CRUDRoles';
import CRUDTrades from './pages/admin/CRUDTrades';
import CRUDUsers from './pages/admin/CRUDUsers';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Routes>
      {/* ---------------- ກຸ່ມໜ້າ Client (ທົ່ວໄປ ໃຜກໍເຂົ້າໄດ້) ---------------- */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Index />} />
      </Route>
      
      {/* ໜ້າ Auth (ບໍ່ມີ Layout ຊ້ອນ) */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email-notice" element={<VerifyEmailNotice />} />
      </Route>

      <Route path="/verify-email/:id/:hash" element={<VerifyEmail />} />

      {/* ---------------- 🔒 2. ກຸ່ມໜ້າຈັດການ (ADMIN & OWNER ເຂົ້າໄດ້) ---------------- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<AdminLayout />}>
          {/* ຖ້າເຂົ້າ /admin ໃຫ້ສະແດງໜ້າ Dashboard ທັນທີ */}
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="strategies" element={<CRUDStratgies />} />
          <Route path="strategy_details/:id" element={<StrategyDetail />} />
          <Route path="backtest_trates/:id" element={<BacktestTrades />} />
          <Route path="users" element={<CRUDUsers />} />
          <Route path="trades_journal" element={<CRUDTrades />} />
          <Route path="settings/roles" element={<CRUDRoles />} />

          {/* ── ⚡ 3. ເສັ້ນທາງລັບສະເພາະ ADMIN ເທົ່ານັ້ນ (Owner ຫ້າມເຂົ້າ) ── */}
          {/* 💡 ຊ້ອນ ProtectedRoute ອີກຊັ້ນໜຶ່ງເພື່ອດັກສິດ ໂດຍຍັງໃຊ້ AdminLayout ຮ່ວມກັນໄດ້ */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>

          </Route>

        </Route>
      </Route>

      {/* 🔄 Fallback URL: ຖ້າພິມ URL ມົ່ວ ໃຫ້ເຕະກັບໄປໜ້າຫຼັກ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;