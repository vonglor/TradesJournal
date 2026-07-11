import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { strategyService } from '../../services/strategyService';
import { formatCapital, formatPercent } from '../../utils/format';
import Swal from 'sweetalert2';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ExcelJS from 'exceljs'; // 📦 ໃຊ້ສຳລັບຈັດການສີ Excel
import { saveAs } from 'file-saver'; // 📦 ໃຊ້ດາວໂຫຼດຟາຍ

const StrategyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [strategy, setStrategy] = useState(null);
    const [profit_factor, setProfit_factor] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // 🔑 State ສໍາລັບຄວບຄຸມການເປີດ/ປິດຕ່າງຫາກຂອງແຕ່ລະ Modal
    const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
    const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
    const [isProfitFactorModalOpen, setIsProfitFactorModalOpen] = useState(false);

    // 📝 State ສຳລັບ Form ຈັດການເງິນທຶນ, ຄວາມສ່ຽງ ແລະ ວັນທີ
    const [initial_capital, setInitial_capital] = useState('');
    const [risk_percent, setRisk_percent] = useState('');
    const [start_date, setStart_date] = useState('');
    const [end_date, setEnd_date] = useState('');

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    // 🔄 ຟັງຊັນດຶງຂໍ້ມູນລາຍລະອຽດກົນລະຍຸດ
    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await strategyService.getById(id);

            // 🟢 1. ອ້າງອີງຫາ response.data ທີ່ໄດ້ຈາກ Backend
            const resData = response?.data;

            if (resData) {
                // 📊 2. ອັບເດດ Profit Factor ໂລດ ເພາະມັນແນບມາໃນລະດັບດຽວກັນສະເໝີ
                setProfit_factor(resData.profit_factor || 0);

                // 📂 3. ເຊັກໂຄງສ້າງ ແລະ ເກັບຂໍ້ມູນ Strategy
                let strategyData = null;
                if (resData.data) {
                    strategyData = resData.data; // ຖ້າຫໍ່ຢູ່ໃນ .data
                } else {
                    strategyData = resData;      // ຖ້າເປັນ Object ໂດຍກົງ
                }

                // 📝 4. ຜູກຂໍ້ມູນເຂົ້າກັບ States ຕ່າງໆ
                setStrategy(strategyData);
                setInitial_capital(strategyData.initial_capital || '');
                setRisk_percent(strategyData.risk_percent || '');
                setStart_date(strategyData.start_date || '');
                setEnd_date(strategyData.end_date || '');

            } else {
                setStrategy(null);
                setProfit_factor(0);
            }
        } catch (error) {
            console.error('Error fetching strategy details:', error);
            Swal.fire({ icon: 'error', title: 'ຜິດພາດ', text: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລາຍລະອຽດກົນລະຍຸດໄດ້' });
        } finally {
            setLoading(false);
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

    useEffect(() => {
        if (id) {
            fetchDetails();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleUpdateCapitalOrRisk = async (e, type) => {
        e.preventDefault();
        setIsUpdating(true);
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('initial_capital', initial_capital);
        formData.append('risk_percent', risk_percent);

        try {
            await strategyService.updateCapital(id, formData);
            Toast.fire({ icon: 'success', title: 'ອັບເດດຂໍ້ມູນສຳເລັດ', background: '#fff', iconColor: '#0a7067' });

            if (type === 'capital') setIsCapitalModalOpen(false);
            if (type === 'risk') setIsRiskModalOpen(false);

            fetchDetails();
        } catch (error) {
            console.error('Error updating strategy:', error);
            Swal.fire({
                icon: 'error',
                title: 'ເກີດຂໍ້ຜິດພາດ',
                text: error.response?.data?.message || 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້',
                confirmButtonColor: '#0a7067'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // 📝 ເພີ່ມ State ສຳລັບເກັບຄ່າ Buy / Sell
    const [tradeAction, setTradeAction] = useState('');

    // 🚀 ຟັງຊັນບັນທຶກຂໍ້ມູນການເທຣດ (Win / Loss) ລົງ backtest_trades
    const handleSaveBacktestTrade = async (e, result) => {
        e.preventDefault();

        // ກວດເຊັກກ່ອນວ່າເລືອກ Buy ຫຼື Sell ແລ້ວຫຼືຍັງ
        if (!tradeAction) {
            Toast.fire({ icon: 'warning', title: 'ກະລຸນາເລືອກ Action (Buy/Sell) ກ່ອນ' });
            return;
        }

        setIsUpdating(true);
        const formData = new FormData();
        formData.append('strategy_id', id);      // ID ຂອງກົນລະຍຸດນີ້
        formData.append('action', tradeAction);    // 'buy' ຫຼື 'sell'
        formData.append('status', result);        // 'win' ຫຼື 'loss'

        try {
            // 💡 ເອີ້ນໃຊ້ Service ທີ່ໄປຫາ Route ບັນທຶກຂໍ້ມູນ (ຕົວຢ່າງ: /api/backtest-trades)
            await strategyService.storeBacktestTrade(formData);

            Toast.fire({
                icon: 'success',
                title: `ບັນທຶກຜົນ ${result === 'win' ? 'ຊະນະ' : 'ແພ້'} ສຳເລັດ`,
                background: '#fff',
                iconColor: '#0a7067'
            });

            // ລ້າງຄ່າ Dropdown ຫຼັງຈາກບັນທຶກສຳເລັດ (ຖ້າຕ້ອງການ)
            setTradeAction('');

            // ໂຫຼດຂໍ້ມູນໜ້າ Dashboard ໃໝ່ ເພື່ອໃຫ້ຕົວເລກ Win/Loss ອັບເດດຕາມ
            fetchDetails();
        } catch (error) {
            console.error('Error saving backtest trade:', error);
            Swal.fire({
                icon: 'error',
                title: 'ເກີດຂໍ້ຜິດພາດ',
                text: error.response?.data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນການເທຣດໄດ້',
                confirmButtonColor: '#0a7067'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateTimespan = async (e) => {
        e.preventDefault();
        if (!start_date || !end_date) {
            Toast.fire({ icon: 'warning', title: 'ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບຖ້ວນ' });
            return;
        }

        setIsUpdating(true);
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('start_date', start_date);
        formData.append('end_date', end_date);

        try {
            await strategyService.updateTimespan(id, formData);
            Toast.fire({ icon: 'success', title: 'ອັບເດດຂໍ້ມູນເວລາການທົດສອບສຳເລັດ', background: '#fff', iconColor: '#0a7067' });
            fetchDetails();
        } catch (error) {
            console.error('Error updating timespan:', error);
            Swal.fire({
                icon: 'error',
                title: 'ເກີດຂໍ້ຜິດພາດ',
                text: error.response?.data?.message || 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້',
                confirmButtonColor: '#0a7067'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-bold text-gray-400 animate-pulse tracking-wide">⏳ ກຳລັງໂຫຼດລາຍລະອຽດກົນລະຍຸດ...</div>;
    if (!strategy) return <div className="text-center py-20 font-bold text-rose-500 bg-rose-50/50 rounded-2xl border border-rose-100 m-4">❌ ບໍ່ພົບຂໍ້ມູນກົນລະຍຸດນີ້ໃນລະບົບ</div>;

    // 📈 ຟັງຊັນສ້າງຂໍ້ມູນສຳລັບແຕ້ມກາຟ Equity Curve
    // 📈 ຟັງຊັນສ້າງຂໍ້ມູນສຳລັບແຕ້ມກາຟ Equity Curve (ເວີຊັ່ນປັບປຸງຕາມ after_balance)
    const prepareChartData = () => {
        const tradeRecords = strategy?.backtest_trades || strategy?.backtestTrades || [];

        let chartData = [];
        let formattedPercentProfit = "0.00%";
        let textColor = '#10b981';

        if (Array.isArray(tradeRecords) && tradeRecords.length > 0) {

            const firstRow = tradeRecords[0];
            const balanceAfterField = firstRow.balance_after !== undefined ? 'balance_after' : 'after_balance';
            const startBalance = Number(firstRow[balanceAfterField] || 0) - Number(firstRow.pnl_amount || 0);

            const totalProfit = Number(strategy?.total_profit || 0);
            if (startBalance > 0) {
                const profitPer = (totalProfit / startBalance) * 100;
                const symbol = profitPer > 0 ? '+' : '';
                textColor = profitPer >= 0 ? '#10b981' : '#f43f5e';
                formattedPercentProfit = `${symbol}${formatPercent(profitPer)}`;
            }

            // 3. ຍັດຈຸດ Start ເຂົ້າໄປ
            chartData.push({
                label: "Start",
                balance: startBalance,
                pnl: 0,
                pnl_percent: 0 // ຈຸດເລີ່ມຕົ້ນ % ການເຕີບໂຕເປັນ 0
            });

            // 4. Loop ເພື່ອເອົາຄ່າ balance ຂອງທຸກໆໄມ້
            tradeRecords.forEach((row, index) => {
                const currentBalance = Number(row[balanceAfterField] || 0);

                // 💡 🔑 1. ປະກາດ const ແລະ 2. ກວດເຊັກ Division by Zero ປ້ອງກັນການຫານໃຫ້ 0
                const pnl_percent = startBalance > 0
                    ? ((currentBalance - startBalance) / startBalance) * 100
                    : 0;

                chartData.push({
                    label: `ໄມ້ ${index + 1}`,
                    balance: currentBalance,
                    pnl: Number(row.pnl_amount || 0),
                    action: row.action === 'buy' ? '🟢 BUY' : '🔴 SELL',
                    pnl_percent: pnl_percent // 🎯 ສົ່ງ % ທີ່ຄຳນວນໄດ້ໄປໃຫ້ກາຟ
                });
            });

        } else {
            chartData.push({
                label: "Start",
                balance: Number(strategy?.initial_capital || 0),
                pnl: 0,
                pnl_percent: 0
            });
        }

        return {
            chartData,
            formattedPercentProfit,
            textColor
        };
    };

    // 🚀 ຟັງຊັນ Export 2 Sheets ບາດດຽວ (ເວີຊັ່ນແກ້ໄຂ Bug ຄ່າ undefined)
    const exportAllToExcel = async () => {
        if (!strategy) {
            Toast.fire({ icon: 'warning', title: 'ບໍ່ມີຂໍ້ມູນເພື່ອ Export' });
            return;
        }

        const workbook = new ExcelJS.Workbook();

        // ດຶງຂໍ້ມູນລາຍການເທຣດອອກມາກ່ອນເພື່ອເອົາມາຄິດໄລ່ຄ່າສະຖິຕິໃຫ້ຖືກຕ້ອງ
        const tradesList = strategy.backtest_trades || strategy.trades || [];

        // 🧮 ຄິດໄລ່ສະຖິຕິສົດໆ ປ້ອງກັນ undefined
        const totalTrades = tradesList.length;
        const winTrades = tradesList.filter(t => t.status?.toLowerCase() === 'win').length;
        const calculatedWinRate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(2) : 0;

        // ຄິດໄລ່ກຳໄລສຸດທິ (Net Profit)
        const netProfit = tradesList.reduce((sum, t) => sum + Number(t.pnl_amount || 0), 0);

        // ----------------------------------------------------
        // 📊 SHEET 1: Strategy Summary (ລາຍລະອຽດກົນລະຍຸດ)
        // ----------------------------------------------------
        const sheet1 = workbook.addWorksheet('Overview Summary');
        sheet1.columns = [
            { header: 'ຫົວຂໍ້ສະຖິຕິ', key: 'title', width: 30 },
            { header: 'ຂໍ້ມູນ / ຜົນຮັບ', key: 'value', width: 40 }
        ];

        // ໃສ່ຂໍ້ມູນ Overview ທີ່ຄິດໄລ່ຖືກຕ້ອງແລ້ວ
        sheet1.addRows([
            { title: 'ຊື່ກົນລະຍຸດ:', value: strategy.name },
            { title: 'ລາຍລະອຽດກົນລະຍຸດ:', value: strategy.description || 'N/A' },
            { title: 'ສິນຊັບ (Asset):', value: strategy.symbol || 'N/A' },
            { title: 'Timeframe:', value: strategy.timeframe || 'N/A' },
            { title: 'Risk:Reward Ratio:', value: strategy.rr_ratio || 'N/A' },
            { title: 'ເງິນທຶນເລີ່ມຕົ້ນ:', value: formatCapital(strategy.initial_capital) },
            { title: 'ກຳໄລສຸດທິ (Net Profit):', value: formatCapital(netProfit) },
            { title: 'ອັດຕາຊະນະ (Win Rate):', value: `${calculatedWinRate}%` },
            { title: 'ຈຳນວນໄມ້ທີ່ເທຣດທັງໝົດ:', value: `${totalTrades} ໄມ້` }
        ]);

        // 🎨 Style Sheet 1
        const headerRow1 = sheet1.getRow(1);
        headerRow1.height = 30;
        headerRow1.eachCell((cell) => {
            cell.font = { name: 'Arial', bold: true, size: 11, color: { argb: 'FF334155' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        sheet1.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            row.height = 25;
            row.getCell(1).font = { name: 'Arial', bold: true, color: { argb: 'FF475569' } };
            row.getCell(2).font = { name: 'Arial', bold: true, color: { argb: 'FF0F172A' } };

            // ໃສ່ສີຂຽວເຂັ້ມໃຫ້ Net Profit ແລະ Win Rate ຖ້າຜົນງານເປັນບວກ
            if (rowNumber === 6 || rowNumber === 7) {
                row.getCell(2).font = { name: 'Arial', bold: true, color: { argb: netProfit >= 0 ? 'FF059669' : 'FFE11D48' } };
            }
        });

        // ----------------------------------------------------
        // 📜 SHEET 2: Backtest Logs (ປະຫວັດການເທຣດທຸກໆໄມ້)
        // ----------------------------------------------------
        const sheet2 = workbook.addWorksheet('Trading Logs');
        sheet2.columns = [
            { header: 'ລຳດັບ', key: 'index', width: 10 },
            { header: 'Action', key: 'action', width: 15 },
            { header: 'ຜົນການເທຣດ', key: 'status', width: 18 },
            { header: 'P&L (ກຳໄລ/ຂາດທຶນ)', key: 'pnl', width: 25 },
            { header: 'ຍອດເງິນຄົງເຫຼືອ', key: 'balance', width: 25 }
        ];

        // ໃສ່ຂໍ້ມູນລາຍການເທຣດ
        tradesList.forEach((trade, index) => {
            const pnl = Number(trade.pnl_amount || 0);
            const absPnl = Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const formattedPnl = pnl >= 0 ? `+$${absPnl}` : `-$${absPnl}`;

            const balance = Number(trade.balance_after || trade.after_balance || 0);
            const formattedBalance = `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            sheet2.addRow({
                index: index + 1,
                action: trade.action?.toUpperCase() || 'N/A',
                status: trade.status?.toLowerCase() === 'win' ? 'ຊະນະ (WIN)' : 'ແພ້ (LOSS)',
                pnl: formattedPnl,
                balance: formattedBalance
            });
        });

        // 🎨 Style Sheet 2
        const headerRow2 = sheet2.getRow(1);
        headerRow2.height = 30;
        headerRow2.eachCell((cell) => {
            cell.font = { name: 'Arial', bold: true, size: 11, color: { argb: 'FF334155' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        sheet2.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            row.height = 25;

            const actionCell = row.getCell('action');
            const statusCell = row.getCell('status');
            const pnlCell = row.getCell('pnl');

            row.eachCell((cell, colNumber) => {
                cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF475569' } };
                cell.alignment = { vertical: 'middle' };
                if (colNumber <= 3) cell.alignment = { vertical: 'middle', horizontal: 'center' };
                if (colNumber >= 4) cell.alignment = { vertical: 'middle', horizontal: 'right' };
            });

            if (actionCell.value === 'BUY') actionCell.font = { name: 'Arial', bold: true, color: { argb: 'FF047857' } };
            else actionCell.font = { name: 'Arial', bold: true, color: { argb: 'FFB91C1C' } };

            if (statusCell.value === 'ຊະນະ (WIN)') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
                statusCell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
            } else {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF43F5E' } };
                statusCell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
            }

            if (pnlCell.value.toString().startsWith('+')) pnlCell.font = { name: 'Arial', bold: true, color: { argb: 'FF059669' } };
            else pnlCell.font = { name: 'Arial', bold: true, color: { argb: 'FFE11D48' } };
        });

        // 💾 ປັບປຸງການຕັ້ງຊື່ຟາຍໃຫ້ສະອາດ ບໍ່ຕິດເຄື່ອງໝາຍລົບ/ຂີດກາງຫຼາຍເກີນໄປ
        const cleanName = strategy.name ? strategy.name.substring(0, 30) : 'Strategy';
        const fileName = `Report_${cleanName}.xlsx`;

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), fileName);

        Toast.fire({ icon: 'success', title: 'Export ທັງໝົດລົງຟາຍ Excel ຮຽບຮ້ອຍແລ້ວ!' });
    };

    const { chartData, formattedPercentProfit, textColor } = prepareChartData();

    return (
        <div className="space-y-6 animate-in fade-in duration-300 p-2 sm:p-6 bg-[#fafafa]/50 min-h-screen">

            {/* 🔗 ສ່ວນຫົວ + ປຸ່ມຍ້ອນກັບ (Premium Header) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100/80 shadow-xs">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard/strategies" className="w-11 h-11 rounded-2xl bg-gray-50 text-gray-500 hover:bg-[#0a7067] hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs">
                        <i className="fa-solid fa-arrow-left text-sm"></i>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">ກົນລະຍຸດ: {strategy.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-lg">📊 {strategy.symbol}</span>
                            <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg">⏱️ {strategy.timeframe}</span>
                        </div>
                    </div>

                </div>

                {/* 👉 ຝັ່ງຂວາມື: ສ່ວນສະແດງ Description (ຄຳອະທິບາຍກົນລະຍຸດ) */}
                <button
                    onClick={exportAllToExcel}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition duration-200 text-sm shadow-2xs"
                >
                    <i className="fa-solid fa-file-export text-base"></i>
                    <span>Export Full Report (Excel)</span>
                </button>
            </div>

            {/* 📊 ໂຄງສ້າງ 4 Column (Luxurious Stats Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">ອັດຕາຊະນະ</p>
                        <p className="text-2xl font-black text-emerald-800 mt-1">{formatPercent((strategy.win_count / strategy.total_trades) * 100)}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><i className="fa-solid fa-arrow-up text-sm"></i></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Profit Factor</p>
                        {/* 🎨 ປ່ຽນສີຕົວເລກຕາມເກນປະສິດທິພາບ */}
                        <p className={`text-xl font-black mt-1 ${profit_factor < 1.0 ? 'text-red-600' :
                            profit_factor <= 1.5 ? 'text-amber-500' :
                                profit_factor <= 2.0 ? 'text-emerald-600' : 'text-indigo-600'
                            }`}>
                            {profit_factor}
                        </p>
                    </div>

                    {/* 🔄 ປ່ຽນສີພື້ນຫຼັງ ແລະ ໄອຄອນ ຕາມເກນ Profit Factor */}
                    <Link
                        onClick={() => setIsProfitFactorModalOpen(true)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${profit_factor < 1.0 ? 'bg-red-50 text-red-600' :
                            profit_factor <= 1.5 ? 'bg-amber-50 text-amber-500' :
                                profit_factor <= 2.0 ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                        <i className={`fa-solid ${profit_factor < 1.0 ? 'fa-triangle-exclamation' : // ຂາດທຶນ/ອັນຕະລາຍ
                            profit_factor <= 1.5 ? 'fa-scale-balanced' :       // ພໍຕົວ/ສະເໝີຕົວ
                                profit_factor <= 2.0 ? 'fa-arrow-up-right-dots' :  // ລະບົບທີ່ດີ
                                    'fa-crown'                                               // ດີເລີດ / Excellent
                            } text-sm`}></i>
                    </Link>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">ເງິນທຶນເລີ່ມຕົ້ນ</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">
                            {formatCapital(strategy.initial_capital)}
                        </p>
                    </div>
                    <Link onClick={() => setIsCapitalModalOpen(true)}
                        className="w-9 h-9 rounded-xl bg-emerald-50 text-slate-500 hover:bg-[#0a7067] hover:text-white transition-all duration-200 flex items-center justify-center shadow-2xs flex-shrink-0 border border-slate-100"
                        title="ແກ້ໄຂເງິນທຶນ"
                    >
                        <i className="fa-solid fa-pen text-[11px]"></i>
                    </Link>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">ຄວາມສ່ຽງຕໍ່ໄມ້</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">
                            {formatPercent(strategy.risk_percent)}
                        </p>
                    </div>
                    <Link onClick={() => setIsRiskModalOpen(true)}
                        className="w-9 h-9 rounded-xl bg-emerald-50 text-slate-500 hover:bg-[#0a7067] hover:text-white transition-all duration-200 flex items-center justify-center shadow-2xs flex-shrink-0 border border-slate-100"
                        title="ແກ້ໄຂຄວາມສ່ຽງ"
                    >
                        <i className="fa-solid fa-pen text-[11px]"></i>
                    </Link>
                </div>
            </div>

            {/* 📈 ເຂດສະຖິຕິການ Backtest ແລະ ຟອມວັນທີ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 📊 ຝັ່ງສະຖິຕິການ Backtest (ປັບປຸງໃໝ່ໃຫ້ຫຼູຫຼາ ເບິ່ງສະບາຍ) */}
                {/* 📊 ຝັ່ງສະຖິຕິການ Backtest (ມີ Form ບັນທຶກຜົນແນວນອນຢູ່ລຸ່ມ) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs min-h-[24rem] flex flex-col justify-between gap-6">

                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#0a7067] rounded-full"></span>
                            <p className="text-[16px] font-black text-slate-700 tracking-tight">📊 ສະຖິຕິການ Backtest ກົນລະຍຸດ</p>
                        </div>
                        <Link to={`/dashboard/backtest_trates/${strategy.id}`}
                            className="w-9 h-9 rounded-xl bg-indigo-100 text-slate-500 hover:bg-indigo-500 hover:text-white transition-all duration-200 flex items-center justify-center shadow-2xs flex-shrink-0 border border-slate-100"
                            title="ເບີ່ງການເທຣດທັງໝົດ"
                        >
                            <i className="fa-solid fa-eye text-[11px]"></i>
                        </Link>
                    </div>

                    {/* 📊 Stats Content Grid (ຂໍ້ມູນທົ່ວໄປ + ຜົນກຳໄລ) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                        {/* 📋 Section 1: Overview Specs */}
                        <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100/50 space-y-2.5 flex flex-col justify-center">
                            <p className="text-[16px] font-bold text-slate-600 uppercase tracking-wider mb-1">ຂໍ້ມູນທົ່ວໄປ</p>
                            <div className="flex justify-between items-center border-b border-slate-100/60 pb-1.5 text-sm">
                                <span className="text-slate-500">💥 ສິນຊັບ:</span>
                                <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-100">{strategy.symbol}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100/60 pb-1.5 text-sm">
                                <span className="text-slate-500">⚖️ ຄວາມສ່ຽງ/ກຳໄລ:</span>
                                <span className="font-bold text-slate-800">1:{strategy.rr_ratio}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100/60 pb-1.5 text-sm">
                                <span className="text-slate-500">⏱️ ກອບເວລາ:</span>
                                <span className="font-bold text-slate-800">{strategy.timeframe}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100/60 pb-1.5 text-sm">
                                <span className="text-slate-500">🏆 ຊະນະ/ແພ້:</span>
                                <span className="font-bold text-emerald-600">{strategy.win_count} <span className="text-slate-300 font-normal">/</span> <span className="text-rose-500">{strategy.loss_count}</span></span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-0.5">
                                <span className="text-slate-500">🔄 ລວມການເທຣດ:</span>
                                <span className="font-black text-slate-800 bg-slate-200/60 px-2.5 py-0.5 rounded-lg">{strategy.total_trades} ໄມ້</span>
                            </div>
                        </div>

                        {/* 💰 Section 2: PnL Performance */}
                        <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100/50 space-y-3 flex flex-col justify-center">
                            <p className="text-[16px] font-bold text-slate-600 uppercase tracking-wider mb-1">ປະສິດທິພາບຜົນກຳໄລ</p>
                            <div className="flex justify-between items-center border-b border-slate-100/60 pb-2 text-sm">
                                <span className="text-slate-500">ກຳໄລ:</span>
                                <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">{formatCapital(strategy.winnings)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100/60 pb-2 text-sm">
                                <span className="text-slate-500">ຂາດທຶນ:</span>
                                <span className="font-black text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-lg">{formatCapital(strategy.losses)}</span>
                            </div>
                            <div className="pt-1">
                                {/* 💡 ປ່ຽນສີພື້ນຫຼັງ ແລະ ສີ Border ໃຫ້ Dynamic ຕາມຜົນກຳໄລ */}
                                <div className={`p-3 rounded-xl flex justify-between items-center border ${Number(strategy.total_profit || 0) >= 0
                                    ? 'bg-emerald-50/50 border-emerald-100'
                                    : 'bg-rose-50/50 border-rose-100'
                                    }`}>
                                    <span className={`text-sm font-bold ${Number(strategy.total_profit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                        }`}>
                                        💵 ກຳໄລສຸດທິ (Net Profit):
                                    </span>

                                    {/* 💡 ປ່ຽນສີຕົວເລກ: ເປັນສີຂຽວ Emerald ເມື່ອເປັນບວກ ແລະ ສີແດງ Rose ເມື່ອເປັນລົບ */}
                                    <span className={`text-lg font-black ${Number(strategy.total_profit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                        {/* ຕື່ມເຄື່ອງໝາຍ + ທາງໜ້າຖ້າກຳໄລຫຼາຍກວ່າ 0 */}
                                        {Number(strategy.total_profit || 0) > 0 ? '+' : ''}
                                        {formatCapital(strategy.total_profit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ⚡ Form ບັນທຶກຜົນ Backtest ແບບແນວນອນ (ລຽນຢູ່ລຸ່ມສຸດ) */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-max">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                            <p className="text-sm font-bold text-slate-700 uppercase tracking-wider"> ບັນທຶກຜົນໄມ້ໃໝ່:</p>
                        </div>

                        <form onSubmit={handleUpdateTimespan} className="w-full flex flex-col sm:flex-row items-center gap-3">
                            {/* Dropdown ຝັ່ງການເທຣດ */}
                            <div className="w-full sm:w-48">
                                <select
                                    value={tradeAction}
                                    onChange={(e) => setTradeAction(e.target.value)}
                                    className="w-full bg-white border border-slate-200 text-sm font-bold px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#0a7067] transition cursor-pointer shadow-2xs text-slate-700"
                                    required >
                                    <option value="">-- ເລືອກ Action --</option>
                                    <option value="buy">🟢 Buy Order</option>
                                    <option value="sell">🔴 Sell Order</option>
                                </select>
                            </div>

                            {/* ກຸ່ມປຸ່ມກົດ Win / Loss */}
                            <div className="w-full flex items-center gap-3">
                                <button
                                    type="button" // 💡 ປ່ຽນເປັນ button ທໍາມະດາ ບໍ່ໃຫ້ມັນ auto-submit form
                                    disabled={isUpdating}
                                    onClick={(e) => handleSaveBacktestTrade(e, 'win')} // 💡 ສົ່ງ 'win' ໄປ
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-1 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/10 disabled:opacity-50"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    {isUpdating ? '⏳ ...' : 'ຊະນະ (Win)'}
                                </button>

                                <button
                                    type="button" // 💡 ປ່ຽนເປັນ button ທໍາມະດາ ບໍ່ໃຫ້ມັນ auto-submit form
                                    disabled={isUpdating}
                                    onClick={(e) => handleSaveBacktestTrade(e, 'loss')} // 💡 ສົ່ງ 'loss' ໄປ
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-1 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm shadow-rose-600/10 disabled:opacity-50"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    {isUpdating ? '⏳ ...' : 'ແພ້ (Loss)'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* ⚙️ ຟອມຈັດການໄລຍະເວລາ */}
                <div className="space-y-6 flex flex-col">

                    {/* 1. Card ຈັດການໄລຍະເວລາ */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex-1">
                        <div className="border-b border-slate-50 pb-3 flex items-center gap-2">
                            <p className="text-[15px] font-bold text-slate-700 tracking-tight">📅 ໄລຍະເວລາໃນການທົດສອບ</p>
                        </div>

                        <form onSubmit={handleUpdateTimespan} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">ວັນທີ່ເລີ່ມຕົ້ນ</label>
                                <input
                                    type="date"
                                    value={start_date}
                                    onChange={e => setStart_date(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#4f46e5] focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">ວັນທີ່ສຸດທ້າຍ</label>
                                <input
                                    type="date"
                                    value={end_date}
                                    onChange={e => setEnd_date(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#4f46e5] focus:bg-white transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                            >
                                {isUpdating ? '⏳ ...' : 'ອັບເດດຂໍ້ມູນວັນທີ'}
                            </button>
                        </form>
                    </div>

                    {/* 2. Card ຄຳອະທິບາຍກົນລະຍຸດ (Trading Notes Style - ຈັດວາງແຍກອອກມາຢ່າງສວຍງາມ) */}
                    {(strategy.description || strategy.descrition) && (
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex-1">
                            <span className="text-[15px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <i className="fa-solid fa-thumbtack text-amber-500"></i> ບັນທຶກ/ຄຳອະທິບາຍກົນລະຍຸດ
                            </span>
                            <div className="bg-white/80 border border-amber-100/30 p-3 rounded-xl">
                                <p className="text-sm font-semibold text-slate-600 leading-relaxed break-words whitespace-pre-line">
                                    {strategy.description || strategy.descrition}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* 💰 1. MODAL ສໍາລັບແກ້ໄຂເງິນທຶນ (Premium Glow Capital Modal) */}
            {isCapitalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCapitalModalOpen(false)}></div>
                    <form
                        onSubmit={(e) => handleUpdateCapitalOrRisk(e, 'capital')}
                        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5 animate-in zoom-in-95 duration-200"
                    >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">💵 ແກ້ໄຂເງິນທຶນເລີ່ມຕົ້ນ</h3>
                            <button type="button" onClick={() => setIsCapitalModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-xl transition">
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600">ຈຳນວນເງິນທຶນ ($) <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                placeholder="ຕົວຢ່າງ: 1500"
                                value={initial_capital}
                                onChange={(e) => handleNumberChange(e, setInitial_capital)}
                                className="w-full bg-slate-50 border border-slate-100 focus:border-[#0a7067] focus:bg-white text-sm font-bold px-4 py-3 rounded-xl focus:outline-none transition-all duration-300"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                            <button type="button" onClick={() => setIsCapitalModalOpen(false)} className="bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm font-bold px-4 py-2.5 rounded-xl transition">ຍົກເລີກ</button>
                            <button type="submit" disabled={isUpdating} className="bg-[#0a7067] hover:bg-[#085a53] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm shadow-[#0a7067]/20">
                                {isUpdating ? '⏳ ...' : 'ອັບເດດເງິນທຶນ'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 📉 2. MODAL ສໍາລັບແກ້ໄຂຄວາມສ່ຽງ (Premium Glow Risk Modal) */}
            {isRiskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsRiskModalOpen(false)}></div>
                    <form
                        onSubmit={(e) => handleUpdateCapitalOrRisk(e, 'risk')}
                        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5 animate-in zoom-in-95 duration-200"
                    >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">📉 ແກ້ໄຂອັດຕາສ່ວນຄວາມສ່ຽງ</h3>
                            <button type="button" onClick={() => setIsRiskModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-xl transition">
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600">ຄວາມສ່ຽງຕໍ່ໄມ້ (%) <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                placeholder="ຕົວຢ່າງ: 1 ຫຼື 2.5"
                                value={risk_percent}
                                onChange={(e) => handleNumberChange(e, setRisk_percent)}
                                className="w-full bg-slate-50 border border-slate-100 focus:border-[#0a7067] focus:bg-white text-sm font-bold px-4 py-3 rounded-xl focus:outline-none transition-all duration-300"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                            <button type="button" onClick={() => setIsRiskModalOpen(false)} className="bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm font-bold px-4 py-2.5 rounded-xl transition">ຍົກເລີກ</button>
                            <button type="submit" disabled={isUpdating} className="bg-[#0a7067] hover:bg-[#085a53] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm shadow-[#0a7067]/20">
                                {isUpdating ? '⏳ ...' : 'ອັບເດດຄວາມສ່ຽງ'}
                            </button>
                        </div>
                    </form>
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

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                    <p className="text-[16px] font-bold text-slate-800 tracking-tight">📅 ກາຟສະແດງການເຕີບໂຕຂອງຍອດເງິນ (Equity Curve)</p>
                </div>
                <div className="w-full h-80 mt-4">
                    {/* 💡 🔑 ປັບປຸງການເຊັກ: ດຶງຂໍ້ມູນມາເຊັກໃຫ້ຄົບທັງ 2 ຮູບແບບຊື່ ໃຫ້ຄືກັນກັບໃນຟັງຊັນ prepareChartData */}
                    {(!strategy?.backtest_trades && !strategy?.backtestTrades) ||
                        (strategy?.backtest_trades || strategy?.backtestTrades || []).length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <i className="fa-solid fa-chart-line text-2xl mb-2 text-indigo-300"></i>
                            <p className="text-xs font-bold">ຍັງບໍ່ມີຂໍ້ມູນການເທຣດເພື່ອສະແດງກາຟ</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                                {/* 💡 🔑 ແກ້ໄຂຈຸດນີ້: ປ່ຽນ dataKey ຈາກ "name" ມາເປັນ "label" ໃຫ້ກົງກັບ Object ທີ່ສົ່ງມາ */}
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />

                                {/* 🎯 Custom Tooltip */}
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-lg text-xs space-y-1 font-bold text-slate-700">
                                                    <p className="text-indigo-600">{data.label}</p>
                                                    <p>💰 ຍອດເງິນ: {formatCapital(data.balance)}</p>
                                                    {/* 📈 💡 ເພີ່ມບັນທັດນີ້ ເພື່ອໂຊ % ການເຕີບໂຕສະສົມຂອງພອດ */}
                                                    <p className={data.pnl_percent >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                                                        📈 ເຕີບໂຕ: {data.pnl_percent >= 0 ? '+' : ''}{formatPercent(data.pnl_percent)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />

                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

        </div>
    );
};

export default StrategyDetail;