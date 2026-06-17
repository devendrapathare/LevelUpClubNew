import React, { useState } from "react";
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNavigation = (page) => {
    window.location.hash = `#${page}`;
  };

  const handleLogout = () => {
    logout();
    window.location.hash = '#login';
  };

  // For professional users, show a different set of navigation links
  const renderNavLinks = () => {
    if (user && user.role === 'professional') {
      // Professional-specific navigation
      return (
        <>
          <a href="#" className="text-primary fw-semibold" onClick={(e) => { e.preventDefault(); handleNavigation(''); }}>
            Home
          </a>
          <a href="#" className="text-dark" onClick={(e) => { e.preventDefault(); handleNavigation('connections'); }}>
            Network
          </a>
          <a href="#" className="text-dark" onClick={(e) => { e.preventDefault(); handleNavigation('messaging'); }}>
            Message
          </a>
          <a href="#" className="text-dark" onClick={(e) => { e.preventDefault(); handleNavigation('community'); }}>
            Community
          </a>
          {/* No Task History or Retest for professionals */}
        </>
      );
    } else {
      // Student-specific navigation (default)
      return (
        <>
          <a href="#" className="text-primary fw-semibold" onClick={(e) => { e.preventDefault(); handleNavigation(''); }}>
            Home
          </a>
          <a href="#" className="text-dark" onClick={(e) => { e.preventDefault(); handleNavigation('resume'); }}>
            Resume
          </a>
          <a href="#" className="text-dark" onClick={(e) => { e.preventDefault(); handleNavigation('connections'); }}>
            Network
          </a>
          <a href="#" className="text-dark" onClick={(e) => { e.preventDefault(); handleNavigation('messaging'); }}>
            Message
          </a>
          <a href="#" className="text-dark" onClick={(e) => { e.preventDefault(); handleNavigation('task-history'); }}>
            Task History
          </a>
          <a href="#" className="text-dark" onClick={(e) => { e.preventDefault(); handleNavigation('community'); }}>
            Community
          </a>
          <a
            href="#"
            className="text-dark"
            onClick={(e) => { e.preventDefault(); handleNavigation('assessment'); }}
          >
            Retest Career Assessment
          </a>
        </>
      );
    }
  };

  return (
    <div className="header-container">
      <div className="brand-section">
        <h4 className="brand-text">LevelUp</h4>
      </div>

      <div className="nav-links">
        {renderNavLinks()}
        
        {/* Profile Dropdown */}
        <div className="profile-dropdown">
          <img
            src={user?.profile_picture_url || "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"}
            alt="profile"
            width={40}
            height={40}
            className="rounded-circle"
            style={{ cursor: "pointer" }}
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <div className="profile-dropdown-menu">
              <p className="fw-bold mb-0">{user?.name}</p>
              <small className="text-muted d-block mb-2">{user?.email}</small>
              <hr className="my-2" />
              <button
                className="btn btn-outline-danger btn-sm w-100"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}