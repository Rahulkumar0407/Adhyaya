import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pattern from '../models/Pattern.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';

dotenv.config();

const patterns = [
    // ========== FOUNDATIONAL ==========
    {
        name: 'Two Pointers (Same Direction)',
        slug: 'two-pointers-same',
        category: 'foundational',
        subcategory: 'two-pointers',
        description: 'Use two pointers moving in the same direction to solve array problems efficiently. Common for removing duplicates, merging arrays, or finding sequences.',
        videoUrl: 'https://www.youtube.com/embed/VEPCm3BCtik',
        cheatsheet: `## Two Pointers (Same Direction)

### When to Use
- Removing duplicates from sorted array
- Merging two sorted arrays
- Moving zeros to end
- Finding longest sequence

### Template
\`\`\`javascript
let slow = 0;
for (let fast = 0; fast < arr.length; fast++) {
  if (condition) {
    arr[slow] = arr[fast];
    slow++;
  }
}
\`\`\`

### Key Insight
Slow pointer marks the position of the "result," fast pointer explores.`,
        keyConcepts: [
            { title: 'Slow & Fast', description: 'Slow marks position, fast explores' },
            { title: 'In-place', description: 'Modify array without extra space' }
        ],
        whenToUse: [
            'Sorted array with duplicates',
            'Need to modify array in-place',
            'O(1) space requirement'
        ],
        typicalComplexity: { time: 'O(n)', space: 'O(1)' },
        order: 1
    },
    {
        name: 'Two Pointers (Opposite Direction)',
        slug: 'two-pointers-opposite',
        category: 'foundational',
        subcategory: 'two-pointers',
        description: 'Use two pointers starting from opposite ends, moving towards each other. Perfect for pair-finding and palindrome problems.',
        videoUrl: 'https://www.youtube.com/embed/cRBSOz49fQk',
        cheatsheet: `## Two Pointers (Opposite Direction)

### When to Use
- Two Sum in sorted array
- Container with most water
- Valid palindrome
- 3Sum / 4Sum problems

### Template
\`\`\`javascript
let left = 0, right = arr.length - 1;
while (left < right) {
  if (arr[left] + arr[right] === target) return [left, right];
  else if (sum < target) left++;
  else right--;
}
\`\`\`

### Key Insight
Converging from both ends eliminates need for nested loops.`,
        keyConcepts: [
            { title: 'Converging', description: 'Pointers move towards each other' },
            { title: 'Sorted Array', description: 'Usually requires sorted input' }
        ],
        whenToUse: [
            'Finding pairs with target sum',
            'Checking palindrome',
            'Sorted array problems'
        ],
        typicalComplexity: { time: 'O(n)', space: 'O(1)' },
        order: 2
    },
    {
        name: 'Sliding Window (Fixed)',
        slug: 'sliding-window-fixed',
        category: 'foundational',
        subcategory: 'sliding-window',
        description: 'Fixed-size window sliding across the array. Use when the window size is given or can be determined.',
        videoUrl: 'https://www.youtube.com/embed/GcW4mgmgSbw',
        cheatsheet: `## Sliding Window (Fixed Size)

### When to Use
- Maximum sum of K consecutive elements
- Find all anagrams of size K
- Maximum of all subarrays of size K

### Template
\`\`\`javascript
// Build first window
for (let i = 0; i < k; i++) {
  windowSum += arr[i];
}
let maxSum = windowSum;

// Slide the window
for (let i = k; i < arr.length; i++) {
  windowSum += arr[i] - arr[i - k]; // Add new, remove old
  maxSum = Math.max(maxSum, windowSum);
}
\`\`\`

### Key Insight
Add the new element, remove the oldest - constant time per slide.`,
        keyConcepts: [
            { title: 'Window Size K', description: 'Size is fixed and known' },
            { title: 'Slide O(1)', description: 'Each slide is constant time' }
        ],
        whenToUse: [
            'Subarray of fixed size K',
            'Consecutive element problems',
            'Moving average/maximum'
        ],
        typicalComplexity: { time: 'O(n)', space: 'O(1)' },
        order: 3
    },
    {
        name: 'Sliding Window (Variable)',
        slug: 'sliding-window-variable',
        category: 'foundational',
        subcategory: 'sliding-window',
        description: 'Variable-size window that expands and contracts based on conditions. Use for finding optimal subarray satisfying a constraint.',
        videoUrl: 'https://www.youtube.com/embed/jM2dhDPYMQM',
        cheatsheet: `## Sliding Window (Variable Size)

### When to Use
- Smallest subarray with sum >= S
- Longest substring with K distinct characters
- Minimum window substring

### Template
\`\`\`javascript
let left = 0;
for (let right = 0; right < arr.length; right++) {
  // Expand: add arr[right] to window
  
  while (windowInvalid) {
    // Contract: remove arr[left] from window
    left++;
  }
  
  // Update result
}
\`\`\`

### Key Insight
Expand to include more, contract when constraint violated.`,
        keyConcepts: [
            { title: 'Expand & Contract', description: 'Window size changes dynamically' },
            { title: 'Constraint-based', description: 'Contract when constraint breaks' }
        ],
        whenToUse: [
            'Find minimum/maximum subarray',
            'Substring with conditions',
            'At most K distinct elements'
        ],
        typicalComplexity: { time: 'O(n)', space: 'O(k)' },
        order: 4
    },
    {
        name: 'Fast & Slow Pointers',
        slug: 'fast-slow-pointers',
        category: 'foundational',
        subcategory: 'fast-slow',
        description: 'Two pointers moving at different speeds. Classic for cycle detection and finding middle of linked list.',
        videoUrl: 'https://www.youtube.com/embed/gBTe7lFR3vc',
        cheatsheet: `## Fast & Slow Pointers (Floyd's Cycle)

### When to Use
- Detect cycle in linked list
- Find middle of linked list
- Happy number problem
- Find start of cycle

### Template
\`\`\`javascript
let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;       // Move 1 step
  fast = fast.next.next;  // Move 2 steps
  if (slow === fast) return true; // Cycle!
}
return false;
\`\`\`

### Key Insight
If there's a cycle, fast will eventually catch slow.`,
        keyConcepts: [
            { title: 'Speed Difference', description: 'Fast moves 2x slow' },
            { title: 'Cycle Detection', description: 'They meet in a cycle' }
        ],
        whenToUse: [
            'Cycle detection',
            'Find middle element',
            'Find cycle start',
            'Happy number type problems'
        ],
        typicalComplexity: { time: 'O(n)', space: 'O(1)' },
        order: 5
    },

    // ========== INTERMEDIATE ==========
    {
        name: 'Merge Intervals',
        slug: 'merge-intervals',
        category: 'intermediate',
        subcategory: 'intervals',
        description: 'Handle overlapping intervals by sorting and merging. Essential for scheduling and range problems.',
        videoUrl: 'https://www.youtube.com/embed/44H3cEC2fFM',
        cheatsheet: `## Merge Intervals

### When to Use
- Merge overlapping intervals
- Insert interval
- Meeting rooms problems
- Interval intersection

### Template
\`\`\`javascript
intervals.sort((a, b) => a[0] - b[0]);
const merged = [intervals[0]];

for (let i = 1; i < intervals.length; i++) {
  const last = merged[merged.length - 1];
  const curr = intervals[i];
  
  if (curr[0] <= last[1]) {
    last[1] = Math.max(last[1], curr[1]); // Merge
  } else {
    merged.push(curr);
  }
}
\`\`\`

### Key Insight
Sort by start time, then merge if current start <= previous end.`,
        keyConcepts: [
            { title: 'Sort First', description: 'Always sort by start time' },
            { title: 'Overlap Check', description: 'curr.start <= prev.end' }
        ],
        whenToUse: [
            'Overlapping ranges',
            'Scheduling problems',
            'Calendar conflicts',
            'Range merging'
        ],
        typicalComplexity: { time: 'O(n log n)', space: 'O(n)' },
        order: 6
    },
    {
        name: 'BFS (Level Order)',
        slug: 'bfs-level-order',
        category: 'intermediate',
        subcategory: 'bfs',
        description: 'Breadth-First Search processes nodes level by level. Use for shortest path in unweighted graphs and level-based tree problems.',
        videoUrl: 'https://www.youtube.com/embed/oDqjPvD54Ss',
        cheatsheet: `## BFS (Level Order Traversal)

### When to Use
- Level order traversal
- Shortest path (unweighted)
- Minimum depth
- Rotting oranges / walls and gates

### Template
\`\`\`javascript
const queue = [root];
let level = 0;

while (queue.length > 0) {
  const levelSize = queue.length;
  
  for (let i = 0; i < levelSize; i++) {
    const node = queue.shift();
    // Process node
    
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  level++;
}
\`\`\`

### Key Insight
Process all nodes at current level before moving to next.`,
        keyConcepts: [
            { title: 'Queue', description: 'FIFO processing order' },
            { title: 'Level Size', description: 'Track nodes per level' }
        ],
        whenToUse: [
            'Level-by-level processing',
            'Shortest path (unweighted)',
            'Minimum steps/depth',
            'Multi-source BFS'
        ],
        typicalComplexity: { time: 'O(n)', space: 'O(w)' },
        order: 7
    },
    {
        name: 'DFS (Tree)',
        slug: 'dfs-tree',
        category: 'intermediate',
        subcategory: 'dfs',
        description: 'Depth-First Search explores as deep as possible before backtracking. Essential for path problems and tree traversals.',
        videoUrl: 'https://www.youtube.com/embed/Sbciimd09h4',
        cheatsheet: `## DFS (Tree Traversal)

### When to Use
- Path sum problems
- Tree diameter
- Validate BST
- Lowest common ancestor

### Template
\`\`\`javascript
function dfs(node, state) {
  if (!node) return baseCase;
  
  // Pre-order: process before children
  
  const left = dfs(node.left, newState);
  const right = dfs(node.right, newState);
  
  // Post-order: process after children
  
  return combine(left, right);
}
\`\`\`

### Key Insight
Choose pre/in/post-order based on when you need to process.`,
        keyConcepts: [
            { title: 'Recursion', description: 'Natural recursive structure' },
            { title: 'State Passing', description: 'Pass context down the tree' }
        ],
        whenToUse: [
            'Path from root to leaf',
            'Tree validation',
            'Tree construction',
            'Ancestor problems'
        ],
        typicalComplexity: { time: 'O(n)', space: 'O(h)' },
        order: 8
    },
    {
        name: 'Two Heaps',
        slug: 'two-heaps',
        category: 'intermediate',
        subcategory: 'heaps',
        description: 'Use two heaps (max + min) to track median or partition elements. Perfect for sliding window median.',
        videoUrl: 'https://www.youtube.com/embed/itmhHWaHupI',
        cheatsheet: `## Two Heaps Pattern

### When to Use
- Find median from data stream
- Sliding window median
- IPO problem
- Maximize capital

### Template
\`\`\`javascript
const maxHeap = new MaxPriorityQueue(); // smaller half
const minHeap = new MinPriorityQueue(); // larger half

function addNum(num) {
  maxHeap.enqueue(num);
  minHeap.enqueue(maxHeap.dequeue().element);
  
  // Balance: maxHeap can have at most 1 more element
  if (maxHeap.size() < minHeap.size()) {
    maxHeap.enqueue(minHeap.dequeue().element);
  }
}

function findMedian() {
  if (maxHeap.size() > minHeap.size()) {
    return maxHeap.front().element;
  }
  return (maxHeap.front().element + minHeap.front().element) / 2;
}
\`\`\`

### Key Insight
Max-heap holds smaller half, min-heap holds larger half.`,
        keyConcepts: [
            { title: 'Partition', description: 'Split into smaller/larger halves' },
            { title: 'Balance', description: 'Keep heaps balanced' }
        ],
        whenToUse: [
            'Running median',
            'Partition into two halves',
            'Kth element problems'
        ],
        typicalComplexity: { time: 'O(log n) per op', space: 'O(n)' },
        order: 9
    },

    // ========== ADVANCED ==========
    {
        name: 'DP - 0/1 Knapsack',
        slug: 'dp-01-knapsack',
        category: 'advanced',
        subcategory: 'dp-knapsack',
        description: 'Choose or skip each item exactly once. Foundation for many subset and partition problems.',
        videoUrl: 'https://www.youtube.com/embed/8LusJS5-AGo',
        cheatsheet: `## DP - 0/1 Knapsack

### When to Use
- Subset sum
- Equal partition
- Target sum
- Coin change (limited coins)

### Template
\`\`\`javascript
// dp[i][w] = max value with first i items, capacity w
const dp = Array(n + 1).fill(0).map(() => Array(W + 1).fill(0));

for (let i = 1; i <= n; i++) {
  for (let w = 1; w <= W; w++) {
    if (weights[i-1] <= w) {
      dp[i][w] = Math.max(
        dp[i-1][w],                        // Skip
        dp[i-1][w - weights[i-1]] + values[i-1] // Take
      );
    } else {
      dp[i][w] = dp[i-1][w];
    }
  }
}
\`\`\`

### Key Insight
For each item: either take it or leave it.`,
        keyConcepts: [
            { title: 'Take or Leave', description: 'Binary choice per item' },
            { title: 'Capacity', description: 'Track remaining capacity' }
        ],
        whenToUse: [
            'Each item used at most once',
            'Subset selection',
            'Partition problems',
            'Bounded resources'
        ],
        typicalComplexity: { time: 'O(n*W)', space: 'O(n*W)' },
        order: 10
    },
    {
        name: 'DP - Unbounded Knapsack',
        slug: 'dp-unbounded-knapsack',
        category: 'advanced',
        subcategory: 'dp-knapsack',
        description: 'Items can be used unlimited times. Use for coin change, rod cutting, and ribbon cutting.',
        videoUrl: 'https://www.youtube.com/embed/jgiZlGzXMBw',
        cheatsheet: `## DP - Unbounded Knapsack

### When to Use
- Coin change (unlimited coins)
- Rod cutting
- Ribbon cutting
- Minimum coins

### Template
\`\`\`javascript
// dp[w] = max value with capacity w
const dp = Array(W + 1).fill(0);

for (let w = 1; w <= W; w++) {
  for (let i = 0; i < n; i++) {
    if (weights[i] <= w) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
}
\`\`\`

### Key Insight
Can reuse items, so reference current row (not previous).`,
        keyConcepts: [
            { title: 'Unlimited Use', description: 'Same item can be picked multiple times' },
            { title: '1D DP', description: 'No need for 2D, iterate capacity first' }
        ],
        whenToUse: [
            'Unlimited item usage',
            'Coin change problems',
            'Cutting problems',
            'Combinations'
        ],
        typicalComplexity: { time: 'O(n*W)', space: 'O(W)' },
        order: 11
    },
    {
        name: 'DP - Longest Common Subsequence',
        slug: 'dp-lcs',
        category: 'advanced',
        subcategory: 'dp-string',
        description: 'Find the longest subsequence common to two sequences. Foundation for edit distance and diff algorithms.',
        videoUrl: 'https://www.youtube.com/embed/sSno9rV8Rhg',
        cheatsheet: `## DP - Longest Common Subsequence

### When to Use
- Longest Common Subsequence
- Shortest Common Supersequence
- Edit Distance
- Minimum Deletions

### Template
\`\`\`javascript
const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    if (s1[i-1] === s2[j-1]) {
      dp[i][j] = dp[i-1][j-1] + 1;
    } else {
      dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
}
\`\`\`

### Key Insight
Match → diagonal + 1. No match → max(left, up).`,
        keyConcepts: [
            { title: 'Two Strings', description: 'Compare character by character' },
            { title: 'Diagonal Relation', description: 'Match adds to diagonal' }
        ],
        whenToUse: [
            'Comparing two sequences',
            'String similarity',
            'Edit operations',
            'Diff algorithms'
        ],
        typicalComplexity: { time: 'O(m*n)', space: 'O(m*n)' },
        order: 12
    },
    {
        name: 'Backtracking with Pruning',
        slug: 'backtracking',
        category: 'advanced',
        subcategory: 'backtracking',
        description: 'Explore all possibilities with smart pruning. Use for permutations, combinations, and constraint satisfaction.',
        videoUrl: 'https://www.youtube.com/embed/REOH22Xwdkk',
        cheatsheet: `## Backtracking with Pruning

### When to Use
- Generate permutations
- Generate combinations
- N-Queens
- Sudoku solver

### Template
\`\`\`javascript
function backtrack(path, choices) {
  if (isComplete(path)) {
    results.push([...path]);
    return;
  }
  
  for (const choice of choices) {
    if (!isValid(choice)) continue; // Prune!
    
    path.push(choice);        // Make choice
    backtrack(path, newChoices);
    path.pop();               // Undo choice
  }
}
\`\`\`

### Key Insight
Try → Recurse → Undo. Prune early to avoid waste.`,
        keyConcepts: [
            { title: 'Try-Undo', description: 'Make choice, explore, backtrack' },
            { title: 'Pruning', description: 'Skip invalid branches early' }
        ],
        whenToUse: [
            'Generate all possibilities',
            'Constraint satisfaction',
            'Combinatorial problems',
            'Puzzle solving'
        ],
        typicalComplexity: { time: 'O(n!) or O(2^n)', space: 'O(n)' },
        order: 13
    },
    {
        name: 'Topological Sort',
        slug: 'topological-sort',
        category: 'advanced',
        subcategory: 'graphs',
        description: 'Order nodes in DAG respecting dependencies. Essential for task scheduling and course ordering.',
        videoUrl: 'https://www.youtube.com/embed/eL-KzMXSXXI',
        cheatsheet: `## Topological Sort (Kahn's Algorithm)

### When to Use
- Course schedule
- Task scheduling
- Build order
- Alien dictionary

### Template
\`\`\`javascript
// Build indegree map
const indegree = new Map();
const graph = new Map();

// Initialize
for (const node of nodes) {
  indegree.set(node, 0);
  graph.set(node, []);
}

// Build graph
for (const [from, to] of edges) {
  graph.get(from).push(to);
  indegree.set(to, indegree.get(to) + 1);
}

// Start with 0 indegree nodes
const queue = [];
for (const [node, deg] of indegree) {
  if (deg === 0) queue.push(node);
}

const result = [];
while (queue.length > 0) {
  const node = queue.shift();
  result.push(node);
  
  for (const neighbor of graph.get(node)) {
    indegree.set(neighbor, indegree.get(neighbor) - 1);
    if (indegree.get(neighbor) === 0) {
      queue.push(neighbor);
    }
  }
}

return result.length === nodes.length ? result : []; // Check cycle
\`\`\`

### Key Insight
Process nodes with no incoming edges first.`,
        keyConcepts: [
            { title: 'Indegree', description: 'Count of incoming edges' },
            { title: 'Queue', description: 'Process zero-indegree nodes' }
        ],
        whenToUse: [
            'Dependency ordering',
            'Task scheduling',
            'Course prerequisites',
            'Build systems'
        ],
        typicalComplexity: { time: 'O(V + E)', space: 'O(V)' },
        order: 14
    }
];

const problems = [
    // Two Pointers Same Direction
    {
        title: 'Remove Duplicates from Sorted Array',
        slug: 'remove-duplicates-sorted-array',
        difficulty: 'easy',
        patternSlug: 'two-pointers-same',
        isCoreProblem: true,
        description: 'Given a sorted array, remove duplicates in-place and return the new length.',
        examples: [
            { input: '[1,1,2]', output: '2, nums = [1,2]', explanation: 'Remove duplicate 1' }
        ],
        starterCode: {
            javascript: 'function removeDuplicates(nums) {\n  // Your code here\n}',
            python: 'def removeDuplicates(nums):\n    # Your code here\n    pass'
        },
        solution: {
            approach: 'Use slow pointer to track unique position, fast pointer to explore.',
            code: {
                javascript: `function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}`
            },
            complexity: { time: 'O(n)', space: 'O(1)' }
        },
        hints: [
            { level: 1, content: 'Use two pointers - slow and fast.' },
            { level: 2, content: 'Slow marks the last unique element position.' },
            { level: 3, content: 'When fast finds a new element, move slow forward and copy.' }
        ],
        leetcodeLink: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
        tags: ['array', 'two-pointers']
    },
    {
        title: 'Move Zeroes',
        slug: 'move-zeroes',
        difficulty: 'easy',
        patternSlug: 'two-pointers-same',
        isCoreProblem: false,
        description: 'Move all zeroes to the end while maintaining relative order of non-zero elements.',
        examples: [
            { input: '[0,1,0,3,12]', output: '[1,3,12,0,0]', explanation: 'Non-zero elements moved left' }
        ],
        hints: [
            { level: 1, content: 'Similar to remove duplicates pattern.' },
            { level: 2, content: 'Swap non-zero with slow pointer position.' }
        ],
        leetcodeLink: 'https://leetcode.com/problems/move-zeroes/',
        tags: ['array', 'two-pointers']
    },

    // Two Pointers Opposite Direction
    {
        title: 'Two Sum II - Sorted Array',
        slug: 'two-sum-sorted',
        difficulty: 'medium',
        patternSlug: 'two-pointers-opposite',
        isCoreProblem: true,
        description: 'Find two numbers in a sorted array that add up to target.',
        examples: [
            { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]', explanation: '2 + 7 = 9' }
        ],
        hints: [
            { level: 1, content: 'Use two pointers from both ends.' },
            { level: 2, content: 'If sum too small, move left. If too big, move right.' }
        ],
        leetcodeLink: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
        tags: ['array', 'two-pointers', 'binary-search']
    },
    {
        title: 'Container With Most Water',
        slug: 'container-most-water',
        difficulty: 'medium',
        patternSlug: 'two-pointers-opposite',
        isCoreProblem: true,
        description: 'Find two lines that together with x-axis form a container that holds most water.',
        examples: [
            { input: '[1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Lines at index 1 and 8' }
        ],
        hints: [
            { level: 1, content: 'Start from both ends - maximum width.' },
            { level: 2, content: 'Move the pointer with shorter line.' }
        ],
        leetcodeLink: 'https://leetcode.com/problems/container-with-most-water/',
        tags: ['array', 'two-pointers', 'greedy']
    },

    // Sliding Window Fixed
    {
        title: 'Maximum Sum Subarray of Size K',
        slug: 'max-sum-subarray-k',
        difficulty: 'easy',
        patternSlug: 'sliding-window-fixed',
        isCoreProblem: true,
        description: 'Find the maximum sum of any contiguous subarray of size K.',
        examples: [
            { input: 'arr = [2,1,5,1,3,2], k = 3', output: '9', explanation: 'Subarray [5,1,3]' }
        ],
        hints: [
            { level: 1, content: 'Calculate sum of first K elements.' },
            { level: 2, content: 'Slide: add new element, subtract oldest.' }
        ],
        tags: ['array', 'sliding-window']
    },

    // Sliding Window Variable
    {
        title: 'Longest Substring Without Repeating Characters',
        slug: 'longest-substring-no-repeat',
        difficulty: 'medium',
        patternSlug: 'sliding-window-variable',
        isCoreProblem: true,
        description: 'Find the length of the longest substring without repeating characters.',
        examples: [
            { input: '"abcabcbb"', output: '3', explanation: '"abc" is the longest' }
        ],
        hints: [
            { level: 1, content: 'Use a set to track characters in window.' },
            { level: 2, content: 'Expand right, shrink left when duplicate found.' }
        ],
        leetcodeLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
        tags: ['string', 'sliding-window', 'hash-table']
    },
    {
        title: 'Minimum Window Substring',
        slug: 'minimum-window-substring',
        difficulty: 'hard',
        patternSlug: 'sliding-window-variable',
        isCoreProblem: true,
        description: 'Find the minimum window in S which contains all characters of T.',
        examples: [
            { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: 'Minimum window containing A, B, C' }
        ],
        hints: [
            { level: 1, content: 'Use frequency map for target string.' },
            { level: 2, content: 'Expand to include all chars, then shrink to minimize.' }
        ],
        leetcodeLink: 'https://leetcode.com/problems/minimum-window-substring/',
        tags: ['string', 'sliding-window', 'hash-table']
    },

    // Fast Slow Pointers
    {
        title: 'Linked List Cycle',
        slug: 'linked-list-cycle',
        difficulty: 'easy',
        patternSlug: 'fast-slow-pointers',
        isCoreProblem: true,
        description: 'Determine if a linked list has a cycle.',
        examples: [
            { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'Tail connects to node 1' }
        ],
        hints: [
            { level: 1, content: 'Use Floyd\'s cycle detection.' },
            { level: 2, content: 'Fast moves 2 steps, slow moves 1.' }
        ],
        leetcodeLink: 'https://leetcode.com/problems/linked-list-cycle/',
        tags: ['linked-list', 'two-pointers']
    },
    {
        title: 'Find the Duplicate Number',
        slug: 'find-duplicate-number',
        difficulty: 'medium',
        patternSlug: 'fast-slow-pointers',
        isCoreProblem: true,
        description: 'Find the duplicate number in array with n+1 integers in range [1,n].',
        examples: [
            { input: '[1,3,4,2,2]', output: '2', explanation: '2 appears twice' }
        ],
        hints: [
            { level: 1, content: 'Treat array as linked list with cycle.' },
            { level: 2, content: 'Use Floyd\'s algorithm to find cycle start.' }
        ],
        leetcodeLink: 'https://leetcode.com/problems/find-the-duplicate-number/',
        tags: ['array', 'two-pointers', 'binary-search']
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/babua-lms');
        console.log('Connected to MongoDB');

        // Clear existing data
        await Pattern.deleteMany({});
        await Problem.deleteMany({});
        console.log('Cleared existing data');

        // Insert patterns
        const createdPatterns = await Pattern.insertMany(patterns);
        console.log(`Created ${createdPatterns.length} patterns`);

        // Create a map of slug to pattern ID
        const patternMap = {};
        createdPatterns.forEach(p => {
            patternMap[p.slug] = p._id;
        });

        // Insert problems with pattern references
        const problemsWithRefs = problems.map(p => ({
            ...p,
            pattern: patternMap[p.patternSlug]
        }));

        const createdProblems = await Problem.insertMany(problemsWithRefs);
        console.log(`Created ${createdProblems.length} problems`);

        // Update pattern totalProblems count
        for (const pattern of createdPatterns) {
            const count = await Problem.countDocuments({ pattern: pattern._id });
            pattern.totalProblems = count;
            await pattern.save();
        }
        console.log('Updated pattern problem counts');

        // Create a demo user
        const existingUser = await User.findOne({ email: 'demo@babua.lms' });
        if (!existingUser) {
            await User.create({
                email: 'demo@babua.lms',
                password: 'demo123',
                name: 'Demo Student',
                role: 'student',
                streakCount: 7,
                babuaCoins: 150
            });
            console.log('Created demo user: demo@babua.lms / demo123');
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('Demo credentials: demo@babua.lms / demo123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();
