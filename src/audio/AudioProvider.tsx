import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LOCAL_DATA_EVENT, STORAGE_KEYS, readJson, writeRaw } from '../lib/storage';
import {
  AmbientEngine,
  DEFAULT_SETTINGS,
  normalizeSettings,
  type AudioSettings,
  type ChimeKind,
  type EngineSnapshot,
  type SceneId,
} from './engine';

interface AudioApi {
  settings: AudioSettings;
  snapshot: EngineSnapshot;
  /** True once the browser has actually started making sound. */
  playing: boolean;
  /** True when the browser paused us because the tab was hidden. */
  pausedByTab: boolean;
  supported: boolean;
  setEnabled: (enabled: boolean) => void;
  setScene: (scene: SceneId) => void;
  setVolume: (volume: number) => void;
  setChimes: (chimes: boolean) => void;
  chime: (kind: ChimeKind) => void;
  /** Called by the Voice Lab so nothing bleeds into a recording. */
  setRecording: (recording: boolean) => void;
}

const AudioContext = createContext<AudioApi | null>(null);

function readStored(): AudioSettings {
  return normalizeSettings(readJson<unknown>(STORAGE_KEYS.audioSettings) ?? undefined);
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AmbientEngine | null>(null);
  const [settings, setSettings] = useState<AudioSettings>(readStored);
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(() => ({
    state: 'idle',
    contextState: 'none',
    scene: null,
    volume: readStored().volume,
    gain: 0,
    chimes: readStored().chimes,
    meter: 0,
    sampleRate: 0,
    hiddenPause: false,
    chimesPlayed: 0,
  }));

  const engine = useMemo(() => {
    const instance = new AmbientEngine();
    engineRef.current = instance;
    return instance;
  }, []);

  useEffect(() => {
    const sync = () => setSnapshot(engine.snapshot());
    const unsubscribe = engine.subscribe(sync);
    sync();
    return () => {
      unsubscribe();
      engine.close();
    };
  }, [engine]);

  // Development-only handle so a browser test can read the real output level.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as unknown as { __toneLabAudio?: () => EngineSnapshot }).__toneLabAudio = () => engine.snapshot();
    return () => {
      delete (window as unknown as { __toneLabAudio?: () => EngineSnapshot }).__toneLabAudio;
    };
  }, [engine]);

  // Clearing local data turns sound off rather than leaving a stale preference.
  useEffect(() => {
    const sync = () => {
      const next = { ...DEFAULT_SETTINGS };
      setSettings(next);
      engine.stop(0.2);
    };
    window.addEventListener(LOCAL_DATA_EVENT, sync);
    return () => window.removeEventListener(LOCAL_DATA_EVENT, sync);
  }, [engine]);

  const persist = useCallback((next: AudioSettings) => {
    setSettings(next);
    writeRaw(STORAGE_KEYS.audioSettings, JSON.stringify(next));
  }, []);

  const setEnabled = useCallback(
    (enabled: boolean) => {
      const next = { ...settings, enabled };
      persist(next);
      if (enabled) {
        // The click that got us here is the user gesture that unlocks audio.
        void engine.start(next);
      } else {
        engine.stop();
      }
    },
    [engine, persist, settings],
  );

  const setScene = useCallback(
    (scene: SceneId) => {
      const next = { ...settings, scene };
      persist(next);
      if (next.enabled && engine.isPlaying()) engine.setScene(scene);
    },
    [engine, persist, settings],
  );

  const setVolume = useCallback(
    (volume: number) => {
      const next = { ...settings, volume };
      persist(next);
      engine.setVolume(volume);
    },
    [engine, persist, settings],
  );

  const setChimes = useCallback(
    (chimes: boolean) => {
      const next = { ...settings, chimes };
      persist(next);
      engine.setChimes(chimes);
    },
    [engine, persist, settings],
  );

  const chime = useCallback((kind: ChimeKind) => engine.chime(kind), [engine]);

  const setRecording = useCallback(
    (recording: boolean) => {
      if (recording) engine.suspendForRecording();
      else engine.resumeAfterRecording();
    },
    [engine],
  );

  const value = useMemo<AudioApi>(
    () => ({
      settings,
      snapshot,
      playing: snapshot.state === 'running' && snapshot.scene !== null,
      pausedByTab: snapshot.hiddenPause || snapshot.state === 'suspended',
      supported: snapshot.state !== 'unsupported',
      setEnabled,
      setScene,
      setVolume,
      setChimes,
      chime,
      setRecording,
    }),
    [settings, snapshot, setEnabled, setScene, setVolume, setChimes, chime, setRecording],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio(): AudioApi {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used inside an AudioProvider');
  return context;
}

/** Convenience for components that only want to play a cue. */
export function useChime(): (kind: ChimeKind) => void {
  return useAudio().chime;
}
