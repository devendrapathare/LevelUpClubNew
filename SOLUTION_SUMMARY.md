# Profile Picture Upload Solution

## Problem

The profile picture was not getting stored permanently because the frontend was only creating temporary preview URLs using `URL.createObjectURL(file)` without actually uploading the file to the server.

## Solution Implemented

### 1. Backend Changes

#### Created Upload Route (`server/routes/upload.js`)

- Implemented file upload functionality using `multer`
- Configured storage to save files in the `uploads/` directory
- Added file validation (image files only, 5MB size limit)
- Created dedicated endpoint: `POST /api/upload/profile-picture`
- Integrated with authentication middleware
- Updated user's profile_picture_url in the database upon successful upload

#### Server Configuration (`server/index.js`)

- Registered the new upload route: `app.use('/api/upload', require('./routes/upload'))`
- Added static file serving for uploaded images: `app.use('/uploads', express.static('uploads'))`

#### Dependencies

- Installed `multer` package for file upload handling

### 2. Frontend Changes

#### Updated UserProfile Component (`client/src/components/UserProfile.jsx`)

- Modified `handleProfilePictureChange` to upload files to the server
- Added `uploadProfilePicture` function that:
  - Creates FormData with the selected file
  - Sends POST request to `/api/upload/profile-picture`
  - Updates UI with the actual server URL upon successful upload
  - Refreshes user data in the authentication context

#### Updated Profile Service (`client/src/services/profileService.js`)

- Removed `profile_picture_url` from the JSON body in `updateProfile` function
- Profile picture updates are now handled separately via the upload route

### 3. File Structure

```
server/
├── uploads/                 # Directory for storing uploaded profile pictures
├── routes/
│   └── upload.js           # New upload route for profile pictures
└── index.js                # Updated to include upload route and static file serving
```

### 4. API Endpoints

- `POST /api/upload/profile-picture` - Upload profile picture (requires authentication)
- Static files served at `/uploads/filename`

### 5. Security & Validation

- File type validation (images only)
- File size limit (5MB)
- Authentication required for uploads
- Unique filenames to prevent conflicts
- Server-side storage for permanent access

## How It Works

1. User selects a profile picture in the frontend
2. Frontend immediately shows a preview using `URL.createObjectURL(file)`
3. Frontend simultaneously uploads the file to `/api/upload/profile-picture`
4. Backend saves the file to the `uploads/` directory with a unique name
5. Backend updates the user's `profile_picture_url` in the database
6. Frontend receives the permanent URL and updates the UI
7. User's profile data is refreshed in the authentication context

## Testing

To test the functionality:

1. Navigate to your profile page
2. Click "Edit Profile"
3. Click "Change Photo" and select an image file
4. The preview should update immediately
5. After a moment, you should see a success message
6. Save your profile changes
7. The new profile picture should be visible in the dashboard

## Files Modified

- `server/routes/upload.js` (new)
- `server/index.js` (modified)
- `client/src/components/UserProfile.jsx` (modified)
- `client/src/services/profileService.js` (modified)
- `README.md` (updated documentation)

## Dependencies Added

- `multer` for file upload handling
