import axios from 'axios';

const ADMIN_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://drivesutrago-com-backend.onrender.com/api';

const adminApi = axios.create({
    baseURL: ADMIN_BASE_URL,
    withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function adminLogin(email, password) {
    const response = await adminApi.post('/admin/login', { email, password });
    return response.data;
}

export async function getAdminDashboard() {
    const response = await adminApi.get('/admin/dashboard');
    return response.data;
}

export async function getPendingTrips(page = 1, limit = 20, mode = '') {
    const response = await adminApi.get('/admin/trips/pending', {
        params: { page, limit, ...(mode && { mode }) }
    });
    return response.data;
}

export async function approveTrip(tripId, notes = '', adjustedEcoScore = null) {
    const response = await adminApi.post(`/admin/trips/${tripId}/approve`, {
        notes,
        ...(adjustedEcoScore && { adjustedEcoScore })
    });
    return response.data;
}

export async function rejectTrip(tripId, reason, notes = '') {
    const response = await adminApi.post(`/admin/trips/${tripId}/reject`, {
        reason,
        notes
    });
    return response.data;
}

export async function getAllUsers(page = 1, limit = 20, search = '') {
    const response = await adminApi.get('/admin/users', {
        params: { page, limit, ...(search && { search }) }
    });
    return response.data;
}

export default {
    adminLogin,
    getAdminDashboard,
    getPendingTrips,
    approveTrip,
    rejectTrip,
    getAllUsers
};
