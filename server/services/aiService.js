import DoubtMessage from '../models/DoubtMessage.js';
import Doubt from '../models/Doubt.js';

// This is a placeholder for AI integration
// In production, integrate with OpenAI, Gemini, or your preferred AI service

/**
 * Generate AI hint for a doubt (non-blocking)
 * @param {String} doubtId - The doubt ID
 * @param {Object} doubtData - Doubt details
 * @returns {Promise<Object>}
 */
export const generateAIHint = async (doubtId, doubtData) => {
    try {
        const { subject, subTopic, description, codeBlocks } = doubtData;

        // Simulate AI hint generation
        // TODO: Replace with actual AI API call (OpenAI/Gemini)

        const hint = generateHintBasedOnTopic(subject, subTopic, description);

        // Create AI message
        const aiMessage = await DoubtMessage.create({
            doubt: doubtId,
            sender: null, // System message
            senderType: 'ai',
            messageType: 'text',
            content: hint,
            aiGenerated: true,
            aiHint: true,
            aiModel: 'rule-based' // Will be 'gpt-4' or 'gemini-pro' in production
        });

        // Update doubt status
        await Doubt.findByIdAndUpdate(doubtId, {
            aiHintGenerated: true,
            status: 'ai-reviewed'
        });

        return aiMessage;

    } catch (error) {
        console.error('AI hint generation error:', error);
        throw error;
    }
};

/**
 * Analyze doubt complexity
 * @param {String} description - Doubt description
 * @param {String} subject - Subject area
 * @returns {Promise<Object>}
 */
export const analyzeDoubtComplexity = async (description, subject) => {
    try {
        // Simple rule-based complexity analysis
        // TODO: Replace with ML model or AI API

        let score = 5; // Default medium complexity

        const descLength = description.length;
        const hasCode = description.includes('```') || description.includes('function') || description.includes('class');
        const hasMultipleQuestions = (description.match(/\?/g) || []).length > 1;

        // Adjust based on indicators
        if (descLength > 500) score += 1;
        if (hasCode) score += 2;
        if (hasMultipleQuestions) score += 1;

        // Subject-based adjustments
        const complexSubjects = ['system-design', 'dbms'];
        if (complexSubjects.includes(subject)) score += 1;

        // Clamp between 1-10
        score = Math.min(10, Math.max(1, score));

        return {
            score,
            category: score <= 3 ? 'simple' : score <= 7 ? 'moderate' : 'complex',
            estimatedTime: score <= 3 ? 60 : score <= 7 ? 120 : 180
        };

    } catch (error) {
        console.error('Complexity analysis error:', error);
        return { score: 5, category: 'moderate', estimatedTime: 120 };
    }
};

/**
 * Generate contextual hint based on topic
 * @param {String} subject
 * @param {String} subTopic  
 * @param {String} description
 * @returns {String}
 */
const generateHintBasedOnTopic = (subject, subTopic, description) => {
    // Template-based hints
    const hints = {
        'dsa': {
            'arrays': '💡 **Hint**: For array problems, consider:\n- Index-based access patterns\n- Two-pointer technique\n- Sliding window if consecutive elements\n- Common time complexities: O(n) for single pass, O(n²) for nested loops',
            'linked-list': '💡 **Hint**: For linked lists:\n- Use dummy nodes for edge cases\n- Two-pointer (slow/fast) for cycle detection\n- Reverse operations often need prev/curr pointers',
            'trees': '💡 **Hint**: For tree problems:\n- Recursion is your friend\n- Consider DFS vs BFS\n- Base case: null node\n- Think about what info you need from subtrees'
        },
        'dbms': {
            'normalization': '💡 **Hint**: For normalization:\n- 1NF: Atomic values\n- 2NF: Remove partial dependencies\n- 3NF: Remove transitive dependencies\n- Identify primary keys first',
            'indexing': '💡 **Hint**: For indexing:\n- B+ trees for range queries\n- Hash indexes for equality\n- Trade-off: faster reads vs slower writes\n- Index columns in WHERE/JOIN clauses'
        },
        'system-design': {
            'scaling': '💡 **Hint**: For scaling:\n- Horizontal (add servers) vs Vertical (bigger server)\n- Load balancer distribution\n- Database sharding/replication\n- Caching strategies (Redis/Memcached)',
            'lld': '💡 **Hint**: For LLD:\n- Identify core entities first\n- Define relationships\n- Apply SOLID principles\n- Consider design patterns'
        }
    };

    const subjectHints = hints[subject];
    if (subjectHints && subjectHints[subTopic]) {
        return subjectHints[subTopic];
    }

    // Generic hint
    return `💡 **AI Hint**: I'm analyzing your doubt about **${subTopic}** in ${subject.toUpperCase()}.\n\n` +
        `While you wait for an expert mentor, here are some quick pointers:\n` +
        `1. Break down the problem into smaller parts\n` +
        `2. Check if there are similar solved examples\n` +
        `3. Identify the core concept being tested\n\n` +
        `A mentor will provide a detailed explanation shortly!`;
};

/**
 * Future: Call actual AI API (OpenAI/Gemini)
 */
export const callAIService = async (prompt, context) => {
    // Placeholder for actual AI integration

    /*
    Example OpenAI integration:
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: "You are a helpful coding mentor. Provide hints, not full solutions." },
            { role: "user", content: prompt }
        ],
        max_tokens: 200
    });
    
    return response.choices[0].message.content;
    */

    throw new Error('AI service not configured');
};

export default {
    generateAIHint,
    analyzeDoubtComplexity,
    callAIService
};
