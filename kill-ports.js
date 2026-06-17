const { exec } = require('child_process');

console.log('Killing processes on ports 3000 and 5001...');
console.log('========================================');

// Function to kill processes on a specific port
function killPort(port) {
  if (process.platform === 'win32') {
    // Windows
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error) {
        console.log(`No processes found on port ${port}`);
        return;
      }
      
      const lines = stdout.split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            exec(`taskkill /PID ${pid} /F`, (killError) => {
              if (killError) {
                console.log(`Failed to kill process ${pid} on port ${port}: ${killError.message}`);
              } else {
                console.log(`Successfully killed process ${pid} on port ${port}`);
              }
            });
          }
        }
      });
    });
  } else {
    // Unix/Linux/Mac
    exec(`lsof -i :${port} -t`, (error, stdout) => {
      if (error) {
        console.log(`No processes found on port ${port}`);
        return;
      }
      
      const pids = stdout.trim().split('\n');
      pids.forEach(pid => {
        if (pid) {
          exec(`kill -9 ${pid}`, (killError) => {
            if (killError) {
              console.log(`Failed to kill process ${pid} on port ${port}: ${killError.message}`);
            } else {
              console.log(`Successfully killed process ${pid} on port ${port}`);
            }
          });
        }
      });
    });
  }
}

// Kill processes on both ports
killPort(3000);
killPort(5001);

console.log('Process killing commands sent. Please wait a moment for processes to terminate.');
console.log('You can now restart the servers with: npm run dev');