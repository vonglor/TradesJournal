/**
 * 💵 Format ຕົວເລກການເງິນ/ເງິນທຶນ (Capital)
 * ຕົວຢ່າງ: 1500 -> 1,500.00
 */
export const formatCapital = (value) => {
    if (value === null || value === undefined || value === '') return '$0.00';
    
    return Number(value).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

/**
 * 📉 Format ເປີເຊັນຄວາມສ່ຽງ (Risk) ຫຼື ຕົວເລກທົ່ວໄປ
 * ຕົວຢ່າງ: 2.5 -> 2.50
 */
export const formatPercent = (value) => {
    if (value === null || value === undefined || value === '') return '0.00%';
    
    const formattedNumber = Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return `${formattedNumber}%`; // 💡 ຕື່ມ % ໃສ່ທາງທ້າຍໃຫ້ອັດຕະໂນມັດ
};