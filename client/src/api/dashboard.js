import client from './client';

export const getDashboardStats = () => client.get('/dashboard/stats');
export const getDashboardCharts = () => client.get('/dashboard/charts');
