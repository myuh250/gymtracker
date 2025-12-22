import { llmClient, getErrorMessage } from '../api/axios.customize';

/**
 * Chat Service - LLM API Integration
 * 
 * Handles all chat-related API calls to LLM service
 * Architecture: Frontend -> LLM Service -> Backend (for RAG data)
 */

// ====================================
// Mock User Configuration (Temporary)
// ====================================
// TODO: Remove when login is implemented
const MOCK_USER_ID = 2;

const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    // Generate UUID v4
    sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
};

const createChatHeaders = (sessionId) => {
  return {
    'X-Session-ID': sessionId,
    'X-User-ID': MOCK_USER_ID.toString(), // TODO: Get from auth context when login is ready
  };
};

// ====================================
// API Functions
// ====================================

export const sendMessage = async (message) => {
  try {
    const sessionId = getOrCreateSessionId();
    
    const response = await llmClient.post(
      '/api/v1/chat/',
      { message },
      { headers: createChatHeaders(sessionId) }
    );

    // Update session ID if backend returns a new one
    if (response.data.session_id) {
      localStorage.setItem('chatSessionId', response.data.session_id);
    }

    return response.data;
  } catch (error) {
    console.error('❌ Send message failed:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const getChatHistory = async (limit = 50) => {
  try {
    const sessionId = getOrCreateSessionId();
    
    const response = await llmClient.get(
      '/api/v1/chat/history',
      { 
        params: { limit },
        headers: createChatHeaders(sessionId)
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Get history failed:', error);
    // Return empty history on error (graceful degradation)
    return {
      session_id: getOrCreateSessionId(),
      message_count: 0,
      messages: []
    };
  }
};

export const deleteSession = async () => {
  try {
    const sessionId = getOrCreateSessionId();
    
    await llmClient.delete(
      '/api/v1/chat/session',
      { headers: createChatHeaders(sessionId) }
    );

    // Clear old session and create new one
    localStorage.removeItem('chatSessionId');
    const newSessionId = getOrCreateSessionId();
    
    return newSessionId;
  } catch (error) {
    console.error('❌ Delete session failed:', error);
    // If delete fails, still create new session locally
    localStorage.removeItem('chatSessionId');
    return getOrCreateSessionId();
  }
};


export const checkLLMHealth = async () => {
  try {
    await llmClient.get('/health', { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('❌ LLM service health check failed:', error);
    return false;
  }
};

export const getCurrentSessionId = () => {
  return localStorage.getItem('chatSessionId');
};
