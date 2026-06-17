import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import './App.css'
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import CareerAssessment from './components/CareerAssessment'
import RIASECAssessment from './components/RIASECAssessment'
import JobMarketplace from './components/JobMarketplace'
import CommunityFeed from './components/CommunityFeed'
import Connections from './components/Connections'
import Messaging from './components/Messaging'
import UserProfile from './components/UserProfile'
import OtherUserProfile from './components/OtherUserProfile'
import StudentDashboard from './components/StudentDashboard'
import TestTaskFunctionality from './components/TestTaskFunctionality'
import TaskHistory from './components/TaskHistory'
import Navbar from './components/Navbar'
import Resume from './components/Resume'

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Get initial page from hash or default to home
    const hash = window.location.hash.substring(1)
    return hash || 'home'
  })
  const { user, logout, loading, requiresAssessment } = useAuth()

  // Handle hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1)
      setCurrentPage(hash || 'home')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleLoginSuccess = (data) => {
    setCurrentPage('home')
    // Update hash to home
    window.location.hash = ''
    
    // For professional users, redirect directly to community feed
    if (data && data.user && data.user.role === 'professional') {
      window.location.hash = '#community'
    }
  }

  const handleAssessmentComplete = () => {
    setCurrentPage('dashboard')
    window.location.hash = ''
  }

  const handleProfileSetupComplete = () => {
    // Redirect professionals to community feed after profile setup
    if (user && user.role === 'professional') {
      window.location.hash = '#community'
    }
  }

  if (loading) {
    return <div className="app">Loading...</div>
  }

  // If user is logged in but hasn't completed the assessment and is a student, show the RIASEC assessment
  // Professionals don't take assessments
  if (user && requiresAssessment && user.role !== 'professional') {
    return (
      <div className="app">
        <Navbar />
        <main>
          <RIASECAssessment onCompletion={handleAssessmentComplete} />
        </main>
      </div>
    )
  }

  const renderPage = () => {
    // Check if we're viewing another user's profile (profile-userId format)
    if (currentPage.startsWith('profile-')) {
      const userId = currentPage.substring(8); // Extract userId after 'profile-'
      return <OtherUserProfile userId={userId} />;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />
      case 'register':
        return <RegisterPage />
      case 'assessment':
        // Only students can access career assessment
        if (user && user.role === 'professional') {
          return <CommunityFeed />;
        }
        return <RIASECAssessment onCompletion={handleAssessmentComplete} />
      case 'riasec-assessment':
        // Only students can access RIASEC assessment
        if (user && user.role === 'professional') {
          return <CommunityFeed />;
        }
        return <RIASECAssessment onCompletion={handleAssessmentComplete} />
      case 'jobs':
        return <JobMarketplace />
      case 'community':
        return <CommunityFeed />
      case 'connections':
        return <Connections />
      case 'messaging':
        return <Messaging />
      case 'profile':
        return <UserProfile />
      case 'resume':
        return <Resume />
      case 'test-tasks':
        return <TestTaskFunctionality />
      case 'task-history':
        // Only students can access task history
        if (user && user.role === 'professional') {
          return <CommunityFeed />;
        }
        return <TaskHistory />
      case 'dashboard':
        // Only students have dashboard
        if (user && user.role === 'professional') {
          return <CommunityFeed />;
        }
        return <StudentDashboard />
      case 'home':
      default:
        // If user is logged in, show appropriate home page based on role
        if (user) {
          // Professionals go directly to community feed
          if (user.role === 'professional') {
            return <CommunityFeed />
          } else {
            // Students go to dashboard
            return <StudentDashboard />
          }
        } else {
          return <HomePage user={user} onLogout={logout} />
        }
    }
  }

  // Show navbar on all pages except login and register when user is logged in
  const showNavbar = user && currentPage !== 'login' && currentPage !== 'register';

  return (
    <div className="app">
      {showNavbar && <Navbar />}
      <main>
        {renderPage()}
      </main>
    </div>
  )
}

export default App