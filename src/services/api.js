import axios from 'axios';
const api = axios.create({
    baseURL: 'https://trades-journal.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});
export default api;