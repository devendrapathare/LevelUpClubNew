const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('LevelUp Club Setup Script');
console.log('========================');

// Check if we're in the right directory
if (!fs.existsSync('client') || !fs.existsSync('server')) {
  console.error('Error: Please run this script from the root level-up-club directory');
  process.exit(1);
}

// Function to run a command
function runCommand(command, cwd, onSuccess, onError) {
  console.log(`\nRunning: ${command} in ${cwd}`);
  const [cmd, ...args] = command.split(' ');
  const child = spawn(cmd, args, { cwd, stdio: 'inherit' });
  
  child.on('close', (code) => {
    if (code === 0) {
      onSuccess();
    } else {
      onError(code);
    }
  });
}

// Setup backend
console.log('\n1. Setting up backend dependencies...');
runCommand('npm install', 'server', () => {
  console.log('Backend dependencies installed successfully!');
  
  // Check if .env file exists
  if (!fs.existsSync('server/.env')) {
    console.log('\n2. Creating .env file...');
    const envContent = `DATABASE_URL=postgresql://username:password@localhost:5432/levelupclub
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5001`;
    
    fs.writeFileSync('server/.env', envContent);
    console.log('Created server/.env file. Please update it with your actual credentials.');
  }
  
  console.log('\n3. Setting up frontend dependencies...');
  runCommand('npm install', 'client', () => {
    console.log('Frontend dependencies installed successfully!');
    console.log('\nSetup complete! ✅');
    console.log('\nNext steps:');
    console.log('1. Update server/.env with your actual database credentials');
    console.log('2. Create the PostgreSQL database "levelupclub"');
    console.log('3. Run "npx prisma migrate dev" in the server directory');
    console.log('4. Run "npm run dev" from the root directory to start both servers');
  }, (code) => {
    console.error(`Error installing frontend dependencies (code ${code})`);
  });
}, (code) => {
  console.error(`Error installing backend dependencies (code ${code})`);
});