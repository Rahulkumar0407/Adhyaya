// Fallback Questions - Used when all AI providers fail
// Ensures interview NEVER crashes

export const FALLBACK_QUESTIONS = {
    hr: [
        "Tell me about yourself and your background.",
        "What are your greatest strengths and how do they help you professionally?",
        "Describe a challenging situation you faced and how you handled it.",
        "Where do you see yourself in 5 years?",
        "Why do you want to work in this industry?",
        "Tell me about a time you worked in a team. What was your role?",
        "How do you handle pressure or stressful situations?",
        "What motivates you to do your best work?",
        "Describe a situation where you had to learn something quickly.",
        "Do you have any questions for us?"
    ],

    dsa: [
        "Explain the difference between an array and a linked list. When would you use each?",
        "What is time complexity? Explain Big O notation with examples.",
        "How does a hash table work? What are collision handling techniques?",
        "Explain the difference between BFS and DFS. When would you use each?",
        "What is dynamic programming? Give an example problem.",
        "Explain the two-pointer technique with an example.",
        "What is a binary search tree? What are its advantages?",
        "Explain the sliding window pattern. What problems does it solve?",
        "What is the difference between stack and queue? Give use cases.",
        "How would you detect a cycle in a linked list?"
    ],

    coding: [
        "Write a function to reverse a string without using built-in methods.",
        "Find the maximum element in an array. Optimize for time complexity.",
        "Write code to check if a string is a palindrome.",
        "Implement a function to find two numbers that add up to a target sum.",
        "Write a function to remove duplicates from a sorted array in-place.",
        "Implement binary search on a sorted array.",
        "Write code to check if parentheses in a string are balanced.",
        "Find the first non-repeating character in a string.",
        "Implement a queue using two stacks.",
        "Write a function to merge two sorted arrays."
    ],

    'system-design': [
        "How would you design a URL shortening service like bit.ly?",
        "Design a basic chat application. What components would you need?",
        "How would you design a cache system? What eviction policies exist?",
        "Explain how you would design a rate limiter.",
        "Design a notification system for a mobile app.",
        "How would you handle millions of file uploads efficiently?",
        "Design a simple recommendation system. What data would you need?",
        "How would you design an API gateway?",
        "Explain the trade-offs between SQL and NoSQL databases.",
        "How would you design a system to handle peak traffic?"
    ]
};

// Adhyaya resource mapping based on weak areas
// Maps topic keywords to Adhyaya platform resources
export const ADHYAYA_RESOURCES = {
    // DSA Patterns
    'sliding_window': {
        title: 'Sliding Window Pattern',
        type: 'dsa-pattern',
        path: '/dsa/sliding-window',
        description: 'Master fixed and variable window problems'
    },
    'two_pointer': {
        title: 'Two Pointer Technique',
        type: 'dsa-pattern',
        path: '/dsa/two-pointer',
        description: 'Learn to solve array problems efficiently'
    },
    'binary_search': {
        title: 'Binary Search Pattern',
        type: 'dsa-pattern',
        path: '/dsa/binary-search',
        description: 'Search algorithms and variations'
    },
    'dp': {
        title: 'Dynamic Programming',
        type: 'dsa-pattern',
        path: '/dsa/dp',
        description: 'Memoization, tabulation, and classic DP problems'
    },
    'graphs': {
        title: 'Graph Algorithms',
        type: 'dsa-pattern',
        path: '/dsa/graphs',
        description: 'BFS, DFS, shortest paths, and graph traversal'
    },
    'trees': {
        title: 'Tree Data Structures',
        type: 'dsa-pattern',
        path: '/dsa/trees',
        description: 'Binary trees, BST, and tree traversal'
    },
    'recursion': {
        title: 'Recursion & Backtracking',
        type: 'dsa-pattern',
        path: '/dsa/recursion',
        description: 'Recursive thinking and backtracking patterns'
    },
    'stack_queue': {
        title: 'Stack & Queue',
        type: 'dsa-pattern',
        path: '/dsa/stack-queue',
        description: 'LIFO, FIFO, and monotonic stack'
    },
    'linked_list': {
        title: 'Linked List Patterns',
        type: 'dsa-pattern',
        path: '/dsa/linked-list',
        description: 'Singly, doubly linked lists and common operations'
    },
    'array': {
        title: 'Array Techniques',
        type: 'dsa-pattern',
        path: '/dsa/array',
        description: 'Array manipulation, prefix sum, and subarray problems'
    },
    'hash_table': {
        title: 'Hash Tables & Maps',
        type: 'dsa-pattern',
        path: '/dsa/hash-table',
        description: 'Hashing, collision handling, and frequency problems'
    },
    'string': {
        title: 'String Algorithms',
        type: 'dsa-pattern',
        path: '/dsa/string',
        description: 'Pattern matching, manipulation, and parsing'
    },
    'sorting': {
        title: 'Sorting Algorithms',
        type: 'dsa-pattern',
        path: '/dsa/sorting',
        description: 'Merge sort, quick sort, and custom comparators'
    },
    'heap': {
        title: 'Heap & Priority Queue',
        type: 'dsa-pattern',
        path: '/dsa/heap',
        description: 'Min/max heap, top-k problems'
    },
    'greedy': {
        title: 'Greedy Algorithms',
        type: 'dsa-pattern',
        path: '/dsa/greedy',
        description: 'Optimal local choices and interval problems'
    },
    'trie': {
        title: 'Trie Data Structure',
        type: 'dsa-pattern',
        path: '/dsa/trie',
        description: 'Prefix trees and autocomplete problems'
    },

    // Core CS Topics
    'dbms': {
        title: 'DBMS Course',
        type: 'course',
        path: '/dbms',
        description: 'Database concepts, SQL, and normalization'
    },
    'os': {
        title: 'Operating Systems',
        type: 'course',
        path: '/os',
        description: 'Process management, memory, and scheduling'
    },
    'cn': {
        title: 'Computer Networks',
        type: 'course',
        path: '/cn',
        description: 'Networking fundamentals and protocols'
    },

    // System Design Topics
    'scalability': {
        title: 'Scalability Basics',
        type: 'system-design',
        path: '/system-design#scalability',
        description: 'Horizontal vs vertical scaling'
    },
    'caching': {
        title: 'Caching Strategies',
        type: 'system-design',
        path: '/system-design#caching',
        description: 'Cache invalidation and patterns'
    },
    'database_design': {
        title: 'Database Design',
        type: 'system-design',
        path: '/system-design#database',
        description: 'SQL vs NoSQL, sharding, replication'
    },

    // Soft Skills
    'communication': {
        title: 'Communication Skills',
        type: 'mentor',
        path: '/mentors',
        description: 'Book a session with a mentor to improve communication'
    },
    'confidence': {
        title: 'Interview Confidence',
        type: 'mentor',
        path: '/mentors',
        description: 'Practice with a mentor to build confidence'
    }
};

// Map weak topics from AI evaluation to Adhyaya resources
export function mapWeakAreasToResources(weakTopics = []) {
    const resources = [];
    const matched = new Set();

    for (const topic of weakTopics) {
        const normalizedTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, '_');

        // Direct match
        if (ADHYAYA_RESOURCES[normalizedTopic] && !matched.has(normalizedTopic)) {
            resources.push(ADHYAYA_RESOURCES[normalizedTopic]);
            matched.add(normalizedTopic);
            continue;
        }

        // Partial match
        for (const [key, resource] of Object.entries(ADHYAYA_RESOURCES)) {
            if (!matched.has(key) && (
                normalizedTopic.includes(key) ||
                key.includes(normalizedTopic) ||
                resource.title.toLowerCase().includes(topic.toLowerCase())
            )) {
                resources.push(resource);
                matched.add(key);
                break;
            }
        }
    }

    // Limit to top 5 resources
    return resources.slice(0, 5);
}

// Get random fallback question for interview type
export function getRandomFallbackQuestion(interviewType, usedQuestions = []) {
    const questions = FALLBACK_QUESTIONS[interviewType] || FALLBACK_QUESTIONS['dsa'];
    const available = questions.filter(q => !usedQuestions.includes(q));

    if (available.length === 0) {
        return questions[0]; // Reset to first if all used
    }

    return available[Math.floor(Math.random() * available.length)];
}

export default {
    FALLBACK_QUESTIONS,
    ADHYAYA_RESOURCES,
    mapWeakAreasToResources,
    getRandomFallbackQuestion
};
