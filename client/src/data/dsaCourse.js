import { dsaPatterns } from './dsaPatterns';

// Define levels for each pattern manually to ensure a good learning curve
const patternLevels = {
    // Beginner
    'arrays-hashing': 'beginner',
    'two-pointers': 'beginner',
    'sliding-window': 'beginner',
    'stack': 'beginner',
    'binary-search': 'beginner',

    // Intermediate
    'linked-list': 'intermediate',
    'trees': 'intermediate',
    'tries': 'intermediate',
    'heap-priority-queue': 'intermediate',
    'intervals': 'intermediate',
    'greedy': 'intermediate',

    // Advanced
    'backtracking': 'advanced',
    'graphs': 'advanced',
    'advanced-graphs': 'advanced',
    '1d-dp': 'advanced',
    '2d-dp': 'advanced',

    // Expert
    'bit-manipulation': 'expert',
    'math-geometry': 'expert',
    // Add defaults for any others
};

const getLevel = (slug) => patternLevels[slug] || 'intermediate';

// Transform dsaPatterns into the courseData structure
const transformPatternsToSyllabus = () => {
    // Sort patterns if needed, for now we respect the order in dsaPatterns.js 
    // or we could sort by level. Let's create a level-based order.

    // We can just utilize the array as is, but assign levels.
    // The Syllabus UI groups by level automatically.

    return dsaPatterns.map(pattern => {
        return {
            id: pattern.id,
            patternSlug: pattern.slug, // Important for linking
            title: pattern.name,
            description: pattern.description || `Master the ${pattern.name} pattern through curated problems`,
            level: getLevel(pattern.slug),
            icon: pattern.icon,
            lessons: pattern.items.map((item, idx) => ({
                id: item.slug, // This is the item slug (e.g., 'two-sum')
                title: item.title,
                duration: `${10 + (idx * 5)} mins`, // Mock duration for the roadmap feel
                difficulty: item.difficulty,
                isTheory: item.difficulty === 'theory',
                patternSlug: pattern.slug // Pass this down if needed
            }))
        };
    });
};

export const dsaCourseData = {
    id: 'dsa-course',
    title: 'Data Structures & Algorithms',
    description: 'Master 150+ standard DSA problems patterns from scratch to expert level.',
    totalVideos: dsaPatterns.reduce((acc, p) => acc + p.items.length, 0),
    estimatedHours: 100,
    difficulty: 'Beginner to Expert',
    sections: transformPatternsToSyllabus()
};

// Level colors for UI (Reused from System Design)
export const levelColors = {
    beginner: { bg: 'from-green-500 to-emerald-600', text: 'text-green-400', border: 'border-green-500/30' },
    intermediate: { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-400', border: 'border-blue-500/30' },
    advanced: { bg: 'from-purple-500 to-violet-600', text: 'text-purple-400', border: 'border-purple-500/30' },
    expert: { bg: 'from-orange-500 to-red-600', text: 'text-orange-400', border: 'border-orange-500/30' },
};

export const getTotalLessons = () => {
    return dsaCourseData.totalVideos;
};
