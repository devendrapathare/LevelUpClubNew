// Script to verify that the upload route is properly set up
const fs = require('fs');
const path = require('path');

console.log('Verifying upload route setup...');

// Check if the upload route file exists
const uploadRoutePath = path.join(__dirname, 'routes', 'upload.js');
if (fs.existsSync(uploadRoutePath)) {
  console.log('✓ Upload route file exists');
} else {
  console.log('✗ Upload route file missing');
  process.exit(1);
}

// Check if multer is installed
try {
  require('multer');
  console.log('✓ Multer is installed');
} catch (error) {
  console.log('✗ Multer is not installed');
  process.exit(1);
}

// Check if the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
  console.log('✓ Uploads directory exists');
} else {
  console.log('✗ Uploads directory missing');
  // Try to create it
  try {
    fs.mkdirSync(uploadsDir);
    console.log('✓ Uploads directory created');
  } catch (error) {
    console.log('✗ Failed to create uploads directory:', error.message);
  }
}

// Check if the route is registered in index.js
const indexPath = path.join(__dirname, 'index.js');
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (indexContent.includes('/api/upload') && indexContent.includes('require(\'./routes/upload\')')) {
  console.log('✓ Upload route is registered in index.js');
} else {
  console.log('✗ Upload route is not registered in index.js');
}

if (indexContent.includes('express.static(\'uploads\')') || indexContent.includes('/uploads')) {
  console.log('✓ Static file serving for uploads is configured');
} else {
  console.log('✗ Static file serving for uploads may not be configured');
}

console.log('\nUpload route should be available at: POST /api/upload/profile-picture');
console.log('Make sure to send a POST request with a file in the "profilePicture" field');
console.log('Also make sure to include the Authorization header with a valid JWT token');