const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AI_SERVICE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:5001';

export const api = {
  // Feedback endpoints
  async getFeedback(status = 'pending') {
    const response = await fetch(`${API_BASE_URL}/api/feedback?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },

  async analyzeFeedback(teacherId) {
    const response = await fetch(`${API_BASE_URL}/api/analyze-feedback/${teacherId}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
  },

  async assignTraining(teacherId, feedbackId, adminId = 'admin-001') {
    const response = await fetch(`${AI_SERVICE_URL}/api/feedback-to-training`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacher_id: teacherId, feedback_id: feedbackId, admin_id: adminId })
    });
    if (!response.ok) throw new Error('Failed to assign training');
    return response.json();
  },

  // Dashboard stats
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/api/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Teachers endpoints
  async getTeachers() {
    const response = await fetch(`${API_BASE_URL}/api/teachers`);
    if (!response.ok) throw new Error('Failed to fetch teachers');
    return response.json();
  },

  // Training modules
  async getTrainingModules() {
    const response = await fetch(`${API_BASE_URL}/api/training-modules`);
    if (!response.ok) throw new Error('Failed to fetch modules');
    return response.json();
  }
};
