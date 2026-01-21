import axios from 'axios';

// On Vercel, REACT_APP_BACKEND_URL is empty and API is served from same origin
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Campaign APIs
export const getCampaigns = async () => {
  const response = await api.get('/campaigns');
  return response.data;
};

export const getCampaign = async (campaignId) => {
  const response = await api.get(`/campaigns/${campaignId}`);
  return response.data;
};

export const getCampaignCharacters = async (campaignId) => {
  const response = await api.get(`/campaigns/${campaignId}/characters`);
  return response.data;
};

// Session APIs
export const startSession = async (campaignId, characterId) => {
  const response = await api.post(`/campaigns/${campaignId}/start`, {
    characterId,
  });
  return response.data;
};

export const getSession = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data;
};

export const submitAction = async (sessionId, action, actionType = 'custom') => {
  const response = await api.post(`/sessions/${sessionId}/action`, {
    action,
    actionType,
  });
  return response.data;
};

export const endSession = async (sessionId) => {
  const response = await api.delete(`/sessions/${sessionId}`);
  return response.data;
};

// Quest APIs
export const getQuests = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}/quests`);
  return response.data;
};

export const completeObjective = async (sessionId, questId, objectiveId) => {
  const response = await api.post(
    `/sessions/${sessionId}/quests/${questId}/objectives/${objectiveId}/complete`
  );
  return response.data;
};

// Anchor APIs
export const getAnchors = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}/anchors`);
  return response.data;
};

// Equipment APIs
export const equipItem = async (sessionId, itemId, slot) => {
  const response = await api.post(`/sessions/${sessionId}/character/equip`, {
    itemId,
    slot,
  });
  return response.data;
};

export const unequipItem = async (sessionId, slot) => {
  const response = await api.post(`/sessions/${sessionId}/character/unequip`, {
    slot,
  });
  return response.data;
};

// Journal APIs
export const addJournalEntry = async (sessionId, entry) => {
  const response = await api.post(`/sessions/${sessionId}/journal`, entry);
  return response.data;
};

export const updateJournalEntry = async (sessionId, entryId, updates) => {
  const response = await api.put(`/sessions/${sessionId}/journal/${entryId}`, updates);
  return response.data;
};

export const deleteJournalEntry = async (sessionId, entryId) => {
  const response = await api.delete(`/sessions/${sessionId}/journal/${entryId}`);
  return response.data;
};

export default api;
