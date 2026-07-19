import client from './client';

export const getPmtaCommands = (params) => client.get('/pmta/commands', { params });
export const createPmtaCommand = (data) => client.post('/pmta/commands', data);
export const getPmtaSchedules = (params) => client.get('/pmta/schedules', { params });
export const createPmtaSchedule = (data) => client.post('/pmta/schedules', data);
export const stopPmtaSchedule = (id) => client.put(`/pmta/schedules/${id}/stop`);
export const deletePmtaSchedule = (id) => client.delete(`/pmta/schedules/${id}`);
export const getPmtaTemplates = (params) => client.get('/pmta/templates', { params });
export const createPmtaTemplate = (data) => client.post('/pmta/templates', data);
export const updatePmtaTemplate = (id, data) => client.put(`/pmta/templates/${id}`, data);
export const deletePmtaTemplate = (id) => client.delete(`/pmta/templates/${id}`);
export const getPmtaVmtas = (params) => client.get('/pmta/vmtas', { params });
export const createPmtaVmta = (data) => client.post('/pmta/vmtas', data);
export const deletePmtaVmta = (id) => client.delete(`/pmta/vmtas/${id}`);
export const getPmtaServerNames = () => client.get('/pmta/server-names');
export const createPmtaVmtaRotation = (data) => client.post('/pmta/vmtas/create-rotation', data);
export const resetPmtaVmtas = (data) => client.post('/pmta/vmtas/reset', data);
