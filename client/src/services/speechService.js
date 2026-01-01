// Speech Service - Text-to-Speech and Speech-to-Text
// Optimized for professional, soft-spoken interviewer voice

class SpeechService {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.onTranscript = null;
        this.onSpeakingChange = null;
        this.preferredVoice = null;

        // Initialize Speech Recognition if available
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                if (transcript && this.onTranscript) {
                    this.onTranscript(transcript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };
        }

        // Pre-load voices
        if (this.synthesis) {
            this.synthesis.onvoiceschanged = () => {
                this.loadPreferredVoice();
            };
            this.loadPreferredVoice();
        }
    }

    loadPreferredVoice() {
        const voices = this.synthesis.getVoices();
        // Priority: Google US English (Female/Male), Microsoft Natural, then any English
        this.preferredVoice = voices.find(v => v.name.includes('Google US English') && v.lang.includes('en-US')) ||
            voices.find(v => v.name.includes('Natural') && v.lang.includes('en')) ||
            voices.find(v => v.name.includes('Google') && v.lang.includes('en')) ||
            voices.find(v => v.name.includes('Microsoft') && v.lang.includes('en')) ||
            voices.find(v => v.lang.startsWith('en'));
    }

    // Text-to-Speech: Avatar speaks
    speak(text, onEnd = null) {
        return new Promise((resolve) => {
            if (!this.synthesis) {
                console.warn('Speech synthesis not supported');
                resolve();
                return;
            }

            // Stop any current speech
            this.synthesis.cancel();

            // Split text into smaller chunks for more natural pauses (at commas, periods)
            const chunks = text.match(/[^.!,?]+[.!,?]?/g) || [text];

            let currentChunk = 0;

            const speakNextChunk = () => {
                if (currentChunk >= chunks.length) {
                    this.isSpeaking = false;
                    if (this.onSpeakingChange) this.onSpeakingChange(false);
                    if (onEnd) onEnd();
                    resolve();
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(chunks[currentChunk].trim());

                if (this.preferredVoice) {
                    utterance.voice = this.preferredVoice;
                }

                // Optimized for "soft-spoken professional interviewer"
                utterance.rate = 0.88; // Slightly slower for clarity and "soft" feel
                utterance.pitch = 1.05; // Slightly higher for a friendly, clear tone
                utterance.volume = 0.9; // Slightly lower for "soft-spoken" effect

                utterance.onstart = () => {
                    this.isSpeaking = true;
                    if (this.onSpeakingChange) this.onSpeakingChange(true);
                };

                utterance.onend = () => {
                    currentChunk++;
                    // Add a small natural pause between sentences
                    setTimeout(speakNextChunk, 250);
                };

                utterance.onerror = (e) => {
                    console.error('Speech error:', e);
                    this.isSpeaking = false;
                    if (this.onSpeakingChange) this.onSpeakingChange(false);
                    resolve();
                };

                this.synthesis.speak(utterance);
            };

            speakNextChunk();
        });
    }

    // Stop speaking
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            if (this.onSpeakingChange) this.onSpeakingChange(false);
        }
    }

    // Start listening (Speech-to-Text)
    startListening(onTranscript) {
        if (!this.recognition) {
            console.warn('Speech recognition not supported');
            return false;
        }

        this.onTranscript = onTranscript;

        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            return false;
        }
    }

    // Stop listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // Check if speech recognition is supported
    isSpeechRecognitionSupported() {
        return !!this.recognition;
    }

    // Check if speech synthesis is supported
    isSpeechSynthesisSupported() {
        return !!this.synthesis;
    }

    // Set callback for speaking state changes (for lip-sync)
    setSpeakingCallback(callback) {
        this.onSpeakingChange = callback;
    }
}

// Export singleton instance
const speechService = new SpeechService();
export default speechService;

