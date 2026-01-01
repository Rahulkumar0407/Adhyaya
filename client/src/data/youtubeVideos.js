// YouTube Video Mapping for DSA Problems
// Videos from: https://youtube.com/playlist?list=PLVItHqpXY_DDScMxEiRhVwfSYZLDtlIiM

// Video IDs for each video in the playlist (in order)
// IMPORTANT: Replace these placeholders with actual YouTube video IDs
const VIDEO_IDS = {
    video1: 'Elnhh8cC2vM', // Day 1 - Two Pointer Pattern Introduction & Theory
    video2: 'Yi90cuHYyWQ', // Day 2 - Valid Palindrome, Reverse String, etc.
    video3: 'SP065oLnxGA', // Day 3 - Merge Sorted Array, Two Sum, 3Sum, etc.
    video4: 'pcj6S1KLxWc', // Day 4 - Sort Colors, Remove Nth Node
    video5: 'jA74srakqvI', // Day 5 - Strobogrammatic, Append Characters, etc.
    video6: 'IW8gQ2u2O_I', // Day 6 - Reverse Words in a String
};

// Helper to convert time string (MM:SS or HH:MM:SS) to seconds
const toSeconds = (time) => {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts[0] * 60 + parts[1];
};

// Pattern-level videos (theory overview)
export const patternVideos = {
    'two-pointers': {
        videoId: VIDEO_IDS.video1,
        timestamp: 0,
        title: 'Two Pointer Pattern - Complete Theory & Introduction',
        chapters: [
            { time: '00:00', title: 'Introduction' },
            { time: '01:20', title: 'Two Pointer Pattern Intuition' },
            { time: '03:29', title: 'Definition' },
            { time: '17:04', title: 'Why use Two Pointer' },
            { time: '26:50', title: 'Templates' },
        ]
    },
};

// Problem-specific video timestamps
// Slugs match the ones in dsaPatterns.js
export const problemVideos = {
    // ========== VIDEO 1: Two Pointer Theory (Day 1) ==========
    'two-pointer-theory': {
        videoId: VIDEO_IDS.video1,
        timestamp: 0,
        endTime: 1800, // Full theory video (~30 mins)
        title: 'Two Pointer Pattern - Complete Theory & Introduction',
    },

    // ========== VIDEO 2: Easy Problems (Day 2) ==========
    'valid-palindrome': {
        videoId: VIDEO_IDS.video2,
        timestamp: 0, // Starts at beginning
        endTime: 420, // Ends when Reverse String starts
        title: '125. Valid Palindrome',
    },
    'reverse-string': {
        videoId: VIDEO_IDS.video2,
        timestamp: 420, // Approx 7:00
        endTime: 900,
        title: '344. Reverse String',
    },
    'squares-of-a-sorted-array': {
        videoId: VIDEO_IDS.video2,
        timestamp: 900, // Approx 15:00
        endTime: 1500,
        title: '977. Squares of a Sorted Array',
    },
    'valid-palindrome-ii': {
        videoId: VIDEO_IDS.video2,
        timestamp: 1500, // Approx 25:00
        endTime: 2100,
        title: '680. Valid Palindrome II',
    },
    'valid-word-abbreviation': {
        videoId: VIDEO_IDS.video2,
        timestamp: 2100, // Approx 35:00
        endTime: 2700, // Approx 45:00
        title: 'Valid Word Abbreviation',
    },

    // ========== VIDEO 3: Core Problems (Day 3) ==========
    'merge-sorted-array': {
        videoId: VIDEO_IDS.video3,
        timestamp: 330, // 05:30
        endTime: 735,
        title: '88. Merge Sorted Array',
    },
    'count-pairs-whose-sum-is-less-than-target': {
        videoId: VIDEO_IDS.video3,
        timestamp: 60, // Approx start
        endTime: 330,
        title: '2824. Count Pairs Whose Sum is Less than Target',
    },
    'two-sum': {
        videoId: VIDEO_IDS.video3,
        timestamp: 735, // 12:15
        endTime: 1100,
        title: '1. Two Sum',
    },
    'two-sum-ii-input-array-is-sorted': {
        videoId: VIDEO_IDS.video3,
        timestamp: 1100, // Approx 18:20
        endTime: 2000,
        title: '167. Two Sum II',
    },
    '3sum': {
        videoId: VIDEO_IDS.video3,
        timestamp: 2000, // Approx 33:20
        endTime: 2800, // Approx 46:00
        title: '15. 3Sum',
    },

    // ========== VIDEO 4: Medium Problems (Day 4) ==========
    'sort-colors': {
        videoId: VIDEO_IDS.video4,
        timestamp: 0,
        endTime: 600,
        title: '75. Sort Colors',
    },
    'remove-nth-node-from-end-of-list': {
        videoId: VIDEO_IDS.video4,
        timestamp: 600, // Approx 10:00
        endTime: 1200, // Approx 20:00
        title: '19. Remove Nth Node From End of List',
    },

    // ========== VIDEO 5: Advanced Problems (Day 5) ==========
    'strobogrammatic-number': {
        videoId: VIDEO_IDS.video5,
        timestamp: 0,
        endTime: 480,
        title: 'Strobogrammatic Number',
    },
    'append-characters-to-string-to-make-subsequence': {
        videoId: VIDEO_IDS.video5,
        timestamp: 480, // Approx 08:00
        endTime: 960,
        title: '2486. Append Characters to String to Make Subsequence',
    },
    'lowest-common-ancestor-of-a-binary-tree-iii': {
        videoId: VIDEO_IDS.video5,
        timestamp: 960, // Approx 16:00
        endTime: 1500, // Approx 25:00
        title: '1650. Lowest Common Ancestor of a Binary Tree III',
    },

    // ========== VIDEO 6: Reverse Words (Day 6) ==========
    'reverse-words-in-a-string': {
        videoId: VIDEO_IDS.video6,
        timestamp: 0,
        endTime: 1200, // Approx 20:00
        title: '151. Reverse Words in a String',
    },
};

// Helper function to get YouTube embed URL
export const getYouTubeEmbedUrl = (videoId, timestamp = 0) => {
    if (!videoId || videoId.startsWith('VIDEO_ID')) return null;
    const startParam = timestamp > 0 ? `?start=${timestamp}` : '';
    return `https://www.youtube.com/embed/${videoId}${startParam}`;
};

// Helper to get video for a specific problem
export const getVideoForProblem = (problemSlug) => {
    const video = problemVideos[problemSlug];
    if (!video || video.videoId.startsWith('VIDEO_ID')) return null;
    return video;
};

// Helper to get video for a pattern
export const getVideoForPattern = (patternSlug) => {
    const video = patternVideos[patternSlug];
    if (!video || video.videoId.startsWith('VIDEO_ID')) return null;
    return video;
};
