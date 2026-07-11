/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ຈຸດນີ້ສຳຄັນຫຼາຍ! ມັນຄືການບອກໃຫ້ Tailwind ມາອ່ານ Style ໃນໄຟລ໌ .jsx ຂອງເຮົາ
  ],
  theme: {
    extend: {
      fontFamily: {
        // 🟢 ຕັ້ງຊື່ font ທີ່ຕ້ອງການ (ໃນໂຄດເຮົາໃຊ້ sans ແລະ display)
        sans: ['"Noto Sans Lao"', 'sans-serif'],
        display: ['"Outfit"', '"Noto Sans Lao"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}