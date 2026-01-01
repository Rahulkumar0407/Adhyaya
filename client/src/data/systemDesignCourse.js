// Complete System Design Course - Basic to Advanced
// Custom topic names for better learning experience

export const courseData = {
    id: 'system-design',
    title: 'Complete System Design for Software Engineers',
    description: 'Master system design from fundamentals to advanced distributed systems. Perfect for SDE interviews at FAANG and top tech companies.',
    totalVideos: 77,
    estimatedHours: 50,
    difficulty: 'Beginner to Advanced',

    sections: [
        // ========== BEGINNER LEVEL ==========
        {
            id: 'getting-started',
            title: 'Getting Started with System Design',
            description: 'Introduction and fundamentals for beginners',
            level: 'beginner',
            icon: '🚀',
            lessons: [
                { id: 'gs-1', title: 'What is System Design? Building Your First Architecture', videoId: 'SqcXvc3ZmRU', duration: '18:30' },
                { id: 'gs-2', title: 'Thinking Like a Systems Engineer', videoId: 'xpDnVSmNFX0', duration: '15:20' },
                { id: 'gs-3', title: 'Cracking System Design Interviews: 5 Golden Rules', videoId: 'CtmBGH8MkX4', duration: '11:45' },
            ],
        },
        {
            id: 'databases-basics',
            title: 'Databases & Storage Fundamentals',
            description: 'Understanding different database types and when to use them',
            level: 'beginner',
            icon: '🗄️',
            lessons: [
                { id: 'db-1', title: 'SQL vs NoSQL: Choosing the Right Database', videoId: 'xQnIN9bW0og', duration: '19:20' },
                { id: 'db-2', title: 'When to Use SQL and When to Use NoSQL', videoId: 'Q_9cFgzZr8Q', duration: '21:00' },
                { id: 'db-4', title: 'Database Selection Guide for System Design', videoId: '6GebEqt6Ynk', duration: '35:00' },
                { id: 'db-5', title: 'Graph Databases: Relationships at Scale', videoId: '2APFrmoqxKc', duration: '18:00' },
            ],
        },

        // ========== INTERMEDIATE LEVEL ==========
        {
            id: 'load-balancing',
            title: 'Load Balancing',
            description: 'Distribute traffic efficiently across servers',
            level: 'intermediate',
            icon: '⚖️',
            lessons: [
                { id: 'lb-1', title: 'Load Balancing: Distributing Traffic at Scale', videoId: 'K0Ta65OqQkY', duration: '18:45' },
                { id: 'lb-2', title: 'Load Balancer Algorithms & Strategies', videoId: 'gMIslJN44P0', duration: '20:10' },
            ],
        },
        {
            id: 'caching',
            title: 'Caching Strategies',
            description: 'Speed up systems with effective caching techniques',
            level: 'intermediate',
            icon: '⚡',
            lessons: [
                { id: 'cache-1', title: 'Caching 101: Speed Up Your Applications', videoId: 'U3RkDLtS7uY', duration: '22:15' },
                { id: 'cache-2', title: 'Cache Invalidation & Eviction Policies', videoId: '6FyXURRVmR0', duration: '19:30' },
                { id: 'cache-3', title: 'Building a Distributed Cache System', videoId: 'iuqZvajTOyA', duration: '25:00' },
            ],
        },
        {
            id: 'data-partitioning',
            title: 'Data Sharding & Partitioning',
            description: 'Scale databases through horizontal partitioning',
            level: 'intermediate',
            icon: '🔀',
            lessons: [
                { id: 'shard-1', title: 'Database Sharding: Scaling Beyond Single Server', videoId: '5faMjKuB9bc', duration: '16:40' },
                { id: 'shard-2', title: 'Sharding Strategies & Partition Keys', videoId: 'zaRkONvyGr8', duration: '18:20' },
            ],
        },
        {
            id: 'consistent-hashing',
            title: 'Consistent Hashing',
            description: 'Distribute data evenly in distributed systems',
            level: 'intermediate',

            lessons: [
                { id: 'hash-1', title: 'Consistent Hashing: The Key to Distributed Data', videoId: 'zaRkONvyGr8', duration: '20:00' },
                { id: 'hash-2', title: 'Virtual Nodes & Hash Ring Implementation', videoId: 'p6wwj0ozifw', duration: '17:45' },
            ],
        },
        {
            id: 'communication',
            title: 'Real-time Communication',
            description: 'Long polling, WebSockets, and SSE patterns',
            level: 'intermediate',
            icon: '📡',
            lessons: [
                { id: 'comm-1', title: 'Real-time Data: Polling vs WebSockets vs SSE', videoId: '6RvlKYgRFYQ', duration: '17:00' },
                { id: 'comm-2', title: 'Building Real-time Features in Your System', videoId: 'sUVpwRLr1LM', duration: '19:45' },
            ],
        },
        {
            id: 'proxies',
            title: 'Proxies & API Gateways',
            description: 'Forward proxies, reverse proxies, and API gateways',
            level: 'intermediate',
            icon: '🚪',
            lessons: [
                { id: 'proxy-1', title: 'Forward vs Reverse Proxy: Complete Guide', videoId: 'ozhe__GdWC8', duration: '15:30' },
                { id: 'proxy-2', title: 'Proxy Servers in Production Systems', videoId: 'wiINqPcvlh0', duration: '17:00' },
                { id: 'proxy-3', title: 'API Gateway: Single Entry Point Pattern', videoId: 'QmGJJJLxJac', duration: '20:00' },
            ],
        },
        {
            id: 'message-queues',
            title: 'Message Queues',
            description: 'Asynchronous communication at scale',
            level: 'intermediate',
            icon: '📨',
            lessons: [
                { id: 'mq-1', title: 'Message Queues: Decoupling Your Services', videoId: 'oUJbuFMyBDk', duration: '20:15' },
                { id: 'mq-2', title: 'Pub/Sub vs Point-to-Point Messaging', videoId: 'J6CBdSCB_fY', duration: '22:30' },
                { id: 'mq-3', title: 'Kafka Architecture: High-Throughput Messaging', videoId: 'wJWUzKCFRcM', duration: '32:00' },
                { id: 'mq-4', title: 'Building a Message Queue from Scratch', videoId: 'PzPXRmVHMxI', duration: '28:00' },
            ],
        },

        // ========== ADVANCED LEVEL ==========
        {
            id: 'cap-theorem',
            title: 'CAP Theorem & Consistency',
            description: 'Understanding trade-offs in distributed systems',
            level: 'advanced',
            icon: '🔄',
            lessons: [
                { id: 'cap-1', title: 'CAP Theorem: Consistency vs Availability', videoId: 'KmGy3sU6Xw8', duration: '14:30' },
                { id: 'cap-2', title: 'Understanding Partition Tolerance', videoId: 'BHqjEjzAicE', duration: '16:15' },
                { id: 'cap-3', title: 'Eventual Consistency: When & How to Use It', videoId: 'm4q7VkgDWrM', duration: '28:00' },
                { id: 'cap-4', title: 'Strong vs Eventual Consistency Trade-offs', videoId: 'mJl4pxFJaOc', duration: '22:00' },
            ],
        },
        {
            id: 'microservices',
            title: 'Microservices Architecture',
            description: 'Modern service-oriented architecture patterns',
            level: 'advanced',
            icon: '🧩',
            lessons: [
                { id: 'micro-1', title: 'Microservices: Breaking Down Monoliths', videoId: 'lL_j7ilk7rc', duration: '25:00' },
                { id: 'micro-2', title: 'Service Discovery with Zookeeper', videoId: 'AS5a91DOmVs', duration: '18:30' },
            ],
        },
        {
            id: 'distributed-components',
            title: 'Distributed System Components',
            description: 'Essential building blocks for distributed systems',
            level: 'advanced',
            icon: '🔧',
            lessons: [
                { id: 'dc-1', title: 'Rate Limiting: Protecting Your APIs', videoId: 'mhUQe4BKZXs', duration: '22:00' },
                { id: 'dc-2', title: 'Token Bucket & Sliding Window Algorithms', videoId: 'FU4WlwfS3G0', duration: '20:00' },
                { id: 'dc-3', title: 'Building Redis: In-Memory Key-Value Store', videoId: 'rnZmdmlR-2M', duration: '28:00' },
                { id: 'dc-4', title: 'Distributed Key-Value Store Architecture', videoId: 'sfQpg4PoMkw', duration: '25:00' },
                { id: 'dc-5', title: 'Push Notification System Design', videoId: 'bBTPZ9NdSk8', duration: '24:00' },
                { id: 'dc-6', title: 'Multi-Platform Notification Delivery', videoId: 'CUwt9QK9a0s', duration: '22:00' },
                { id: 'dc-7', title: 'Web Crawler: Indexing the Internet', videoId: 'BKZxZwUgL3Y', duration: '30:00' },
                { id: 'dc-8', title: 'Distributed Crawling Architecture', videoId: 'VHN4X7aMADk', duration: '26:00' },
            ],
        },

        // ========== EXPERT LEVEL ==========
        {
            id: 'advanced-distributed',
            title: 'Advanced Distributed Systems',
            description: 'Complex distributed infrastructure designs',
            level: 'expert',
            icon: '🎓',
            pointsRequired: 100,
            lessons: [
                { id: 'ad-1', title: 'Unique ID Generation at Scale (Snowflake)', videoId: 'eSsySVR3YnY', duration: '22:00' },
                { id: 'ad-2', title: 'Distributed Message Queue Deep Dive', videoId: 'VcrMpzZIg94', duration: '26:00' },
                { id: 'ad-3', title: 'Two-Phase Commit & Saga Pattern', videoId: 'VQpzJJMGsDA', duration: '28:00' },
                { id: 'ad-4', title: 'Centralized Logging with ELK Stack', videoId: 'u8CpqNcpU6M', duration: '24:00' },
                { id: 'ad-5', title: 'Building Elasticsearch: Search at Scale', videoId: 'CeGtqYdA-DI', duration: '30:00' },
                { id: 'ad-6', title: 'HDFS: Distributed File Storage', videoId: 'sYDRA_UhSvo', duration: '26:00' },
                { id: 'ad-7', title: 'Prometheus & Grafana: System Monitoring', videoId: 'PDxcEzu62jk', duration: '23:00' },
                { id: 'ad-8', title: 'Global Rate Limiting Across Data Centers', videoId: 'mhUQe4BKZXs', duration: '20:00' },
                { id: 'ad-9', title: 'Cron at Scale: Distributed Job Scheduling', videoId: '4qXrN8EL7do', duration: '25:00' },
                { id: 'ad-10', title: 'Feature Flags & Dynamic Configuration', videoId: 'wIhYt3bCc5k', duration: '21:00' },
                { id: 'ad-11', title: 'Distributed Locking with Redis & Zookeeper', videoId: 'VzzPlZr0Gfc', duration: '22:00' },
                { id: 'ad-12', title: 'Paxos & Raft: Consensus Algorithms', videoId: 'KBWH4D8NMHs', duration: '27:00' },
                { id: 'ad-13', title: 'Jaeger & Zipkin: Request Tracing', videoId: '2z8qLjM8m_M', duration: '24:00' },
                { id: 'ad-14', title: 'Time-Series Databases for Metrics', videoId: 'UHC0BcO7O0c', duration: '22:00' },
                { id: 'ad-15', title: 'PagerDuty: On-Call Alerting Systems', videoId: 'sYJBXcnqTvE', duration: '20:00' },
                { id: 'ad-16', title: 'CI/CD: Continuous Deployment Pipelines', videoId: 'Y4aEmBKBDho', duration: '26:00' },
            ],
        },
        {
            id: 'real-world-designs',
            title: 'Real-World System Designs',
            description: 'Design popular applications step by step',
            level: 'expert',
            icon: '🏗️',
            pointsRequired: 100,
            lessons: [
                { id: 'rw-1', title: 'WhatsApp: Billion-User Chat System', videoId: 'vvhC64hQZMk', duration: '35:00' },
                { id: 'rw-2', title: 'Real-time Messaging with Delivery Guarantees', videoId: 'L7LtmfFYjc4', duration: '30:00' },
                { id: 'rw-3', title: 'Uber: Ride-Sharing Platform Architecture', videoId: 'lsK4THeHBN0', duration: '38:00' },
                { id: 'rw-4', title: 'Location Tracking & Driver Matching', videoId: 'umWABit-wbk', duration: '32:00' },
                { id: 'rw-5', title: 'Instagram: Photo Sharing at Scale', videoId: 'hnpzNAPiC0E', duration: '33:00' },
                { id: 'rw-6', title: 'Feed Generation & Media Storage', videoId: 'VJpfO6KdyWE', duration: '28:00' },
                { id: 'rw-7', title: 'Netflix: Video Streaming Infrastructure', videoId: 'jPKTo1iGQiE', duration: '40:00' },
                { id: 'rw-8', title: 'Adaptive Bitrate & CDN Optimization', videoId: 'AQ-j8e0I4Vo', duration: '35:00' },
                { id: 'rw-9', title: 'Twitter: Real-time News Feed at Scale', videoId: 'hykjbT5Z0oE', duration: '30:00' },
                { id: 'rw-10', title: 'Fan-out on Write vs Fan-out on Read', videoId: 'pUK1sSRnLVM', duration: '28:00' },
                { id: 'rw-11', title: 'TinyURL: URL Shortening Service', videoId: 'JQDHz72OA3c', duration: '25:00' },
                { id: 'rw-12', title: 'Base62 Encoding & Collision Handling', videoId: 'AVIZt-EgZKo', duration: '22:00' },
                { id: 'rw-13', title: 'Dropbox: Cloud Storage & File Sync', videoId: 'U0xTu6E2CT8', duration: '36:00' },
                { id: 'rw-14', title: 'Chunking & Delta Sync Algorithms', videoId: 'jLM1nGgsT54', duration: '32:00' },
                { id: 'rw-15', title: 'TikTok: Short Video Platform Design', videoId: '07BVxmVFDGY', duration: '45:00' },
                { id: 'rw-16', title: 'Recommendation Engine & Content Delivery', videoId: 'vpa2vguLYiE', duration: '38:00' },
            ],
        },
        {
            id: 'special-bonus',
            title: 'Bonus: Special Topics',
            description: 'Blockchain, interview walkthroughs, and more',
            level: 'expert',
            icon: '🌟',
            pointsRequired: 100,
            lessons: [
                { id: 'bonus-1', title: 'Blockchain: Decentralized Systems Deep Dive', videoId: 'hUHw4OnPGCA', duration: '30:00' },
                { id: 'bonus-2', title: 'Live Interview: E-commerce System Design', videoId: 'CC-AxHIgBSM', duration: '45:00' },
                { id: 'bonus-3', title: 'Mock Interview: Search Autocomplete', videoId: 'N7YQPJ0a7e8', duration: '40:00' },
                { id: 'bonus-4', title: 'Framework for Any System Design Question', videoId: 'IY2EPjShgc4', duration: '25:00' },
            ],
        },
    ],
};

// Level colors for UI
export const levelColors = {
    beginner: { bg: 'from-green-500 to-emerald-600', text: 'text-green-400', border: 'border-green-500/30' },
    intermediate: { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-400', border: 'border-blue-500/30' },
    advanced: { bg: 'from-purple-500 to-violet-600', text: 'text-purple-400', border: 'border-purple-500/30' },
    expert: { bg: 'from-orange-500 to-red-600', text: 'text-orange-400', border: 'border-orange-500/30' },
};

// Helper functions
export const getTotalLessons = () => {
    return courseData.sections.reduce((total, section) => total + section.lessons.length, 0);
};

export const getAllLessons = () => {
    const lessons = [];
    courseData.sections.forEach((section) => {
        section.lessons.forEach((lesson) => {
            lessons.push({
                ...lesson,
                sectionId: section.id,
                sectionTitle: section.title,
                level: section.level,
            });
        });
    });
    return lessons;
};

export const getLessonById = (lessonId) => {
    for (const section of courseData.sections) {
        const lesson = section.lessons.find((l) => l.id === lessonId);
        if (lesson) {
            return {
                ...lesson,
                sectionId: section.id,
                sectionTitle: section.title,
                level: section.level,
                icon: section.icon,
            };
        }
    }
    return null;
};

export const getNextLesson = (currentLessonId) => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
        return allLessons[currentIndex + 1];
    }
    return null;
};

export const getPreviousLesson = (currentLessonId) => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex > 0) {
        return allLessons[currentIndex - 1];
    }
    return null;
};

export const getLessonNumber = (lessonId) => {
    const allLessons = getAllLessons();
    return allLessons.findIndex((l) => l.id === lessonId) + 1;
};

export default courseData;
