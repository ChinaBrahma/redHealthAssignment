/**
 * Custom scoring plugin for allocationEngine.js.
 * This function is called with:
 *   - agents: the array of agent objects (with all attributes)
 *   - weights: current weights from config, for reference
 *   - normalized: an object with normalized metric arrays for each attribute
 * 
 * Must return an array of numbers (scores, one per agent).
 *
 * Example logic below:
 *   - Double the performanceScore's influence for "veteran" agents
 *   - Apply a bonus for agents handling more activeClients than average
 *   - Penalize for low target achievement
 */
module.exports = function customScorer(agents, weights, normalized) {
  const avgClients = agents.reduce((sum, a) => sum + a.activeClients, 0) / agents.length;

  return agents.map((agent, i) => {
    let score = 0;
    // If seniorityMonths >= 12, double weight of performanceScore
    if (agent.seniorityMonths >= 12) {
      score += 2 * weights.performanceScore * normalized.performanceScore[i];
    } else {
      score += weights.performanceScore * normalized.performanceScore[i];
    }
    // Standard contributions
    score += weights.seniorityMonths * normalized.seniorityMonths[i];
    score += weights.targetAchievedPercent * normalized.targetAchievedPercent[i];
    score += weights.activeClients * normalized.activeClients[i];
    // Bonus: if activeClients is above average, add 0.1 to the score
    if (agent.activeClients > avgClients) score += 0.1;
    // Penalty: if targetAchievedPercent is very low, subtract 0.1
    if (agent.targetAchievedPercent < 50) score -= 0.1;
    return score;
  });
}; 