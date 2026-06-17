import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = ({ onLoginSuccess }) => {
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password.')
      setLoading(false)
      return
    }

    try {
      const data = await login(email, password)
      // For professional users, redirect directly to community feed
      if (data.user && data.user.role === 'professional') {
        window.location.hash = '#community'
      } else {
        onLoginSuccess(data) // Pass the entire data object, not just data.user
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-header text-center">
          <h5 className="auth-brand">
            <span className="brand-icon">📈</span>LevelUp
          </h5>
        </div>

        <h5 className="text-center mb-3 fw-semibold">Welcome Back!</h5>
        <p className="text-center text-muted small mb-4">
          Enter your credentials to log into your account.
        </p>

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
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                  className="role-radio"
                />
                <span className="role-label">Student</span>
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="professional"
                  checked={role === 'professional'}
                  onChange={(e) => setRole(e.target.value)}
                  className="role-radio"
                />
                <span className="role-label">Professional</span>
              </label>
            </div>
          </div>

          {/* Email */}
          <div className="form-group mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>

          {/* Password */}
          <div className="form-group mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Login Button */}
          <button type="submit" className="auth-button primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p className="text-center mt-3 small">
            Don't have an account?{' '}
            <a href="#register" onClick={(e) => { e.preventDefault(); window.location.hash = '#register'; }} className="auth-link">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage