import axios from 'axios';

export const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
