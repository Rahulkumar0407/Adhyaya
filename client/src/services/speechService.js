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

        // Initialize Speech Recognition
        this.initializeRecognition();
    }

    initializeRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            // Clean up existing instance if any
            if (this.recognition) {
                try {
                    this.recognition.onend = null;
                    this.recognition.onerror = null;
                    this.recognition.onresult = null;
                    this.recognition.abort();
                } catch (e) {
                    console.warn('Error cleanup recognition:', e);
                }
            }

            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.consecutiveNetworkErrors = 0; // Track errors to prevent loops

            this.recognition.onresult = (event) => {
                // Reset error counter on success
                this.consecutiveNetworkErrors = 0;

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

                if (event.error === 'network') {
                    this.consecutiveNetworkErrors++;
                    console.warn(`Network error count: ${this.consecutiveNetworkErrors}`);

                    // Increased tolerance to 6 errors
                    if (this.consecutiveNetworkErrors > 6) {
                        console.error('Too many network errors, stopping auto-restart.');
                        this.shouldKeepListening = false; // Stop trying
                        // We will emit error so UI shows "Stopped"
                    } else {
                        // Periodic hard reset (every 2nd error) to try and clear bad state
                        // without thrashing instance every single time
                        if (this.consecutiveNetworkErrors % 2 === 0) {
                            setTimeout(() => {
                                if (this.shouldKeepListening) {
                                    console.log('Periodic hard reset of speech recognition...');
                                    this.initializeRecognition();
                                    // Helper will be called by onend logic usually, but let's ensure we are ready
                                }
                            }, 200);
                        }
                    }
                } else if (event.error === 'not-allowed') {
                    console.warn('Microphone access denied. Please allow microphone permission.');
                    this.shouldKeepListening = false;
                } else if (event.error === 'no-speech') {
                    // No speech is fine, just restart
                }

                // Emit error event for UI feedback
                if (this.onError) {
                    // If we stopped due to too many errors, send a special message
                    if (this.consecutiveNetworkErrors > 6 && event.error === 'network') {
                        this.onError('network-fatal');
                    } else {
                        // Don't show toast for every non-fatal network error, just log it
                        if (event.error !== 'network') {
                            this.onError(event.error);
                        }
                    }
                }
            };

            this.recognition.onend = () => {
                // Auto-restart if we should keep listening AND haven't hit error limit
                if (this.shouldKeepListening) {
                    console.log('Speech recognition ended, checking restart...');

                    // Exponential backoff: 0 errors -> 100ms, 1 -> 1000ms, 2 -> 2000ms, 3 -> 4000ms...
                    // This gives the network time to recover.
                    let delay = 100;
                    if (this.consecutiveNetworkErrors > 0) {
                        delay = Math.min(1000 * Math.pow(2, this.consecutiveNetworkErrors - 1), 8000);
                        console.log(`Waiting ${delay}ms before restart attempt...`);
                    }

                    try {
                        setTimeout(() => {
                            if (this.shouldKeepListening && !this.isSpeaking && this.recognition) {
                                try {
                                    this.recognition.start();
                                } catch (err) {
                                    console.warn('Restart failed:', err);
                                    this.isListening = false;
                                }
                            }
                        }, delay);
                    } catch (e) {
                        console.warn('Failed to auto-restart recognition:', e);
                        this.isListening = false;
                    }
                } else {
                    this.isListening = false;
                }
            };
        }

        // Flag to track if user wants mic on
        this.shouldKeepListening = false;

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

    // Get all available voices - filter duplicates and keep unique voices
    getAvailableVoices() {
        const allVoices = this.synthesis.getVoices().filter(v => v.lang.startsWith('en') && !v.name.includes('Beauregard'));

        // Filter out duplicate voices that have same voice engine but different names
        // Some Windows voices like "Microsoft David" and variations are identical
        const seenVoiceIds = new Set();
        const uniqueVoices = [];

        for (const voice of allVoices) {
            // Create a unique identifier based on voice characteristics
            // Voices with same localService + lang + voiceURI pattern are likely duplicates
            const voiceSignature = `${voice.localService}-${voice.lang}-${voice.name.replace(/\s+(Desktop|Mobile|Online)$/i, '')}`;

            // Skip known duplicate voice patterns
            const isDuplicate =
                voice.name.toLowerCase().includes('rudolf') || // Rudolph typically mirrors David
                (seenVoiceIds.has(voiceSignature));

            if (!isDuplicate) {
                seenVoiceIds.add(voiceSignature);
                uniqueVoices.push(voice);
            }
        }

        return uniqueVoices;
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

    // Clean text for speech - remove markdown, symbols, and format for natural reading
    cleanTextForSpeech(text) {
        if (!text) return '';

        return text
            // Handle code blocks - replace with summary instead of reading code
            .replace(/```[\s\S]*?```/g, ' Here is a code example. ')

            // Handle inline code - just read the content without backticks
            .replace(/`([^`]+)`/g, '$1')

            // Remove markdown bold/italic FIRST so it doesn't conflict with math operators
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/_([^_]+)_/g, '$1')

            // Remove markdown headers
            .replace(/#{1,6}\s*/g, '')

            // Remove links, keep text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

            // Remove metadata tags like [TYPE:CODING], [NOTE], [10 pts]
            .replace(/\[[A-Z0-9_\s:]+\]/g, '')

            // Remove bullet points and list markers
            .replace(/^[\s]*[-*+]\s+/gm, '')
            .replace(/^[\s]*\d+\.\s+/gm, '')

            // Handle "Example:" or "Examples:" sections - summarize instead of reading all
            .replace(/(?:For )?[Ee]xample[s]?:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/g, ' Here are some examples. ')
            .replace(/(?:Sample )?[Ii]nput[s]?:\s*.*?(?:Sample )?[Oo]utput[s]?:\s*.*?(?=\n\n|\n[A-Z]|$)/gs, ' See the examples provided. ')

            // Mathematical operators - convert to spoken words
            // NOW safe to process math symbols since bold ** is already gone
            .replace(/\^(\d+)/g, ' raised to the power of $1 ')
            .replace(/\*\*/g, ' raised to the power of ')
            .replace(/>=/g, ' greater than or equal to ')
            .replace(/<=/g, ' less than or equal to ')
            .replace(/!=/g, ' not equal to ')
            .replace(/==/g, ' equals ')
            .replace(/->/g, ' arrow ')
            .replace(/=>/g, ' arrow ')
            .replace(/<-/g, ' arrow ')
            .replace(/\|\|/g, ' or ')
            .replace(/&&/g, ' and ')
            .replace(/\+\+/g, ' plus plus ')
            .replace(/--/g, ' minus minus ')
            .replace(/O\(([^)]+)\)/g, ' O of $1 ') // Big O notation

            // Common programming symbols
            .replace(/\[\]/g, ' array ')
            .replace(/\{\}/g, ' object ')
            .replace(/\(\)/g, ' ')
            .replace(/\[([^\]]+)\]/g, '$1') // Array indices - just read the content

            // Handle constraints section - read naturally
            .replace(/Constraints?:\s*/gi, 'The constraints are: ')

            // Clean up special characters that shouldn't be read
            .replace(/[#@$%&*()_+=\[\]{}<>|\\\/~`]/g, ' ')

            // Clean up quotes
            .replace(/["']/g, '')

            // Handle numbers with commas
            .replace(/(\d),(\d)/g, '$1$2')

            // Remove excessive whitespace
            .replace(/\s+/g, ' ')

            // Remove newlines for smoother speech
            .replace(/\n/g, '. ')

            // Clean up multiple periods
            .replace(/\.{2,}/g, '.')
            .replace(/\.\s*\./g, '.')

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

                        // Resume listening if it was active
                        if (this.shouldKeepListening) {
                            setTimeout(() => {
                                try {
                                    // Check again in case stopped manually during delay
                                    if (this.shouldKeepListening && !this.isListening) {
                                        this.recognition.start();
                                        this.isListening = true;
                                    }
                                } catch (e) {
                                    // Ignore already started errors
                                }
                            }, 500);
                        }
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
                this.shouldKeepListening = true; // User wants mic on
                this.recognition.start();
                this.isListening = true;
                return true;
            } catch (e) {
                // If error is "active", it's fine, we remain listening
                if (e.error === 'no-speech' || e.message?.includes('active')) {
                    return true;
                }

                // If another error occurred, the instance might be buggy.
                console.warn('Start failed, attempting to re-initialize recognition:', e);
                try {
                    this.initializeRecognition();
                    this.recognition.start();
                    this.isListening = true;
                    return true;
                } catch (retryError) {
                    console.error('Failed to restart even after re-initialization:', retryError);
                    throw retryError;
                }
            }
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            return false;
        }
    }

    // Stop listening
    stopListening() {
        this.shouldKeepListening = false; // User explicitly stopping
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

