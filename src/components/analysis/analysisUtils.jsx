// Statistical Analysis Utilities for Mega-Sena

/**
 * Calculate frequency of each number (1-60) across all draws
 */
export function calculateNumberFrequency(draws) {
  const frequency = {};
  for (let i = 1; i <= 60; i++) {
    frequency[i] = 0;
  }
  
  draws.forEach(draw => {
    if (draw.numbers && Array.isArray(draw.numbers)) {
      draw.numbers.forEach(num => {
        if (num >= 1 && num <= 60) {
          frequency[num]++;
        }
      });
    }
  });
  
  return frequency;
}

/**
 * Get hot numbers (most frequent) and cold numbers (least frequent)
 */
export function getHotColdNumbers(frequency, count = 10) {
  const sorted = Object.entries(frequency)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency);
  
  return {
    hot: sorted.slice(0, count),
    cold: sorted.slice(-count).reverse()
  };
}

/**
 * Analyze even vs odd distribution in draws
 */
export function analyzeEvenOddDistribution(draws) {
  const distribution = {};
  
  draws.forEach(draw => {
    if (draw.numbers && Array.isArray(draw.numbers)) {
      const evenCount = draw.numbers.filter(n => n % 2 === 0).length;
      const oddCount = 6 - evenCount;
      const key = `${evenCount}E/${oddCount}O`;
      distribution[key] = (distribution[key] || 0) + 1;
    }
  });
  
  return distribution;
}

/**
 * Analyze low (1-30) vs high (31-60) distribution
 */
export function analyzeLowHighDistribution(draws) {
  const distribution = {};
  
  draws.forEach(draw => {
    if (draw.numbers && Array.isArray(draw.numbers)) {
      const lowCount = draw.numbers.filter(n => n <= 30).length;
      const highCount = 6 - lowCount;
      const key = `${lowCount}L/${highCount}H`;
      distribution[key] = (distribution[key] || 0) + 1;
    }
  });
  
  return distribution;
}

/**
 * Calculate gap analysis - intervals between number occurrences
 */
export function calculateGapAnalysis(draws, sortedByDate = true) {
  const gaps = {};
  const lastSeen = {};
  
  for (let i = 1; i <= 60; i++) {
    gaps[i] = [];
    lastSeen[i] = -1;
  }
  
  const sortedDraws = sortedByDate 
    ? [...draws].sort((a, b) => new Date(a.draw_date) - new Date(b.draw_date))
    : draws;
  
  sortedDraws.forEach((draw, index) => {
    if (draw.numbers && Array.isArray(draw.numbers)) {
      draw.numbers.forEach(num => {
        if (lastSeen[num] !== -1) {
          gaps[num].push(index - lastSeen[num]);
        }
        lastSeen[num] = index;
      });
    }
  });
  
  // Calculate average gap and current gap for each number
  const gapStats = {};
  const totalDraws = sortedDraws.length;
  
  for (let i = 1; i <= 60; i++) {
    const numGaps = gaps[i];
    const avgGap = numGaps.length > 0 
      ? numGaps.reduce((a, b) => a + b, 0) / numGaps.length 
      : totalDraws;
    const currentGap = lastSeen[i] !== -1 ? totalDraws - 1 - lastSeen[i] : totalDraws;
    
    gapStats[i] = {
      averageGap: avgGap,
      currentGap: currentGap,
      maxGap: numGaps.length > 0 ? Math.max(...numGaps) : totalDraws,
      minGap: numGaps.length > 0 ? Math.min(...numGaps) : 0,
      isOverdue: currentGap > avgGap
    };
  }
  
  return gapStats;
}

/**
 * Analyze consecutive number patterns
 */
export function analyzeConsecutivePatterns(draws) {
  const patterns = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  draws.forEach(draw => {
    if (draw.numbers && Array.isArray(draw.numbers)) {
      const sorted = [...draw.numbers].sort((a, b) => a - b);
      let consecutivePairs = 0;
      
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] - sorted[i] === 1) {
          consecutivePairs++;
        }
      }
      patterns[consecutivePairs]++;
    }
  });
  
  return patterns;
}

/**
 * Analyze sum range of drawn numbers
 */
export function analyzeSumDistribution(draws) {
  const sums = draws
    .filter(draw => draw.numbers && Array.isArray(draw.numbers))
    .map(draw => draw.numbers.reduce((a, b) => a + b, 0));
  
  if (sums.length === 0) return { min: 0, max: 0, avg: 0, distribution: {} };
  
  const min = Math.min(...sums);
  const max = Math.max(...sums);
  const avg = sums.reduce((a, b) => a + b, 0) / sums.length;
  
  // Group into ranges
  const distribution = {};
  const rangeSize = 30;
  
  sums.forEach(sum => {
    const rangeStart = Math.floor(sum / rangeSize) * rangeSize;
    const key = `${rangeStart}-${rangeStart + rangeSize - 1}`;
    distribution[key] = (distribution[key] || 0) + 1;
  });
  
  return { min, max, avg, distribution, sums };
}

/**
 * Calculate decade distribution (1-10, 11-20, etc.)
 */
export function analyzeDecadeDistribution(draws) {
  const decades = {
    '01-10': 0,
    '11-20': 0,
    '21-30': 0,
    '31-40': 0,
    '41-50': 0,
    '51-60': 0
  };
  
  let total = 0;
  
  draws.forEach(draw => {
    if (draw.numbers && Array.isArray(draw.numbers)) {
      draw.numbers.forEach(num => {
        total++;
        if (num <= 10) decades['01-10']++;
        else if (num <= 20) decades['11-20']++;
        else if (num <= 30) decades['21-30']++;
        else if (num <= 40) decades['31-40']++;
        else if (num <= 50) decades['41-50']++;
        else decades['51-60']++;
      });
    }
  });
  
  return { decades, total };
}

/**
 * Monte Carlo simulation for combination generation
 */
export function monteCarloGeneration(frequency, numSimulations = 10000, numCombinations = 5) {
  const totalFreq = Object.values(frequency).reduce((a, b) => a + b, 0);
  const weights = {};
  
  for (let i = 1; i <= 60; i++) {
    weights[i] = frequency[i] / totalFreq;
  }
  
  const combinations = [];
  const seen = new Set();
  
  for (let sim = 0; sim < numSimulations && combinations.length < numCombinations; sim++) {
    const combo = weightedRandomSelection(weights, 6);
    const key = combo.sort((a, b) => a - b).join(',');
    
    if (!seen.has(key)) {
      seen.add(key);
      combinations.push({
        numbers: combo,
        method: 'Monte Carlo',
        confidence: calculateCombinationScore(combo, frequency, totalFreq)
      });
    }
  }
  
  return combinations.slice(0, numCombinations);
}

/**
 * Weighted random selection
 */
function weightedRandomSelection(weights, count) {
  const selected = [];
  const available = { ...weights };
  
  while (selected.length < count) {
    const totalWeight = Object.values(available).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [num, weight] of Object.entries(available)) {
      random -= weight;
      if (random <= 0) {
        selected.push(parseInt(num));
        delete available[num];
        break;
      }
    }
  }
  
  return selected;
}

/**
 * Calculate combination score based on frequency
 */
function calculateCombinationScore(combo, frequency, totalFreq) {
  const avgFreq = totalFreq / 60;
  let score = 0;
  
  combo.forEach(num => {
    score += frequency[num] / avgFreq;
  });
  
  return Math.min(100, Math.round((score / 6) * 100));
}

/**
 * Generate balanced combinations with constraints
 */
export function generateBalancedCombination(options = {}) {
  const {
    evenOddRatio = [3, 3], // [even, odd]
    lowHighRatio = [3, 3], // [low, high]
    sumRange = [150, 220],
    excludeNumbers = [],
    preferNumbers = []
  } = options;
  
  let attempts = 0;
  const maxAttempts = 10000;
  
  while (attempts < maxAttempts) {
    attempts++;
    const combo = generateRandomCombination(excludeNumbers, preferNumbers);
    
    // Check even/odd
    const evenCount = combo.filter(n => n % 2 === 0).length;
    if (evenCount !== evenOddRatio[0]) continue;
    
    // Check low/high
    const lowCount = combo.filter(n => n <= 30).length;
    if (lowCount !== lowHighRatio[0]) continue;
    
    // Check sum
    const sum = combo.reduce((a, b) => a + b, 0);
    if (sum < sumRange[0] || sum > sumRange[1]) continue;
    
    return {
      numbers: combo.sort((a, b) => a - b),
      method: 'Balanced Constraints',
      constraints: {
        evenOdd: `${evenOddRatio[0]}E/${evenOddRatio[1]}O`,
        lowHigh: `${lowHighRatio[0]}L/${lowHighRatio[1]}H`,
        sum: sum
      }
    };
  }
  
  // Fallback: return a random combination
  return {
    numbers: generateRandomCombination(excludeNumbers, preferNumbers).sort((a, b) => a - b),
    method: 'Random (constraints too strict)',
    constraints: null
  };
}

/**
 * Generate random combination
 */
function generateRandomCombination(exclude = [], prefer = []) {
  const available = [];
  for (let i = 1; i <= 60; i++) {
    if (!exclude.includes(i)) {
      available.push(i);
    }
  }
  
  const combo = [];
  
  // Add preferred numbers first
  prefer.forEach(num => {
    if (combo.length < 6 && available.includes(num)) {
      combo.push(num);
      available.splice(available.indexOf(num), 1);
    }
  });
  
  // Fill remaining with random
  while (combo.length < 6) {
    const idx = Math.floor(Math.random() * available.length);
    combo.push(available[idx]);
    available.splice(idx, 1);
  }
  
  return combo;
}

/**
 * Generate combinations based on gap analysis (overdue numbers)
 */
export function generateOverdueCombination(gapStats, count = 6) {
  const overdue = Object.entries(gapStats)
    .filter(([_, stats]) => stats.isOverdue)
    .sort((a, b) => (b[1].currentGap / b[1].averageGap) - (a[1].currentGap / a[1].averageGap))
    .map(([num, stats]) => ({
      number: parseInt(num),
      overdueRatio: stats.currentGap / stats.averageGap
    }));
  
  const selected = overdue.slice(0, Math.min(count, overdue.length));
  
  // Fill with random if not enough overdue numbers
  while (selected.length < count) {
    const num = Math.floor(Math.random() * 60) + 1;
    if (!selected.find(s => s.number === num)) {
      selected.push({ number: num, overdueRatio: 0 });
    }
  }
  
  return {
    numbers: selected.map(s => s.number).sort((a, b) => a - b),
    method: 'Gap Analysis (Overdue)',
    details: selected.slice(0, count).map(s => ({
      number: s.number,
      overdueRatio: s.overdueRatio.toFixed(2)
    }))
  };
}

/**
 * Entropy calculation for a set of numbers
 */
export function calculateEntropy(numbers) {
  const n = numbers.length;
  if (n === 0) return 0;
  
  const freq = {};
  numbers.forEach(num => {
    freq[num] = (freq[num] || 0) + 1;
  });
  
  let entropy = 0;
  Object.values(freq).forEach(count => {
    const p = count / n;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  });
  
  return entropy;
}

/**
 * Calculate variance of a combination
 */
export function calculateVariance(combo) {
  const mean = combo.reduce((a, b) => a + b, 0) / combo.length;
  const squaredDiffs = combo.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / combo.length;
}

/**
 * Get comprehensive statistics summary
 */
export function getStatisticsSummary(draws) {
  const frequency = calculateNumberFrequency(draws);
  const hotCold = getHotColdNumbers(frequency);
  const evenOdd = analyzeEvenOddDistribution(draws);
  const lowHigh = analyzeLowHighDistribution(draws);
  const gaps = calculateGapAnalysis(draws);
  const consecutive = analyzeConsecutivePatterns(draws);
  const sums = analyzeSumDistribution(draws);
  const decades = analyzeDecadeDistribution(draws);
  
  return {
    totalDraws: draws.length,
    frequency,
    hotCold,
    evenOdd,
    lowHigh,
    gaps,
    consecutive,
    sums,
    decades
  };
}