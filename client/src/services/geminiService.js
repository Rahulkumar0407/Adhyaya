// Gemini AI Service - Interview Question Generation with API Key Rotation
// Uses multiple API keys with automatic fallback
// API keys are loaded from environment variables to prevent exposure

const GEMINI_API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY_1,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3,
    import.meta.env.VITE_GEMINI_API_KEY_4,
].filter(key => key); // Filter out undefined keys

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';


class GeminiService {
    constructor() {
        this.currentKeyIndex = 0;
        this.failedKeys = new Set();
    }

    // Get current API key
    getCurrentKey() {
        return GEMINI_API_KEYS[this.currentKeyIndex];
    }

    // Rotate to next available key
    rotateKey() {
        const startIndex = this.currentKeyIndex;
        do {
            this.currentKeyIndex = (this.currentKeyIndex + 1) % GEMINI_API_KEYS.length;
            if (!this.failedKeys.has(this.currentKeyIndex)) {
                return true;
            }
        } while (this.currentKeyIndex !== startIndex);
        return false; // All keys exhausted
    }

    // Mark current key as failed
    markKeyFailed() {
        this.failedKeys.add(this.currentKeyIndex);
    }

    // Reset failed keys (call after some time)
    resetFailedKeys() {
        this.failedKeys.clear();
    }

    // Make API request with automatic key rotation
    async makeRequest(prompt, maxRetries = 14) {
        let lastError = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            if (this.failedKeys.size >= GEMINI_API_KEYS.length) {
                throw new Error('RATE_LIMIT_EXCEEDED: All API keys exhausted. Please try again later.');
            }

            const apiKey = this.getCurrentKey();

            try {
                const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.9,
                            topP: 0.95,
                            topK: 40,
                            maxOutputTokens: 2048,
                        },
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                    console.warn(`Gemini API Key ${this.currentKeyIndex + 1} failed: ${errorMessage}`);

                    // Rotate on any error (429, 403, 400, etc.)
                    this.markKeyFailed();
                    this.rotateKey();
                    lastError = new Error(errorMessage);
                    continue;
                }

                const data = await response.json();

                if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                    return data.candidates[0].content.parts[0].text;
                }

                throw new Error('Invalid response format from Gemini API');
            } catch (error) {
                console.error(`Gemini Service Error (Key ${this.currentKeyIndex + 1}):`, error.message);
                lastError = error;

                // Rotate on network errors or other exceptions
                this.markKeyFailed();
                const canRotate = this.rotateKey();
                if (!canRotate) break;
                continue;
            }
        }

        throw lastError || new Error('Failed to get response from Gemini API');
    }

    // Fallback questions when API is unavailable
    getFallbackQuestion(interviewType, index = 0) {
        const fallbacks = {
            'dsa': [
                "**Two Sum**\nGiven an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9",
                "**Valid Parentheses**\nGiven a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nExample:\nInput: s = '()[]{}'\nOutput: true",
                "**Maximum Subarray**\nFind the contiguous subarray with the largest sum.\n\nExample:\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6 (subarray [4,-1,2,1])"
            ],
            'system-design': [
                "Let's design a URL shortening service like bit.ly. How would you approach the system design? Consider the scale of handling millions of URLs.",
                "Can you walk me through designing a real-time chat application like WhatsApp? Focus on message delivery guarantees and scalability.",
                "How would you design a video streaming platform like YouTube? Consider upload, storage, transcoding, and CDN aspects."
            ],
            'dbms': [
                "Explain the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN with examples. When would you use each?",
                "What are ACID properties in databases? Can you explain each with a real-world transaction example?",
                "What is database normalization? Explain 1NF, 2NF, and 3NF with examples."
            ],
            'custom': [
                "Tell me about a challenging project you worked on. What was your role and how did you overcome obstacles?",
                "How do you approach debugging a complex issue in production? Walk me through your process.",
                "Explain a technical concept you're passionate about to someone non-technical."
            ]
        };

        const questions = fallbacks[interviewType] || fallbacks['custom'];
        return questions[index % questions.length];
    }

    // Generate interview questions based on type
    async generateInterviewQuestions(interviewType, customRole = '', previousQuestions = []) {
        const prompts = {
            'system-design': `You are an expert technical interviewer at a top tech company. Generate a unique system design interview question.

Context: This is a ${interviewType} interview.
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.join(', ')}. Give something DIFFERENT.` : ''}

Generate ONE thoughtful system design question. Examples of topics:
- Design a URL shortener, video streaming platform, chat system, payment system, notification system, search engine, etc.
- Focus on scalability, availability, consistency, and performance.

Respond with ONLY the question text, nothing else. Make it conversational like a real interviewer would ask.`,

            'dbms': `You are an expert database and SQL interviewer. Generate a unique DBMS interview question.

Context: This is a ${interviewType} interview.
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.join(', ')}. Give something DIFFERENT.` : ''}

Topics can include:
- SQL queries (joins, subqueries, aggregations)
- Normalization (1NF, 2NF, 3NF, BCNF)
- ACID properties and transactions
- Indexes and query optimization
- CAP theorem, sharding, replication
- NoSQL vs SQL comparison

Respond with ONLY the question text, nothing else. Make it conversational.`,

            'dsa': `You are an expert DSA/coding interviewer. Generate a unique algorithmic interview question.

Context: This is a ${interviewType} interview.
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.join(', ')}. Give something DIFFERENT.` : ''}

Topics can include:
- Arrays, strings, linked lists
- Trees, graphs, dynamic programming
- Sorting, searching, two pointers
- Stack, queue, heap
- Recursion, backtracking

Respond with ONLY the question in the format:
**Problem Title**
[Problem description with input/output examples]

Make it like a real LeetCode-style problem.`,

            'custom': `You are an expert technical interviewer. Generate a unique interview question for a ${customRole || 'Software Developer'} position.

${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.join(', ')}. Give something DIFFERENT.` : ''}

The question should be relevant to the role and can be:
- Technical concepts related to the role
- Problem-solving scenarios
- System design (if senior role)
- Behavioral/situational questions

Respond with ONLY the question text, nothing else. Make it conversational like a real interviewer.`
        };

        const prompt = prompts[interviewType] || prompts['custom'];
        try {
            return await this.makeRequest(prompt);
        } catch (error) {
            console.warn('API failed, using fallback question:', error.message);
            return this.getFallbackQuestion(interviewType, previousQuestions.length);
        }
    }

    // Generate follow-up question based on previous answer
    async generateFollowUp(interviewType, previousQuestion, userAnswer, customRole = '') {
        const prompt = `You are an expert technical interviewer conducting a ${interviewType} interview${customRole ? ` for a ${customRole} position` : ''}.

Previous question: "${previousQuestion}"
Candidate's answer: "${userAnswer}"

Based on the answer, generate a thoughtful follow-up question that:
1. Digs deeper into their understanding
2. Explores edge cases or alternative approaches
3. Tests practical application of concepts

Respond with ONLY the follow-up question text. Be conversational and encouraging.`;

        return await this.makeRequest(prompt);
    }

    // Evaluate user's answer
    async evaluateAnswer(question, answer, interviewType) {
        const prompt = `You are an expert technical interviewer evaluating a candidate's response.

Interview Type: ${interviewType}
Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer and respond in this JSON format ONLY:
{
    "score": <number 0-100>,
    "feedback": "<brief constructive feedback>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<area 1>", "<area 2>"],
    "followUp": "<optional follow-up question or null>"
}

Be fair but thorough in your evaluation.`;

        try {
            const response = await this.makeRequest(prompt);
            // Try to parse JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            // Fallback
            return {
                score: 70,
                feedback: response,
                strengths: ['Good attempt'],
                improvements: ['Could elaborate more'],
                followUp: null
            };
        } catch (error) {
            console.error('Error evaluating answer:', error);
            return {
                score: 65,
                feedback: 'Could not fully evaluate. Keep practicing!',
                strengths: ['Attempted the question'],
                improvements: ['Try to be more specific'],
                followUp: null
            };
        }
    }

    // Generate topic-specific revision questions
    async generateRevisionQuestions(course, topic, contextData, duration) {
        let questionCount = duration === 20 ? 10 : 15;
        // Limit context size if needed, but lesson titles/desc are usually small
        const contextString = JSON.stringify(contextData).slice(0, 5000);

        const prompt = `You are a strict and precise question generator for a Revision Session.
        
        Session Details:
        - Course: ${course}
        - Topic: ${topic.title}
        - Description: ${topic.description}
        - Duration: ${duration} minutes
        - Question Count: ${questionCount} questions

        CONTEXT DATA (STRICTLY USE THIS ONLY):
        ${contextString}

        INSTRUCTIONS:
        1. Generate exactly ${questionCount} questions.
        2. Questions MUST be based ONLY on the provided Context Data. Do NOT hallucinate or bring in outside knowledge not present in the context.
        3. Mix the following types:
           - MCQ (Multiple Choice with 4 options) - approx 40%
           - ShortAnswer (One line text answer) - approx 30%
           - Conceptual (Explain in simple words) - approx 30%
        4. Difficulty: Beginner to Intermediate (Interview prep level).
        5. Return ONLY a valid JSON array of objects.
        
        JSON FORMAT:
        [
            {
                "id": 1,
                "type": "MCQ" | "ShortAnswer" | "Conceptual",
                "question": "Question text here...",
                "options": ["A", "B", "C", "D"], // Only for MCQ. MUST include the correct answer.
                "correctAnswer": "Correct option text or answer key", 
                "explanation": "Brief explanation of the answer sourced from context."
            }
        ]
        
        If the context data is insufficient to generate ${questionCount} questions, generate as many as possible without hallucinating.`;

        try {
            const response = await this.makeRequest(prompt);
            // Try to parse JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to parse questions JSON");
        } catch (error) {
            console.error("Error generating revision questions:", error);
            // Fallback or rethrow
            throw error;
        }
    }

    // Get intro message
    async getIntroMessage(interviewType, customRole = '') {
        const prompt = `You are a friendly AI interviewer starting a ${interviewType} interview${customRole ? ` for a ${customRole} position` : ''}.

Generate a warm, professional greeting (2-3 sentences) that:
1. Introduces yourself as an AI interviewer
2. Briefly explains what the interview will cover
3. Encourages the candidate

Keep it natural and friendly. Add a bit of Hindi/Hinglish flavor for an Indian audience (like "Namaste" or "All the best!").
Respond with ONLY the greeting text.`;

        try {
            return await this.makeRequest(prompt);
        } catch (error) {
            // Fallback greeting
            const greetings = {
                'dsa': "Namaste! I'm your AI interviewer for today's DSA round. We'll work through some coding problems together - don't worry about getting everything perfect, I'm here to see how you think! Let's get started! 💪",
                'system-design': "Hello and welcome! I'm your AI interviewer for the System Design round. We'll design a scalable system together, and I want to understand your thought process. Feel free to think out loud! Shuru karte hain! 🚀",
                'dbms': "Namaste! Ready for some database magic? I'm your AI interviewer for the DBMS round. We'll cover SQL, normalization, and core concepts. Don't stress - let's learn together!",
                'custom': `Welcome! I'm your AI interviewer for the ${customRole || 'technical'} interview. I'll ask you questions relevant to the role. Relax, be yourself, and let's have a great conversation! All the best! ✨`
            };
            return greetings[interviewType] || greetings['custom'];
        }
    }
}

// Export singleton
const geminiService = new GeminiService();
export default geminiService;
