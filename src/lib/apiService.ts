import api from './api';

export const apiService = {
  // Auth APIs
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),

    register: (userData: { name: string; email: string; password: string }) =>
      api.post('/auth/register', userData),

    logout: () => api.post('/auth/logout'),

    getProfile: () => api.get('/auth/profile'),
  },

  // NeuronZ APIs
  neuronz: {
    getDueLines: () => api.get('/neuronz/due'),

    processLineSession: (data: { lineId: string; correctAnswers: number; totalQuizzes?: number; timeSpent?: number }) =>
      api.post('/neuronz/session', data),

    generateMicroQuizzes: (lineId: string) => api.get(`/neuronz/quizzes/${lineId}`),

    getMasteryProgress: () => api.get('/neuronz/mastery'),

    checkDailyLimit: () => api.get('/neuronz/limit'),

    resetLineLevel: (lineId: string) => api.put(`/neuronz/reset/${lineId}`),

    getLinesByLevel: (level: number, limit = 20) =>
      api.get(`/neuronz/level/${level}?limit=${limit}`),

    getLinesByChapter: (chapterId: string, subject?: string, ncertClass?: number) =>
      api.get('/neuronz/chapter', { params: { chapterId, subject, class: ncertClass } }),
  },

  // Questions APIs
  questions: {
    getQuestions: (filters?: any) => api.get('/questions', { params: filters }),

    getRandomQuestions: (filters: any) => api.post('/questions/random', filters),

    getPYQs: (filters: any) => api.get('/questions/pyq', { params: filters }),
  },

  // Chapters APIs
  chapters: {
    getChapters: (subject?: string) => api.get('/chapters', { params: { subject } }),

    getChapterById: (chapterId: string) => api.get(`/chapters/${chapterId}`),
  },

  // Mock Tests APIs
  mocks: {
    getMockTests: () => api.get('/mocks'),

    createMockTest: (data: any) => api.post('/mocks', data),

    submitMockTest: (mockId: string, answers: any) =>
      api.post(`/mocks/${mockId}/submit`, { answers }),
  },

  // Study Plan APIs
  studyPlan: {
    getStudyPlan: () => api.get('/study-plan'),

    createStudyPlan: (data: any) => api.post('/study-plan', data),

    updateProgress: (data: any) => api.put('/study-plan/progress', data),
  },

  // Sessions APIs
  sessions: {
    createSession: (data: any) => api.post('/sessions', data),

    getSessions: () => api.get('/sessions'),

    updateSession: (sessionId: string, data: any) =>
      api.put(`/sessions/${sessionId}`, data),
  },
};

export default apiService;