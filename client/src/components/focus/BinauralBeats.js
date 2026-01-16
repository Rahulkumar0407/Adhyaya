/**
 * Binaural Beats Generator - Enhanced Version
 * Uses Web Audio API to generate scientifically-backed binaural frequencies
 * 
 * Based on popular research and YouTube focus music:
 * - 40Hz Gamma: Peak focus, problem solving, heightened attention
 * - 14Hz Beta: Active concentration, cognition
 * - 10Hz Alpha: Relaxed focus, creativity
 */
class BinauralBeats {
    constructor() {
        this.ctx = null;
        this.leftOsc = null;
        this.rightOsc = null;
        this.leftGain = null;
        this.rightGain = null;
        this.masterGain = null;
        this.noiseNode = null;
        this.isPlaying = false;

        // Default: 40Hz Gamma (most popular for focus)
        this.baseFreq = 200;
        this.beatFreq = 40;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    }

    play(beatType = 'gamma') {
        this.init();
        if (this.isPlaying) this.stop();

        this.setBeatType(beatType);

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Create oscillators
        this.leftOsc = this.ctx.createOscillator();
        this.rightOsc = this.ctx.createOscillator();

        this.leftOsc.type = 'sine';
        this.rightOsc.type = 'sine';

        // Binaural effect: slightly different frequencies for each ear
        this.leftOsc.frequency.value = this.baseFreq - (this.beatFreq / 2);
        this.rightOsc.frequency.value = this.baseFreq + (this.beatFreq / 2);

        // Create Stereo Panners
        const leftPanner = this.ctx.createStereoPanner();
        const rightPanner = this.ctx.createStereoPanner();
        leftPanner.pan.value = -1;
        rightPanner.pan.value = 1;

        // Create Gain Nodes
        this.leftGain = this.ctx.createGain();
        this.rightGain = this.ctx.createGain();
        this.masterGain = this.ctx.createGain();

        this.leftGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.rightGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.gain.value = 0.3;

        // Add subtle pink noise for ambience (like popular YouTube tracks)
        this.addPinkNoise();

        // Connect graph
        this.leftOsc.connect(this.leftGain);
        this.leftGain.connect(leftPanner);
        leftPanner.connect(this.masterGain);

        this.rightOsc.connect(this.rightGain);
        this.rightGain.connect(rightPanner);
        rightPanner.connect(this.masterGain);

        this.masterGain.connect(this.ctx.destination);

        // Start Oscillators
        this.leftOsc.start();
        this.rightOsc.start();

        // Smooth fade in (3 seconds like pro tracks)
        this.leftGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 3);
        this.rightGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 3);

        this.isPlaying = true;
    }

    addPinkNoise() {
        // Create pink noise for ambient background
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
            b6 = white * 0.115926;
        }

        this.noiseNode = this.ctx.createBufferSource();
        this.noiseNode.buffer = noiseBuffer;
        this.noiseNode.loop = true;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 0.08; // Very subtle

        this.noiseNode.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        this.noiseNode.start();
    }

    stop() {
        if (!this.isPlaying) return;

        const now = this.ctx.currentTime;

        // Fade out smoothly
        if (this.leftGain) {
            this.leftGain.gain.setValueAtTime(this.leftGain.gain.value, now);
            this.leftGain.gain.linearRampToValueAtTime(0, now + 1.5);
        }
        if (this.rightGain) {
            this.rightGain.gain.setValueAtTime(this.rightGain.gain.value, now);
            this.rightGain.gain.linearRampToValueAtTime(0, now + 1.5);
        }

        setTimeout(() => {
            try {
                if (this.leftOsc) {
                    this.leftOsc.stop();
                    this.leftOsc.disconnect();
                }
                if (this.rightOsc) {
                    this.rightOsc.stop();
                    this.rightOsc.disconnect();
                }
                if (this.noiseNode) {
                    this.noiseNode.stop();
                    this.noiseNode.disconnect();
                }
            } catch (e) { }
            this.isPlaying = false;
        }, 1500);
    }

    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
        }
    }

    setBeatType(type) {
        switch (type) {
            case 'gamma': // 40Hz - Peak focus (Most popular on YouTube)
                this.baseFreq = 200;
                this.beatFreq = 40;
                break;
            case 'beta': // 20Hz - Active concentration
                this.baseFreq = 200;
                this.beatFreq = 20;
                break;
            case 'alpha': // 10Hz - Relaxed focus
                this.baseFreq = 200;
                this.beatFreq = 10;
                break;
            case 'theta': // 6Hz - Creativity, deep relaxation
                this.baseFreq = 150;
                this.beatFreq = 6;
                break;
            default:
                this.baseFreq = 200;
                this.beatFreq = 40;
        }

        if (this.isPlaying && this.leftOsc && this.rightOsc) {
            this.leftOsc.frequency.setTargetAtTime(this.baseFreq - (this.beatFreq / 2), this.ctx.currentTime, 0.5);
            this.rightOsc.frequency.setTargetAtTime(this.baseFreq + (this.beatFreq / 2), this.ctx.currentTime, 0.5);
        }
    }
}

const binauralBeats = new BinauralBeats();
export default binauralBeats;
