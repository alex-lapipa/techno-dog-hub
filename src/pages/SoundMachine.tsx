import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Square, Volume2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { useSoundEngine } from "@/hooks/useSoundEngine";

type TrackName = "KICK" | "SNARE" | "CLAP" | "CH" | "OH" | "PERC" | "TOM" | "ACID";

interface Track {
  name: TrackName;
  steps: boolean[];
  color: string;
}

interface TrackParams {
  decay: number;
  tone: number;
  level: number;
}

const PRESETS = {
  BERLIN: {
    KICK: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    SNARE: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    CLAP: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
    CH: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    OH: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    PERC: [false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false],
    TOM: [false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false],
    ACID: [true, false, true, false, false, true, false, true, true, false, true, false, false, true, false, true],
  },
  DETROIT: {
    KICK: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
    SNARE: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    CLAP: [false, false, false, false, true, false, false, true, false, false, false, false, true, false, false, false],
    CH: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    OH: [false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true],
    PERC: [false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false],
    TOM: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false],
    ACID: [true, false, false, true, false, true, false, false, true, false, false, true, false, true, false, false],
  },
  WAREHOUSE: {
    KICK: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, true, false],
    SNARE: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    CLAP: [false, false, false, false, true, false, true, false, false, false, false, false, true, false, true, false],
    CH: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    OH: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true],
    PERC: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    TOM: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    ACID: [true, true, false, true, false, false, true, false, true, true, false, true, false, false, true, false],
  },
  HYPNOTIC: {
    KICK: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    SNARE: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    CLAP: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    CH: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    OH: [false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false],
    PERC: [false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true],
    TOM: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    ACID: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  },
  INDUSTRIAL: {
    KICK: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    SNARE: [false, false, false, false, true, false, false, true, false, false, false, false, true, false, false, true],
    CLAP: [false, true, false, false, true, false, false, false, false, true, false, false, true, false, false, false],
    CH: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    OH: [false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true],
    PERC: [true, false, true, false, false, true, false, true, true, false, true, false, false, true, false, true],
    TOM: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
    ACID: [true, true, false, true, true, false, true, false, true, true, false, true, true, false, true, false],
  },
};

const AI_TAGS = ["dark", "berlin", "techno", "detroit soul", "warehouse", "minimal", "hypnotic loop", "industrial", "hard"];

const DEFAULT_TRACK_PARAMS: Record<TrackName, TrackParams> = {
  KICK: { decay: 50, tone: 50, level: 80 },
  SNARE: { decay: 40, tone: 60, level: 75 },
  CLAP: { decay: 35, tone: 50, level: 70 },
  CH: { decay: 20, tone: 70, level: 60 },
  OH: { decay: 60, tone: 70, level: 55 },
  PERC: { decay: 30, tone: 80, level: 65 },
  TOM: { decay: 55, tone: 40, level: 70 },
  ACID: { decay: 70, tone: 50, level: 75 },
};

const SoundMachine = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(130);
  const [currentStep, setCurrentStep] = useState(0);
  const [drive, setDrive] = useState(20);
  const [cutoff, setCutoff] = useState(80);
  const [reso, setReso] = useState(30);
  const [swing, setSwing] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(["dark", "techno"]);
  const [selectedTrack, setSelectedTrack] = useState<TrackName>("KICK");
  const [trackParams, setTrackParams] = useState<Record<TrackName, TrackParams>>(DEFAULT_TRACK_PARAMS);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const tracksRef = useRef<Track[]>([]);
  
  const { initAudio, playSound, updateMasterEffects } = useSoundEngine();

  const [tracks, setTracks] = useState<Track[]>([
    { name: "KICK", steps: Array(16).fill(false), color: "hsl(var(--crimson))" },
    { name: "SNARE", steps: Array(16).fill(false), color: "hsl(var(--logo-green))" },
    { name: "CLAP", steps: Array(16).fill(false), color: "hsl(280 100% 60%)" },
    { name: "CH", steps: Array(16).fill(false), color: "hsl(200 100% 60%)" },
    { name: "OH", steps: Array(16).fill(false), color: "hsl(40 100% 60%)" },
    { name: "PERC", steps: Array(16).fill(false), color: "hsl(320 100% 60%)" },
    { name: "TOM", steps: Array(16).fill(false), color: "hsl(160 100% 50%)" },
    { name: "ACID", steps: Array(16).fill(false), color: "hsl(60 100% 50%)" },
  ]);

  // Keep tracksRef in sync
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  // Update master effects when sliders change
  useEffect(() => {
    if (audioInitialized) {
      updateMasterEffects(drive, cutoff, reso);
    }
  }, [drive, cutoff, reso, audioInitialized, updateMasterEffects]);

  const toggleStep = useCallback((trackIndex: number, stepIndex: number) => {
    setTracks(prev => prev.map((track, i) => 
      i === trackIndex 
        ? { ...track, steps: track.steps.map((s, j) => j === stepIndex ? !s : s) }
        : track
    ));
  }, []);

  const loadPreset = useCallback((presetName: keyof typeof PRESETS) => {
    const preset = PRESETS[presetName];
    setTracks(prev => prev.map(track => ({
      ...track,
      steps: preset[track.name] || Array(16).fill(false)
    })));
  }, []);

  const clearAll = useCallback(() => {
    setTracks(prev => prev.map(track => ({
      ...track,
      steps: Array(16).fill(false)
    })));
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const generatePattern = useCallback(() => {
    const presetKeys = Object.keys(PRESETS) as (keyof typeof PRESETS)[];
    const randomPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)];
    loadPreset(randomPreset);
  }, [loadPreset]);

  const handlePlay = useCallback(() => {
    if (!audioInitialized) {
      initAudio();
      setAudioInitialized(true);
    }
    setIsPlaying(prev => !prev);
  }, [audioInitialized, initAudio]);

  // Sequencer loop with audio playback
  useEffect(() => {
    if (isPlaying) {
      const stepDuration = (60 / bpm / 4) * 1000;
      
      const tick = () => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % 16;
          
          // Play sounds for active steps
          tracksRef.current.forEach(track => {
            if (track.steps[nextStep]) {
              playSound(track.name, trackParams[track.name]);
            }
          });
          
          return nextStep;
        });
      };
      
      // Play sounds for initial step
      tracksRef.current.forEach(track => {
        if (track.steps[currentStep]) {
          playSound(track.name, trackParams[track.name]);
        }
      });
      
      intervalRef.current = window.setInterval(tick, stepDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, bpm, playSound, trackParams]);

  // Update track params
  const updateTrackParam = useCallback((param: keyof TrackParams, value: number) => {
    setTrackParams(prev => ({
      ...prev,
      [selectedTrack]: {
        ...prev[selectedTrack],
        [param]: value
      }
    }));
  }, [selectedTrack]);

  // Preview sound on track select
  const handleTrackSelect = useCallback((trackName: TrackName) => {
    setSelectedTrack(trackName);
    if (audioInitialized) {
      playSound(trackName, trackParams[trackName]);
    }
  }, [audioInitialized, playSound, trackParams]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO 
        title="T:DOG Sound Machine | AI-Powered Rhythm Machine"
        description="Next-gen AI-powered rhythm machine inspired by classic hardware. Create dark, warehouse techno patterns with the T:DOG Sound Machine."
        path="/sound-machine"
      />
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter mb-2">
              T<span className="text-logo-green">:</span>DOG
            </h1>
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              AI-Powered Rhythm Machine
            </p>
            <p className="text-muted-foreground/60 font-mono text-[10px] tracking-wider mt-1">
              NEXT-GEN • API-READY • v2.0
            </p>
          </div>

          {/* AI Generate Section */}
          <div className="border border-border bg-card/50 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-logo-green" />
              <span className="font-mono text-xs uppercase tracking-widest text-logo-green">AI Generate</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {AI_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider border transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-logo-green/20 border-logo-green text-logo-green"
                      : "bg-background border-border text-muted-foreground hover:border-logo-green/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <Button 
              onClick={generatePattern}
              className="w-full bg-logo-green/10 border border-logo-green text-logo-green hover:bg-logo-green/20 font-mono text-xs uppercase tracking-widest"
            >
              Generate
            </Button>
          </div>

          {/* Transport & Master Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Transport */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePlay}
                className={`w-20 h-10 font-mono text-xs uppercase ${
                  isPlaying 
                    ? "bg-crimson/20 border border-crimson text-crimson hover:bg-crimson/30" 
                    : "bg-logo-green/20 border border-logo-green text-logo-green hover:bg-logo-green/30"
                }`}
              >
                {isPlaying ? <Square className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isPlaying ? "Stop" : "Play"}
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="h-10 font-mono text-xs uppercase tracking-widest"
              >
                Clear
              </Button>
            </div>

            {/* BPM */}
            <div className="flex items-center gap-3 border border-border bg-card/50 px-4 py-2">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">BPM</span>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(Math.max(60, Math.min(200, parseInt(e.target.value) || 130)))}
                className="w-16 bg-transparent border border-border px-2 py-1 font-mono text-sm text-center"
              />
            </div>

            {/* Master Controls */}
            <div className="flex-1 flex items-center gap-4 border border-border bg-card/50 px-4 py-2">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Master</span>
              <div className="flex-1 grid grid-cols-4 gap-4">
                {[
                  { label: "Drive", value: drive, setter: setDrive },
                  { label: "Cutoff", value: cutoff, setter: setCutoff },
                  { label: "Reso", value: reso, setter: setReso },
                  { label: "Swing", value: swing, setter: setSwing },
                ].map(({ label, value, setter }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="font-mono text-[9px] uppercase text-muted-foreground/60">{label}</span>
                    <Slider
                      value={[value]}
                      onValueChange={([v]) => setter(v)}
                      max={100}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2 mb-6">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Presets:</span>
            {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map(preset => (
              <button
                key={preset}
                onClick={() => loadPreset(preset)}
                className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider border border-border bg-background hover:border-logo-green hover:text-logo-green transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Step Numbers */}
          <div className="flex mb-2">
            <div className="w-16 shrink-0" />
            <div className="flex-1 grid grid-cols-16 gap-1">
              {Array.from({ length: 16 }, (_, i) => (
                <div 
                  key={i} 
                  className={`text-center font-mono text-[10px] ${
                    currentStep === i && isPlaying ? "text-logo-green" : "text-muted-foreground/60"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Sequencer Grid */}
          <div className="border border-border bg-card/30 p-4 mb-6">
            {tracks.map((track, trackIndex) => (
              <div key={track.name} className="flex items-center mb-2 last:mb-0">
                <button
                  onClick={() => handleTrackSelect(track.name)}
                  className={`w-16 shrink-0 font-mono text-[10px] uppercase tracking-wider py-2 text-left transition-colors ${
                    selectedTrack === track.name ? "text-logo-green" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {track.name}
                </button>
                <div className="flex-1 grid grid-cols-16 gap-1">
                  {track.steps.map((active, stepIndex) => (
                    <button
                      key={stepIndex}
                      onClick={() => toggleStep(trackIndex, stepIndex)}
                      className={`aspect-square border transition-all ${
                        active 
                          ? "border-transparent" 
                          : "border-border hover:border-muted-foreground"
                      } ${
                        currentStep === stepIndex && isPlaying
                          ? "ring-1 ring-logo-green"
                          : ""
                      } ${
                        stepIndex % 4 === 0 ? "border-l-2 border-l-border" : ""
                      }`}
                      style={{
                        backgroundColor: active ? track.color : "transparent",
                        opacity: active ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Track Parameters */}
          <div className="border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-xs uppercase tracking-widest">{selectedTrack} Parameters</span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Decay", param: "decay" as const },
                { label: "Tone", param: "tone" as const },
                { label: "Level", param: "level" as const },
              ].map(({ label, param }) => (
                <div key={label} className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">{label}</span>
                    <span className="font-mono text-[10px] text-logo-green">{trackParams[selectedTrack][param]}</span>
                  </div>
                  <Slider
                    value={[trackParams[selectedTrack][param]]}
                    onValueChange={([v]) => updateTrackParam(param, v)}
                    max={100}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="font-mono text-[10px] text-muted-foreground/60 tracking-wider">
              Web Audio API synthesis • Click a track name to preview its sound
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SoundMachine;
