import client from './client';

export const getOffers = (params) => client.get('/offers', { params });
export const getOffer = (id) => client.get(`/offers/${id}`);
export const createOffer = (data) => client.post('/offers', data);
export const updateOffer = (id, data) => client.put(`/offers/${id}`, data);
export const deleteOffer = (id) => client.delete(`/offers/${id}`);
export const bulkActionOffers = (action, ids) => client.post('/offers/bulk-action', { action, ids });
export const getOfferSuppressions = (id) => client.get(`/offers/${id}/suppression`);
export const addOfferSuppression = (id, data) => client.post(`/offers/${id}/suppression`, data);
export const deleteOfferSuppression = (offerId, suppressionId) => client.delete(`/offers/${offerId}/suppression/${suppressionId}`);
