/**
 * Focus Attention Service
 * 
 * On-device face detection and gaze tracking using TensorFlow.js
 * Privacy-first: No video recording, no cloud uploads, only derived metrics
 */

// Note: TensorFlow.js and face-landmarks-detection must be installed:
// npm install @tensorflow/tfjs @tensorflow-models/face-landmarks-detection

class FocusAttentionService {
    constructor() {
        this.model = null;
        this.isInitialized = false;
        this.isInitializing = false; // Track initialization state
        this.isRunning = false;
        this.isStarting = false; // Prevent concurrent startTracking calls
        this.videoElement = null;
        this.canvasElement = null;
        this.animationFrameId = null;
        this.currentStream = null; // Track current media stream
        this.lightweightMode = false; // Skip ML, just show webcam

        // Metrics
        this.metrics = {
            gazeScore: 100,
            blinkCount: 0,
            lookAwayCount: 0,
            drowsinessEvents: 0,
            lastBlinkTime: Date.now(),
            eyeAspectRatioHistory: [],
            gazeHistory: []
        };

        // Thresholds
        this.config = {
            blinkThreshold: 0.3,       // Increased: Eye aspect ratio below this = blink
            gazeAwayThreshold: 0.45,   // Increased: How far off-center before "looking away"
            drowsinessBlinkRate: 5,    // Blinks per minute indicating drowsiness
            sampleInterval: 150,       // Increased to 150ms (was 100ms) - reduces CPU load
            historySize: 30,           // Number of samples to keep
            distractionCooldown: 5000  // Minimum ms between distraction events of same type
        };

        // Callbacks
        this.onMetricsUpdate = null;
        this.onDistraction = null;
        this.onDrowsiness = null;

        // Distraction throttling - track last time each type was reported
        this.lastDistractionTime = {};

        // Consecutive no-face counter for gradual decay
        this.consecutiveNoFace = 0;
    }

    /**
     * Initialize TensorFlow.js and load face detection model
     * Now runs in background without blocking webcam display
     */
    async initialize() {
        if (this.isInitialized) return true;
        if (this.isInitializing) {
            // Wait for ongoing initialization
            while (this.isInitializing) {
                await new Promise(r => setTimeout(r, 100));
            }
            return this.isInitialized;
        }

        this.isInitializing = true;

        try {
            console.log('[FocusAttention] Loading TensorFlow.js model...');

            // Dynamic import to avoid loading if not needed
            const tf = await import('@tensorflow/tfjs');
            const faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection');

            // Use WebGL backend for performance
            await tf.setBackend('webgl');
            await tf.ready();

            // Load the face landmarks model
            this.model = await faceLandmarksDetection.createDetector(
                faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                {
                    runtime: 'tfjs',
                    refineLandmarks: false, // Disable for better performance
                    maxFaces: 1
                }
            );

            this.isInitialized = true;
            this.isInitializing = false;
            console.log('[FocusAttention] Model initialized successfully');
            return true;
        } catch (error) {
            console.error('[FocusAttention] Failed to initialize:', error);
            this.isInitializing = false;
            return false;
        }
    }

    /**
     * Start webcam and begin tracking
     * Now shows webcam immediately, ML loads in background
     */
    async startTracking(videoElement, canvasElement = null, options = {}) {
        // Prevent concurrent calls - if already starting or running, return
        if (this.isStarting) {
            console.log('[FocusAttention] Tracking already starting, ignoring duplicate call');
            return false;
        }

        if (this.isRunning) {
            console.log('[FocusAttention] Tracking already running');
            return true;
        }

        this.isStarting = true;
        this.lightweightMode = options.lightweightMode || false;

        try {
            // Stop any existing stream first
            if (this.currentStream) {
                this.currentStream.getTracks().forEach(track => track.stop());
                this.currentStream = null;
            }

            this.videoElement = videoElement;
            this.canvasElement = canvasElement;

            // Request webcam access with lower resolution for better performance
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 320 }, // Lower resolution for performance
                    height: { ideal: 240 }
                }
            });

            this.currentStream = stream;
            this.videoElement.srcObject = stream;

            // Wait for video to be ready before playing
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    resolve(); // Don't block forever
                }, 5000);

                const onLoadedMetadata = () => {
                    clearTimeout(timeout);
                    this.videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                    this.videoElement.removeEventListener('error', onError);

                    // CRITICAL: Set explicit dimensions for Tensor flow to work correctly
                    this.videoElement.width = this.videoElement.videoWidth;
                    this.videoElement.height = this.videoElement.videoHeight;

                    resolve();
                };
                const onError = (error) => {
                    clearTimeout(timeout);
                    this.videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                    this.videoElement.removeEventListener('error', onError);
                    reject(error);
                };

                // Check if already loaded
                if (this.videoElement.readyState >= 2) {
                    // Still ensure dimensions are set
                    this.videoElement.width = this.videoElement.videoWidth || 320;
                    this.videoElement.height = this.videoElement.videoHeight || 240;
                    clearTimeout(timeout);
                    resolve();
                } else {
                    this.videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
                    this.videoElement.addEventListener('error', onError);
                }
            });

            // Now play the video
            await this.videoElement.play();

            this.isRunning = true;
            this.isStarting = false;
            this.resetMetrics();

            // Start detection loop immediately (will run in lightweight mode until ML loads)
            this.runDetectionLoop();

            // Initialize ML model in background if not lightweight mode
            if (!this.lightweightMode && !this.isInitialized) {
                this.initialize().then(() => {
                    console.log('[FocusAttention] ML model ready, full tracking enabled');
                }).catch(err => {
                    console.warn('[FocusAttention] ML failed to load, running in lightweight mode:', err.message);
                    this.lightweightMode = true;
                });
            }

            console.log('[FocusAttention] Tracking started' + (this.lightweightMode ? ' (lightweight mode)' : ''));
            return true;
        } catch (error) {
            console.error('[FocusAttention] Failed to start webcam:', error);
            this.isStarting = false;
            // Clean up on error
            if (this.currentStream) {
                this.currentStream.getTracks().forEach(track => track.stop());
                this.currentStream = null;
            }
            return false;
        }
    }

    /**
     * Stop tracking and release resources
     */
    stopTracking() {
        this.isRunning = false;
        this.isStarting = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Stop the current stream
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }

        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject = null;
        }

        console.log('[FocusAttention] Tracking stopped');
        return this.getAggregatedMetrics();
    }

    /**
     * Main detection loop
     */
    async runDetectionLoop() {
        if (!this.isRunning) return;

        try {
            // Ensure video is ready and has data
            if (this.videoElement.readyState === 4) {
                // Only run ML detection if model is loaded
                if (this.model && !this.lightweightMode) {
                    const faces = await this.model.estimateFaces(this.videoElement);

                    if (faces.length === 0) {
                        // No face detected
                        this.handleNoFace();
                    } else {
                        const face = faces[0];
                        this.processFaceData(face);
                    }
                } else {
                    // Lightweight mode - just report basic metrics
                    // Assume user is present and focused when webcam is on
                    if (this.metrics.gazeScore < 100) {
                        this.metrics.gazeScore = Math.min(100, this.metrics.gazeScore + 2);
                    }
                }

                // Emit metrics update
                if (this.onMetricsUpdate) {
                    this.onMetricsUpdate(this.getCurrentMetrics());
                }
            }
        } catch (error) {
            console.error('[FocusAttention] Detection error:', error);
        }

        // Continue loop
        if (this.isRunning) {
            // Use setTimeout to control frame rate
            setTimeout(() => {
                this.animationFrameId = requestAnimationFrame(() => this.runDetectionLoop());
            }, this.config.sampleInterval);
        }
    }

    /**
     * Process face landmark data
     */
    processFaceData(face) {
        const keypoints = face.keypoints;

        // Get eye landmarks
        const leftEye = this.getEyeLandmarks(keypoints, 'left');
        const rightEye = this.getEyeLandmarks(keypoints, 'right');

        // Calculate Eye Aspect Ratio (EAR) for blink detection
        const leftEAR = this.calculateEyeAspectRatio(leftEye);
        const rightEAR = this.calculateEyeAspectRatio(rightEye);
        const avgEAR = (leftEAR + rightEAR) / 2;

        // Detect blink
        this.detectBlink(avgEAR);

        // Calculate gaze direction
        this.calculateGazeDirection(keypoints);

        // Check for drowsiness
        this.checkDrowsiness();
    }

    /**
     * Get eye landmark points
     */
    getEyeLandmarks(keypoints, side) {
        // MediaPipe face mesh eye landmark indices
        const leftEyeIndices = [33, 160, 158, 133, 153, 144];
        const rightEyeIndices = [362, 385, 387, 263, 373, 380];

        const indices = side === 'left' ? leftEyeIndices : rightEyeIndices;
        return indices.map(i => keypoints[i]).filter(p => p);
    }

    /**
     * Calculate Eye Aspect Ratio (EAR)
     * Low EAR = eyes closed (blink)
     */
    calculateEyeAspectRatio(eyePoints) {
        if (eyePoints.length < 6) return 1;

        // Vertical distances
        const v1 = this.distance(eyePoints[1], eyePoints[5]);
        const v2 = this.distance(eyePoints[2], eyePoints[4]);

        // Horizontal distance
        const h = this.distance(eyePoints[0], eyePoints[3]);

        if (h === 0) return 1;
        return (v1 + v2) / (2 * h);
    }

    /**
     * Detect blinks
     */
    detectBlink(ear) {
        this.metrics.eyeAspectRatioHistory.push(ear);
        if (this.metrics.eyeAspectRatioHistory.length > this.config.historySize) {
            this.metrics.eyeAspectRatioHistory.shift();
        }

        // Simple blink detection: EAR drops below threshold
        // We need previous frame to be OPEN (> threshold) and current frame CLOSED (< threshold)
        const prevEAR = this.metrics.eyeAspectRatioHistory[this.metrics.eyeAspectRatioHistory.length - 2] || ear;

        if (prevEAR > this.config.blinkThreshold && ear < this.config.blinkThreshold) {
            this.metrics.blinkCount++;
            this.metrics.lastBlinkTime = Date.now();
        }
    }

    /**
     * Calculate gaze direction with GRADUATED scoring
     * Provides smooth 0-100% attention scores based on multiple factors
     */
    calculateGazeDirection(keypoints) {
        // Use nose tip and face center to estimate gaze
        const noseTip = keypoints[1];  // Nose tip
        const leftCheek = keypoints[234];
        const rightCheek = keypoints[454];
        const forehead = keypoints[10]; // Forehead center
        const chin = keypoints[152]; // Chin

        if (!noseTip || !leftCheek || !rightCheek) {
            // Can't calculate - apply gradual decay
            this.applyScoreDecay(5);
            return;
        }

        // Calculate face center
        const faceCenter = {
            x: (leftCheek.x + rightCheek.x) / 2,
            y: (leftCheek.y + rightCheek.y) / 2
        };

        // Calculate face dimensions
        const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
        const faceHeight = forehead && chin ? Math.abs(chin.y - forehead.y) : faceWidth * 1.3;

        // Calculate horizontal offset (left/right looking)
        const horizontalOffset = faceWidth > 0 ? (noseTip.x - faceCenter.x) / faceWidth : 0;

        // Calculate vertical offset (up/down looking)
        const verticalOffset = faceHeight > 0 && forehead && chin
            ? (noseTip.y - faceCenter.y) / faceHeight
            : 0;

        // Store in history for smoothing
        this.metrics.gazeHistory.push({ h: horizontalOffset, v: verticalOffset });
        if (this.metrics.gazeHistory.length > this.config.historySize) {
            this.metrics.gazeHistory.shift();
        }

        // Calculate smoothed gaze (exponential moving average)
        const smoothingFactor = 0.3; // Lower = smoother
        let smoothH = 0, smoothV = 0;
        this.metrics.gazeHistory.forEach((g, i) => {
            const weight = Math.pow(smoothingFactor, this.metrics.gazeHistory.length - 1 - i);
            smoothH += (g.h || 0) * weight;
            smoothV += (g.v || 0) * weight;
        });
        const totalWeight = (1 - Math.pow(smoothingFactor, this.metrics.gazeHistory.length)) / (1 - smoothingFactor);
        smoothH /= totalWeight;
        smoothV /= totalWeight;

        // Calculate combined deviation (Euclidean distance from center)
        const deviation = Math.sqrt(smoothH * smoothH + smoothV * smoothV);

        // GRADUATED SCORING ALGORITHM
        // Score decreases smoothly based on deviation
        let targetScore = 100;

        if (deviation < 0.1) {
            // Looking straight - full attention (95-100%)
            targetScore = 95 + (1 - deviation / 0.1) * 5;
        } else if (deviation < 0.2) {
            // Slight deviation - still good (80-95%)
            targetScore = 80 + (1 - (deviation - 0.1) / 0.1) * 15;
        } else if (deviation < 0.35) {
            // Moderate deviation - attention dropping (50-80%)
            targetScore = 50 + (1 - (deviation - 0.2) / 0.15) * 30;
        } else if (deviation < 0.5) {
            // Significant deviation - distracted (20-50%)
            targetScore = 20 + (1 - (deviation - 0.35) / 0.15) * 30;
        } else {
            // Looking away - low attention (0-20%)
            targetScore = Math.max(0, 20 - (deviation - 0.5) * 40);
        }

        // Apply smooth transition to current score (prevents jumpy values)
        const transitionSpeed = 0.15; // How fast score changes
        this.metrics.gazeScore = this.metrics.gazeScore +
            (targetScore - this.metrics.gazeScore) * transitionSpeed;

        // Round for display
        this.metrics.gazeScore = Math.round(Math.min(100, Math.max(0, this.metrics.gazeScore)));

        if (this.metrics.gazeScoreHistory) {
            this.metrics.gazeScoreHistory.push(this.metrics.gazeScore);
        }

        // Detect significant distraction (throttled)
        if (deviation > this.config.gazeAwayThreshold && this.metrics.gazeScore < 40) {
            this.metrics.lookAwayCount++;
            this.emitDistraction({
                type: 'gaze_away',
                severity: deviation,
                score: this.metrics.gazeScore,
                timestamp: Date.now()
            });
        } else if (this.metrics.gazeScore < 50 && this.metrics.gazeScore > 20) {
            // Emit low_focus warning for moderate drops
            this.emitDistraction({
                type: 'low_focus',
                severity: deviation,
                score: this.metrics.gazeScore,
                timestamp: Date.now()
            });
        }

        // Reset consecutive no-face counter since we detected a face
        this.consecutiveNoFace = 0;
    }

    /**
     * Apply gradual score decay (used when face partially visible)
     */
    applyScoreDecay(amount) {
        this.metrics.gazeScore = Math.max(0, this.metrics.gazeScore - amount);
        if (this.metrics.gazeScoreHistory) {
            this.metrics.gazeScoreHistory.push(this.metrics.gazeScore);
        }
    }

    /**
     * Emit a distraction event with throttling
     */
    emitDistraction(event) {
        if (!this.onDistraction) return;

        const now = Date.now();
        const lastTime = this.lastDistractionTime[event.type] || 0;

        // Only emit if enough time has passed since last event of this type
        if (now - lastTime >= this.config.distractionCooldown) {
            this.lastDistractionTime[event.type] = now;
            this.onDistraction(event);
        }
    }

    /**
     * Handle no face detected - GRADUAL decay instead of instant 0
     */
    handleNoFace() {
        // Track consecutive no-face frames
        this.consecutiveNoFace = (this.consecutiveNoFace || 0) + 1;

        // Gradual decay based on how long face has been missing
        let decayRate;
        if (this.consecutiveNoFace < 5) {
            // Brief absence - slow decay (might just be adjusting)
            decayRate = 3;
        } else if (this.consecutiveNoFace < 15) {
            // Moderate absence - faster decay
            decayRate = 7;
        } else if (this.consecutiveNoFace < 30) {
            // Extended absence - rapid decay
            decayRate = 12;
        } else {
            // Very long absence - near zero
            decayRate = 20;
        }

        // Apply gradual decay
        this.metrics.gazeScore = Math.max(0, this.metrics.gazeScore - decayRate);

        if (this.metrics.gazeScoreHistory) {
            this.metrics.gazeScoreHistory.push(this.metrics.gazeScore);
        }

        // Only emit distraction after sustained absence (prevents false positives)
        if (this.consecutiveNoFace === 10) {
            this.metrics.lookAwayCount++;
            this.emitDistraction({
                type: 'no_face',
                timestamp: Date.now()
            });
        }
    }

    /**
     * Check for drowsiness based on blink patterns
     */
    checkDrowsiness() {
        const now = Date.now();
        const timeSinceLastBlink = now - this.metrics.lastBlinkTime;

        // If eyes have been closed for too long, might be drowsy
        if (timeSinceLastBlink > 3000) {
            this.metrics.drowsinessEvents++;
            if (this.onDrowsiness) {
                this.onDrowsiness({
                    type: 'prolonged_eye_closure',
                    duration: timeSinceLastBlink,
                    timestamp: now
                });
            }
        }
    }

    /**
     * Euclidean distance between two points
     */
    distance(p1, p2) {
        if (!p1 || !p2) return 0;
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            gazeScore: 100,
            blinkCount: 0,
            lookAwayCount: 0,
            drowsinessEvents: 0,
            lastBlinkTime: Date.now(),
            eyeAspectRatioHistory: [],
            gazeHistory: [],
            gazeScoreHistory: []
        };
        // Reset distraction throttling
        this.lastDistractionTime = {};
        // Reset consecutive no-face counter
        this.consecutiveNoFace = 0;
    }

    /**
     * Get current metrics (real-time)
     */
    getCurrentMetrics() {
        return {
            gazeScore: Math.round(this.metrics.gazeScore),
            blinkCount: this.metrics.blinkCount,
            lookAwayCount: this.metrics.lookAwayCount,
            drowsinessEvents: this.metrics.drowsinessEvents,
            isTracking: this.isRunning
        };
    }

    /**
     * Get aggregated metrics (for session end)
     */
    getAggregatedMetrics() {
        // Calculate average gaze score from history
        const avgGazeScore = this.metrics.gazeScoreHistory && this.metrics.gazeScoreHistory.length > 0
            ? Math.round(this.metrics.gazeScoreHistory.reduce((a, b) => a + b, 0) / this.metrics.gazeScoreHistory.length)
            : 0;

        return {
            avgGazeScore,
            blinkRatePerMin: this.metrics.blinkCount,
            lookAwayCount: this.metrics.lookAwayCount,
            drowsinessEvents: this.metrics.drowsinessEvents
        };
    }

    /**
     * Set configuration
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Set callbacks
     */
    setCallbacks({ onMetricsUpdate, onDistraction, onDrowsiness }) {
        if (onMetricsUpdate) this.onMetricsUpdate = onMetricsUpdate;
        if (onDistraction) this.onDistraction = onDistraction;
        if (onDrowsiness) this.onDrowsiness = onDrowsiness;
    }
}

// Singleton instance
const focusAttentionService = new FocusAttentionService();

export default focusAttentionService;
export { FocusAttentionService };
