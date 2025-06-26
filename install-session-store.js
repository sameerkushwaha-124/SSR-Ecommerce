#!/usr/bin/env node

/**
 * Installation script for MongoDB session store
 * Run this before deploying to production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing MongoDB session store for production...');

try {
  // Check if package.json exists
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }

  // Install connect-mongo
  console.log('📦 Installing connect-mongo...');
  execSync('npm install connect-mongo@^5.1.0', { stdio: 'inherit' });

  console.log('✅ MongoDB session store installed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Deploy your application');
  console.log('2. Set environment variables:');
  console.log('   - NODE_ENV=production');
  console.log('   - MONGODB_URI=your_mongodb_connection_string');
  console.log('   - EXPRESS_SESSION_SECRET=your_secret_key');
  console.log('   - FORCE_HTTPS=true (if you have HTTPS) or false');
  console.log('');
  console.log('🎉 Your Buy Now functionality should now work in production!');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.log('');
  console.log('🔧 Manual installation:');
  console.log('Run: npm install connect-mongo@^5.1.0');
  process.exit(1);
}
