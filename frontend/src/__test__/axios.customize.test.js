import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import apiClient, { 
  llmClient, 
  getErrorMessage, 
  checkServiceHealth,
  BACKEND_BASE_URL,
  LLM_SERVICE_BASE_URL 
} from '../api/axios.customize';

describe('Axios Configuration', () => {
  let mockBackend;
  let mockLLM;
  let mockAxios;
  let localStorageMock;
  
  beforeEach(() => {
    // Mock axios clients
    mockBackend = new MockAdapter(apiClient);
    mockLLM = new MockAdapter(llmClient);
    mockAxios = new MockAdapter(axios); // Mock global axios for refresh calls
    
    // Setup localStorage mock
    localStorageMock = {
      store: {},
      getItem(key) {
        return this.store[key] || null;
      },
      setItem(key, value) {
        this.store[key] = String(value);
      },
      removeItem(key) {
        delete this.store[key];
      },
      clear() {
        this.store = {};
      }
    };
    global.localStorage = localStorageMock;
    
    // Reset window.location
    delete window.location;
    window.location = { href: '' };
  });
  
  afterEach(() => {
    mockBackend.reset();
    mockLLM.reset();
    mockAxios.reset();
    localStorageMock.clear();
  });
  
  describe('API Client Configuration', () => {
    test('backend client should have correct baseURL', () => {
      expect(apiClient.defaults.baseURL).toBe(BACKEND_BASE_URL);
    });
    
    test('llm client should have correct baseURL', () => {
      expect(llmClient.defaults.baseURL).toBe(LLM_SERVICE_BASE_URL);
    });
    
    test('backend client should have withCredentials enabled', () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });
    
    test('llm client should have withCredentials disabled', () => {
      expect(llmClient.defaults.withCredentials).toBe(false);
    });
    
    test('backend client timeout should be 30s', () => {
      expect(apiClient.defaults.timeout).toBe(30000);
    });
    
    test('llm client timeout should be 3min', () => {
      expect(llmClient.defaults.timeout).toBe(180000);
    });
  });
  
  describe('Request Interceptor', () => {
    test('should add Authorization header when token exists', async () => {
      const token = 'test-token-123';
      localStorage.setItem('accessToken', token);
      
      mockBackend.onGet('/test').reply(200, { data: 'success' });
      
      await apiClient.get('/test');
      
      const request = mockBackend.history.get[0];
      expect(request.headers.Authorization).toBe(`Bearer ${token}`);
    });
    
    test('should not add Authorization header when token does not exist', async () => {
      mockBackend.onGet('/test').reply(200, { data: 'success' });
      
      await apiClient.get('/test');
      
      const request = mockBackend.history.get[0];
      expect(request.headers.Authorization).toBeUndefined();
    });
    
    test('should add X-Request-Id header to all requests', async () => {
      mockBackend.onGet('/test').reply(200, { data: 'success' });
      
      await apiClient.get('/test');
      
      const request = mockBackend.history.get[0];
      expect(request.headers['X-Request-Id']).toBeDefined();
      expect(typeof request.headers['X-Request-Id']).toBe('string');
    });
    
    test('X-Request-Id should be unique for each request', async () => {
      mockBackend.onGet('/test1').reply(200);
      mockBackend.onGet('/test2').reply(200);
      
      await apiClient.get('/test1');
      await apiClient.get('/test2');
      
      const requestId1 = mockBackend.history.get[0].headers['X-Request-Id'];
      const requestId2 = mockBackend.history.get[1].headers['X-Request-Id'];
      
      expect(requestId1).not.toBe(requestId2);
    });
  });
  
  describe('Token Refresh Flow', () => {
    test('should refresh token on 401 error', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      
      localStorage.setItem('accessToken', oldToken);
      
      // First request fails with 401
      mockBackend.onGet('/protected').replyOnce(401);
      
      // Mock axios.get for refresh (global axios, not apiClient)
      mockAxios.onGet(`${BACKEND_BASE_URL}/api/v1/auth/refresh`).reply(200, {
        data: { accessToken: newToken }
      });
      
      // Retry succeeds with new token
      mockBackend.onGet('/protected').reply(200, { data: 'success' });
      
      const response = await apiClient.get('/protected');
      
      expect(response.data.data).toBe('success');
      expect(localStorage.getItem('accessToken')).toBe(newToken);
    });
    
    test('should redirect to login when refresh fails', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      
      mockBackend.onGet('/protected').reply(401);
      mockAxios.onGet(`${BACKEND_BASE_URL}/api/v1/auth/refresh`).reply(401);
      
      try {
        await apiClient.get('/protected');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(window.location.href).toBe('/login');
      }
    });
    
    test('should not retry request twice', async () => {
      localStorage.setItem('accessToken', 'token');
      
      mockBackend.onGet('/protected').reply(401);
      mockAxios.onGet(`${BACKEND_BASE_URL}/api/v1/auth/refresh`).reply(401);
      
      try {
        await apiClient.get('/protected');
        expect.fail('Should have thrown error');
      } catch (error) {
        // Should only try refresh once
        const refreshCalls = mockAxios.history.get.filter(r => 
          r.url.includes('/api/v1/auth/refresh')
        );
        expect(refreshCalls.length).toBe(1);
      }
    });
  });
  
  describe('Queue Mechanism', () => {
    test('should queue multiple requests during token refresh', async () => {
      const newToken = 'new-token';
      localStorage.setItem('accessToken', 'old-token');
      
      // All requests initially fail
      mockBackend.onGet('/api1').replyOnce(401);
      mockBackend.onGet('/api2').replyOnce(401);
      mockBackend.onGet('/api3').replyOnce(401);
      
      // Mock refresh with delay
      mockAxios.onGet(`${BACKEND_BASE_URL}/api/v1/auth/refresh`).reply(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve([200, { data: { accessToken: newToken } }]);
          }, 50);
        });
      });
      
      // Retry succeeds
      mockBackend.onGet('/api1').reply(200, { data: 'result1' });
      mockBackend.onGet('/api2').reply(200, { data: 'result2' });
      mockBackend.onGet('/api3').reply(200, { data: 'result3' });
      
      // Send 3 requests in parallel
      const promises = [
        apiClient.get('/api1'),
        apiClient.get('/api2'),
        apiClient.get('/api3')
      ];
      
      const results = await Promise.all(promises);
      
      // All should succeed
      expect(results[0].data.data).toBe('result1');
      expect(results[1].data.data).toBe('result2');
      expect(results[2].data.data).toBe('result3');
      
      // Should only refresh once
      const refreshCalls = mockAxios.history.get.filter(r => 
        r.url.includes('/api/v1/auth/refresh')
      );
      expect(refreshCalls.length).toBe(1);
    });
  });
  
  describe('Error Message Helper', () => {
    test('should extract server error message', () => {
      const error = {
        isAxiosError: true,
        response: {
          data: { message: 'Custom server error' },
          status: 500
        }
      };
      
      const message = getErrorMessage(error);
      expect(message).toBe('Custom server error');
    });
    
    test('should use status code mapping when no server message', () => {
      const error = {
        response: { status: 404 }
      };
      
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      const message = getErrorMessage(error);
      expect(message).toBe('The requested resource was not found.');
      vi.restoreAllMocks();
    });
    
    test('should handle timeout error', () => {
      const error = {
        code: 'ECONNABORTED'
      };
      
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      const message = getErrorMessage(error);
      expect(message).toBe('Request timeout. Please try again.');
      vi.restoreAllMocks();
    });
    
    test('should handle network error', () => {
      const error = {
        code: 'ERR_NETWORK'
      };
      
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      const message = getErrorMessage(error);
      expect(message).toBe('Network error. Please check your internet connection.');
      vi.restoreAllMocks();
    });
    
    test('should handle non-axios errors', () => {
      const error = new Error('Generic error');
      
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(false);
      const message = getErrorMessage(error);
      expect(message).toBe('Generic error');
      vi.restoreAllMocks();
    });
  });
  
  describe('Service Health Check', () => {
    test('should check backend health', async () => {
      mockBackend.onGet('/actuator/health').reply(200, { status: 'UP' });
      
      const isHealthy = await checkServiceHealth('backend');
      
      expect(isHealthy).toBe(true);
    });
    
    test('should check llm service health', async () => {
      mockLLM.onGet('/health').reply(200, { status: 'healthy' });
      
      const isHealthy = await checkServiceHealth('llm');
      
      expect(isHealthy).toBe(true);
    });
    
    test('should return false when service is down', async () => {
      mockBackend.onGet('/actuator/health').reply(500);
      
      const isHealthy = await checkServiceHealth('backend');
      
      expect(isHealthy).toBe(false);
    });
    
    test('should handle network timeout', async () => {
      mockBackend.onGet('/actuator/health').timeout();
      
      const isHealthy = await checkServiceHealth('backend');
      
      expect(isHealthy).toBe(false);
    });
  });
  
  describe('LLM Client', () => {
    test('should send requests to llm service', async () => {
      const token = 'user-token';
      localStorage.setItem('accessToken', token);
      
      mockLLM.onPost('/api/v1/chat').reply(200, { 
        response: 'AI response',
        sessionId: 'session-123'
      });
      
      const response = await llmClient.post('/api/v1/chat', {
        message: 'Hello AI'
      });
      
      expect(response.data.response).toBe('AI response');
      
      const request = mockLLM.history.post[0];
      expect(request.headers.Authorization).toBe(`Bearer ${token}`);
    });
    
    test('should handle llm 401 error with token refresh', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      
      localStorage.setItem('accessToken', oldToken);
      
      // LLM returns 401
      mockLLM.onPost('/api/v1/chat').replyOnce(401);
      
      // Mock refresh with global axios
      mockAxios.onGet(`${BACKEND_BASE_URL}/api/v1/auth/refresh`).reply(200, {
        data: { accessToken: newToken }
      });
      
      // Retry succeeds
      mockLLM.onPost('/api/v1/chat').reply(200, { response: 'Success' });
      
      const response = await llmClient.post('/api/v1/chat', { message: 'test' });
      
      expect(response.data.response).toBe('Success');
      expect(localStorage.getItem('accessToken')).toBe(newToken);
    });
  });
  
  describe('Integration Tests', () => {
    test('should handle mixed backend and llm requests', async () => {
      const token = 'token-123';
      localStorage.setItem('accessToken', token);
      
      mockBackend.onGet('/api/v1/exercises').reply(200, { data: ['Exercise 1'] });
      mockLLM.onPost('/api/v1/chat').reply(200, { response: 'AI reply' });
      
      const [backendRes, llmRes] = await Promise.all([
        apiClient.get('/api/v1/exercises'),
        llmClient.post('/api/v1/chat', { message: 'test' })
      ]);
      
      expect(backendRes.data.data).toEqual(['Exercise 1']);
      expect(llmRes.data.response).toBe('AI reply');
    });
  });
});
