#!/usr/bin/env node

const fs = require('fs');
const { allocate } = require('./allocationEngine.js');

console.log('📊 ASCII Chart Demo\n');

// Load test data
const input = JSON.parse(fs.readFileSync('input-normal.json', 'utf8'));
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Run allocation
const result = allocate(input, config);

console.log('=== ALLOCATION CHART ===');
console.log('Horizontal bar chart showing allocation distribution:');
const { printChart } = require('./allocationEngine.js');
printChart(result.allocations);

console.log('\n=== CHART FEATURES ===');
console.log('• Uses █ for filled bars and ░ for empty space');
console.log('• Bar length is proportional to allocation amount');
console.log('• Easy to read agent labels and values');
console.log('• Works in any terminal without graphics');
console.log('• Shows maximum value for reference'); 