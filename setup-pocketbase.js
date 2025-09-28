#!/usr/bin/env node

/**
 * PocketBase Setup Script
 * This script helps set up PocketBase with the required collections and fields
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PocketBase Setup Script');
console.log('========================\n');

// Check if PocketBase executable exists
const pbPath = process.platform === 'win32' ? './pocketbase.exe' : './pocketbase';
const pbExists = fs.existsSync(pbPath);

if (!pbExists) {
  console.log('❌ PocketBase executable not found!');
  console.log('📥 Please download PocketBase from: https://pocketbase.io/docs/');
  console.log('💡 Place the executable in your project root directory');
  console.log('   - Windows: pocketbase.exe');
  console.log('   - macOS/Linux: pocketbase');
  process.exit(1);
}

console.log('✅ PocketBase executable found');

// Check if PocketBase is already running
try {
  execSync('curl -s http://127.0.0.1:8090/api/health', { stdio: 'pipe' });
  console.log('✅ PocketBase is already running on http://127.0.0.1:8090');
} catch (error) {
  console.log('⚠️  PocketBase is not running');
  console.log('🚀 Starting PocketBase...');
  
  try {
    if (process.platform === 'win32') {
      execSync('start pocketbase serve', { stdio: 'inherit' });
    } else {
      execSync('./pocketbase serve &', { stdio: 'inherit' });
    }
    console.log('✅ PocketBase started successfully');
  } catch (startError) {
    console.log('❌ Failed to start PocketBase automatically');
    console.log('💡 Please run manually: ./pocketbase serve');
  }
}

console.log('\n📋 Next Steps:');
console.log('==============');
console.log('1. 🌐 Open PocketBase Admin: http://127.0.0.1:8090/_/');
console.log('2. 👤 Create your admin account (first time only)');
console.log('3. 📁 Create "users" collection (type: Auth)');
console.log('4. 🔧 Add required fields: role, firstName, lastName, isActive');
console.log('5. 👥 Create test users with different roles');
console.log('6. 🧪 Test your app: npm run dev');

console.log('\n📖 For detailed instructions, see: POCKETBASE_SETUP.md');

console.log('\n🎯 Quick Test Users to Create:');
console.log('============================');
console.log('Admin: admin@company.com / admin123');
console.log('Manager: manager@company.com / manager123');
console.log('Worker: worker@company.com / worker123');

console.log('\n✨ Happy coding!');
