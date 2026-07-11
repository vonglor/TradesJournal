import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { backtestTradeService } from '../../services/backtestTradeService'; 
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs'; // 📦 ໃຊ້ສຳລັບຈັດການສີ Excel
import { saveAs } from 'file-saver'; // 📦 ໃຊ້ດາວໂຫຼດຟາຍ

const BacktestTrades = () => {
    const { id } = useParams();
    const [backtestTrades, setBacktestTrades] = useState([]);
    const [strategyName, setStrategyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchBacktestTrades = async () => {
        setIsLoading(true);
        try {
            const response = await backtestTradeService.getAllById(id);
            if (response && response.data && response.data.strategy_name) {
                setStrategyName(response.data.strategy_name);
            } else if (response && response.strategy_name) {
                setStrategyName(response.strategy_name);
            }

            if (response && response.data && Array.isArray(response.data.data)) {
                setBacktestTrades(response.data.data);
            } else if (response && Array.isArray(response.data)) {
                setBacktestTrades(response.data);
            } else if (Array.isArray(response)) {
                setBacktestTrades(response);
            } else {
                setBacktestTrades([]);
            }
        } catch (error) {
            console.error('Error fetching backtest trades:', error);
            Toast.fire({ icon: 'error', title: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນປະຫວັດການເທຣດໄດ້' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBacktestTrades();
    }, []);

    const formatMoney = (value) => {
        const num = Number(value || 0);
        const absNum = Math.abs(num).toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
        return num < 0 ? `-$${absNum}` : `$${absNum}`;
    };

    // 🟢 🚀 ຟັງຊັນ Export Excel ແບບໃສ່ສີ (ມີອັນດຽວຢູ່ເທິງສຸດ ເຮັດວຽກໄດ້ 100%)
    const exportToExcel = async () => {
        if (backtestTrades.length === 0) {
            Toast.fire({ icon: 'warning', title: 'ບໍ່ມີຂໍ້ມູນການເທຣດເພື່ອ Export' });
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Backtest Logs');

        worksheet.columns = [
            { header: 'ລຳດັບ', key: 'index', width: 10 },
            { header: 'Action', key: 'action', width: 15 },
            { header: 'ຜົນການເທຣດ', key: 'status', width: 18 },
            { header: 'P&L (ກຳໄລ/ຂາດທຶນ)', key: 'pnl', width: 25 },
            { header: 'ຍອດເງິນຄົງເຫຼືອ', key: 'balance', width: 25 }
        ];

        backtestTrades.forEach((trade, index) => {
            const pnl = Number(trade.pnl_amount || 0);
            const balance = Number(trade.balance_after || trade.after_balance || 0);

            worksheet.addRow({
                index: index + 1,
                action: trade.action?.toUpperCase() || 'N/A',
                status: trade.status?.toLowerCase() === 'win' ? 'ຊະນະ (WIN)' : 'ແພ້ (LOSS)',
                pnl: pnl >= 0 ? `+${formatMoney(pnl)}` : formatMoney(pnl),
                balance: formatMoney(balance)
            });
        });

        // 🎨 Header Styling (ສີເທົາ Slate-50)
        const headerRow = worksheet.getRow(1);
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
            cell.font = { name: 'Arial', bold: true, size: 11, color: { argb: 'FF334155' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { bottom: { style: 'medium', color: { argb: 'FFE2E8F0' } } };
        });

        // 🎨 Data Rows Styling (ແຍກສີ ຂຽວ/ແດງ ເໝືອນໜ້າເວັບ)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            row.height = 25;
            const actionCell = row.getCell('action');
            const statusCell = row.getCell('status');
            const pnlCell = row.getCell('pnl');
            const balanceCell = row.getCell('balance');

            row.eachCell((cell, colNumber) => {
                cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF475569' } };
                cell.alignment = { vertical: 'middle' };
                cell.border = { bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } } };

                if (colNumber <= 3) cell.alignment = { vertical: 'middle', horizontal: 'center' };
                if (colNumber >= 4) cell.alignment = { vertical: 'middle', horizontal: 'right' };
            });

            // ສີ Action
            if (actionCell.value === 'BUY') {
                actionCell.font = { name: 'Arial', bold: true, color: { argb: 'FF047857' } };
            } else {
                actionCell.font = { name: 'Arial', bold: true, color: { argb: 'FFB91C1C' } };
            }

            // ສີ ປ້າຍຜົນການເທຣດ
            if (statusCell.value === 'ຊະນະ (WIN)') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
                statusCell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
            } else {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF43F5E' } };
                statusCell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
            }

            // ສີ ຕົວເລກເງິນ P&L
            if (pnlCell.value.toString().startsWith('+')) {
                pnlCell.font = { name: 'Arial', bold: true, color: { argb: 'FF059669' } };
            } else {
                pnlCell.font = { name: 'Arial', bold: true, color: { argb: 'FFB91C1C', color: { argb: 'FFE11D48' } } };
            }

            balanceCell.font = { name: 'Arial', bold: true, color: { argb: 'FF1E293B' } };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = `Backtest_Color_Report_${strategyName.replace(/[^a-zA-Z0-9📥]/g, '_') || id}.xlsx`;
        saveAs(new Blob([buffer]), fileName);

        Toast.fire({ icon: 'success', title: 'Export ຟາຍ Excel ສຳເລັດແລ້ວ' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 p-2 sm:p-6 bg-[#fafafa]/50 min-h-screen">
            
            {/* 🔗 PREMIUM CLEAN HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs">
                <div className="flex items-center gap-4">
                    <Link to={`/dashboard/strategy_details/${id}`} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-[#0a7067] hover:text-white flex items-center justify-center transition-all duration-300 border border-slate-100 shadow-3xs">
                        <i className="fa-solid fa-arrow-left text-xs"></i>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            📜 ປະຫວັດການເທຣດທັງໝົດຂອງກົນລະຍຸດ: {strategyName || '...'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">ລາຍການບັນທຶກ ແລະ ສະຖິຕິການທົດສອບລະບົບແບບລະອຽດທຸກໆໄມ້</p>
                    </div>
                </div>

                <button
                    onClick={exportToExcel}
                    disabled={isLoading || backtestTrades.length === 0}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition duration-200 text-sm shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i className="fa-solid fa-file-excel text-base"></i>
                    <span>Export Excel</span>
                </button>
            </div>

            {/* 📊 LUXURY DATA TABLE SECTION */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-700 text-sm font-black uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4 w-20 text-center">ລຳດັບ</th>
                                <th className="p-4 text-center">Action</th>
                                <th className="p-4 text-center">ຜົນການເທຣດ</th>
                                <th className="p-4 text-right">P&L (ກຳໄລ/າດທຶນ)</th>
                                <th className="p-4 text-right">ຍອດເງິນຄົງເຫຼືອ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-600">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400 font-bold tracking-wide animate-pulse">
                                        <i className="fa-solid fa-spinner animate-spin mr-2 text-[#0a7067] text-lg"></i> ກຳລັງໂຫຼດຂໍ້ມູນປະຫວັດ...
                                    </td>
                                </tr>
                            ) : backtestTrades.length > 0 ? (
                                backtestTrades.map((trade, index) => {
                                    const isWin = trade.status?.toLowerCase() === 'win';
                                    const isBuy = trade.action?.toLowerCase() === 'buy';

                                    return (
                                        <tr key={trade.id} className="hover:bg-slate-50/60 transition duration-150">
                                            <td className="p-4 text-center text-slate-400 font-mono text-sm font-medium">{index + 1}</td>
                                            
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 text-[12px] font-black px-2.5 py-0.5 rounded-lg border ${
                                                    isBuy 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' 
                                                        : 'bg-rose-50 text-rose-700 border-rose-100/50'
                                                }`}>
                                                    <span className={`w-1 h-1 rounded-full ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    {trade.action?.toUpperCase() || 'N/A'}
                                                </span>
                                            </td>
                                            
                                            <td className="p-4 text-center">
                                                <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-lg ${
                                                    isWin 
                                                        ? 'bg-emerald-600 text-white shadow-xs' 
                                                        : 'bg-rose-600 text-white shadow-xs'
                                                }`}>
                                                    {isWin ? 'ຊະນະ' : 'ແພ້'}
                                                </span>
                                            </td>
                                            
                                            <td className={`p-4 text-right font-mono text-sm font-black ${
                                                Number(trade.pnl_amount || 0) >= 0 ? 'text-emerald-600' : 'text-rose-500'
                                            }`}>
                                                {Number(trade.pnl_amount || 0) >= 0 ? '+' : ''}
                                                {formatMoney(trade.pnl_amount)}
                                            </td>
                                            
                                            <td className="p-4 text-right text-sm font-mono text-slate-800 font-bold">
                                                {formatMoney(trade.balance_after || trade.after_balance)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400 bg-slate-50/20">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <i className="fa-solid fa-folder-open text-2xl text-slate-300"></i>
                                            <p className="text-xs font-bold">ຍັງບໍ່ມີປະຫວັດການເທຣດ (Backtest) ສຳລັບກົນລະຍຸດນີ້</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BacktestTrades;