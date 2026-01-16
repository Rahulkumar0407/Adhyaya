/**
 * Nature Ambient Sound Generator
 * Creates calming nature-inspired audio for focus sessions
 * Uses Web Audio API to synthesize pleasant ambient sounds
 */
class AmbientSoundGenerator {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.nodes = [];
        this.isPlaying = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    }

    play(type = 'rain') {
        this.init();
        if (this.isPlaying) this.stop();

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        switch (type) {
            case 'rain':
                this.createRainSound();
                break;
            case 'forest':
                this.createForestSound();
                break;
            case 'ocean':
                this.createOceanSound();
                break;
            case 'stream':
                this.createStreamSound();
                break;
            default:
                this.createRainSound();
        }

        // Fade in over 3 seconds
        this.masterGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 3);
        this.isPlaying = true;
    }

    // Rain sound - Brown noise filtered to sound like rain
    createRainSound() {
        const bufferSize = 2 * this.ctx.sampleRate;

        // Create brown noise (more pleasant than white noise)
        const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const output = noiseBuffer.getChannelData(channel);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // Volume boost
            }
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        // High-pass filter to simulate rain patter
        const highPass = this.ctx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 400;
        highPass.Q.value = 0.5;

        // Low-pass for smoothness
        const lowPass = this.ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.value = 8000;
        lowPass.Q.value = 0.5;

        // Add subtle modulation for natural variation
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.1; // Very slow modulation
        lfoGain.gain.value = 0.15;

        lfo.connect(lfoGain);
        lfoGain.connect(this.masterGain.gain);
        lfo.start();

        noiseNode.connect(highPass);
        highPass.connect(lowPass);
        lowPass.connect(this.masterGain);
        noiseNode.start();

        this.nodes.push(noiseNode, lfo);
    }

    // Forest sound - Layered with gentle rustling
    createForestSound() {
        const bufferSize = 2 * this.ctx.sampleRate;

        // Wind/rustling layer (pink noise)
        const rustleBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const output = rustleBuffer.getChannelData(channel);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
        }

        const rustleNode = this.ctx.createBufferSource();
        rustleNode.buffer = rustleBuffer;
        rustleNode.loop = true;

        // Bandpass to focus on wind frequencies
        const bandPass = this.ctx.createBiquadFilter();
        bandPass.type = 'bandpass';
        bandPass.frequency.value = 500;
        bandPass.Q.value = 0.3;

        // Gentle LFO for wind gusts
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.05;
        lfoGain.gain.value = 0.2;
        lfo.connect(lfoGain);
        lfoGain.connect(this.masterGain.gain);
        lfo.start();

        rustleNode.connect(bandPass);
        bandPass.connect(this.masterGain);
        rustleNode.start();

        // Add distant bird-like tones (very subtle)
        this.addBirdSounds();

        this.nodes.push(rustleNode, lfo);
    }

    // Subtle bird-like ambient tones
    addBirdSounds() {
        const createBirdTone = (delay) => {
            setTimeout(() => {
                if (!this.isPlaying) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = 1800 + Math.random() * 800;

                gain.gain.setValueAtTime(0, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.6);

                // Schedule next bird sound randomly
                if (this.isPlaying) {
                    createBirdTone(3000 + Math.random() * 8000);
                }
            }, delay);
        };

        createBirdTone(2000);
    }

    // Ocean waves sound
    createOceanSound() {
        const bufferSize = 4 * this.ctx.sampleRate;

        const oceanBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const output = oceanBuffer.getChannelData(channel);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                // Brown noise base
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                // Add wave pattern
                const wavePhase = (i / this.ctx.sampleRate) * 0.1;
                const waveMod = 0.5 + 0.5 * Math.sin(wavePhase * Math.PI * 2);
                output[i] *= waveMod * 3;
            }
        }

        const oceanNode = this.ctx.createBufferSource();
        oceanNode.buffer = oceanBuffer;
        oceanNode.loop = true;

        // Low-pass for deep ocean feel
        const lowPass = this.ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.value = 1500;
        lowPass.Q.value = 0.3;

        // Slow wave modulation
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.08; // Wave rhythm
        lfoGain.gain.value = 0.25;
        lfo.connect(lfoGain);
        lfoGain.connect(this.masterGain.gain);
        lfo.start();

        oceanNode.connect(lowPass);
        lowPass.connect(this.masterGain);
        oceanNode.start();

        this.nodes.push(oceanNode, lfo);
    }

    // Stream/creek sound
    createStreamSound() {
        const bufferSize = 2 * this.ctx.sampleRate;

        const streamBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const output = streamBuffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                // Mix of white noise with bubbling effect
                const white = Math.random() * 2 - 1;
                const bubble = Math.sin(i * 0.1) * Math.random() * 0.3;
                output[i] = (white * 0.5 + bubble) * 0.3;
            }
        }

        const streamNode = this.ctx.createBufferSource();
        streamNode.buffer = streamBuffer;
        streamNode.loop = true;

        // Bandpass for water frequencies
        const bandPass = this.ctx.createBiquadFilter();
        bandPass.type = 'bandpass';
        bandPass.frequency.value = 2000;
        bandPass.Q.value = 0.5;

        // High-pass to remove rumble
        const highPass = this.ctx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 200;

        streamNode.connect(highPass);
        highPass.connect(bandPass);
        bandPass.connect(this.masterGain);
        streamNode.start();

        this.nodes.push(streamNode);
    }

    stop() {
        if (!this.isPlaying) return;

        // Fade out
        if (this.masterGain) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(0, now + 1.5);
        }

        setTimeout(() => {
            this.nodes.forEach(node => {
                try {
                    node.stop();
                    node.disconnect();
                } catch (e) { }
            });
            this.nodes = [];
            this.isPlaying = false;
        }, 1600);
    }

    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(value * 0.5, this.ctx.currentTime, 0.1);
        }
    }
}

const ambientSound = new AmbientSoundGenerator();
export default ambientSound;
