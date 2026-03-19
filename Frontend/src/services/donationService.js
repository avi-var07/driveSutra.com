import api from './api';

// Donate carbon credits for tree planting
export async function donateForTrees(creditsToSpend, message = '') {
    const response = await api.post('/donations/tree', { creditsToSpend, message });
    return response.data;
}

// Get user's donation history
export async function getDonationHistory() {
    const response = await api.get('/donations/history');
    return response.data;
}

// Get all donations (public tree wall)
export async function getTreePlantingWall() {
    const response = await api.get('/donations/wall');
    return response.data;
}

export default { donateForTrees, getDonationHistory, getTreePlantingWall };
