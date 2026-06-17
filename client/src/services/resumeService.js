class ResumeService {
  async analyzeResume(file) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to analyze resume');
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error("Error analyzing resume:", error);
      throw error;
    }
  }
}

export default new ResumeService();