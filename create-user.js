/**
 * Script to create a user in localStorage
 * Run this in the browser console or via Node.js
 */

// User data
const userData = {
  email: 's@s.com',
  password: 's@s.com',
  name: 'Test User',
  createdAt: new Date().toISOString()
};

// For browser console
if (typeof window !== 'undefined') {
  // Get existing users
  const existingUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
  
  // Check if user already exists
  const userExists = existingUsers.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  
  if (userExists) {
    console.log('User already exists:', userData.email);
  } else {
    // Add new user
    existingUsers.push(userData);
    localStorage.setItem('adiology_users', JSON.stringify(existingUsers));
    console.log('✅ User created successfully:', userData.email);
    console.log('Total users:', existingUsers.length);
  }
} else {
  // For Node.js
  const fs = require('fs');
  const path = require('path');
  
  // This would require a different approach for Node.js
  // Since localStorage is browser-only, we'll just log instructions
  console.log('This script should be run in the browser console.');
  console.log('Copy and paste this code into your browser console:');
  console.log(`
    const userData = ${JSON.stringify(userData, null, 2)};
    const existingUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
    const userExists = existingUsers.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (userExists) {
      console.log('User already exists:', userData.email);
    } else {
      existingUsers.push(userData);
      localStorage.setItem('adiology_users', JSON.stringify(existingUsers));
      console.log('✅ User created successfully:', userData.email);
    }
  `);
}

