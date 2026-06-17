import React, { useState, useEffect } from 'react'
import Dashboard from './Dashboard'
import StudentDashboard from './StudentDashboard'
import CommunityFeed from './CommunityFeed'

const HomePage = ({ user, onLogout }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const features = [
    {
      title: " Gamified Learning",
      description: "Turn your professional development into a fun journey. Complete tasks, earn XP, and level up your skills."
    },
    {
      title: " AI-Powered Guidance",
      description: "Take our smart assessment and get personalized career recommendations based on your strengths and interests."
    },
    {
      title: " Networking Access",
      description: "Connect with professionals, mentors, and peers to grow your network and opportunities."
    }
  ];

  const handleNavigation = (page) => {
    window.location.hash = `#${page}`;
  };

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page min-h-screen bg-gray-50"> 
      {user ? (
        // ... (User Dashboard content remains the same)
        <div className="linkedin-layout">
          <div className="container mx-auto">
            <div className="main-content">
              {/* Assuming StudentDashboard and CommunityFeed are defined */}
              {/* {user.role === 'student' ? <StudentDashboard /> : <CommunityFeed />} */}
            </div>
          </div>
        </div>
      ) : (
        <div className="landing-page min-h-screen flex flex-col">
          {/* Navbar */}
          <nav className="navbar" style={{
            backgroundColor: '#2c3e50',
            padding: '1rem',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <div className="container navbar-container" style={{
              maxWidth: '1600px',
              width: '100%',
              margin: '0 auto',
              padding: '0 40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <a href="#" className="nav-brand" style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center'
              }} onClick={(e) => {
                e.preventDefault();
                handleNavigation('');
              }}>
                <span className="brand-icon" style={{
                  fontSize: '1.5rem',
                  marginRight: '0.5rem'
                }}>📈</span> LevelUp
              </a>
              <div className="nav-links" style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <button 
                  className="nav-button login-button" style={{
                    backgroundColor: '#1e88e5',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                  onClick={() => handleNavigation('login')}
                >
                  Log In
                </button>
                <button 
                  className="nav-button signup-button" style={{
                    backgroundColor: '#1e88e5',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleNavigation('register')}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="hero-section" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#fff',
            padding: '2rem'
          }}>
            {/* Text Content */}
            <div className="hero-text-content" style={{
              width: '50%',
              textAlign: 'center'
            }}>
              <h1 className="hero-title" style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '1rem'
              }}>
                Level Up Your Career <span className="hero-emoji">🚀</span>
              </h1>
              <p className="hero-description" style={{
                fontSize: '1.5rem',
                color: '#666',
                marginBottom: '2rem'
              }}>
                <b className="highlight-text" style={{
                  color: '#1e88e5'
                }}>LevelUp</b> is an AI-powered platform that transforms career
                development into an exciting adventure. Complete AI tasks, earn XP,
                and connect with professionals to unlock your dream job.
              </p>
              <div className="hero-cta-buttons" style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <button
                  className="cta-button primary-button" style={{
                    flex: '1',
                    minWidth: '200px',
                    backgroundColor: '#1e88e5',
                    color: '#fff',
                    padding: '1rem 2rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleNavigation('register')}
                >
                  Get Started as a Student
                </button>
                <button
                  className="cta-button secondary-button" style={{
                    flex: '1',
                    minWidth: '200px',
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    padding: '1rem 2rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleNavigation('register-professional')}
                >
                  I'm a Professional
                </button>
              </div>
            </div>
            
            {/* Image */}
            <div className="hero-image-container" style={{
              width: '50%',
              textAlign: 'center'
            }}>
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80"
                alt="career growth"
                className="hero-image" style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '1rem'
                }}
              />
            </div>
          </div>

          {/* Features Carousel Section */}
          <div className="features-section" style={{
            padding: '2rem',
            backgroundColor: '#f7f7f7',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h2 className="section-title" style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '1rem'
            }}>
              A Smarter Way to Build Your Future
            </h2>
            <p className="section-description" style={{
              fontSize: '1.5rem',
              color: '#666',
              marginBottom: '2rem'
            }}>
              Our platform gives you everything you need to explore your career path
              and grow with confidence.
            </p>

            {/* Carousel Container */}
            <div className="feature-carousel-container" style={{
              maxWidth: '800px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* Feature Card */}
              <div className="feature-card" style={{
                backgroundColor: '#fff',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                <h3 className="feature-title" style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '1rem'
                }}>
                  {features[currentFeature].title}
                </h3>
                <p className="feature-description" style={{
                  fontSize: '1rem',
                  color: '#666',
                  marginBottom: '2rem'
                }}>
                  {features[currentFeature].description}
                </p>
                <div className="feature-indicators" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`feature-indicator ${index === currentFeature ? 'active' : ''}`} style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: index === currentFeature ? '#333' : '#ccc',
                        margin: '0 5px',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* All-in-One section */}
          <div className="all-in-one-section" style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            marginBottom: '0'
          }}>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2d3748',
              marginBottom: '1rem'
            }}>All-in-One AI Career Platform</h3>
            <p style={{
              fontSize: '1.25rem',
              color: '#4a5568',
              maxWidth: '800px',
              margin: '0 auto'
            }}>Everything you need to level up your career in one place</p>
          </div>

          {/* Main Feature Cards Grid */}
          <div className="features-grid" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem'
          }}>
            {/* AI Career Assessment */}
            <div className="feature-card" style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <span className="feature-card-title" style={{
                color: '#333',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}> AI Career Assessment</span>
              <p className="feature-card-subtitle" style={{
                color: '#666',
                fontSize: '1rem'
              }}>Personalized pathfinding</p>
            </div>
            
            {/* Gamified Learning */}
            <div className="feature-card" style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <span className="feature-card-title" style={{
                color: '#333',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}> Gamified Learning</span>
              <p className="feature-card-subtitle" style={{
                color: '#666',
                fontSize: '1rem'
              }}>XP, levels, and badges</p>
            </div>
            
            {/* Networking */}
            <div className="feature-card" style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <span className="feature-card-title" style={{
                color: '#333',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}> Networking</span>
              <p className="feature-card-subtitle" style={{
                color: '#666',
                fontSize: '1rem'
              }}>Connect with mentors</p>
            </div>
            
            {/* Resume Builder */}
            <div className="feature-card" style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <span className="feature-card-title" style={{
                color: '#333',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}> Resume Builder</span>
              <p className="feature-card-subtitle" style={{
                color: '#666',
                fontSize: '1rem'
              }}>ATS-optimized templates</p>
            </div>
          </div>
            
          {/* Center CTA */}
          <div className="center-cta" style={{
            padding: '3rem',
            textAlign: 'center'
          }}>
            <button
              className="main-cta-button"
              style={{
                backgroundColor: '#1e88e5',
                color: '#fff',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => handleNavigation('register')}
            >
              Start Your Journey Now
            </button>
          </div>

          
          {/* Footer */}
          <footer className="footer">
            <div className="container">
              <p className="copyright">
                2025 LevelUp. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default HomePage;