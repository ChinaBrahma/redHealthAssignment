// allocationEngine.js
const fs = require('fs');
const path = require('path');
const process = require('process');
const inquirer = require('inquirer');
const asciichart = require('asciichart');
const express = require('express');

// --------- Default Config ---------
const DEFAULT_CONFIG = {
  weights: {
    performanceScore: 0.4,
    seniorityMonths: 0.2,
    targetAchievedPercent: 0.3,
    activeClients: 0.1
  },
  minPerAgent: 0,
  maxPerAgent: Infinity
};

// --------- Validation ---------
function validateInput(input, config) {
  if (!input) throw new Error('Input data missing!');
  if (!('siteKitty' in input)) throw new Error('siteKitty field missing!');
  if (!Array.isArray(input.salesAgents)) throw new Error('salesAgents field missing or not an array!');
  if (input.salesAgents.length === 0) throw new Error('No agents present!');
  if (input.siteKitty < 0) throw new Error('Kitty must be positive!');
  if (config.minPerAgent && config.maxPerAgent && config.minPerAgent > config.maxPerAgent)
    throw new Error('minPerAgent cannot exceed maxPerAgent.');
}

// --------- Normalization ---------
function normalize(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (max === min) return arr.map(() => 1);
  return arr.map(v => (v - min) / (max - min));
}

// --------- Allocation Logic ---------
function allocate(input, config, pluginScorer) {
  validateInput(input, config);

  const agents = input.salesAgents;
  const kitty = input.siteKitty;
  const weights = config.weights || DEFAULT_CONFIG.weights;
  const minPerAgent = config.minPerAgent ?? DEFAULT_CONFIG.minPerAgent;
  const maxPerAgent = config.maxPerAgent ?? DEFAULT_CONFIG.maxPerAgent;

  // Prepare attribute arrays
  const attrKeys = Object.keys(weights);
  const normalized = {};
  attrKeys.forEach(k => normalized[k] = normalize(agents.map(a => a[k])));

  // Scoring (native or plugin)
  let scores = [];
  if (pluginScorer) {
    scores = pluginScorer(agents, weights, normalized);
  } else {
    scores = agents.map((_, i) => attrKeys.reduce((s, k) => s + weights[k] * normalized[k][i], 0));
  }
  const totalScore = scores.reduce((a, b) => a + b, 0);

  // Proportional allocation (with min/max limits)
  let allocations = agents.map((a, i) => {
    // If all scores zero, split equally
    let alloc = totalScore === 0 ? (kitty / agents.length) : (scores[i] / totalScore) * kitty;
    alloc = Math.round(Math.max(minPerAgent, Math.min(maxPerAgent, alloc)));
    return {
      id: a.id,
      assignedDiscount: alloc,
      justification: buildJustification(normalized, i, attrKeys, a)
    };
  });

  // Rounding and total check
  let sumAlloc = allocations.reduce((sum, a) => sum + a.assignedDiscount, 0);
  let diff = kitty - sumAlloc;
  if (diff !== 0) allocations[0].assignedDiscount += diff;

  // Final summary
  const summary = computeSummary(allocations, kitty);
  return { allocations, summary };
}

// --------- Justification ---------
function buildJustification(norm, idx, fields, agent) {
  const high = [];
  fields.forEach(f => {
    if (norm[f][idx] > 0.8) high.push(f);
  });
  if (high.length)
    return `Exceptional: ${high.join(', ')}.`;
  return `Balanced contribution.`;
}

// --------- Summary Stats ---------
function computeSummary(alloc, kitty) {
  const amounts = alloc.map(a => a.assignedDiscount);
  const sum = amounts.reduce((a, b) => a + b, 0);
  const sorted = [...amounts].sort((a, b) => a - b);
  const avg = sum / amounts.length;
  const agentsAtMin = alloc.filter(a => a.assignedDiscount === Math.min(...amounts)).length;
  const agentsAtMax = alloc.filter(a => a.assignedDiscount === Math.max(...amounts)).length;
  const median = amounts.length % 2 === 0 ?
      (sorted[amounts.length/2 - 1] + sorted[amounts.length/2]) / 2 :
      sorted[Math.floor(amounts.length/2)];
  return {
    totalAllocated: sum,
    remainingKitty: kitty - sum,
    mean: avg,
    median,
    min: Math.min(...amounts),
    max: Math.max(...amounts),
    agentsAtMin,
    agentsAtMax
  };
}

// --------- ASCII Chart ---------
function printChart(alloc) {
  const maxValue = Math.max(...alloc.map(a => a.assignedDiscount));
  const maxBarLength = 50; // Maximum bar length in characters
  
  console.log('\n=== Allocation Chart ===');
  alloc.forEach((a, idx) => {
    const percentage = maxValue > 0 ? (a.assignedDiscount / maxValue) : 0;
    const barLength = Math.round(percentage * maxBarLength);
    const bar = '█'.repeat(barLength) + '░'.repeat(maxBarLength - barLength);
    console.log(`${a.id.padEnd(3)}: ${bar} ${a.assignedDiscount.toString().padStart(6)}`);
  });
  console.log(`Max: ${maxValue}`);
}

// --------- Audit Logging ---------
function auditLog(input, config, result) {
  if (!fs.existsSync('logs')) fs.mkdirSync('logs');
  const stamp = new Date().toISOString().replace(/[:.]/g,'-');
  const fname = `logs/allocation-log-${stamp}.json`;
  fs.writeFileSync(fname, JSON.stringify({input, config, result}, null, 2));
  console.log(`Audit log saved: ${fname}`);
}

// --------- Interactive Simulation CLI ---------
async function simulationMode(input, config) {
  let agents = JSON.parse(JSON.stringify(input.salesAgents));
  let weights = {...config.weights};
  while (true) {
    const result = allocate({siteKitty: input.siteKitty, salesAgents: agents}, {weights, minPerAgent: config.minPerAgent, maxPerAgent: config.maxPerAgent});
    printChart(result.allocations);
    console.log('Summary:', result.summary);

    const {act} = await inquirer.prompt([{
      type: 'list',
      name: 'act',
      message: 'Simulate: What to change?',
      choices: ['Change weight', 'Edit agent value', 'Exit']
    }]);
    if (act === 'Exit') break;
    if (act === 'Change weight') {
      const {which, value} = await inquirer.prompt([
        {type:'list', name:'which', message:'Attribute:', choices:Object.keys(weights)},
        {type:'input', name:'value', message:'New weight (0-1): ', validate:v=>!isNaN(Number(v)) && v>=0 && v<=1}
      ]);
      weights[which] = Number(value);
    }
    if (act === 'Edit agent value') {
      const {idx, attr, val} = await inquirer.prompt([
        {type:'list', name:'idx', message:'Agent', choices:agents.map((a,i)=>({name:a.id,value:i}))},
        {type:'list', name:'attr', message:'Field', choices:Object.keys(weights)},
        {type:'input', name:'val', message:'New value (number):', validate: v=>!isNaN(Number(v))}
      ]);
      agents[idx][attr] = Number(val);
    }
  }
}

// --------- Batch Scenario Mode ---------
function batchMode(folder, config, pluginPath) {
  const files = fs.readdirSync(folder).filter(f=>f.endsWith('.json'));
  files.forEach(f => {
    const input = JSON.parse(fs.readFileSync(path.join(folder, f)));
    let pluginScorer = null;
    if (pluginPath) pluginScorer = require(path.resolve(pluginPath));
    try {
      const result = allocate(input, config, pluginScorer);
      console.log(`\n=== ${f} ===`);
      printChart(result.allocations);
      console.log('Summary:', result.summary);
      auditLog(input, config, result);
    } catch(e) {
      console.log(`Error running ${f}:`, e.message);
    }
  });
}

// --------- Express API Mode ---------
function apiMode(config, pluginPath) {
  const app = express();
  app.use(express.json());
  app.post('/allocate', (req, res) => {
    let pluginScorer = null;
    if (pluginPath) pluginScorer = require(path.resolve(pluginPath));
    try {
      const result = allocate(req.body.input, config, pluginScorer);
      res.json(result);
    } catch(e) {
      res.status(400).json({error: e.message});
    }
  });
  app.listen(3000, ()=>console.log('API ready at http://localhost:3000/allocate'));
}

// --------- CLI MAIN ---------
async function main() {
  const argv = require('yargs')
    .option('input', {type:'string',describe:'Input JSON file'})
    .option('config', {type:'string',describe:'Config JSON file'})
    .option('simulate', {type:'boolean', describe:'Interactive simulation'})
    .option('batch', {type:'string', describe:'Folder for batch scenario mode'})
    .option('plugin', {type:'string', describe:'Custom JS scoring plugin'})
    .option('apimode', {type:'boolean', describe:'Run as HTTP API'})
    .argv;

  // Load config (with ENV overrides)
  let config = {...DEFAULT_CONFIG};
  if (argv.config) Object.assign(config, JSON.parse(fs.readFileSync(argv.config)));
  if (process.env.MIN_PER_AGENT) config.minPerAgent = Number(process.env.MIN_PER_AGENT);
  if (process.env.MAX_PER_AGENT) config.maxPerAgent = Number(process.env.MAX_PER_AGENT);
  if (process.env.WEIGHTS) Object.assign(config.weights, JSON.parse(process.env.WEIGHTS));

  let pluginScorer = null;
  if (argv.plugin) pluginScorer = require(path.resolve(argv.plugin));

  if (argv.simulate && argv.input) {
    const input = JSON.parse(fs.readFileSync(argv.input));
    await simulationMode(input, config);
    process.exit(0);
  }

  if (argv.batch) {
    batchMode(argv.batch, config, argv.plugin);
    process.exit(0);
  }

  if (argv.apimode) {
    apiMode(config, argv.plugin);
    // Don't exit - keep the server running
  }

  if (!argv.input) throw new Error('--input FILE required!');

  // Single-run mode (default)
  const input = JSON.parse(fs.readFileSync(argv.input));
  const result = allocate(input, config, pluginScorer);

  printChart(result.allocations);
  console.log('Allocations:', JSON.stringify(result.allocations, null, 2));
  console.log('Summary:', result.summary);
  auditLog(input, config, result);
}

if (require.main === module) main();

// Export for testing
module.exports = { allocate, normalize, validateInput, computeSummary, printChart, apiMode }; 