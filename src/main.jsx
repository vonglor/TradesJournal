import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- ນຳເຂົ້າຕົວນີ້
import App from './App.jsx'
import './index.css' // <--- ຕ້ອງມີແຖວນີ້ ເພື່ອດຶງ Tailwind CSS ເຂົ້າມາໃນລະບົບ!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
   
  </React.StrictMode>,
)