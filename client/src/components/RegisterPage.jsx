import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const RegisterPage = () => {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validate inputs
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    try {
      const data = await register(formData)
      setSuccess(true)
      
      // Handle different redirection based on user role
      if (data.user.role === 'professional') {
        // For professionals, redirect to profile page for setup
        window.location.hash = '#profile'
      } else if (data.requiresAssessment) {
        // For students, redirect to assessment
        window.location.hash = '#riasec-assessment'
      } else {
        // Otherwise, redirect to login
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'student'
        })
      }
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="auth-card">
        <div className="auth-header text-center">
          <h5 className="auth-brand">
            <span className="brand-icon">📈</span>LevelUp
          </h5>
        </div>

        <h5 className="text-center mb-3 fw-semibold">Create Your Account</h5>
        <p className="text-center text-muted small mb-4">
          Join LevelUp to accelerate your career journey.
        </p>

        {success && (
          <div className="success-message">
            Registration successful! You can now log in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selection */}
          <div className="form-group mb-3">
            <label className="form-label fw-semibold">I am a...</label>
            <div className="role-selection">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                  className="role-radio"
                />
                <span className="role-label">Student</span>
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="professional"
                  checked={formData.role === 'professional'}
                  onChange={handleChange}
                  className="role-radio"
                />
                <span className="role-label">Professional</span>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          {/* Email */}
          <div className="form-group mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          {/* Password */}
          <div className="form-group mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Register Button */}
          <button type="submit" className="auth-button primary w-100" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <p className="text-center mt-3 small">
            Already have an account?{' '}
            <a href="#login" onClick={(e) => { e.preventDefault(); window.location.hash = '#login'; }} className="auth-link">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage