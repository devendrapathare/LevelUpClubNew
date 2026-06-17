const API_BASE_URL = '/api'

class ApiService {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    return data
  }

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    return data
  }

  async getCurrentUser() {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user')
    }

    return data
  }

  async getUser(userId) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user')
    }

    return data.user
  }

  async updateUser(userId, userData) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user')
    }

    return data
  }

  async addXP(userId, xp) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/xp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ xp }),
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update XP')
    }

    return data
  }

  async getUserTasks(userId) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/tasks/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks')
    }

    return data.tasks
  }

  async submitTask(taskId, fileUrl) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ file_url: fileUrl }),
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit task')
    }

    return data
  }

  async getTaskHistory(userId) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/tasks/history/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch task history')
    }

    return data.taskHistory
  }

  async getConnections(userId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/connections/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch connections');
    }

    return data;
  }

  async searchUsers(query) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/users?name=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to search users');
    }

    return data;
  }

  async sendConnectionRequest(receiverId) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/connections/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ receiver_id: receiverId }),
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send connection request')
    }

    return data
  }

  async acceptConnectionRequest(requestId) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/connections/${requestId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to accept connection request')
    }

    return data
  }

  async rejectConnectionRequest(requestId) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/connections/${requestId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject connection request')
    }

    return data
  }

  // Assessment API methods
  async getRIASECQuestions() {
    const response = await fetch(`${API_BASE_URL}/assessments/riasec/questions`)
    
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch assessment questions')
    }

    return data.questions
  }

  async submitRIASECAnswers(answers) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await fetch(`${API_BASE_URL}/assessments/riasec/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ answers }),
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit assessment')
    }

    return data
  }

  async selectCareer(careerId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/assessments/riasec/select-career`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ careerId }),
    });

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to select career');
    }

    return data;
  }
}

export default new ApiService()