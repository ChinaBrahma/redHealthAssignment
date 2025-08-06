# Smart Discount Allocation Engine

## Overview
This is a data-driven discount allocation system that distributes a fixed discount kitty among sales agents based on their performance metrics. The system ensures fair, explainable, and dynamic allocation while maintaining transparency in the decision-making process.

## Approach & Design Philosophy

### Core Algorithm
The allocation engine uses a **weighted scoring system** with the following approach:

1. **Normalization**: All agent attributes are normalized to a 0-1 scale to ensure fair comparison
2. **Weighted Scoring**: Each attribute contributes to the final score based on configurable weights
3. **Proportional Allocation**: The kitty is distributed proportionally based on calculated scores
4. **Constraint Enforcement**: Min/max per agent limits are applied to ensure fairness
5. **Rounding Handling**: Any rounding differences are adjusted to maintain total kitty integrity

### Key Features
- **Configurable Weights**: Adjust the importance of different metrics via JSON config
- **Plugin System**: Extensible scoring logic through custom JavaScript plugins
- **Multiple Modes**: CLI, API, batch processing, and interactive simulation
- **Audit Logging**: Complete audit trail for all allocations
- **Edge Case Handling**: Robust handling of edge cases like identical scores

### Assumptions Made

1. **Fairness**: All agents should receive some allocation (minimum 0)
2. **Performance-Based**: Higher performing agents should receive proportionally more
3. **Transparency**: Justifications should be clear and data-driven
4. **Flexibility**: System should be configurable for different business needs
5. **Extensibility**: New scoring algorithms should be easily pluggable

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Install Dependencies
```bash
npm install inquirer asciichart express yargs
```


# Sample run commands - CLI (run any one of the following)
Sample data used for all these commands is input-normal.json

## 1. For Basic Run
```bash
# Test scenarios
npm test  
# or
npm run test-all
```

## 2. For Interactive simulation run this
```bash
npm run simulate
```
##  3. To see the chart demonstration run this
```bash
npm run demo
```

##  4. Batch processing
```bash
npm run batch
npm run batch-with-plugin
```

## 5. API mode(currently under progress)
```bash
npm run api
```



### Available Modes

#### 1. Single Run Mode (Default)
```bash
node allocationEngine.js --input input-normal.json --config config.json
```

#### 2. Interactive Simulation Mode
```bash
node allocationEngine.js --input input-normal.json --config config.json --simulate
```

#### 3. Batch Processing Mode
```bash
node allocationEngine.js --batch scenarios/ --config config.json
```

#### 4. API Mode
```bash
node allocationEngine.js --apimode --config config.json
```

#### 5. Custom Plugin Mode
```bash
node allocationEngine.js --input input-normal.json --config config.json --plugin plugins/myCustomScorer.js
```

### CLI Options Reference
```bash
--input <file>          # Input JSON file (required)
--config <file>         # Configuration JSON file
--simulate              # Interactive simulation mode
--batch <folder>        # Batch processing mode
--plugin <file>         # Custom scoring plugin
--apimode               # Run as HTTP API
```

### Environment Variables
You can override config values using environment variables:
```bash
export MIN_PER_AGENT=100
export MAX_PER_AGENT=5000
export WEIGHTS='{"performanceScore":0.5,"seniorityMonths":0.2,"targetAchievedPercent":0.2,"activeClients":0.1}'
node allocationEngine.js --input input-normal.json
```

## Test Cases

### 1. Normal Case (`input-normal.json`)
- **Scenario**: 4 agents with varying performance metrics
- **Expected**: Proportional allocation based on weighted scores
- **Test**: `node allocationEngine.js --input input-normal.json --config config.json`

### 2. All-Same Scores Case (`input-all-same.json`)
- **Scenario**: 3 agents with identical attributes
- **Expected**: Equal distribution (kitty divided equally)
- **Test**: `node allocationEngine.js --input input-all-same.json --config config.json`

### 3. Rounding Edge Case (`input-rounding.json`)
- **Scenario**: Values that cause rounding issues
- **Expected**: Total allocation equals kitty exactly
- **Test**: `node allocationEngine.js --input input-rounding.json --config config.json`

## Output Format

The system outputs a JSON object with:
- **allocations**: Array of agent allocations with justifications
- **summary**: Statistical summary of the allocation

### ASCII Chart Visualization

The system includes a built-in ASCII chart that provides instant visual feedback on allocation distribution:

```
=== Allocation Chart ===
A1 : ██████████████████████████████████████████████████   4970
A2 : ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   1369
A3 : █████████████████████████████████████░░░░░░░░░░░░░   3661
A4 : ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      0
Max: 4970
```

**Chart Features:**
- **Horizontal bars**: Each agent gets a row with proportional bar length
- **Bar representation**: `█` for filled, `░` for empty
- **Visual fairness**: Easy to spot distribution patterns
- **Clear labels**: Agent IDs and exact values displayed

**Usage:**
```bash
# Basic allocation with chart
node allocationEngine.js --input input-normal.json --config config.json

# Using npm scripts
npm run demo  # Shows chart demo
```

**Benefits:**
- **Quick assessment**: Instant visual validation of fairness
- **Anomaly detection**: Easy to spot unusual allocations
- **Stakeholder communication**: Clear visual for presentations
- **CLI-friendly**: Works in any terminal without graphics
- **Easy to read**: Agent labels and values clearly displayed

Example output:
```json
{
  "allocations": [
    {
      "id": "A1",
      "assignedDiscount": 6000,
      "justification": "Exceptional: performanceScore, seniorityMonths, targetAchievedPercent."
    }
  ],
  "summary": {
    "totalAllocated": 10000,
    "remainingKitty": 0,
    "mean": 2500,
    "median": 2500,
    "min": 1000,
    "max": 6000,
    "agentsAtMin": 1,
    "agentsAtMax": 1
  }
}
```

## Configuration

The `config.json` file controls:
- **weights**: Relative importance of each metric (must sum to 1.0)
- **minPerAgent**: Minimum allocation per agent
- **maxPerAgent**: Maximum allocation per agent

## Custom Plugins

Create custom scoring logic by implementing a function that:
- Takes `(agents, weights, normalized)` as parameters
- Returns an array of scores (one per agent)

Example plugin is provided in `plugins/myCustomScorer.js`.

## Architecture

### Core Components
1. **allocationEngine.js**: Main allocation logic and CLI interface
2. **config.json**: Configuration for weights and constraints
3. **input-*.json**: Sample input files for different scenarios
4. **plugins/**: Directory for custom scoring algorithms
5. **logs/**: Audit logs (auto-generated)

### Key Functions
- `allocate()`: Main allocation algorithm
- `normalize()`: Attribute normalization
- `validateInput()`: Input validation
- `buildJustification()`: Generate allocation justifications
- `computeSummary()`: Calculate allocation statistics

## Error Handling

The system handles various edge cases:
- Invalid input data
- Empty agent lists
- Negative kitty values
- Configuration conflicts
- Rounding errors

## Future Enhancements

1. **Machine Learning Integration**: Train models on historical allocation data
2. **Real-time Updates**: Dynamic reallocation based on changing metrics
3. **Multi-location Support**: Handle allocations across multiple sites
4. **Advanced Analytics**: Detailed performance analytics and reporting
5. **Web Interface**: User-friendly web dashboard for allocation management


**Built for Red Health Take-Home Assignment - A demonstration of fair, scalable, and transparent discount allocation automation.**

