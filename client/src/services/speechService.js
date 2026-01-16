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
        this.activeUtterance = null; // Keep reference to prevent GC

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
                console.warn('Speech recognition error:', event.error);
                this.isListening = false;

                // Provide helpful error messages
                if (event.error === 'network') {
                    console.warn('Network error - speech recognition requires internet. Use text input instead.');
                } else if (event.error === 'not-allowed') {
                    console.warn('Microphone access denied. Please allow microphone permission.');
                } else if (event.error === 'no-speech') {
                    console.warn('No speech detected. Try speaking louder or closer to the mic.');
                }

                // Emit error event for UI feedback
                if (this.onError) {
                    this.onError(event.error);
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };
        }

        // Pre-load voices
        if (this.synthesis) {
            this.voicesReady = new Promise((resolve) => {
                this.voicesReadyResolve = resolve;
            });

            // Handle voices changed event
            this.synthesis.onvoiceschanged = () => {
                this.loadPreferredVoice();
                this.voicesReadyResolve();
            };

            // Check if voices are already loaded
            if (this.synthesis.getVoices().length > 0) {
                this.loadPreferredVoice();
                this.voicesReadyResolve();
            }
        }
    }

    async loadPreferredVoice() {
        let voices = this.synthesis.getVoices();

        // If still no voices, we might be too early, but usually onvoiceschanged handles it.
        if (voices.length === 0) return;

        console.log('Available voices:', voices.length);

        // Priority for natural, expressive voices
        // 1. Microsoft Edge natural voices (very high quality)
        // 2. Google voices (good quality)
        // 3. Any natural-sounding English voice
        this.preferredVoice =
            voices.find(v => v.name.includes('Microsoft Aria') && v.lang.includes('en')) ||
            voices.find(v => v.name.includes('Microsoft Jenny') && v.lang.includes('en')) ||
            voices.find(v => v.name.includes('Microsoft Guy') && v.lang.includes('en')) ||
            voices.find(v => v.name.includes('Google UK English Female')) ||
            voices.find(v => v.name.includes('Google UK English Male')) ||
            voices.find(v => v.name.includes('Google US English')) ||
            voices.find(v => v.name.includes('Natural') && v.lang.includes('en')) ||
            voices.find(v => v.name.includes('Samantha')) || // macOS
            voices.find(v => v.name.includes('Alex')) || // macOS
            voices.find(v => v.name.includes('Microsoft') && v.lang.includes('en')) ||
            voices.find(v => v.lang.startsWith('en-')) ||
            // Fallback: first available voice
            (voices.length > 0 ? voices[0] : null);

        if (this.preferredVoice && !this.manualVoiceSet) {
            console.log('Selected voice:', this.preferredVoice.name);
        } else if (this.manualVoiceSet) {
            console.log('Using manually set voice:', this.preferredVoice?.name);
        } else {
            console.warn('No speech synthesis voice available. TTS will be silent.');
        }
    }

    // Get all available voices
    getAvailableVoices() {
        return this.synthesis.getVoices().filter(v => v.lang.startsWith('en') && !v.name.includes('Beauregard'));
    }

    // Manually set a voice by its URI
    setVoice(voiceURI) {
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.voiceURI === voiceURI);
        if (voice) {
            this.preferredVoice = voice;
            this.manualVoiceSet = true;
            console.log('Voice manually set to:', voice.name);
            return true;
        }
        return false;
    }

    // Clean text for speech - remove markdown and symbols
    cleanTextForSpeech(text) {
        if (!text) return '';

        return text
            // Remove markdown headers
            .replace(/#{1,6}\s*/g, '')
            // Remove bold/italic markdown
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/_([^_]+)_/g, '$1')
            // Remove code blocks
            .replace(/```[\s\S]*?```/g, 'code block')
            .replace(/`([^`]+)`/g, '$1')
            // Remove links, keep text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Remove bullet points and list markers
            .replace(/^[\s]*[-*+]\s+/gm, '')
            .replace(/^[\s]*\d+\.\s+/gm, '')
            // Remove special symbols that sound weird when spoken
            .replace(/[#@$%^&*()_+=\[\]{}<>|\\\/~`]/g, ' ')
            // Remove multiple spaces
            .replace(/\s+/g, ' ')
            // Trim
            .trim();
    }

    // Text-to-Speech: Avatar speaks with natural, emotionful voice
    async speak(text, onEnd = null) {
        // Clean text before speaking
        text = this.cleanTextForSpeech(text);

        console.log('speechService.speak called with:', text?.substring(0, 30));
        if (!this.synthesis || !text) {
            console.warn('Speech synthesis not supported or empty text');
            if (onEnd) onEnd();
            return;
        }

        // Wait for voices with timeout
        if (this.voicesReady) {
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
            await Promise.race([this.voicesReady, timeoutPromise]);

            // Reload voices just in case
            if (!this.preferredVoice) {
                await this.loadPreferredVoice();
            }
        }

        return new Promise((resolve) => {
            // Stop any current speech
            this.synthesis.cancel();
            this.cancelled = false;

            // Increment speech ID to invalidate previous utterances
            this.currentSpeechId = (this.currentSpeechId || 0) + 1;
            const mySpeechId = this.currentSpeechId;


            // Split text into smaller chunks for more natural pauses (at sentences)
            // Improved regex to handle various punctuation but ensure we don't lose text
            const chunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];

            let currentChunk = 0;

            const speakNextChunk = () => {
                // Check if cancelled or new speech started
                if (this.cancelled || mySpeechId !== this.currentSpeechId || currentChunk >= chunks.length) {
                    // Only update state if we are still the active speech
                    if (mySpeechId === this.currentSpeechId) {
                        this.isSpeaking = false;
                        this.activeUtterance = null;
                        if (this.onSpeakingChange) this.onSpeakingChange(false);
                    }
                    if (onEnd && !this.cancelled && mySpeechId === this.currentSpeechId) onEnd();
                    resolve();
                    return;
                }

                const textToSpeak = chunks[currentChunk].trim();

                // Skip empty chunks
                if (!textToSpeak) {
                    currentChunk++;
                    speakNextChunk();
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                // Keep reference to prevent garbage collection
                this.activeUtterance = utterance;

                if (this.preferredVoice) {
                    utterance.voice = this.preferredVoice;
                }

                // Optimized for natural, conversational interviewer voice
                // Slower rate makes it feel less robotic and more thoughtful
                utterance.rate = 0.85; // Slower for natural conversation
                utterance.pitch = 1.02; // Slightly higher for warmth
                utterance.volume = 1.0; // Full volume

                console.log('Speaking chunk:', textToSpeak.substring(0, 20) + '...', 'Voice:', this.preferredVoice?.name);

                utterance.onstart = () => {
                    if (!this.cancelled && mySpeechId === this.currentSpeechId) {
                        this.isSpeaking = true;
                        if (this.onSpeakingChange) this.onSpeakingChange(true);
                    }
                };

                utterance.onend = () => {
                    if (this.cancelled || mySpeechId !== this.currentSpeechId) {
                        resolve();
                        return;
                    }
                    currentChunk++;
                    // Add natural pause between sentences - longer pause feels more human
                    setTimeout(speakNextChunk, 500);
                };

                utterance.onerror = (e) => {
                    // Ignore interrupted errors
                    if (e.error === 'interrupted' || e.error === 'canceled') return;

                    console.error('Speech error:', e);
                    if (mySpeechId === this.currentSpeechId) {
                        this.isSpeaking = false;
                        if (this.onSpeakingChange) this.onSpeakingChange(false);
                    }

                    // On error, try to continue to next chunk instead of stopping completely
                    currentChunk++;
                    setTimeout(speakNextChunk, 100);
                };

                try {
                    this.synthesis.speak(utterance);

                    // Safety check: Resume if paused (sometimes browsers pause auto-playing audio)
                    if (this.synthesis.paused) {
                        this.synthesis.resume();
                    }

                    // Chrome bug fix: Periodically resume to keep speech active
                    if (this.resumeInterval) clearInterval(this.resumeInterval);
                    this.resumeInterval = setInterval(() => {
                        if (this.synthesis.paused) {
                            console.log('Force resuming paused speech...');
                            this.synthesis.resume();
                        }
                    }, 5000);
                } catch (err) {
                    console.error('Synthesis speak failed:', err);
                    resolve();
                }
            };

            speakNextChunk();
        });
    }

    // Stop speaking - fully cancel all speech
    stopSpeaking() {
        console.log('stopSpeaking called - cancelling all speech');

        // Set cancelled flag to stop any chunked speech in progress
        this.cancelled = true;

        // Increment speech ID to invalidate any pending callbacks
        this.currentSpeechId = (this.currentSpeechId || 0) + 1;

        // Clear the resume interval
        if (this.resumeInterval) {
            clearInterval(this.resumeInterval);
            this.resumeInterval = null;
        }

        if (this.synthesis) {
            // Cancel multiple times to ensure it stops (Chrome bug)
            this.synthesis.cancel();
            this.synthesis.cancel();
            this.synthesis.cancel();

            this.isSpeaking = false;
            this.activeUtterance = null;
            if (this.onSpeakingChange) this.onSpeakingChange(false);
        }
    }

    // Start listening (Speech-to-Text)
    startListening(onTranscript, onErrorCallback) {
        if (!this.recognition) {
            console.warn('Speech recognition not supported');
            return false;
        }

        this.onTranscript = onTranscript;
        this.onError = onErrorCallback;

        try {
            // Check if already started
            try {
                this.recognition.start();
                this.isListening = true;
                return true;
            } catch (e) {
                // If error is "active", it's fine, we remain listening
                if (e.error === 'no-speech' || e.message?.includes('active')) {
                    return true;
                }
                throw e;
            }
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

