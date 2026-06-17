import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requiresAssessment, setRequiresAssessment] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      console.log('Initializing auth with token:', !!token)
      if (token) {
        try {
          // Check if user requires assessment
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('User data from /api/auth/me:', data)
            setUser({
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              level: data.level,
              xp: data.xp,
              selectedCareer: data.selectedCareer,
              profile_picture_url: data.profile_picture_url
            });
            setRequiresAssessment(data.requiresAssessment || false);
          } else {
            console.error('Failed to fetch user data:', response.status)
            // Token is invalid, remove it
            localStorage.removeItem('token')
          }
        } catch (err) {
          console.error('Error initializing auth:', err)
          // Token is invalid, remove it
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password)
      if (data.token) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        setRequiresAssessment(data.requiresAssessment || false)
      }
      return data
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const data = await api.register(userData)
      if (data.token) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        // Professionals don't require assessment
        if (data.user.role === 'professional') {
          setRequiresAssessment(false)
        } else {
          setRequiresAssessment(data.requiresAssessment || true)
        }
      }
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setRequiresAssessment(false)
  }

  const refreshUser = async () => {
    if (user) {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Refreshed user data:', data)
            setUser({
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              level: data.level,
              xp: data.xp,
              selectedCareer: data.selectedCareer,
              profile_picture_url: data.profile_picture_url
            });
            setRequiresAssessment(data.requiresAssessment || false);
          }
        }
      } catch (err) {
        console.error('Failed to refresh user data:', err)
      }
    }
  }

  const completeAssessment = () => {
    setRequiresAssessment(false)
    // Refresh user data to get the selected career
    refreshUser()
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    refreshUser,
    requiresAssessment,
    completeAssessment
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export default AuthProvider