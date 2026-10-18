import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeVoice, toMono } from '../voice/analyze';
import { readVoice } from '../voice/read';
import type { VoiceResult } from '../voice/types';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'processing' | 'ready' | 'error';

export interface RecorderError {
  code: 'denied' | 'missing' | 'busy' | 'unsupported' | 'decode' | 'unknown';
  message: string;
  hint: string;
}

const BAR_COUNT = 24;
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

function describeError(error: unknown): RecorderError {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return {
      code: 'denied',
      message: 'Microphone permission was declined.',
      hint: 'Allow microphone access in your browser’s site settings, then try again — or use the text lab instead.',
    };
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return {
      code: 'missing',
      message: 'No microphone was found.',
      hint: 'Connect or enable an input device, then try again. The text lab works without one.',
    };
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return {
      code: 'busy',
      message: 'The microphone is unavailable.',
      hint: 'Another app may be using it. Close that app and try again.',
    };
  }
  return {
    code: 'unknown',
    message: 'The microphone could not be started.',
    hint: 'Try again, or use the text lab — it never needs a microphone.',
  };
}

export function useVoiceRecorder(maxSeconds = 20) {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [bars, setBars] = useState<number[]>(() => new Array<number>(BAR_COUNT).fill(0));
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState<RecorderError | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const urlRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const stopRef = useRef<() => void>(() => {});

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    tickRef.current = null;
    analyserRef.current = null;
    setLevel(0);
    setBars(new Array<number>(BAR_COUNT).fill(0));
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    releaseStream();
  }, [releaseStream]);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  const finalize = useCallback(async () => {
    if (!mountedRef.current) return;
    setStatus('processing');
    const blob = new Blob(chunksRef.current, {
      type: recorderRef.current?.mimeType || 'audio/webm',
    });
    chunksRef.current = [];

    if (blob.size === 0) {
      setError({
        code: 'decode',
        message: 'Nothing was captured.',
        hint: 'Try again, and speak as soon as the timer starts.',
      });
      setStatus('error');
      return;
    }

    try {
      const context = contextRef.current ?? new AudioContext();
      contextRef.current = context;
      const buffer = await context.decodeAudioData(await blob.arrayBuffer());
      const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
        buffer.getChannelData(index),
      );
      const mono = toMono(channels);
      const metrics = analyzeVoice(mono, buffer.sampleRate);
      const read = readVoice(metrics);
      const url = URL.createObjectURL(blob);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      if (!mountedRef.current) return;
      setResult({ url, metrics, read });
      setStatus('ready');
    } catch {
      setError({
        code: 'decode',
        message: 'The recording could not be read in this browser.',
        hint: 'Try a different browser, or use the text lab — it needs no microphone.',
      });
      setStatus('error');
    }
  }, []);

  const start = useCallback(async () => {
    if (status === 'requesting' || status === 'recording') return;
    setError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError({
        code: 'unsupported',
        message: 'This browser cannot capture audio.',
        hint: 'Microphone capture needs a secure connection (https) and a modern browser. The text lab works everywhere.',
      });
      setStatus('error');
      return;
    }

    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      const context = new AudioContext();
      await context.resume();
      contextRef.current = context;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        recorderRef.current = null;
        void finalize();
      };
      recorder.onerror = () => {
        setError({
          code: 'unknown',
          message: 'Recording stopped unexpectedly.',
          hint: 'Try again, or use the text lab instead.',
        });
        setStatus('error');
        releaseStream();
      };
      recorder.start(200);
      startedAtRef.current = performance.now();
      setSeconds(0);
      setResult(null);
      setStatus('recording');

      const timeDomain = new Float32Array(analyser.fftSize);
      let lastMeter = 0;
      const loop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(timeDomain);
        let sum = 0;
        for (let i = 0; i < timeDomain.length; i += 1) {
          const value = timeDomain[i] ?? 0;
          sum += value * value;
        }
        const rms = Math.sqrt(sum / timeDomain.length);
        const now = performance.now();
        if (now - lastMeter > 60) {
          lastMeter = now;
          setLevel(Math.min(1, rms * 4));
          const segment = Math.floor(timeDomain.length / BAR_COUNT);
          const nextBars: number[] = [];
          for (let bar = 0; bar < BAR_COUNT; bar += 1) {
            let peak = 0;
            for (let i = bar * segment; i < (bar + 1) * segment; i += 1) {
              peak = Math.max(peak, Math.abs(timeDomain[i] ?? 0));
            }
            nextBars.push(Math.min(1, peak * 3));
          }
          setBars(nextBars);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);

      tickRef.current = window.setInterval(() => {
        const elapsed = (performance.now() - startedAtRef.current) / 1000;
        setSeconds(Math.min(maxSeconds, elapsed));
        if (elapsed >= maxSeconds) stopRef.current();
      }, 200);
    } catch (caught) {
      releaseStream();
      setError(describeError(caught));
      setStatus('error');
    }
  }, [finalize, maxSeconds, releaseStream, status]);

  const reset = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setResult(null);
    setError(null);
    setStatus('idle');
    setSeconds(0);
    setLevel(0);
    setBars(new Array<number>(BAR_COUNT).fill(0));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      recorderRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      void contextRef.current?.close();
      contextRef.current = null;
    };
  }, []);

  return { status, seconds, level, bars, result, error, start, stop, reset, maxSeconds };
}
