// Course data structure - matches takeuforward.org structure but with original content

export const courses = {
    dsa: {
        id: 'dsa',
        title: 'Data Structures & Algorithms',
        subtitle: 'Master the fundamentals to crack any coding interview',
        description: 'A comprehensive roadmap to master DSA from basics to advanced topics, with interview-focused explanations and practice problems.',
        sections: [
            {
                id: 'basics',
                title: 'Basics',
                topics: [
                    { id: 'time-complexity', title: 'Time Complexity', slug: 'time-complexity' },
                    { id: 'space-complexity', title: 'Space Complexity', slug: 'space-complexity' },
                    { id: 'arrays-intro', title: 'Introduction to Arrays', slug: 'arrays-intro' },
                ]
            },
            {
                id: 'arrays',
                title: 'Arrays',
                topics: [
                    { id: 'two-pointers', title: 'Two Pointers', slug: 'two-pointers' },
                    { id: 'sliding-window', title: 'Sliding Window', slug: 'sliding-window' },
                    { id: 'prefix-sum', title: 'Prefix Sum', slug: 'prefix-sum' },
                    { id: 'kadane-algorithm', title: "Kadane's Algorithm", slug: 'kadane-algorithm' },
                ]
            },
            {
                id: 'strings',
                title: 'Strings',
                topics: [
                    { id: 'string-basics', title: 'String Basics', slug: 'string-basics' },
                    { id: 'string-pattern-matching', title: 'Pattern Matching', slug: 'string-pattern-matching' },
                    { id: 'palindrome', title: 'Palindrome Problems', slug: 'palindrome' },
                ]
            },
            {
                id: 'linked-lists',
                title: 'Linked Lists',
                topics: [
                    { id: 'll-intro', title: 'Introduction to Linked Lists', slug: 'll-intro' },
                    { id: 'll-operations', title: 'Basic Operations', slug: 'll-operations' },
                    { id: 'fast-slow-pointers', title: 'Fast & Slow Pointers', slug: 'fast-slow-pointers' },
                    { id: 'reverse-ll', title: 'Reversing Linked Lists', slug: 'reverse-ll' },
                ]
            },
            {
                id: 'stack-queue',
                title: 'Stack & Queue',
                topics: [
                    { id: 'stack-basics', title: 'Stack Fundamentals', slug: 'stack-basics' },
                    { id: 'queue-basics', title: 'Queue Fundamentals', slug: 'queue-basics' },
                    { id: 'monotonic-stack', title: 'Monotonic Stack', slug: 'monotonic-stack' },
                ]
            },
            {
                id: 'recursion',
                title: 'Recursion & Backtracking',
                topics: [
                    { id: 'recursion-basics', title: 'Recursion Fundamentals', slug: 'recursion-basics' },
                    { id: 'backtracking', title: 'Backtracking', slug: 'backtracking' },
                    { id: 'subsets', title: 'Subsets & Combinations', slug: 'subsets' },
                ]
            },
            {
                id: 'trees',
                title: 'Trees',
                topics: [
                    { id: 'tree-basics', title: 'Tree Fundamentals', slug: 'tree-basics' },
                    { id: 'tree-traversal', title: 'Tree Traversal', slug: 'tree-traversal' },
                    { id: 'binary-tree', title: 'Binary Tree Problems', slug: 'binary-tree' },
                ]
            },
            {
                id: 'bst',
                title: 'Binary Search Trees',
                topics: [
                    { id: 'bst-basics', title: 'BST Fundamentals', slug: 'bst-basics' },
                    { id: 'bst-operations', title: 'BST Operations', slug: 'bst-operations' },
                ]
            },
            {
                id: 'heaps',
                title: 'Heaps',
                topics: [
                    { id: 'heap-basics', title: 'Heap Fundamentals', slug: 'heap-basics' },
                    { id: 'priority-queue', title: 'Priority Queue', slug: 'priority-queue' },
                ]
            },
            {
                id: 'graphs',
                title: 'Graphs',
                topics: [
                    { id: 'graph-basics', title: 'Graph Fundamentals', slug: 'graph-basics' },
                    { id: 'bfs', title: 'BFS', slug: 'bfs' },
                    { id: 'dfs', title: 'DFS', slug: 'dfs' },
                    { id: 'shortest-path', title: 'Shortest Path Algorithms', slug: 'shortest-path' },
                ]
            },
            {
                id: 'dp',
                title: 'Dynamic Programming',
                topics: [
                    { id: 'dp-intro', title: 'DP Introduction', slug: 'dp-intro' },
                    { id: 'dp-1d', title: '1D DP', slug: 'dp-1d' },
                    { id: 'dp-2d', title: '2D DP', slug: 'dp-2d' },
                    { id: 'dp-patterns', title: 'DP Patterns', slug: 'dp-patterns' },
                ]
            },
            {
                id: 'advanced',
                title: 'Advanced Topics',
                topics: [
                    { id: 'trie', title: 'Trie', slug: 'trie' },
                    { id: 'segment-tree', title: 'Segment Tree', slug: 'segment-tree' },
                ]
            },
        ]
    },
    lld: {
        id: 'lld',
        title: 'Low Level Design',
        subtitle: 'Master object-oriented design and design patterns',
        description: 'Learn to design scalable, maintainable systems using OOP principles, SOLID, and design patterns.',
        sections: [
            {
                id: 'oop-fundamentals',
                title: 'OOP Fundamentals',
                topics: [
                    { id: 'oop-basics', title: 'OOP Basics', slug: 'oop-basics' },
                    { id: 'inheritance', title: 'Inheritance', slug: 'inheritance' },
                    { id: 'polymorphism', title: 'Polymorphism', slug: 'polymorphism' },
                ]
            },
            {
                id: 'solid',
                title: 'SOLID Principles',
                topics: [
                    { id: 'single-responsibility', title: 'Single Responsibility', slug: 'single-responsibility' },
                    { id: 'open-closed', title: 'Open-Closed', slug: 'open-closed' },
                    { id: 'liskov-substitution', title: 'Liskov Substitution', slug: 'liskov-substitution' },
                    { id: 'interface-segregation', title: 'Interface Segregation', slug: 'interface-segregation' },
                    { id: 'dependency-inversion', title: 'Dependency Inversion', slug: 'dependency-inversion' },
                ]
            },
            {
                id: 'uml',
                title: 'UML Diagrams',
                topics: [
                    { id: 'class-diagram', title: 'Class Diagrams', slug: 'class-diagram' },
                    { id: 'sequence-diagram', title: 'Sequence Diagrams', slug: 'sequence-diagram' },
                ]
            },
            {
                id: 'design-patterns',
                title: 'Design Patterns',
                subtopics: [
                    {
                        id: 'creational',
                        title: 'Creational',
                        topics: [
                            { id: 'singleton', title: 'Singleton', slug: 'singleton' },
                            { id: 'factory', title: 'Factory', slug: 'factory' },
                            { id: 'builder', title: 'Builder', slug: 'builder' },
                        ]
                    },
                    {
                        id: 'structural',
                        title: 'Structural',
                        topics: [
                            { id: 'adapter', title: 'Adapter', slug: 'adapter' },
                            { id: 'decorator', title: 'Decorator', slug: 'decorator' },
                            { id: 'facade', title: 'Facade', slug: 'facade' },
                        ]
                    },
                    {
                        id: 'behavioral',
                        title: 'Behavioral',
                        topics: [
                            { id: 'observer', title: 'Observer', slug: 'observer' },
                            { id: 'strategy', title: 'Strategy', slug: 'strategy' },
                            { id: 'command', title: 'Command', slug: 'command' },
                        ]
                    },
                ]
            },
            {
                id: 'case-studies',
                title: 'Case Studies',
                topics: [
                    { id: 'parking-lot', title: 'Parking Lot', slug: 'parking-lot' },
                    { id: 'elevator', title: 'Elevator System', slug: 'elevator' },
                    { id: 'bookmyshow', title: 'BookMyShow', slug: 'bookmyshow' },
                    { id: 'vending-machine', title: 'Vending Machine', slug: 'vending-machine' },
                ]
            },
        ]
    },
    systemDesign: {
        id: 'system-design',
        title: 'System Design',
        subtitle: 'Design scalable distributed systems',
        description: 'Learn to design large-scale systems from requirements to implementation, covering all major components and trade-offs.',
        sections: [
            {
                id: 'fundamentals',
                title: 'Fundamentals',
                topics: [
                    { id: 'requirements', title: 'Gathering Requirements', slug: 'requirements' },
                    { id: 'estimations', title: 'Capacity Estimations', slug: 'estimations' },
                    { id: 'scalability', title: 'Scalability Basics', slug: 'scalability' },
                ]
            },
            {
                id: 'core-components',
                title: 'Core Components',
                topics: [
                    { id: 'apis', title: 'APIs & REST', slug: 'apis' },
                    { id: 'databases', title: 'Databases', slug: 'databases' },
                    { id: 'caching', title: 'Caching', slug: 'caching' },
                    { id: 'load-balancing', title: 'Load Balancing', slug: 'load-balancing' },
                    { id: 'cdns', title: 'CDNs', slug: 'cdns' },
                ]
            },
            {
                id: 'scaling',
                title: 'Scaling Techniques',
                topics: [
                    { id: 'horizontal-scaling', title: 'Horizontal Scaling', slug: 'horizontal-scaling' },
                    { id: 'vertical-scaling', title: 'Vertical Scaling', slug: 'vertical-scaling' },
                    { id: 'database-sharding', title: 'Database Sharding', slug: 'database-sharding' },
                ]
            },
            {
                id: 'case-studies',
                title: 'Case Studies',
                topics: [
                    { id: 'whatsapp', title: 'WhatsApp', slug: 'whatsapp' },
                    { id: 'youtube', title: 'YouTube', slug: 'youtube' },
                    { id: 'uber', title: 'Uber', slug: 'uber' },
                    { id: 'twitter', title: 'Twitter', slug: 'twitter' },
                ]
            },
        ]
    },
    aiMl: {
        id: 'ai-ml',
        title: 'AI & Machine Learning',
        subtitle: 'Master ML from fundamentals to deep learning',
        description: 'A practical guide to machine learning and AI, focusing on intuition and real-world applications.',
        sections: [
            {
                id: 'python-ml',
                title: 'Python for ML',
                topics: [
                    { id: 'numpy', title: 'NumPy Basics', slug: 'numpy' },
                    { id: 'pandas', title: 'Pandas', slug: 'pandas' },
                    { id: 'matplotlib', title: 'Matplotlib', slug: 'matplotlib' },
                ]
            },
            {
                id: 'math-foundations',
                title: 'Math Foundations',
                topics: [
                    { id: 'linear-algebra', title: 'Linear Algebra', slug: 'linear-algebra' },
                    { id: 'statistics', title: 'Statistics', slug: 'statistics' },
                    { id: 'calculus', title: 'Calculus', slug: 'calculus' },
                ]
            },
            {
                id: 'ml-algorithms',
                title: 'Machine Learning Algorithms',
                topics: [
                    { id: 'linear-regression', title: 'Linear Regression', slug: 'linear-regression' },
                    { id: 'logistic-regression', title: 'Logistic Regression', slug: 'logistic-regression' },
                    { id: 'decision-trees', title: 'Decision Trees', slug: 'decision-trees' },
                    { id: 'svm', title: 'SVM', slug: 'svm' },
                ]
            },
            {
                id: 'deep-learning',
                title: 'Deep Learning',
                topics: [
                    { id: 'neural-networks', title: 'Neural Networks', slug: 'neural-networks' },
                    { id: 'cnn', title: 'CNNs', slug: 'cnn' },
                    { id: 'rnn', title: 'RNNs', slug: 'rnn' },
                ]
            },
            {
                id: 'projects',
                title: 'Projects',
                topics: [
                    { id: 'project-1', title: 'Project 1', slug: 'project-1' },
                    { id: 'project-2', title: 'Project 2', slug: 'project-2' },
                ]
            },
            {
                id: 'interview-prep',
                title: 'Interview Preparation',
                topics: [
                    { id: 'ml-interview', title: 'ML Interview Guide', slug: 'ml-interview' },
                ]
            },
        ]
    },
};

// Helper function to get all topics from a course
export function getAllTopics(courseId) {
    const course = courses[courseId];
    if (!course) return [];
    
    const allTopics = [];
    
    course.sections.forEach(section => {
        if (section.subtopics) {
            // Handle nested structure (like Design Patterns)
            section.subtopics.forEach(subtopic => {
                subtopic.topics.forEach(topic => {
                    allTopics.push({
                        ...topic,
                        sectionId: section.id,
                        sectionTitle: section.title,
                        subtopicId: subtopic.id,
                        subtopicTitle: subtopic.title,
                    });
                });
            });
        } else {
            // Regular structure
            section.topics.forEach(topic => {
                allTopics.push({
                    ...topic,
                    sectionId: section.id,
                    sectionTitle: section.title,
                });
            });
        }
    });
    
    return allTopics;
}

// Helper function to get topic by slug
export function getTopicBySlug(courseId, slug) {
    const allTopics = getAllTopics(courseId);
    return allTopics.find(topic => topic.slug === slug);
}

// Helper function to get next/previous topics
export function getAdjacentTopics(courseId, currentSlug) {
    const allTopics = getAllTopics(courseId);
    const currentIndex = allTopics.findIndex(topic => topic.slug === currentSlug);
    
    return {
        previous: currentIndex > 0 ? allTopics[currentIndex - 1] : null,
        next: currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null,
    };
}

