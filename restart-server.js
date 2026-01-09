// Simple script to restart the server
const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Restarting COBRIA Backend Server...');

// Kill any existing node processes
const killProcess = spawn('taskkill', ['/F', '/IM', 'node.exe'], { 
  stdio: 'inherit',
  shell: true 
});

killProcess.on('close', (code) => {
  console.log('✅ Killed existing processes');
  
  // Wait a moment then start the server
  setTimeout(() => {
    console.log('🚀 Starting server with new routes...');
    
    const serverProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ Error starting server:', error);
    });
    
    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });
    
  }, 2000);
});

killProcess.on('error', (error) => {
  console.error('❌ Error killing processes:', error);
});


