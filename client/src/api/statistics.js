import client from './client';

export const getFullReport = (params) => client.get('/statistics/full-report', { params });
export const getAdvancedReport = (params) => client.get('/statistics/advanced-report', { params });
