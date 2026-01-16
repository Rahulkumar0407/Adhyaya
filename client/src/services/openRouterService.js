// OpenRouter AI Service - Interview Question Generation with Multi-Provider Fallback
// Fallback chain: OpenRouter → Groq → Gemini
// Uses multiple models with automatic failover

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS = [
    import.meta.env.VITE_OPENROUTER_MODEL_1 || 'mistralai/mistral-7b-instruct',
    import.meta.env.VITE_OPENROUTER_MODEL_2 || 'meta-llama/llama-3-8b-instruct',
    import.meta.env.VITE_OPENROUTER_MODEL_3 || 'openchat/openchat-3.5',
];

// Groq API configuration (fallback 1)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.2-90b-vision-preview';

// Gemini API configuration (fallback 2)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// API Keys from environment
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
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

const GEMINI_API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY_1,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3,
    import.meta.env.VITE_GEMINI_API_KEY_4,
    import.meta.env.VITE_GEMINI_API_KEY_5,
    import.meta.env.VITE_GEMINI_API_KEY_6,
].filter(key => key);

// System prompts for different interview types
const STOP_SEQUENCES = ["### Candidate", "Candidate:", "User:", "### User"];

const SYSTEM_PROMPTS = {
    base: `You are a strict but supportive technical interviewer conducting placement interviews for Indian students.
RULES:
- Do NOT give answers or solutions
- Ask realistic follow-up questions
- Adapt difficulty based on performance
- Focus on practical questions
- Be encouraging but maintain standards
- NEVER simulate or hallucinate the candidate's response. Stop speaking after your question.`,

    hr: `You are an HR interviewer looking for:
- Communication clarity (STAR method)
- Cultural fit and attitude
- Problem-solving approach
Ask one question at a time. Probe deeper if answers are vague.`,

    dsa: `You are a DSA/Coding interviewer evaluating:
- Data structures and algorithms knowledge
- Problem-solving thought process
- Optimization capability
Ask conceptual questions first. If the candidate answers well, move to a problem statement.`,

    coding: `You are a live coding interviewer evaluating:
- Code quality and correctness
- Complexity analysis
- Edge case handling
Focus on the approach before code. Ask clarifying questions.`,

    'system-design': `You are a system design interviewer evaluating:
- Scalability thinking
- Component design decisions
- Real-world constraints
Start with requirements, then probe architecture choices.`
};

// Evaluation schema for structured responses
const EVALUATION_PROMPT = `
After evaluating the candidate's response, provide your assessment in this EXACT JSON format:
{
    "clarity": <1-10>,
    "confidence": <1-10>,
    "technical_depth": <1-10>,
    "mistakes": ["list", "of", "mistakes"],
    "weak_patterns": ["dsa patterns or concepts needing work"],
    "follow_up_difficulty": "increase" | "maintain" | "decrease",
    "follow_up_question": "Your next interview question",
    "brief_feedback": "One line of constructive feedback"
}
IMPORTANT: Return ONLY the JSON object, no other text.`;

class OpenRouterService {
    constructor() {
        this.currentOpenRouterModelIndex = 0;
        this.currentGroqKeyIndex = 0;
        this.currentGeminiKeyIndex = 0;
        this.failedProviders = new Set();
        this.conversationHistory = [];
        this.totalTokensUsed = 0;
    }

    // Reset for new interview
    resetSession() {
        this.conversationHistory = [];
        this.failedProviders.clear();
        this.totalTokensUsed = 0;
    }

    // Get system prompt for interview type
    getSystemPrompt(interviewType) {
        const typePrompt = SYSTEM_PROMPTS[interviewType] || SYSTEM_PROMPTS['dsa'];
        return `${SYSTEM_PROMPTS.base}\n\n${typePrompt}`;
    }

    // Try OpenRouter API
    async tryOpenRouter(messages, model) {
        if (!OPENROUTER_API_KEY) {
            throw new Error('OpenRouter API key not configured');
        }

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Adhyaya Mock Interview'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7,
                stop: STOP_SEQUENCES
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('OpenRouter API Error:', response.status, error);
            throw new Error(error.error?.message || `OpenRouter error: ${response.status}`);
        }

        const data = await response.json();
        console.log('OpenRouter Response Data:', JSON.stringify(data, null, 2)); // Debug log
        this.totalTokensUsed += data.usage?.total_tokens || 0;

        if (data.error) {
            console.error('OpenRouter returned error object:', data.error);
            throw new Error(data.error.message || 'OpenRouter returned an error object');
        }

        if (!data.choices || data.choices.length === 0) {
            console.error('Missing choices. Keys:', Object.keys(data));
            throw new Error('No choices returned from OpenRouter');
        }

        return data.choices[0].message.content;
    }

    // Try Groq API
    async tryGroq(messages) {
        const apiKey = GROQ_API_KEYS[this.currentGroqKeyIndex];
        if (!apiKey) {
            throw new Error('Groq API key not available');
        }

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            // Rotate Groq key on failure
            this.currentGroqKeyIndex = (this.currentGroqKeyIndex + 1) % GROQ_API_KEYS.length;
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Groq error: ${response.status}`);
        }

        const data = await response.json();
        this.totalTokensUsed += data.usage?.total_tokens || 0;
        return data.choices[0].message.content;
    }

    // Try Gemini API
    async tryGemini(messages) {
        const apiKey = GEMINI_API_KEYS[this.currentGeminiKeyIndex];
        if (!apiKey) {
            throw new Error('Gemini API key not available');
        }

        // Convert messages to Gemini format
        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }]
        }));

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            // Rotate Gemini key on failure
            this.currentGeminiKeyIndex = (this.currentGeminiKeyIndex + 1) % GEMINI_API_KEYS.length;
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Gemini error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    // Main API call with fallback chain
    async generateResponse(prompt, interviewType = 'dsa', requiresEvaluation = false) {
        const systemPrompt = this.getSystemPrompt(interviewType);
        const fullPrompt = requiresEvaluation ? `${prompt}\n\n${EVALUATION_PROMPT}` : prompt;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory,
            { role: 'user', content: fullPrompt }
        ];

        let lastError = null;

        // Try OpenRouter models first
        for (let i = this.currentOpenRouterModelIndex; i < OPENROUTER_MODELS.length; i++) {
            try {
                console.log(`Trying OpenRouter model: ${OPENROUTER_MODELS[i]}`);
                const response = await this.tryOpenRouter(messages, OPENROUTER_MODELS[i]);
                this.conversationHistory.push({ role: 'user', content: fullPrompt });
                this.conversationHistory.push({ role: 'assistant', content: response });
                return this.parseResponse(response, requiresEvaluation);
            } catch (error) {
                console.error(`OpenRouter ${OPENROUTER_MODELS[i]} failed:`, error);
                lastError = error;
                this.currentOpenRouterModelIndex = i + 1;
            }
        }

        // Try Groq as fallback
        if (GROQ_API_KEYS.length > 0) {
            for (let i = 0; i < GROQ_API_KEYS.length; i++) {
                try {
                    console.log('Trying Groq fallback...');
                    const response = await this.tryGroq(messages);
                    this.conversationHistory.push({ role: 'user', content: fullPrompt });
                    this.conversationHistory.push({ role: 'assistant', content: response });
                    return this.parseResponse(response, requiresEvaluation);
                } catch (error) {
                    console.warn('Groq failed:', error.message);
                    lastError = error;
                }
            }
        }

        // Try Gemini as final fallback
        if (GEMINI_API_KEYS.length > 0) {
            for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
                try {
                    console.log('Trying Gemini fallback...');
                    const response = await this.tryGemini(messages);
                    this.conversationHistory.push({ role: 'user', content: fullPrompt });
                    this.conversationHistory.push({ role: 'assistant', content: response });
                    return this.parseResponse(response, requiresEvaluation);
                } catch (error) {
                    console.warn('Gemini failed:', error.message);
                    lastError = error;
                }
            }
        }

        // All providers failed
        throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
    }

    // Parse response, extracting JSON if evaluation was requested
    parseResponse(response, requiresEvaluation) {
        if (!requiresEvaluation) {
            return { text: response, evaluation: null };
        }

        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const evaluation = JSON.parse(jsonMatch[0]);
                return {
                    text: evaluation.follow_up_question || response,
                    evaluation: evaluation
                };
            }
        } catch (e) {
            console.warn('Failed to parse evaluation JSON:', e);
        }

        return { text: response, evaluation: null };
    }

    // Generate interview intro
    async generateIntro(interviewType, customRole = '', config = {}) {
        const { difficulty = 'intermediate', companyTarget = 'product' } = config;

        const prompt = `Start this ${interviewType} interview. The candidate is preparing for ${companyTarget} company interviews at ${difficulty} level.
${customRole ? `The role is: ${customRole}` : ''}

Give a brief, friendly introduction (2-3 sentences) setting the stage.
Do NOT ask the first question yet. Just say you are ready to begin.
Be natural and encouraging.`;

        const response = await this.generateResponse(prompt, interviewType, false);
        return response.text;
    }

    // Generate follow-up based on user answer
    async evaluateAndFollowUp(userAnswer, interviewType, questionNumber) {
        const prompt = `The candidate answered: "${userAnswer}"

This is question ${questionNumber} of the interview. Evaluate their response and ask an appropriate follow-up question.`;

        return await this.generateResponse(prompt, interviewType, true);
    }

    // Generate final summary
    async generateFinalSummary(interviewType) {
        const prompt = `The interview is now complete. Based on the entire conversation, provide a final assessment in this JSON format:
{
    "overall_score": <1-100>,
    "clarity_score": <1-100>,
    "confidence_score": <1-100>,
    "technical_score": <1-100>,
    "key_strengths": ["list of 2-3 strengths"],
    "areas_to_improve": ["list of 2-3 areas"],
    "weak_topics": ["specific topics to study"],
    "final_feedback": "2-3 sentences of constructive feedback"
}
Return ONLY the JSON.`;

        const response = await this.generateResponse(prompt, interviewType, false);
        try {
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn('Failed to parse final summary:', e);
        }

        return {
            overall_score: 70,
            clarity_score: 70,
            confidence_score: 70,
            technical_score: 70,
            key_strengths: ['Good effort', 'Completed interview'],
            areas_to_improve: ['Practice more'],
            weak_topics: [],
            final_feedback: 'Keep practicing to improve your interview skills.'
        };
    }

    // Get token usage stats
    getTokenUsage() {
        return this.totalTokensUsed;
    }
}

// Export singleton
const openRouterService = new OpenRouterService();
export default openRouterService;
