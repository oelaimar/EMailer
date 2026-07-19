import client from './client';

export const getTeams = (params) => client.get('/teams', { params });
export const getTeam = (id) => client.get(`/teams/${id}`);
export const createTeam = (data) => client.post('/teams', data);
export const updateTeam = (id, data) => client.put(`/teams/${id}`, data);
export const deleteTeam = (id) => client.delete(`/teams/${id}`);
export const bulkActionTeams = (action, ids) => client.post('/teams/bulk-action', { action, ids });
export const getTeamUsers = (id) => client.get(`/teams/${id}/users`);
export const setTeamUsers = (teamId, userIds) => client.post('/teams/users', { teamId, userIds });
export const getTeamAuthorizations = (id) => client.get(`/teams/${id}/authorizations`);
export const setTeamAuthorizations = (teamId, authorizations) => client.post('/teams/authorizations', { teamId, authorizations });
