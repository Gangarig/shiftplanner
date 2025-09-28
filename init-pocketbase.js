#!/usr/bin/env node

/**
 * PocketBase Initialization Script
 * This script helps set up the users collection in PocketBase
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 PocketBase Initialization');
console.log('============================\n');

// Check if PocketBase is running
async function checkPocketBase() {
  try {
    const response = await fetch('http://127.0.0.1:8090/api/health');
    if (response.ok) {
      console.log('✅ PocketBase is running on http://127.0.0.1:8090');
      return true;
    }
  } catch (error) {
    console.log('❌ PocketBase is not running');
    console.log('💡 Please start PocketBase: ./pocketbase serve');
    return false;
  }
}

// Create test users
async function createTestUsers() {
  const testUsers = [
    {
      email: 'admin@company.com',
      password: 'admin123',
      passwordConfirm: 'admin123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true
    },
    {
      email: 'manager@company.com',
      password: 'manager123',
      passwordConfirm: 'manager123',
      role: 'manager',
      firstName: 'Manager',
      lastName: 'User',
      isActive: true
    },
    {
      email: 'worker1@company.com',
      password: 'worker123',
      passwordConfirm: 'worker123',
      role: 'worker',
      firstName: 'Worker',
      lastName: 'One',
      isActive: true
    },
    {
      email: 'worker2@company.com',
      password: 'worker123',
      passwordConfirm: 'worker123',
      role: 'worker',
      firstName: 'Worker',
      lastName: 'Two',
      isActive: true
    }
  ];

  console.log('👥 Test users to create:');
  testUsers.forEach(user => {
    console.log(`   ${user.role}: ${user.email} / ${user.password}`);
  });

  return testUsers;
}

async function main() {
  const isRunning = await checkPocketBase();
  
  if (!isRunning) {
    console.log('\n🛑 Please start PocketBase first:');
    console.log('   ./pocketbase serve');
    console.log('\nThen run this script again.');
    process.exit(1);
  }

  console.log('\n📋 Manual Setup Steps:');
  console.log('======================');
  console.log('1. 🌐 Open PocketBase Admin: http://127.0.0.1:8090/_/');
  console.log('2. 📁 Create "users" collection (type: Auth)');
  console.log('3. 🔧 Add these fields:');
  console.log('   - role (Select): admin, manager, accountant, worker');
  console.log('   - firstName (Text)');
  console.log('   - lastName (Text)');
  console.log('   - isActive (Bool, default: true)');
  console.log('4. 👥 Create test users (see below)');
  
  const testUsers = await createTestUsers();
  
  console.log('\n📖 For detailed instructions, see: POCKETBASE_SETUP.md');
  console.log('\n✨ After setup, your shift planning will work!');
}

main().catch(console.error);
