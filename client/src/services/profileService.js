class ProfileService {
  async getProfile(userId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch user profile
      const userResponse = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.msg || 'Failed to fetch user profile');
      }

      const userData = await userResponse.json();
      
      // Transform the data to match the expected format
      const userProfile = {
        id: userData.user.id,
        name: userData.user.name,
        email: userData.user.email,
        role: userData.user.role,
        headline: userData.user.headline || '',
        bio: userData.user.bio || '',
        location: userData.user.location || '',
        profile_picture_url: userData.user.profile_picture_data ? `/api/users/${userId}/profile-picture` : '',
        resume_url: '',
        skills: [],
        experience: [],
        education: []
      };

      // Include extended profile data if available
      if (userData.user.profile) {
        userProfile.skills = userData.user.profile.skills || [];
        userProfile.experience = userData.user.profile.experience || [];
        userProfile.education = userData.user.profile.education || [];
        userProfile.resume_url = userData.user.profile.resume_url || '';
      }

      return userProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  async updateProfile(userId, profileData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update user profile with extended data (excluding profile_picture_url since it's handled separately)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          headline: profileData.headline,
          bio: profileData.bio,
          location: profileData.location,
          skills: profileData.skills,
          experience: profileData.experience,
          education: profileData.education
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update profile');
      }

      const data = await response.json();
      
      return {
        success: true,
        message: data.msg,
        profile: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          headline: data.user.headline || '',
          bio: data.user.bio || '',
          location: data.user.location || '',
          profile_picture_url: data.user.profile_picture_data ? `/api/users/${userId}/profile-picture` : '',
          resume_url: profileData.resume_url || '',
          skills: profileData.skills || [],
          experience: profileData.experience || [],
          education: profileData.education || []
        }
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }
}

export default new ProfileService();