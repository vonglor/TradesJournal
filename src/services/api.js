import axios from 'axios';
const api = axios.create({
    baseURL: 'https://trades-journal.onrender.com/api',
});
export default api;