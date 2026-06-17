import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import communityService from '../services/communityService';

const OtherUserProfile = ({ userId }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        try {
          const data = await profileService.getProfile(userId);
          setProfileData(data);
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      if (userId) {
        setPostsLoading(true);
        try {
          console.log("Fetching posts for user ID:", userId);
          const posts = await communityService.getUserPosts(userId);
          console.log("Posts fetched:", posts);
          setUserPosts(posts);
        } catch (error) {
          console.error("Error fetching user posts:", error);
        } finally {
          setPostsLoading(false);
        }
      }
    };

    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="user-profile">Loading profile...</div>;
  }

  if (!profileData) {
    return <div className="user-profile">User profile not found.</div>;
  }

  // If user is viewing their own profile, redirect to their profile page
  if (user && user.id === userId) {
    window.location.hash = '#profile';
    return <div className="user-profile">Redirecting to your profile...</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-picture-container">
          <img 
            src={profileData.profile_picture_url || "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"} 
            alt="Profile" 
            className="avatar-large"
          />
        </div>
        <div className="profile-info">
          <h1>{profileData.name}</h1>
          {profileData.headline && <p className="headline">{profileData.headline}</p>}
          {profileData.location && <p className="location">{profileData.location}</p>}
          <div className="profile-meta">
            <span className="role">{profileData.role}</span>
          </div>
        </div>
        {/* No edit button for other users' profiles */}
      </div>

      <div className="profile-view">
        <div className="profile-section">
          <h2>About</h2>
          {profileData.bio ? (
            <p className="bio-text">{profileData.bio}</p>
          ) : (
            <p className="placeholder">No bio added yet.</p>
          )}
        </div>

        <div className="profile-section">
          <h2>Skills</h2>
          {profileData.skills && profileData.skills.length > 0 ? (
            <div className="skills-list">
              {profileData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="placeholder">No skills added yet.</p>
          )}
        </div>

        <div className="profile-section">
          <h2>Experience</h2>
          {profileData.experience && profileData.experience.length > 0 ? (
            <div className="experience-list">
              {profileData.experience.map((exp, index) => (
                <div key={exp.id || index} className="experience-item">
                  <h3>{exp.title}</h3>
                  <p className="company">{exp.company}</p>
                  <p className="dates">{exp.start_date} - {exp.end_date}</p>
                  <p className="description">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="placeholder">No experience added yet.</p>
          )}
        </div>

        <div className="profile-section">
          <h2>Education</h2>
          {profileData.education && profileData.education.length > 0 ? (
            <div className="education-list">
              {profileData.education.map((edu, index) => (
                <div key={edu.id || index} className="education-item">
                  <h3>{edu.school}</h3>
                  <p className="degree">{edu.degree} in {edu.field}</p>
                  <p className="dates">{edu.start_date} - {edu.end_date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="placeholder">No education added yet.</p>
          )}
        </div>

        <div className="profile-section">
          <h2>Posts</h2>
          {postsLoading ? (
            <p>Loading posts...</p>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="posts-list">
              {userPosts.map(post => (
                <div key={post.id} className="post-item">
                  <div className="post-header">
                    <img 
                      src={post.user.profile_picture_url || "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"} 
                      alt="Profile" 
                      className="post-avatar"
                    />
                    <div className="post-user-info">
                      <h4>{post.user.name}</h4>
                      <p className="post-date">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>{post.content}</p>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="post-media">
                        {post.media_urls.map((url, index) => (
                          <img key={index} src={url} alt="Post media" className="post-image" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="post-stats">
                    <span>{post.likes} likes</span>
                    <span>{post.comments.length} comments</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="placeholder">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherUserProfile;