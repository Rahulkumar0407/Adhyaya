import mongoose from 'mongoose';

const InterviewPatternSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['dsa', 'system-design'],
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    examples: [String], // Example problem names
    tips: [String], // Tips for solving this pattern
    resources: [{
        title: String,
        url: String,
        type: { type: String, enum: ['video', 'article', 'course'] }
    }]
}, {
    timestamps: true
});

// Static method to seed default patterns
InterviewPatternSchema.statics.seedPatterns = async function () {
    const dsaPatterns = [
        {
            category: 'dsa',
            name: 'Sliding Window',
            slug: 'sliding_window',
            description: 'Technique for finding subarrays/substrings that satisfy certain conditions',
            difficulty: 'medium',
            examples: ['Maximum Sum Subarray of Size K', 'Longest Substring Without Repeating Characters', 'Minimum Window Substring'],
            tips: ['Identify the window boundaries', 'Expand/shrink based on condition', 'Track window state with hash map']
        },
        {
            category: 'dsa',
            name: 'Two Pointer',
            slug: 'two_pointer',
            description: 'Using two pointers to traverse array from different positions',
            difficulty: 'easy',
            examples: ['Two Sum II', 'Container With Most Water', 'Three Sum'],
            tips: ['Sort array if needed', 'Move pointers based on comparison', 'Handle duplicates carefully']
        },
        {
            category: 'dsa',
            name: 'Binary Search',
            slug: 'binary_search',
            description: 'Divide and conquer search in sorted arrays',
            difficulty: 'medium',
            examples: ['Search in Rotated Sorted Array', 'Find First and Last Position', 'Median of Two Sorted Arrays'],
            tips: ['Always check for sorted condition', 'Handle edge cases carefully', 'Consider lower_bound vs upper_bound']
        },
        {
            category: 'dsa',
            name: 'Dynamic Programming',
            slug: 'dp',
            description: 'Breaking problems into overlapping subproblems',
            difficulty: 'hard',
            examples: ['Climbing Stairs', 'Coin Change', 'Longest Common Subsequence'],
            tips: ['Define state clearly', 'Write recurrence relation first', 'Consider memoization vs tabulation']
        },
        {
            category: 'dsa',
            name: 'Graphs',
            slug: 'graphs',
            description: 'Graph traversal and shortest path algorithms',
            difficulty: 'hard',
            examples: ['Number of Islands', 'Course Schedule', 'Dijkstra\'s Algorithm'],
            tips: ['Choose BFS for shortest path in unweighted graphs', 'Use DFS for exhaustive search', 'Track visited nodes']
        },
        {
            category: 'dsa',
            name: 'Trees',
            slug: 'trees',
            description: 'Binary tree and BST operations',
            difficulty: 'medium',
            examples: ['Invert Binary Tree', 'Lowest Common Ancestor', 'Serialize and Deserialize'],
            tips: ['Consider recursive vs iterative', 'Use level-order for breadth problems', 'Handle null nodes carefully']
        },
        {
            category: 'dsa',
            name: 'Stack & Queue',
            slug: 'stack_queue',
            description: 'LIFO and FIFO data structure problems',
            difficulty: 'medium',
            examples: ['Valid Parentheses', 'Next Greater Element', 'Implement Queue using Stacks'],
            tips: ['Stack for matching pairs', 'Monotonic stack for next greater/smaller', 'Queue for BFS']
        },
        {
            category: 'dsa',
            name: 'Recursion & Backtracking',
            slug: 'recursion',
            description: 'Generate all combinations/permutations',
            difficulty: 'medium',
            examples: ['Subsets', 'Permutations', 'N-Queens'],
            tips: ['Draw the recursion tree', 'Prune early for efficiency', 'Track state carefully']
        },
        {
            category: 'dsa',
            name: 'Greedy',
            slug: 'greedy',
            description: 'Locally optimal choices for global optimum',
            difficulty: 'medium',
            examples: ['Jump Game', 'Meeting Rooms', 'Task Scheduler'],
            tips: ['Prove greedy works', 'Sort if ordering matters', 'Consider counter-examples']
        },
        {
            category: 'dsa',
            name: 'Trie',
            slug: 'trie',
            description: 'Prefix tree for string operations',
            difficulty: 'hard',
            examples: ['Implement Trie', 'Word Search II', 'Design Add and Search Words'],
            tips: ['Use for prefix matching', 'Consider space-time tradeoffs', 'Handle end-of-word markers']
        }
    ];

    const sdPatterns = [
        {
            category: 'system-design',
            name: 'Scalability',
            slug: 'scalability',
            description: 'Designing for horizontal and vertical scaling',
            difficulty: 'hard',
            examples: ['Design Twitter', 'Design URL Shortener', 'Design Netflix'],
            tips: ['Consider read vs write ratio', 'Use caching strategically', 'Partition data effectively']
        },
        {
            category: 'system-design',
            name: 'Caching',
            slug: 'caching',
            description: 'Reducing latency with cache layers',
            difficulty: 'medium',
            examples: ['Design Cache System', 'CDN Design', 'Session Management'],
            tips: ['Consider cache invalidation', 'Choose eviction policy', 'Handle cache misses gracefully']
        },
        {
            category: 'system-design',
            name: 'Load Balancing',
            slug: 'load_balancing',
            description: 'Distributing traffic across servers',
            difficulty: 'medium',
            examples: ['Design Load Balancer', 'API Gateway', 'Service Discovery'],
            tips: ['Consider health checks', 'Choose algorithm (round-robin, least connections)', 'Handle sticky sessions']
        },
        {
            category: 'system-design',
            name: 'Database Design',
            slug: 'database_design',
            description: 'SQL vs NoSQL, sharding, replication',
            difficulty: 'hard',
            examples: ['Design Instagram Database', 'Design Chat System Storage', 'Design Analytics Platform'],
            tips: ['Understand CAP theorem', 'Consider consistency requirements', 'Plan for data growth']
        },
        {
            category: 'system-design',
            name: 'Microservices',
            slug: 'microservices',
            description: 'Service-oriented architecture design',
            difficulty: 'hard',
            examples: ['Design E-commerce Platform', 'Design Uber', 'Design Payment System'],
            tips: ['Define service boundaries', 'Handle inter-service communication', 'Plan for failure scenarios']
        },
        {
            category: 'system-design',
            name: 'CDN',
            slug: 'cdn',
            description: 'Content delivery network design',
            difficulty: 'medium',
            examples: ['Design YouTube', 'Design Image Hosting', 'Design Static Asset Delivery'],
            tips: ['Consider geographic distribution', 'Handle cache invalidation', 'Optimize for latency']
        },
        {
            category: 'system-design',
            name: 'Message Queues',
            slug: 'message_queues',
            description: 'Asynchronous communication patterns',
            difficulty: 'medium',
            examples: ['Design Notification System', 'Design Order Processing', 'Design Event-Driven System'],
            tips: ['Consider message ordering', 'Handle failures and retries', 'Choose pub/sub vs queue']
        },
        {
            category: 'system-design',
            name: 'Rate Limiting',
            slug: 'rate_limiting',
            description: 'Protecting systems from abuse',
            difficulty: 'medium',
            examples: ['Design API Rate Limiter', 'Design DDoS Protection', 'Design Fair Usage System'],
            tips: ['Choose algorithm (token bucket, sliding window)', 'Consider distributed rate limiting', 'Handle edge cases']
        }
    ];

    // Upsert all patterns
    for (const pattern of [...dsaPatterns, ...sdPatterns]) {
        await this.findOneAndUpdate(
            { slug: pattern.slug },
            pattern,
            { upsert: true, new: true }
        );
    }

    console.log('Interview patterns seeded successfully');
};

export default mongoose.model('InterviewPattern', InterviewPatternSchema);
