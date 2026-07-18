import client from './client';

export const getAffiliateNetworks = (params) => client.get('/affiliate-networks', { params });
export const getAffiliateNetwork = (id) => client.get(`/affiliate-networks/${id}`);
export const createAffiliateNetwork = (data) => client.post('/affiliate-networks', data);
export const updateAffiliateNetwork = (id, data) => client.put(`/affiliate-networks/${id}`, data);
export const deleteAffiliateNetwork = (id) => client.delete(`/affiliate-networks/${id}`);
export const bulkActionAffiliateNetworks = (action, ids) => client.post('/affiliate-networks/bulk-action', { action, ids });
