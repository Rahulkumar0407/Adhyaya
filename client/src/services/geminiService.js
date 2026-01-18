// Gemini AI Service - Interview Question Generation with API Key Rotation
// Uses multiple API keys with automatic fallback to Groq AI
// API keys are loaded from environment variables to prevent exposure

const GEMINI_API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY_1,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3,
    import.meta.env.VITE_GEMINI_API_KEY_4,
    import.meta.env.VITE_GEMINI_API_KEY_5,
    import.meta.env.VITE_GEMINI_API_KEY_6,
].filter(key => key); // Filter out undefined keys

// Groq API keys for fallback (free tier with Llama models)
const GROQ_API_KEYS = [
    import.meta.env.VITE_GROQ_API_KEY_1,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3,
    import.meta.env.VITE_GROQ_API_KEY_4,
    import.meta.env.VITE_GROQ_API_KEY_5,
    import.meta.env.VITE_GROQ_API_KEY_6,
    import.meta.env.VITE_GROQ_API_KEY_7,
    import.meta.env.VITE_GROQ_API_KEY_8,
].filter(key => key);

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';


class GeminiService {
    constructor() {
        this.currentKeyIndex = 0;
        this.currentGroqKeyIndex = 0;
        this.failedKeys = new Set();
        this.failedGroqKeys = new Set();
        this.useGroqFallback = false;
    }

    // Get current API key
    getCurrentKey() {
        return GEMINI_API_KEYS[this.currentKeyIndex];
    }

    // Get current Groq API key
    getCurrentGroqKey() {
        return GROQ_API_KEYS[this.currentGroqKeyIndex];
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

    // Rotate to next available Groq key
    rotateGroqKey() {
        if (GROQ_API_KEYS.length === 0) return false;
        const startIndex = this.currentGroqKeyIndex;
        do {
            this.currentGroqKeyIndex = (this.currentGroqKeyIndex + 1) % GROQ_API_KEYS.length;
            if (!this.failedGroqKeys.has(this.currentGroqKeyIndex)) {
                return true;
            }
        } while (this.currentGroqKeyIndex !== startIndex);
        return false;
    }

    // Mark current key as failed
    markKeyFailed() {
        this.failedKeys.add(this.currentKeyIndex);
    }

    // Mark current Groq key as failed
    markGroqKeyFailed() {
        this.failedGroqKeys.add(this.currentGroqKeyIndex);
    }

    // Reset failed keys (call after some time)
    resetFailedKeys() {
        this.failedKeys.clear();
    }

    // Reset failed Groq keys
    resetFailedGroqKeys() {
        this.failedGroqKeys.clear();
    }

    // Helper to extract retry delay from error message
    extractRetryDelay(errorMessage) {
        const match = errorMessage.match(/retry in (\d+\.?\d*)s/i);
        if (match) {
            return Math.ceil(parseFloat(match[1]) * 1000) + 1000; // Add 1s buffer
        }
        return 45000; // Default 45 seconds if not specified
    }

    // Helper to sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Make request to Groq API (fallback)
    async makeGroqRequest(prompt) {
        if (GROQ_API_KEYS.length === 0) {
            throw new Error('No Groq API keys configured');
        }

        let lastError = null;
        const maxAttempts = GROQ_API_KEYS.length * 2;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (this.failedGroqKeys.size >= GROQ_API_KEYS.length) {
                // All Groq keys exhausted, wait and retry once
                console.log('⏳ All Groq keys exhausted. Waiting 30s before retry...');
                await this.sleep(30000);
                this.resetFailedGroqKeys();
            }

            const apiKey = this.getCurrentGroqKey();
            if (!apiKey) break;

            try {
                console.log(`🔄 Trying Groq API Key ${this.currentGroqKeyIndex + 1}...`);
                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.9,
                        max_tokens: 2048,
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                    console.warn(`Groq API Key ${this.currentGroqKeyIndex + 1} failed: ${errorMessage}`);

                    if (response.status === 429 || response.status === 503) {
                        this.markGroqKeyFailed();
                        this.rotateGroqKey();
                        lastError = new Error(errorMessage);
                        continue;
                    }

                    this.markGroqKeyFailed();
                    this.rotateGroqKey();
                    lastError = new Error(errorMessage);
                    continue;
                }

                const data = await response.json();

                if (data.choices && data.choices[0]?.message?.content) {
                    console.log('✅ Groq API request successful!');
                    return data.choices[0].message.content;
                }

                throw new Error('Invalid response format from Groq API');
            } catch (error) {
                console.error(`Groq Service Error (Key ${this.currentGroqKeyIndex + 1}):`, error.message);
                lastError = error;
                this.markGroqKeyFailed();
                if (!this.rotateGroqKey()) break;
            }
        }

        throw lastError || new Error('Failed to get response from Groq API');
    }

    // Make API request with INSTANT fallback to Groq on failure
    async makeRequest(prompt) {
        const apiKey = this.getCurrentKey();

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
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
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                let text = data.candidates[0].content.parts[0].text;
                // Clean up potential system tokens or artifacts
                return text.replace(/^<s>\[SYSTEM\]\s*/i, '')
                    .replace(/^\[SYSTEM\]\s*/i, '')
                    .replace(/^System:\s*/i, '')
                    .trim();
            }

            throw new Error('Invalid response format from Gemini API');

        } catch (error) {
            console.warn(`Gemini API Key ${this.currentKeyIndex + 1} failed: ${error.message}`);

            // Mark current key as failed and rotate for NEXT time (so we don't start with bad key)
            this.markKeyFailed();
            this.rotateKey();

            // INSTANT FALLBACK to Groq - No retries, no waiting
            console.log('⚡ Instant fallback: Switching to Groq API...');

            try {
                return await this.makeGroqRequest(prompt);
            } catch (groqError) {
                console.error('Groq fallback also failed:', groqError.message);
                throw new Error('All AI providers exhausted. Please check your connection.');
            }
        }
    }

    // Fallback questions when API is unavailable
    getFallbackQuestion(interviewType, index = 0) {
        const fallbacks = {
            'dsa': [
                "[TYPE:CODING] Let's start with a warm-up. Given an integer array, return true if any value appears at least twice in the array, and return false if every element is distinct.\n\n**Example:**\nInput: nums = [1, 2, 3, 1]\nOutput: true\n\nInput: nums = [1, 2, 3, 4]\nOutput: false\n\n**Constraints:**\n- 1 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9\n\n[PATTERN:hash_table]",
                "[TYPE:CODING] Here's a problem for you. Given a string containing only parentheses characters - round (), square [], and curly {} brackets - determine if the brackets are balanced and properly nested.\n\n**Example:**\nInput: s = '()[]{}'\nOutput: true\n\nInput: s = '([)]'\nOutput: false\n\n**Constraints:**\n- The string only contains bracket characters\n- An empty string is considered valid\n\n[PATTERN:stack_queue]",
                "[TYPE:CODING] Let's try this one. Given an integer array, find the contiguous subarray with the largest sum and return that sum.\n\n**Example:**\nInput: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nExplanation: The subarray [4, -1, 2, 1] has the largest sum.\n\n**Constraints:**\n- Array can contain negative numbers\n- At least one element exists\n\n[PATTERN:dp]"
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

    // DSA Patterns for tagging
    // When recommending a topic:
    // 1. YOU MUST use one of the EXACT slugs from the list below.
    // 2. Do NOT invent new topics or use different formatting (e.g. use 'two-pointers', NOT 'two_pointers' or 'Two Pointers').
    // 3. If no specific DSA pattern fits, use 'custom'.
    dsaPatterns = [
        'sliding-window', 'two-pointers', 'fast-and-slow-pointers', 'merge-intervals', 'cyclic-sort', 'in-place-reversal-of-a-linked-list', 'tree-breadth-first-search', 'tree-depth-first-search', 'two-heaps', 'subsets', 'modified-binary-search', 'bitwise-xor', 'top-k-elements', 'k-way-merge', '0-1-knapsack', 'topological-sort-graph', 'dynamic-programming', 'graphs', 'trees', 'stack-queue', 'recursion', 'greedy', 'trie'
    ];

    // System Design patterns
    sdPatterns = [
        'scalability', 'caching', 'load_balancing', 'database_design',
        'microservices', 'cdn', 'message_queues', 'rate_limiting'
    ];

    // Get difficulty modifier for prompts
    getDifficultyPrompt(difficulty, companyTarget) {
        const difficultyMap = {
            beginner: 'easy difficulty, focusing on fundamentals. Keep explanations simple. Ask straightforward questions.',
            intermediate: 'medium difficulty with some edge cases. Include follow-up probes. Test practical understanding.',
            advanced: 'hard difficulty with complex scenarios. Deep dive into trade-offs. Expect optimal solutions and edge case handling.'
        };

        const companyMap = {
            faang: 'This is for a FAANG/Big Tech interview. Expect high standards, optimal solutions, and strong system design thinking.',
            product: 'This is for a product-based company. Focus on practical problem-solving and real-world applications.',
            service: 'This is for a service-based company. Focus on fundamental concepts and clear communication.',
            startup: 'This is for a startup interview. Focus on practical, quick solutions and adaptability.'
        };

        return `${difficultyMap[difficulty] || difficultyMap.intermediate}\n${companyMap[companyTarget] || companyMap.product}`;
    }

    // Generate interview questions based on type with config support
    async generateInterviewQuestions(interviewType, customRole = '', previousQuestions = [], config = {}) {
        const { difficulty = 'intermediate', companyTarget = 'product', techStack = 'javascript' } = config;
        const difficultyContext = this.getDifficultyPrompt(difficulty, companyTarget);

        const prompts = {
            'system-design': `You are an expert technical interviewer at a top tech company. Generate a unique system design interview question.

Context: This is a ${interviewType} interview.
${difficultyContext}
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}

Generate ONE thoughtful system design question. Examples of topics:
- Design a URL shortener, video streaming platform, chat system, payment system, notification system, search engine, etc.
- Focus on scalability, availability, consistency, and performance.

At the end of your question, add a hidden tag in this format: [PATTERN:scalability] or [PATTERN:caching] etc.
Available patterns: ${this.sdPatterns.join(', ')}

Respond with ONLY the question text, nothing else. Make it conversational like a real interviewer would ask.`,

            'dbms': `You are an expert database and SQL interviewer. Generate a unique DBMS interview question.

Context: This is a ${interviewType} interview.
${difficultyContext}
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}

Topics can include:
- SQL queries (joins, subqueries, aggregations)
- Normalization (1NF, 2NF, 3NF, BCNF)
- ACID properties and transactions
- Indexes and query optimization
- CAP theorem, sharding, replication
- NoSQL vs SQL comparison

Respond with ONLY the question text, nothing else. Make it conversational.`,

            'dsa': `You are an expert DSA interviewer at a ${companyTarget === 'faang' ? 'FAANG' : companyTarget} company conducting a REAL technical coding interview.

${difficultyContext}
Preferred language: ${techStack}
Question number: ${previousQuestions.length + 1}
${previousQuestions.length > 0 ? `Previously discussed topics:\n${previousQuestions.slice(-3).join('\n')}\n\nIMPORTANT: Ask about a COMPLETELY DIFFERENT pattern/topic.` : ''}

=== FAANG DSA INTERVIEW FORMAT ===

This interview should feel like a REAL FAANG coding interview:
1. CODING IS PRIMARY - Every main question should be a coding problem
2. Theory comes as FOLLOW-UP questions about the code (complexity, edge cases, optimization)

INTERVIEW STRUCTURE:
${previousQuestions.length === 0 ? `
QUESTION 1 - START WITH CODING (Easy/Medium)
- Present a proper LeetCode-style coding problem
- Include: Problem statement, 1-2 examples with input/output, constraints
- Topics: Arrays, Strings, Hash Maps, Two Pointers (warm-up patterns)
- END TAG: [TYPE:CODING]
` : previousQuestions.length === 1 ? `
QUESTION 2 - CODING (Medium difficulty)
- Present another coding problem, DIFFERENT pattern from before
- Include: Problem statement, examples, constraints
- Topics: Sliding Window, Binary Search, Stack/Queue, Linked Lists
- If they solved Q1 well, increase difficulty slightly
- END TAG: [TYPE:CODING]
` : `
QUESTION 3+ - CODING (Medium/Hard)
- Continue with challenging coding problems
- Include: Clear problem statement, examples, constraints
- Topics: Trees, Graphs, DP, Recursion, Backtracking
- Match difficulty to candidate's performance
- END TAG: [TYPE:CODING]
`}

DSA PATTERNS TO COVER: ${this.dsaPatterns.join(', ')}

QUESTION FORMAT:
\`\`\`
[Natural intro like "Alright, here's a problem for you..."]

[Problem description - describe the task clearly in 2-4 sentences WITHOUT naming the problem]

**Example 1:**
Input: [input]
Output: [output]
Explanation: [brief explanation]

**Constraints:**
- [constraint 1]
- [constraint 2]

[PATTERN:pattern_name] [TYPE:CODING]
\`\`\`

CRITICAL RULES:
1. ALWAYS start with a coding problem, not theory
2. Be conversational ("Let's try this one...", "Here's a problem for you...")
3. Keep problems focused - one clear objective
4. MUST include [TYPE:CODING] tag at the end
5. Theory questions come ONLY as follow-ups after they submit code
6. **NEVER reveal the famous problem name** (don't say "Two Sum", "Valid Parentheses", etc.) - describe the problem naturally instead
7. **Do NOT ask 'Two Sum' as the first question.** Choose a different easy/medium problem involving Arrays/Strings/HashMaps.`,

            'custom': `You are an expert technical interviewer. Generate a unique interview question for a ${customRole || 'Software Developer'} position.

${difficultyContext}
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}

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

    // Evaluate user's answer - handles "I don't know" realistically
    async evaluateAnswer(question, answer, interviewType) {
        // Detect if the user doesn't know or gave a weak response
        const dontKnowPatterns = [
            /i don'?t know/i, /no idea/i, /not sure/i, /can'?t answer/i,
            /skip/i, /pass/i, /i'?m stuck/i, /don'?t remember/i,
            /i forgot/i, /no clue/i, /sorry/i, /i give up/i,
            /unable to/i, /difficult for me/i
        ];

        const isStuckResponse = dontKnowPatterns.some(pattern => pattern.test(answer)) ||
            answer.trim().length < 15;

        let prompt;

        if (isStuckResponse) {
            // Special handling for "I don't know" - act like a real interviewer
            prompt = `You are a supportive technical interviewer. The candidate just said they don't know or are stuck.

Interview Type: ${interviewType}
Question: "${question}"
Candidate's Response: "${answer}"

IMPORTANT: The candidate is stuck. As a REAL supportive interviewer:

1. FIRST - Start your response with an EXPLICIT acknowledgment like:
   - "That's perfectly okay! Not knowing is the first step to learning."
   - "No problem at all! Let me help you think through this."
   - "Hey, that's fine! Everyone gets stuck sometimes."
   
2. THEN - Give ONE of these (pick the most helpful):
   - A small hint (without giving away the answer)
   - A simpler version of the same question
   - A related easier warm-up question

Your ENTIRE response must be in this JSON format:
{
    "score": 25,
    "feedback": "<Your encouraging acknowledgment here - must start with something like 'That's okay!' or 'No problem!'>",
    "strengths": ["Being honest about limitations"],
    "improvements": ["${interviewType} fundamentals"],
    "followUp": "<Your ONE helpful hint or simpler question here>"
}

CRITICAL RULES:
- feedback MUST start with an encouraging phrase acknowledging they're stuck
- followUp should be ONE simple question or hint, not multiple
- Be warm and supportive, not robotic
- DO NOT ask multiple questions in followUp`;
        } else {
            // Normal evaluation for actual attempts
            prompt = `You are a friendly technical interviewer having a CONVERSATION with a candidate.

Interview Type: ${interviewType}
Question: "${question}"
Candidate's Answer: "${answer}"

Respond like you're TALKING to them, not reading from a script:
1. React naturally to what they said ("Ah, interesting point!", "Right, that's correct!", "Hmm, let me ask you...")
2. If they're on the right track, encourage them and dig deeper
3. Speak in a warm, conversational tone - like a helpful senior developer

For "improvements", prioritize using these STANDARD KEYWORDS if they apply (so we can recommend resources):
[DSA]: sliding-window, two-pointers, fast-and-slow-pointers, merge-intervals, cyclic-sort, in-place-reversal-of-a-linked-list, tree-breadth-first-search, tree-depth-first-search, two-heaps, subsets, modified-binary-search, bitwise-xor, top-k-elements, k-way-merge, 0-1-knapsack, topological-sort-graph, dynamic-programming, graphs, trees, stack-queue, recursion, greedy, trie
[System Design]: scalability, caching, database_design, load_balancing, microservices, cdn, api_design
[CS Core]: dbms, os, cn, sql, normalization, transactions
[Soft Skills]: communication, confidence, clarity, structured_thinking

Respond in this JSON format ONLY:
{
    "score": <number 0-100>,
    "feedback": "<one short sentence reacting to their answer>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<keyword_from_list_above>", "<specific_area>"],
    "followUp": "<your natural follow-up question>"
}

CONVERSATION STYLE EXAMPLES for followUp:
- "Nice! So tell me, what happens when..."
- "Ah, good thinking! Now what if we had to..."
- "Right, exactly! Can you walk me through how..."
- "Interesting approach! What would you do if..."

IMPORTANT RULES FOR EVALUATION:
1. **WORD-FOR-WORD ACCURACY CHECK**: Analyze the candidate's answer word-by-word.
   - If they include ANY incorrect statement, wrong terminology, or false claim, you MUST correct it.
   - ONLY say "Correct" if the answer is 100% accurate.
2. **CODE BUGS = REDO**: If the code has a bug (syntax, logic, off-by-one):
   - **Score**: 40-60
   - **Feedback**: Point out the specific error.
   - **FollowUp**: YOU MUST ASK THEM TO FIX IT. Do NOT ask a new question. Say: "Please fix this error and run the code again."
3. **STRICT SCORING**:
   - 100: Flawless, precise, optimal.
   - 90-99: Correct but could be more precise.
   - < 70: Any factual error or code bug.
4. **Be specific**: Tell them EXACTLY what Failed.

${interviewType === 'dsa' ? `
=== FAANG-STYLE DSA FOLLOW-UPS ===
After the candidate submits code, check the code carefully:

IF CODE/ANSWER HAS BUGS:
- Feedback: "I see a small issue in line X. The loop condition is off."
- FollowUp: "Please fix line X and resubmit your solution." (MANDATORY if buggy)
- Score: 40-60

IF CORRECT:
- Ask 1-2 theoretical follow-ups about their solution:

FOLLOW-UP TYPES (pick ONE based on score):
1. TIME/SPACE COMPLEXITY (if score >= 80):
   - "Nice solution! What's the time complexity? Can you walk me through it?"
   - "Good work! What about space complexity - how much extra memory are we using?"
   
2. OPTIMIZATION (if score >= 70):
   - "This works! Can you think of a way to optimize it further?"
   - "Great! What if the input was 10x larger - would your approach still work?"
   
3. EDGE CASES (if score >= 50):
   - "What edge cases should we handle here?"
   - "What happens if the input is empty or has duplicates?"
   
4. ALTERNATIVE APPROACH (if score >= 80):
   - "Excellent! Is there another way to solve this?"
   - "Can you think of a different data structure that might help?"

5. DEBUGGING HELP (if score < 50):
   - "I see what you're trying to do. What if we started with [hint]?"
   - "Close! Think about what happens when [edge case]..."

RULES:
- After 1-2 follow-ups on current problem, move to a NEW coding problem
- followUp should be a CONCEPT question about their code, NOT a new coding problem
- Do NOT add [TYPE:CODING] - keep it conversational
- If candidate answered well with good complexity analysis, acknowledge and move to next problem
` : ''}`;
        }

        try {
            const response = await this.makeRequest(prompt);
            // Try to parse JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            // Fallback
            return {
                score: isStuckResponse ? 30 : 70,
                feedback: isStuckResponse
                    ? "No problem! Let me give you a hint to help you think about this..."
                    : response,
                strengths: isStuckResponse ? ['Honest about limitations'] : ['Good attempt'],
                improvements: ['Could elaborate more'],
                followUp: isStuckResponse
                    ? "Let's break this down - what's the first thing you'd consider when approaching this problem?"
                    : null
            };
        } catch (error) {
            console.error('Error evaluating answer:', error);
            return {
                score: isStuckResponse ? 30 : 65,
                feedback: isStuckResponse
                    ? "That's okay! Let me simplify this for you."
                    : 'Could not fully evaluate. Keep practicing!',
                strengths: isStuckResponse ? ['Honest'] : ['Attempted the question'],
                improvements: ['Try to be more specific'],
                followUp: isStuckResponse
                    ? "Let's start simpler - can you tell me what you do understand about this topic?"
                    : null
            };
        }
    }

    // Thorough code evaluation for DSA problems with FAANG-style follow-ups
    async evaluateCode(question, code, language) {
        const prompt = `You are an expert code reviewer at a FAANG company conducting a technical interview.

PROBLEM:
${question}

CANDIDATE'S CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

THOROUGH CODE REVIEW - Analyze the code like a FAANG interviewer would:

1. **CORRECTNESS** (0-30 points):
   - Does it solve the problem correctly?
   - Does it handle the given examples?
   - Are there logical errors?

2. **EDGE CASES** (0-20 points):
   - Empty input handling
   - Single element cases
   - Negative numbers (if applicable)
   - Overflow/underflow potential
   - Duplicates handling

3. **TIME COMPLEXITY** (0-25 points):
   - What is the actual time complexity?
   - Is it optimal for this problem?
   - Any unnecessary operations?

4. **SPACE COMPLEXITY** (0-15 points):
   - Extra space used
   - In-place optimization possible?

5. **CODE QUALITY** (0-10 points):
   - Variable naming
   - Code structure
   - Readability

Respond in this EXACT JSON format:
{
    "score": <total 0-100>,
    "correctness": {
        "score": <0-30>,
        "issues": ["list of correctness issues if any"],
        "works": <true/false>
    },
    "timeComplexity": {
        "actual": "O(?)",
        "optimal": "O(?)",
        "isOptimal": <true/false>
    },
    "spaceComplexity": {
        "actual": "O(?)",
        "canImprove": <true/false>
    },
    "edgeCases": {
        "handled": ["cases handled"],
        "missed": ["cases missed"]
    },
    "feedback": "<2-3 sentence natural feedback like a real interviewer>",
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "followUp": "<ONE follow-up question about their code - ask about complexity, edge case, or optimization>"
}

FOLLOW-UP QUESTION EXAMPLES (pick ONE based on the code):
- If code works but not optimal: "This works! What's the time complexity? Can we do better?"
- If missing edge cases: "Good solution! What happens if the input is empty?"
- If optimal: "Excellent! Can you explain why this is O(n) time?"
- If has bugs: "I see an issue here - what happens when [edge case]?"

Be conversational and encouraging, like a real interviewer would be.`;

        try {
            const response = await this.makeRequest(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                // Ensure followUp exists
                if (!result.followUp) {
                    result.followUp = result.score >= 70
                        ? "Nice work! Can you walk me through the time and space complexity of your solution?"
                        : "I see what you're trying to do. Can you trace through your code with the first example?";
                }
                return result;
            }
            throw new Error('Invalid JSON response');
        } catch (error) {
            console.error('Error evaluating code:', error);
            return {
                score: 60,
                correctness: { score: 20, issues: [], works: true },
                timeComplexity: { actual: 'O(n)', optimal: 'O(n)', isOptimal: true },
                spaceComplexity: { actual: 'O(1)', canImprove: false },
                edgeCases: { handled: [], missed: [] },
                feedback: "I can see your approach. Let's discuss it further.",
                strengths: ['Attempted solution'],
                improvements: ['Could add more edge case handling'],
                followUp: "Can you tell me the time complexity of your solution?"
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
