import React, { useState } from 'react';
import { X, Upload, Music, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('genre', genre);
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);

    try {
      const response = await fetch('/api/tracks', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onUploadSuccess();
        onClose();
        // Reset form
        setTitle('');
        setArtist('');
        setGenre('');
        setAudioFile(null);
        setCoverFile(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Upload className="text-brand" /> トラックをアップロード
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">タイトル</label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand transition-colors"
                      placeholder="曲のタイトル"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">アーティスト</label>
                    <input
                      required
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand transition-colors"
                      placeholder="アーティスト名"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">ジャンル</label>
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand transition-colors"
                      placeholder="エレクトロニック、ロックなど"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">オーディオファイル</label>
                    <div className="relative group">
                      <input
                        required
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={cn(
                        "h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors",
                        audioFile ? "border-brand bg-brand/5" : "border-white/10 group-hover:border-white/20"
                      )}>
                        <Music size={24} className={audioFile ? "text-brand" : "text-zinc-500"} />
                        <span className="text-xs text-zinc-400 text-center px-4 truncate w-full">
                          {audioFile ? audioFile.name : "オーディオを選択"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">カバーアート (任意)</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={cn(
                        "h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors",
                        coverFile ? "border-brand bg-brand/5" : "border-white/10 group-hover:border-white/20"
                      )}>
                        <ImageIcon size={24} className={coverFile ? "text-brand" : "text-zinc-500"} />
                        <span className="text-xs text-zinc-400 text-center px-4 truncate w-full">
                          {coverFile ? coverFile.name : "画像を選択"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled={isUploading || !audioFile}
                type="submit"
                className="w-full bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand/20"
              >
                {isUploading ? "アップロード中..." : "トラックを公開"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
