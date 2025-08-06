#!/usr/bin/env node

const { apiMode } = require('./allocationEngine.js');
const fs = require('fs');

console.log('Testing API mode...');

// Load config
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Start API server
console.log('Starting API server...');
apiMode(config);

console.log('API server should be running at http://localhost:3000/allocate');
console.log('Press Ctrl+C to stop'); 