import client from './client';
export const getOutlookSendData = () => client.get('/outlook-accounts/send-process-data');
export const sendOutlook = (data) => client.post('/outlook-accounts/send', data);
export const getOutlookDrops = (params) => client.get('/outlook-accounts/drops', { params });
export const getOutlookTests = (params) => client.get('/outlook-accounts/tests', { params });
