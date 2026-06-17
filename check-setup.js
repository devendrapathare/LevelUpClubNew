const fs = require('fs');
const path = require('path');

console.log('LevelUp Club Setup Checker');
console.log('========================');

// Required files and directories
const requiredItems = [
  { path: 'client', type: 'directory', name: 'Client directory' },
  { path: 'server', type: 'directory', name: 'Server directory' },
  { path: 'client/src', type: 'directory', name: 'Client source directory' },
  { path: 'server/prisma', type: 'directory', name: 'Prisma directory' },
  { path: 'server/.env', type: 'file', name: 'Server environment file' },
  { path: 'client/src/App.jsx', type: 'file', name: 'Main App component' },
  { path: 'server/index.js', type: 'file', name: 'Server entry point' },
  { path: 'server/prisma/schema.prisma', type: 'file', name: 'Prisma schema' }
];

let allPresent = true;

requiredItems.forEach(item => {
  const fullPath = path.join(__dirname, item.path);
  const exists = fs.existsSync(fullPath);
  const isCorrectType = exists && 
    ((item.type === 'directory' && fs.lstatSync(fullPath).isDirectory()) || 
     (item.type === 'file' && fs.lstatSync(fullPath).isFile()));
  
  if (exists && isCorrectType) {
    console.log(`✅ ${item.name} - Present`);
  } else if (exists) {
    console.log(`⚠️  ${item.name} - Wrong type (expected ${item.type})`);
    allPresent = false;
  } else {
    console.log(`❌ ${item.name} - Missing`);
    allPresent = false;
  }
});

console.log('\n' + '='.repeat(40));

if (allPresent) {
  console.log('✅ All required files and directories are present!');
  console.log('\nNext steps:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Update server/.env with your database credentials');
  console.log('3. Run "npx prisma migrate dev" in the server directory');
  console.log('4. Run "npm run dev" to start the application');
} else {
  console.log('❌ Some required files or directories are missing.');
  console.log('Please make sure you have the complete project structure.');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));
if (majorVersion >= 14) {
  console.log(`✅ Node.js version ${nodeVersion} - Supported`);
} else {
  console.log(`⚠️  Node.js version ${nodeVersion} - Recommended to use v14 or higher`);
}