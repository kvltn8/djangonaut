import { api } from './client';

/** POST /api/chat/  { message } -> { answer }   (chatbot app; rate limited per visitor) */
export const sendChat = (message) => api('/api/chat/', { method: 'POST', body: { message }, auth: false });
