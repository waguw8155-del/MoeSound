import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, Mic2, Radio, Compass, MessageCircle, ShoppingBag, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  onUploadClick: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ onUploadClick, currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: 'ホーム' },
    { icon: Compass, label: '見つける' },
    { icon: Library, label: 'ライブラリ' },
    { icon: MessageCircle, label: 'ブログ' },
    { icon: ShoppingBag, label: 'ショップ' },
    { icon: Mail, label: 'メッセージ' },
  ];

  const yourItems = [
    { icon: Heart, label: 'いいねした曲' },
    { icon: Radio, label: 'ステーション' },
    { icon: Mic2, label: 'アーティスト' },
  ];

  return (
    <aside className="w-64 border-r border-white/5 h-screen flex flex-col bg-surface sticky top-0">
      <div className="p-6">
        <div 
          className="flex items-center gap-2 text-brand font-black text-2xl tracking-tighter mb-10 cursor-pointer group"
          onClick={() => onViewChange('ホーム')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-brand to-accent rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,85,0,0.4)] group-hover:rotate-12 transition-transform duration-300">
            <Radio size={24} />
          </div>
          <span className="group-hover:text-white transition-colors">MOESOUND</span>
        </div>

        <nav className="space-y-8">
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-3">メニュー</p>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={() => onViewChange(item.label)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                      currentView === item.label 
                        ? "bg-brand/10 text-brand shadow-[inset_0_0_10px_rgba(255,85,0,0.1)] border border-brand/20" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <item.icon size={20} className={cn(currentView === item.label ? "text-brand" : "text-zinc-500")} />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-3">コレクション</p>
            <ul className="space-y-1">
              {yourItems.map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={() => onViewChange(item.label)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                      currentView === item.label 
                        ? "bg-accent/10 text-accent shadow-[inset_0_0_10px_rgba(255,45,85,0.1)] border border-accent/20" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <item.icon size={20} className={cn(currentView === item.label ? "text-accent" : "text-zinc-500")} />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="relative group px-2">
          <img 
            src="https://picsum.photos/seed/japanese-anime-cute-girl-mascot/200/200" 
            className="w-full aspect-square object-cover rounded-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500 border border-white/5"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          <p className="absolute bottom-2 left-4 text-[10px] font-black text-zinc-500 group-hover:text-brand transition-colors tracking-tighter">MOESOUND MASCOT v1.0</p>
        </div>
        <button 
          onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-accent text-white font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl border border-white/10"
        >
          <PlusSquare size={20} />
          アップロード
        </button>
      </div>
    </aside>
  );
}
