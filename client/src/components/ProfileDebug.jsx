import React, { useState } from 'react';
import profileService from '../services/profileService';

const ProfileDebug = () => {
  const [profileData, setProfileData] = useState({
    name: 'Test User',
    headline: 'Software Developer',
    bio: 'This is a test bio',
    location: 'Test City',
    profile_picture_url: '',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: [
      {
        title: 'Software Engineer',
        company: 'Test Company',
        start_date: '2020-01',
        end_date: '2022-12',
        description: 'Worked on various projects'
      }
    ],
    education: [
      {
        school: 'Test University',
        degree: 'BSc Computer Science',
        field: 'Computer Science',
        start_date: '2016-09',
        end_date: '2020-06'
      }
    ]
  });

  const handleUpdateProfile = async () => {
    try {
      console.log('Sending profile data:', profileData);
      // Replace with a valid user ID for testing
      const result = await profileService.updateProfile('test-user-id', profileData);
      console.log('Profile update result:', result);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Profile Debug</h2>
      <button onClick={handleUpdateProfile} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Test Profile Update
      </button>
      <div style={{ marginTop: '20px' }}>
        <h3>Profile Data Being Sent:</h3>
        <pre>{JSON.stringify(profileData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ProfileDebug;