// Complete DBMS Course - Gate Smashers
// Video IDs verified from GitHub repo xoraus/GateSmashers-DBMS

export const dbmsCourseData = {
    id: 'dbms',
    title: 'Complete Database Management Systems',
    description: 'Master DBMS from fundamentals to advanced concepts. Essential for placements at top tech companies.',
    totalVideos: 65,
    estimatedHours: 30,
    difficulty: 'Beginner to Advanced',

    sections: [
        // ========== BEGINNER LEVEL ==========
        {
            id: 'introduction',
            title: 'Introduction to DBMS',
            description: 'Understanding databases and why we need them',
            level: 'beginner',
            icon: '📚',
            lessons: [
                { id: 'intro-1', title: 'DBMS Syllabus Overview', videoId: 'kBdlM6hNDAE', duration: '12:30' },
                { id: 'intro-2', title: 'What is DBMS? Real Life Examples', videoId: '3EJlovevfcA', duration: '15:20' },
                { id: 'intro-3', title: 'File System vs DBMS: Why Databases Win', videoId: 'ZtVw2iuFI2w', duration: '14:00' },
                { id: 'intro-4', title: '2-Tier and 3-Tier Architecture', videoId: 'VyvTabQHevw', duration: '16:45' },
            ],
        },
        {
            id: 'schema-architecture',
            title: 'Schema & Architecture',
            description: 'Database structure and organization',
            level: 'beginner',
            icon: '🏗️',
            lessons: [
                { id: 'schema-1', title: 'What is Schema? Database Blueprint', videoId: 'pDX4NR4eY3A', duration: '11:20' },
                { id: 'schema-2', title: 'Three Schema Architecture Explained', videoId: '5fs1ldO6B5c', duration: '18:30' },
                { id: 'schema-3', title: 'Data Independence: Logical vs Physical', videoId: 'upUSGUSK5k0', duration: '13:45' },
            ],
        },
        {
            id: 'keys',
            title: 'Keys in Databases',
            description: 'Understanding different types of keys',
            level: 'beginner',
            icon: '🔑',
            lessons: [
                { id: 'key-1', title: 'Candidate Key in DBMS', videoId: 'mMxjKFiIKxs', duration: '14:30' },
                { id: 'key-2', title: 'Primary Key in DBMS', videoId: 'Tp37HXfekNo', duration: '12:00' },
                { id: 'key-3', title: 'Foreign Key with Examples (Part 1)', videoId: 'UyqpQ3D2yCw', duration: '15:45' },
                { id: 'key-4', title: 'Foreign Key - Referential Integrity (Part 2)', videoId: 'DM2lAomoDrg', duration: '13:20' },
            ],
        },

        // ========== ER MODEL ==========
        {
            id: 'er-model',
            title: 'Entity-Relationship Model',
            description: 'Designing databases with ER diagrams',
            level: 'beginner',
            icon: '📊',
            lessons: [
                { id: 'er-1', title: 'Introduction to ER Model', videoId: 'gbVev8RuZLg', duration: '18:00' },
                { id: 'er-2', title: 'Types of Attributes in ER Model', videoId: 'WEo3g6Ir-vA', duration: '15:30' },
                { id: 'er-3', title: 'Degree of Relationship (One-to-One)', videoId: 's6MH7f3SnsY', duration: '12:45' },
                { id: 'er-4', title: 'Degree of Relationship (One-to-Many)', videoId: 'rZxETdO_KUQ', duration: '14:00' },
                { id: 'er-5', title: 'Degree of Relationship (Many-to-Many)', videoId: 'onR_sLhbZ4w', duration: '13:15' },
            ],
        },

        // ========== INTERMEDIATE LEVEL ==========
        {
            id: 'transactions',
            title: 'Transactions & ACID',
            description: 'ACID properties and transaction management',
            level: 'intermediate',
            icon: '🔄',
            lessons: [
                { id: 'tx-1', title: 'Introduction to Transaction Concurrency', videoId: 'MniO3hZKS-Q', duration: '13:00' },
                { id: 'tx-2', title: 'ACID Properties in Database', videoId: 'tRY_-YSOCG8', duration: '16:30' },
                { id: 'tx-3', title: 'Transaction States', videoId: 'OHbuN0ozVao', duration: '12:45' },
                { id: 'tx-4', title: 'Serial vs Parallel Schedule', videoId: 'FhP_0GfVbDk', duration: '14:20' },
                { id: 'tx-5', title: 'Read-Write Conflict Problem', videoId: 'JPhf6QKSwV8', duration: '15:00' },
            ],
        },
        {
            id: 'schedules',
            title: 'Schedules & Recovery',
            description: 'Understanding recoverable schedules',
            level: 'intermediate',
            icon: '📋',
            lessons: [
                { id: 'sch-1', title: 'Irrecoverable Schedule', videoId: 'u8s3jJGT4rQ', duration: '14:00' },
                { id: 'sch-2', title: 'Cascading vs Cascadeless Schedule', videoId: '3dHGt2T67zY', duration: '16:00' },
            ],
        },
        {
            id: 'serializability',
            title: 'Serializability',
            description: 'Ensuring correct concurrent execution',
            level: 'intermediate',
            icon: '📄',
            lessons: [
                { id: 'ser-1', title: 'Introduction to Serializability', videoId: 'TJ0HvEp9eeA', duration: '14:00' },
                { id: 'ser-2', title: 'Finding Conflict Equivalent Schedules', videoId: 'ckqDozxECp0', duration: '16:30' },
                { id: 'ser-3', title: 'Conflict Serializability', videoId: 'zv0ba0Iok1Y', duration: '18:45' },
                { id: 'ser-4', title: 'View Serializability', videoId: '8LKM_RWeroM', duration: '17:00' },
            ],
        },

        // ========== ADVANCED LEVEL ==========
        {
            id: 'concurrency-control',
            title: 'Concurrency Control',
            description: 'Locking mechanisms for safe access',
            level: 'advanced',
            icon: '🔒',
            lessons: [
                { id: 'cc-1', title: 'Shared-Exclusive Locking Protocol', videoId: '94C0V7f2zm4', duration: '16:00' },
                { id: 'cc-2', title: 'Shared-Exclusive Locking - Problems', videoId: 'UsqtDD1VriY', duration: '15:00' },
                { id: 'cc-3', title: 'Two-Phase Locking (2PL) Protocol', videoId: '1pUaEDNLWi4', duration: '18:30' },
                { id: 'cc-4', title: 'Problems in 2PL Protocol', videoId: 'pZExswIjVsk', duration: '14:00' },
                { id: 'cc-5', title: 'Strict 2PL and Rigorous 2PL', videoId: 'z8Yqn91akV8', duration: '17:00' },
            ],
        },
        {
            id: 'timestamp',
            title: 'Timestamp Protocols',
            description: 'Ordering based on timestamps',
            level: 'advanced',
            icon: '⏱️',
            lessons: [
                { id: 'ts-1', title: 'Basic Timestamp Ordering Protocol', videoId: '27NtGV1vNoY', duration: '15:30' },
                { id: 'ts-2', title: 'Numeric Question on Timestamp Protocol', videoId: 'h60vaqrXHO8', duration: '18:00' },
            ],
        },

        // ========== EXPERT LEVEL ==========
        {
            id: 'indexing',
            title: 'Indexing & Optimization',
            description: 'Optimizing data retrieval',
            level: 'expert',
            icon: '📑',
            pointsRequired: 100,
            lessons: [
                { id: 'idx-1', title: 'Why Indexing is Used?', videoId: 'ITcOiLInsxs', duration: '11:00' },
                { id: 'idx-2', title: 'I/O Cost in Indexing (Part 1)', videoId: 'K67bLD2AQqA', duration: '18:30' },
                { id: 'idx-3', title: 'I/O Cost in Indexing (Part 2)', videoId: 'cWFRxJZVyoE', duration: '15:00' },
                { id: 'idx-4', title: 'Types of Indexes in Databases', videoId: 'fsG1XaZEa78', duration: '20:00' },
                { id: 'idx-5', title: 'Primary Index in Databases', videoId: 'xZC4NoMNNGk', duration: '16:00' },
                { id: 'idx-6', title: 'Clustered Index in Databases', videoId: 'aZjYr87r1b8', duration: '18:00' },
                { id: 'idx-7', title: 'Secondary Index in Databases', videoId: '49P_GDeMDRo', duration: '17:00' },
            ],
        },
        {
            id: 'normalization',
            title: 'Normalization',
            description: 'Designing efficient database schemas',
            level: 'expert',
            icon: '📐',
            pointsRequired: 100,
            lessons: [
                { id: 'norm-1', title: 'Introduction to Normalization: Anomalies', videoId: 'xoTyrdT9SZI', duration: '14:30' },
                { id: 'norm-2', title: 'First Normal Form (1NF)', videoId: 'mUtAPbb1ECM', duration: '12:00' },
                { id: 'norm-3', title: 'Functional Dependency Basics', videoId: 'dR-jJimWWHA', duration: '18:00' },
                { id: 'norm-4', title: 'Second Normal Form (2NF)', videoId: 'R7UblSu4744', duration: '15:30' },
                { id: 'norm-5', title: 'Third Normal Form (3NF)', videoId: 'aAx_JoEDXQA', duration: '17:20' },
                { id: 'norm-6', title: 'BCNF - Boyce Codd Normal Form', videoId: 'NNjUhvvwOrk', duration: '19:00' },
            ],
        },
        {
            id: 'sql',
            title: 'SQL Commands',
            description: 'Structured Query Language',
            level: 'expert',
            icon: '💻',
            pointsRequired: 100,
            lessons: [
                { id: 'sql-1', title: 'Introduction to SQL: DDL, DML, DCL, TCL', videoId: 'nWeW3sCmLeU', duration: '15:00' },
                { id: 'sql-2', title: 'All SQL Commands with Examples', videoId: 'D-k-h0GuFmE', duration: '45:52' },
                { id: 'sql-3', title: 'Constraints in SQL', videoId: 'h8IWmmxIyS0', duration: '18:30' },
                { id: 'sql-4', title: 'SELECT Statement in SQL', videoId: 'L0P3S26aAJI', duration: '14:20' },
                { id: 'sql-5', title: 'Aggregate Functions: COUNT, SUM, AVG', videoId: 'fWCjT6qeZaQ', duration: '16:00' },
                { id: 'sql-6', title: 'GROUP BY and HAVING Clause', videoId: 'nR7ekS7N5eA', duration: '17:30' },
                { id: 'sql-7', title: 'SubQueries and Nested Queries', videoId: 'oj0A3z3sRPs', duration: '19:00' },
                { id: 'sql-8', title: 'JOIN Operations in SQL', videoId: '9yeOJ0ZMGaE', duration: '22:00' },
            ],
        },
    ],
};

// Level colors for UI
export const dbmsLevelColors = {
    beginner: { bg: 'from-green-500 to-emerald-600', text: 'text-green-400', border: 'border-green-500/30' },
    intermediate: { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-400', border: 'border-blue-500/30' },
    advanced: { bg: 'from-purple-500 to-violet-600', text: 'text-purple-400', border: 'border-purple-500/30' },
    expert: { bg: 'from-orange-500 to-red-600', text: 'text-orange-400', border: 'border-orange-500/30' },
};

// Helper functions
export const getDbmsTotalLessons = () => {
    return dbmsCourseData.sections.reduce((total, section) => total + section.lessons.length, 0);
};

export const getAllDbmsLessons = () => {
    const lessons = [];
    dbmsCourseData.sections.forEach((section) => {
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

export const getDbmsLessonById = (lessonId) => {
    for (const section of dbmsCourseData.sections) {
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

export const getNextDbmsLesson = (currentLessonId) => {
    const allLessons = getAllDbmsLessons();
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
        return allLessons[currentIndex + 1];
    }
    return null;
};

export const getPreviousDbmsLesson = (currentLessonId) => {
    const allLessons = getAllDbmsLessons();
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex > 0) {
        return allLessons[currentIndex - 1];
    }
    return null;
};

export const getDbmsLessonNumber = (lessonId) => {
    const allLessons = getAllDbmsLessons();
    return allLessons.findIndex((l) => l.id === lessonId) + 1;
};

export default dbmsCourseData;
