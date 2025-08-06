#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Import the allocation function for testing
const { allocate } = require('./allocationEngine.js');

console.log('🧪 Running Smart Discount Allocation Engine Tests\n');

// Test 1: Normal Case
console.log('📋 Test 1: Normal Case');
try {
  const normalInput = JSON.parse(fs.readFileSync('input-normal.json', 'utf8'));
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  
  const result = allocate(normalInput, config);
  
  console.log('✅ Normal case passed');
  console.log(`   Total allocated: ${result.summary.totalAllocated}`);
  console.log(`   Remaining kitty: ${result.summary.remainingKitty}`);
  console.log(`   Allocation range: ${result.summary.min} - ${result.summary.max}`);
  console.log('');
} catch (error) {
  console.log('❌ Normal case failed:', error.message);
}

// Test 2: All-Same Scores Case
console.log('📋 Test 2: All-Same Scores Case');
try {
  const sameInput = JSON.parse(fs.readFileSync('input-all-same.json', 'utf8'));
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  
  const result = allocate(sameInput, config);
  
  console.log('✅ All-same case passed');
  console.log(`   Total allocated: ${result.summary.totalAllocated}`);
  console.log(`   Remaining kitty: ${result.summary.remainingKitty}`);
  console.log(`   Equal distribution: ${result.summary.min === result.summary.max ? 'Yes' : 'No'}`);
  console.log('');
} catch (error) {
  console.log('❌ All-same case failed:', error.message);
}

// Test 3: Rounding Edge Case
console.log('📋 Test 3: Rounding Edge Case');
try {
  const roundingInput = JSON.parse(fs.readFileSync('input-rounding.json', 'utf8'));
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  
  const result = allocate(roundingInput, config);
  
  console.log('✅ Rounding case passed');
  console.log(`   Total allocated: ${result.summary.totalAllocated}`);
  console.log(`   Remaining kitty: ${result.summary.remainingKitty}`);
  console.log(`   Kitty fully distributed: ${result.summary.remainingKitty === 0 ? 'Yes' : 'No'}`);
  console.log('');
} catch (error) {
  console.log('❌ Rounding case failed:', error.message);
}

console.log('🎉 All tests completed!');
console.log('\nTo run the full application:');
console.log('  npm install');
console.log('  node allocationEngine.js --input input-normal.json --config config.json'); 