import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import { Track } from '../types';
import { cn } from '../lib/utils';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Player({ currentTrack, isPlaying, onTogglePlay, onNext, onPrev }: PlayerProps) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-panel px-6 py-4 flex items-center justify-between z-50">
      <audio
        ref={audioRef}
        src={currentTrack.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
        muted={isMuted}
      />

      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/4">
        <div className="relative group">
          <img
            src={currentTrack.cover_url}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-xl object-cover shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan rounded-full animate-pulse shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-black tracking-tight truncate group-hover:text-brand transition-colors">{currentTrack.title}</h4>
          <p className="text-[10px] uppercase font-bold text-zinc-500 truncate tracking-widest">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 w-2/4">
        <div className="flex items-center gap-8">
          <button className="text-zinc-500 hover:text-cyan transition-colors">
            <Shuffle size={18} />
          </button>
          <button onClick={onPrev} className="text-zinc-300 hover:text-white transition-all active:scale-90">
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,85,0,0.3)] border border-white/20"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={onNext} className="text-zinc-300 hover:text-white transition-all active:scale-90">
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button className="text-zinc-500 hover:text-accent transition-colors">
            <Repeat size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-lg">
          <span className="text-[10px] font-black text-zinc-500 w-10 text-right font-mono tracking-tighter">
            {formatTime((progress / 100) * duration)}
          </span>
          <div className="relative flex-1 h-1.5 group cursor-pointer">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute inset-0 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-brand to-accent relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[progress-stripe_1s_linear_infinite]" />
              </div>
            </div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-200 rotate-45"
              style={{ left: `${progress}%`, marginLeft: '-8px' }}
            />
          </div>
          <span className="text-[10px] font-black text-zinc-500 w-10 font-mono tracking-tighter">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Extra */}
      <div className="flex items-center justify-end gap-4 w-1/4">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden relative group border border-white/5">
           <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (audioRef.current) audioRef.current.volume = val;
                if (val > 0) setIsMuted(false);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="h-full bg-zinc-500 group-hover:bg-cyan transition-colors"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
        </div>
      </div>
    </div>
  );
}
