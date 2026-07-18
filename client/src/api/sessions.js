import client from './client';

export const getSessions = (params) => client.get('/sessions', { params });
export const forceDisconnectSessions = (sessionIds) => client.post('/sessions/force-disconnect', { sessionIds });
