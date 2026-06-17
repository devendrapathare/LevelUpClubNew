import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import communityService from '../services/communityService';
import resumeService from '../services/resumeService';

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    headline: '',
    bio: '',
    location: '',
    profile_picture_url: '',
    resume_url: '',
    skills: [],
    experience: [],
    education: []
  });
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [newEducation, setNewEducation] = useState({
    school: '',
    degree: '',
    field: '',
    start_date: '',
    end_date: ''
  });
  // State for managing delete options visibility
  const [showDeleteOptions, setShowDeleteOptions] = useState({});
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  
  // Ref for the resume section
  const resumeSectionRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const data = await profileService.getProfile(user.id);
          setProfileData({
            ...data,
            skills: data.skills || [],
            experience: data.experience || [],
            education: data.education || []
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (user) {
        setPostsLoading(true);
        try {
          const posts = await communityService.getUserPosts(user.id);
          setUserPosts(posts);
        } catch (error) {
          console.error("Error fetching user posts:", error);
        } finally {
          setPostsLoading(false);
        }
      }
    };

    fetchUserPosts();
  }, [user]);

  // Scroll to resume section when hash is #resume
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === 'resume' && resumeSectionRef.current) {
        resumeSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Check hash on initial load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        profile_picture_url: previewUrl
      }));

      // Upload the file to the server
      uploadProfilePicture(file);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Upload the resume to the server
      uploadResume(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to upload profile picture');
      }

      const data = await response.json();
      console.log('Profile picture uploaded:', data);
      
      // Update the profile data with the actual URL from the server
      setProfileData(prev => ({
        ...prev,
        profile_picture_url: data.profilePictureUrl
      }));
      
      // Refresh user data in context
      refreshUser();
      
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture. Please try again.");
    }
  };

  const uploadResume = async (file) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to upload resume');
      }

      const data = await response.json();
      console.log('Resume uploaded:', data);
      
      // Update the profile data with the resume URL from the server
      setProfileData(prev => ({
        ...prev,
        resume_url: data.resumeUrl
      }));
      
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Error uploading resume. Please try again.");
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company) {
      setProfileData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience, id: Date.now() }]
      }));
      setNewExperience({
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: ''
      });
    }
  };

  const handleRemoveExperience = (index) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleAddEducation = () => {
    if (newEducation.school && newEducation.degree) {
      setProfileData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation, id: Date.now() }]
      }));
      setNewEducation({
        school: '',
        degree: '',
        field: '',
        start_date: '',
        end_date: ''
      });
    }
  };

  const handleRemoveEducation = (index) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await profileService.updateProfile(user.id, profileData);
      alert(result.message);
      setIsEditing(false);
      // Refresh user data in context
      refreshUser();
      
      // For professional users, redirect to community feed after profile setup
      if (user && user.role === 'professional') {
        setTimeout(() => {
          window.location.hash = '#community';
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Function to handle delete post
  const handleDeletePost = async (postId) => {
    try {
      await communityService.deletePost(postId);
      // Remove the deleted post from the state
      setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      // Hide the delete options menu
      setShowDeleteOptions(prev => ({ ...prev, [postId]: false }));
      alert('Post deleted successfully!');
    } catch (error) {
      console.error("Error deleting post:", error);
      // Provide more specific error message to the user
      const errorMessage = error.message || "Error deleting post. Please try again.";
      alert(errorMessage);
    }
  };

  // Function to toggle delete options visibility
  const toggleDeleteOptions = (postId) => {
    setShowDeleteOptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAnalyzeResume = async () => {
    if (!profileData.resume_url) {
      alert('Please upload a resume first.');
      return;
    }

    try {
      setAnalyzingResume(true);
      
      // Get the resume file from the server
      const response = await fetch(`/api/upload/resume/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }
      
      const resumeBlob = await response.blob();
      const resumeFile = new File([resumeBlob], 'resume.pdf', { type: 'application/pdf' });
      
      // Analyze the resume
      const analysis = await resumeService.analyzeResume(resumeFile);
      setResumeAnalysis(analysis);
      
      alert('Resume analysis completed!');
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Error analyzing resume. Please try again.");
    } finally {
      setAnalyzingResume(false);
    }
  };

  if (loading) {
    return <div className="user-profile">Loading profile...</div>;
  }

  if (!user) {
    return <div className="user-profile">Please log in to view your profile.</div>;
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-content">
        <div className="user-profile-header">
          <img 
            src={profileData.profile_picture_url || "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"} 
            alt="Profile" 
            className="user-profile-avatar"
          />
          <div className="user-profile-info">
            <h1>{profileData.name}</h1>
            {profileData.headline && <p className="user-profile-headline">{profileData.headline}</p>}
            {profileData.location && <p className="user-profile-location">{profileData.location}</p>}
            <div className="user-profile-meta-info">
              <span className="user-profile-meta-tag">Level {user.level || 1}</span>
              <span className="user-profile-meta-tag">{user.selectedCareer || "Career not selected"}</span>
            </div>
            <p className="user-profile-member-since">Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <div className="user-profile-edit">
            <form onSubmit={handleSubmit}>
              <section className="user-profile-section">
                <h2>Profile Picture</h2>
                <div className="form-group">
                  <label htmlFor="profilePicture">Upload Profile Picture</label>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="form-input"
                  />
                  {(profileData.profile_picture_url && !profileData.profile_picture_url.startsWith('data:')) && (
                    <img 
                      src={profileData.profile_picture_url} 
                      alt="Current profile" 
                      className="user-profile-avatar-preview"
                      style={{ width: '100px', height: '100px', borderRadius: '50%', marginTop: '10px' }}
                    />
                  )}
                </div>
              </section>
              
              <section className="user-profile-section">
                <h2>About</h2>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                  className="form-textarea"
                />
              </section>

              <section className="user-profile-section">
                <h2>Skills</h2>
                <div className="skills-input">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="form-input"
                  />
                  <button type="button" onClick={handleAddSkill} className="btn btn-secondary">
                    Add
                  </button>
                </div>
                <div className="skills-list">
                  {profileData.skills.map((skill, index) => (
                    <span key={index} className="user-profile-skill-tag">{skill}</span>
                  ))}
                </div>
              </section>

              <section className="user-profile-section">
                <h2>Experience</h2>
                <div className="experience-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                        placeholder="Job Title"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                        placeholder="Company Name"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="text"
                        value={newExperience.start_date}
                        onChange={(e) => setNewExperience({...newExperience, start_date: e.target.value})}
                        placeholder="MM/YYYY"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="text"
                        value={newExperience.end_date}
                        onChange={(e) => setNewExperience({...newExperience, end_date: e.target.value})}
                        placeholder="MM/YYYY or Present"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                      rows="3"
                      placeholder="Describe your responsibilities and achievements..."
                      className="form-textarea"
                    />
                  </div>
                  <button type="button" onClick={handleAddExperience} className="btn btn-primary">
                    Add Experience
                  </button>
                </div>
                <div className="experience-list">
                  {profileData.experience.map((exp, index) => (
                    <div key={exp.id || index} className="experience-item">
                      <h3>{exp.title}</h3>
                      <p className="company">{exp.company}</p>
                      <p className="experience-dates">{exp.start_date} - {exp.end_date}</p>
                      <p className="description">{exp.description}</p>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveExperience(index)}
                        className="btn btn-secondary"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="user-profile-section">
                <h2>Education</h2>
                <div className="education-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>School</label>
                      <input
                        type="text"
                        value={newEducation.school}
                        onChange={(e) => setNewEducation({...newEducation, school: e.target.value})}
                        placeholder="School Name"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Degree</label>
                      <input
                        type="text"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                        placeholder="Degree"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Field of Study</label>
                      <input
                        type="text"
                        value={newEducation.field}
                        onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}
                        placeholder="Field of Study"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="text"
                        value={newEducation.start_date}
                        onChange={(e) => setNewEducation({...newEducation, start_date: e.target.value})}
                        placeholder="MM/YYYY"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="text"
                        value={newEducation.end_date}
                        onChange={(e) => setNewEducation({...newEducation, end_date: e.target.value})}
                        placeholder="MM/YYYY or Present"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <button type="button" onClick={handleAddEducation} className="btn btn-primary">
                    Add Education
                  </button>
                </div>
                <div className="education-list">
                  {profileData.education.map((edu, index) => (
                    <div key={edu.id || index} className="education-item">
                      <h3>{edu.school}</h3>
                      <p className="degree">{edu.degree} in {edu.field}</p>
                      <p className="experience-dates">{edu.start_date} - {edu.end_date}</p>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveEducation(index)}
                        className="btn btn-secondary"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="user-profile-section" ref={resumeSectionRef}>
                <h2>Resume</h2>
                <div className="form-group">
                  <label htmlFor="resume">Upload Resume (PDF only)</label>
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeChange}
                    className="form-input"
                  />
                  {profileData.resume_url && (
                    <div className="resume-preview">
                      <p>Resume uploaded successfully!</p>
                      <button href={profileData.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        View Resume
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        ) : (
          <div className="user-profile-view">
            <section className="user-profile-section">
              <h2>About</h2>
              {profileData.bio ? (
                <p className="user-profile-bio-text">{profileData.bio}</p>
              ) : (
                <p className="placeholder">No bio added yet.</p>
              )}
            </section>

            <section className="user-profile-section">
              <h2>Skills</h2>
              {profileData.skills && profileData.skills.length > 0 ? (
                <div className="skills-list">
                  {profileData.skills.map((skill, index) => (
                    <span key={index} className="user-profile-skill-tag">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="placeholder">No skills added yet.</p>
              )}
            </section>

            <section className="user-profile-section">
              <h2>Experience</h2>
              {profileData.experience && profileData.experience.length > 0 ? (
                <div className="experience-list">
                  {profileData.experience.map((exp, index) => (
                    <div key={exp.id || index} className="experience-item">
                      <h3>{exp.title}</h3>
                      <p className="company">{exp.company}</p>
                      <p className="experience-dates">{exp.start_date} - {exp.end_date}</p>
                      <p className="description">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="placeholder">No experience added yet.</p>
              )}
            </section>

            <section className="user-profile-section">
              <h2>Education</h2>
              {profileData.education && profileData.education.length > 0 ? (
                <div className="education-list">
                  {profileData.education.map((edu, index) => (
                    <div key={edu.id || index} className="education-item">
                      <h3>{edu.school}</h3>
                      <p className="degree">{edu.degree} in {edu.field}</p>
                      <p className="experience-dates">{edu.start_date} - {edu.end_date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="placeholder">No education added yet.</p>
              )}
            </section>

            <section className="user-profile-section" ref={resumeSectionRef}>
              <h2>Resume</h2>
              {profileData.resume_url ? (
                <div className="resume-view">
                  <button href={`/api/upload/resume/${user.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    View Resume
                  </button>
                  <button 
                    onClick={handleAnalyzeResume} 
                    className="btn btn-secondary"
                    disabled={analyzingResume}
                  >
                    {analyzingResume ? 'Analyzing...' : 'Analyze Resume'}
                  </button>
                  
                  {resumeAnalysis && (
                    <div className="resume-analysis">
                      <h3>Resume Analysis Results</h3>
                      
                      {resumeAnalysis.metadata && (
                        <div className="analysis-metadata">
                          <span className={`badge ${resumeAnalysis.metadata.source === 'AI' ? 'badge-ai' : 'badge-mock'}`}>
                            {resumeAnalysis.metadata.source === 'AI' ? '✨ AI-Powered Analysis' : 'Sample Analysis'}
                          </span>
                          {resumeAnalysis.metadata.career && (
                            <span className="career-badge">Career: {resumeAnalysis.metadata.career}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="analysis-section">
                        <h4>Relevance Score: {resumeAnalysis.relevance_score}/100</h4>
                      </div>
                      
                      <div className="analysis-section">
                        <h4>Improvement Suggestions</h4>
                        <ul>
                          {resumeAnalysis.improvements.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="analysis-section">
                        <h4>General Recommendations</h4>
                        <ul>
                          {resumeAnalysis.recommendations.map((recommendation, index) => (
                            <li key={index}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="placeholder">No resume uploaded yet.</p>
              )}
            </section>

            <section className="user-profile-section">
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
                        {/* Delete options button - only visible for own posts */}
                        {user && user.id === post.user.id && (
                          <div className="post-options">
                            <button 
                              className="post-options-btn"
                              onClick={() => toggleDeleteOptions(post.id)}
                            >
                              ⋮
                            </button>
                            {showDeleteOptions[post.id] && (
                              <div className="delete-options-menu">
                                <button 
                                  className="delete-post-btn"
                                  onClick={() => handleDeletePost(post.id)}
                                >
                                  Delete Post
                                </button>
                              </div>
                            )}
                          </div>
                        )}
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
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;