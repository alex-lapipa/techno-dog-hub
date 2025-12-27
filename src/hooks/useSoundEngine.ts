import { useRef, useCallback, useEffect } from 'react';

interface SoundParams {
  decay: number;
  tone: number;
  level: number;
}

export const useSoundEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const distortionRef = useRef<WaveShaperNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      
      // Master chain: distortion -> filter -> gain -> output
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.7;
      
      distortionRef.current = audioContextRef.current.createWaveShaper();
      distortionRef.current.curve = makeDistortionCurve(0);
      
      filterRef.current = audioContextRef.current.createBiquadFilter();
      filterRef.current.type = 'lowpass';
      filterRef.current.frequency.value = 8000;
      filterRef.current.Q.value = 1;
      
      distortionRef.current.connect(filterRef.current);
      filterRef.current.connect(masterGainRef.current);
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  // Distortion curve generator
  const makeDistortionCurve = (amount: number) => {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    const k = amount * 4;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  // Update master effects
  const updateMasterEffects = useCallback((drive: number, cutoff: number, reso: number) => {
    if (distortionRef.current) {
      distortionRef.current.curve = makeDistortionCurve(drive / 100);
    }
    if (filterRef.current) {
      // Map cutoff 0-100 to 200-12000 Hz (exponential)
      filterRef.current.frequency.value = 200 * Math.pow(60, cutoff / 100);
      filterRef.current.Q.value = 1 + (reso / 100) * 20;
    }
  }, []);

  // KICK DRUM - Low frequency oscillator with pitch envelope
  const playKick = useCallback((params: SoundParams) => {
    const ctx = initAudio();
    if (!ctx || !distortionRef.current) return;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    // Pitch envelope: start high, drop to low
    const startFreq = 150 + (params.tone / 100) * 100;
    const endFreq = 40 + (params.tone / 100) * 20;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);
    
    // Amplitude envelope
    const decayTime = 0.1 + (params.decay / 100) * 0.4;
    gain.gain.setValueAtTime((params.level / 100) * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
    
    osc.connect(gain);
    gain.connect(distortionRef.current);
    
    osc.start(now);
    osc.stop(now + decayTime + 0.01);
  }, [initAudio]);

  // SNARE - Noise + oscillator mix
  const playSnare = useCallback((params: SoundParams) => {
    const ctx = initAudio();
    if (!ctx || !distortionRef.current) return;
    
    const now = ctx.currentTime;
    
    // Noise component
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000 + (params.tone / 100) * 3000;
    
    const noiseGain = ctx.createGain();
    const decayTime = 0.1 + (params.decay / 100) * 0.2;
    noiseGain.gain.setValueAtTime((params.level / 100) * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(distortionRef.current);
    
    // Tonal component
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 180 + (params.tone / 100) * 50;
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime((params.level / 100) * 0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(oscGain);
    oscGain.connect(distortionRef.current);
    
    noise.start(now);
    osc.start(now);
    osc.stop(now + decayTime + 0.01);
  }, [initAudio]);

  // CLAP - Layered noise bursts
  const playClap = useCallback((params: SoundParams) => {
    const ctx = initAudio();
    if (!ctx || !distortionRef.current) return;
    
    const now = ctx.currentTime;
    
    // Create multiple short noise bursts
    for (let i = 0; i < 3; i++) {
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let j = 0; j < noiseData.length; j++) {
        noiseData[j] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200 + (params.tone / 100) * 800;
      filter.Q.value = 2;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime((params.level / 100) * 0.3, now + i * 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.01 + 0.03);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(distortionRef.current);
      
      noise.start(now + i * 0.01);
    }
    
    // Main tail
    const decayTime = 0.1 + (params.decay / 100) * 0.15;
    const tailBuffer = ctx.createBuffer(1, ctx.sampleRate * decayTime, ctx.sampleRate);
    const tailData = tailBuffer.getChannelData(0);
    for (let i = 0; i < tailData.length; i++) {
      tailData[i] = Math.random() * 2 - 1;
    }
    
    const tail = ctx.createBufferSource();
    tail.buffer = tailBuffer;
    
    const tailFilter = ctx.createBiquadFilter();
    tailFilter.type = 'bandpass';
    tailFilter.frequency.value = 1500;
    tailFilter.Q.value = 1;
    
    const tailGain = ctx.createGain();
    tailGain.gain.setValueAtTime((params.level / 100) * 0.25, now + 0.03);
    tailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03 + decayTime);
    
    tail.connect(tailFilter);
    tailFilter.connect(tailGain);
    tailGain.connect(distortionRef.current);
    
    tail.start(now + 0.03);
  }, [initAudio]);

  // CLOSED HI-HAT
  const playCH = useCallback((params: SoundParams) => {
    const ctx = initAudio();
    if (!ctx || !distortionRef.current) return;
    
    const now = ctx.currentTime;
    
    // Metallic oscillators
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    const fundamental = 40 + (params.tone / 100) * 20;
    
    ratios.forEach(ratio => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = fundamental * ratio;
      
      const gain = ctx.createGain();
      const decayTime = 0.02 + (params.decay / 100) * 0.05;
      gain.gain.setValueAtTime((params.level / 100) * 0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7000;
      
      osc.connect(gain);
      gain.connect(filter);
      filter.connect(distortionRef.current!);
      
      osc.start(now);
      osc.stop(now + decayTime + 0.01);
    });
  }, [initAudio]);

  // OPEN HI-HAT
  const playOH = useCallback((params: SoundParams) => {
    const ctx = initAudio();
    if (!ctx || !distortionRef.current) return;
    
    const now = ctx.currentTime;
    
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    const fundamental = 40 + (params.tone / 100) * 20;
    
    ratios.forEach(ratio => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = fundamental * ratio;
      
      const gain = ctx.createGain();
      const decayTime = 0.15 + (params.decay / 100) * 0.35;
      gain.gain.setValueAtTime((params.level / 100) * 0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 6000;
      
      osc.connect(gain);
      gain.connect(filter);
      filter.connect(distortionRef.current!);
      
      osc.start(now);
      osc.stop(now + decayTime + 0.01);
    });
  }, [initAudio]);

  // PERCUSSION - Metallic click
  const playPerc = useCallback((params: SoundParams) => {
    const ctx = initAudio();
    if (!ctx || !distortionRef.current) return;
    
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 800 + (params.tone / 100) * 400;
    
    const gain = ctx.createGain();
    const decayTime = 0.03 + (params.decay / 100) * 0.1;
    gain.gain.setValueAtTime((params.level / 100) * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
    
    osc.connect(gain);
    gain.connect(distortionRef.current);
    
    osc.start(now);
    osc.stop(now + decayTime + 0.01);
  }, [initAudio]);

  // TOM - Low pitched drum
  const playTom = useCallback((params: SoundParams) => {
    const ctx = initAudio();
    if (!ctx || !distortionRef.current) return;
    
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    
    const startFreq = 200 + (params.tone / 100) * 100;
    const endFreq = 80 + (params.tone / 100) * 40;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.1);
    
    const gain = ctx.createGain();
    const decayTime = 0.15 + (params.decay / 100) * 0.3;
    gain.gain.setValueAtTime((params.level / 100) * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
    
    osc.connect(gain);
    gain.connect(distortionRef.current);
    
    osc.start(now);
    osc.stop(now + decayTime + 0.01);
  }, [initAudio]);

  // ACID - TB-303 style bass with filter envelope
  const playAcid = useCallback((params: SoundParams) => {
    const ctx = initAudio();
    if (!ctx || !distortionRef.current) return;
    
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 55 + (params.tone / 100) * 55; // A1 to A2 range
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 15 + (params.decay / 100) * 10; // Resonance
    
    // Filter envelope (the 303 squelch)
    const filterStart = 800 + (params.tone / 100) * 2000;
    const filterEnd = 100 + (params.tone / 100) * 100;
    filter.frequency.setValueAtTime(filterStart, now);
    filter.frequency.exponentialRampToValueAtTime(filterEnd, now + 0.1 + (params.decay / 100) * 0.2);
    
    const gain = ctx.createGain();
    const decayTime = 0.15 + (params.decay / 100) * 0.25;
    gain.gain.setValueAtTime((params.level / 100) * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(distortionRef.current);
    
    osc.start(now);
    osc.stop(now + decayTime + 0.01);
  }, [initAudio]);

  // Play sound by track name
  const playSound = useCallback((trackName: string, params: SoundParams) => {
    switch (trackName) {
      case 'KICK': playKick(params); break;
      case 'SNARE': playSnare(params); break;
      case 'CLAP': playClap(params); break;
      case 'CH': playCH(params); break;
      case 'OH': playOH(params); break;
      case 'PERC': playPerc(params); break;
      case 'TOM': playTom(params); break;
      case 'ACID': playAcid(params); break;
    }
  }, [playKick, playSnare, playClap, playCH, playOH, playPerc, playTom, playAcid]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    initAudio,
    playSound,
    updateMasterEffects,
  };
};
