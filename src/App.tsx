import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Play, Heart, MessageCircle, Share2, MoreHorizontal, Compass, Settings, LogOut, Music as MusicIcon, Users, ShoppingBag, Calendar, ArrowRight, Send, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import UploadModal from './components/UploadModal';
import { Track } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('ホーム');
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageUsers, setMessageUsers] = useState<any[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [isBlogUploadOpen, setIsBlogUploadOpen] = useState(false);
  const [isShopUploadOpen, setIsShopUploadOpen] = useState(false);

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchMessageUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setMessageUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUser || !newMessage.trim()) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: selectedChatUser.id,
          content: newMessage
        })
      });
      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  useEffect(() => {
    if (currentView === 'メッセージ') {
      fetchMessages();
      fetchMessageUsers();
    }
  }, [currentView, user]);

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/tracks');
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    }
  };

  const fetchShopItems = async () => {
    try {
      const response = await fetch('/api/shop-items');
      const data = await response.json();
      setShopItems(data);
    } catch (error) {
      console.error('Failed to fetch shop items:', error);
    }
  };

  useEffect(() => {
    fetchTracks();
    fetchBlogs();
    fetchShopItems();
    fetchUser();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      window.open(url, 'google_login', 'width=500,height=600');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      if (currentView === 'マイページ') {
        setCurrentView('ホーム');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!currentTrack) return;
    const index = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (index + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!currentTrack) return;
    const index = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (index - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'ホーム':
        return (
          <div className="px-8 py-8">
            {/* Anime Hero Section */}
            <section className="mb-12 relative overflow-hidden rounded-[40px] h-[400px] border border-white/10 group">
              <div className="absolute inset-0">
                <img 
                  src="https://picsum.photos/seed/japanese-anime-cute-girl-music-hero/1200/600" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>
              <div className="relative h-full flex flex-col justify-end p-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-brand text-[10px] font-black italic rounded-full shadow-lg animate-pulse">FEATURED</span>
                  <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">Anime Beats Collection</span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter mb-6 leading-none">
                  あなたの音を、<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-accent to-cyan">世界へ響かせよう。</span>
                </h1>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setCurrentView('見つける')}
                    className="bg-white text-black px-8 py-3 rounded-2xl font-black hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <Play size={20} fill="black" /> 今すぐ聴く
                  </button>
                  <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="glass-panel px-8 py-3 rounded-2xl font-black hover:bg-white/10 transition-colors"
                  >
                    作品を投稿する
                  </button>
                </div>
              </div>
              {/* Decorative Anime Elements */}
              <div className="absolute top-10 right-10 w-32 h-32 border-2 border-brand/20 rounded-full animate-[spin_10s_linear_infinite] border-dashed" />
              <div className="absolute bottom-20 right-40 w-16 h-16 bg-accent/20 blur-2xl rounded-full animate-pulse" />
            </section>

            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">今注目のトレンド</h2>
                <button className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">すべて見る</button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-3 animate-pulse">
                      <div className="aspect-square bg-zinc-900 rounded-2xl" />
                      <div className="h-4 bg-zinc-900 rounded w-3/4" />
                      <div className="h-3 bg-zinc-900 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : tracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-500">
                    <Play size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">まだ曲がありません</h3>
                  <p className="text-zinc-500 text-sm mb-6">最初の曲をアップロードしましょう！</p>
                  <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-brand text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                  >
                    今すぐアップロード
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {tracks.map((track) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={track.id}
                      className="group relative space-y-3"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl anime-card">
                        <img
                          src={track.cover_url}
                          alt={track.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <button
                            onClick={() => handlePlayTrack(track)}
                            className="w-14 h-14 bg-brand text-white rounded-full flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 border-2 border-white/20"
                          >
                            {currentTrack?.id === track.id && isPlaying ? (
                              <div className="flex items-end gap-1 h-6">
                                <div className="w-1 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]" />
                                <div className="w-1 bg-white animate-[music-bar_1.2s_ease-in-out_infinite]" />
                                <div className="w-1 bg-white animate-[music-bar_0.6s_ease-in-out_infinite]" />
                              </div>
                            ) : (
                              <Play size={28} fill="currentColor" className="ml-1" />
                            )}
                          </button>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-brand text-[10px] font-black italic rounded-md shadow-lg">NEW</span>
                        </div>
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-accent transition-colors border border-white/10">
                            <Heart size={16} />
                          </button>
                          <button className="p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-cyan/80 transition-colors border border-white/10">
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold truncate group-hover:text-brand transition-colors">{track.title}</h3>
                        <p className="text-sm text-zinc-500 truncate">{track.artist}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-6">最近のアクティビティ</h2>
              <div className="space-y-4">
                {tracks.slice(0, 5).map((track) => (
                  <div key={track.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img src={track.cover_url} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => handlePlayTrack(track)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{track.title}</h4>
                      <p className="text-xs text-zinc-500">{track.artist} • {track.genre}</p>
                    </div>
                    <div className="flex items-center gap-6 text-zinc-500">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Heart size={14} /> 1.2k
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <MessageCircle size={14} /> 24
                      </div>
                      <button className="p-1 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case '見つける':
        return (
          <div className="px-8 py-8 flex flex-col items-center justify-center h-[60vh]">
            <Compass size={64} className="text-brand mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold mb-2">新しい音楽を見つける</h2>
            <p className="text-zinc-500">おすすめのプレイリストや新着アーティストをチェックしましょう。</p>
            <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-2xl">
              {['エレクトロニック', 'ヒップホップ', 'ロック'].map(genre => (
                <div key={genre} className="bg-zinc-900 p-6 rounded-2xl border border-white/5 hover:border-brand/50 transition-colors cursor-pointer text-center">
                  <span className="font-bold">{genre}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'ライブラリ':
        return (
          <div className="px-8 py-8">
            <h2 className="text-3xl font-bold mb-8">ライブラリ</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5">
                <h3 className="text-xl font-bold mb-4">最近再生した曲</h3>
                <p className="text-zinc-500 text-sm">ここに履歴が表示されます。</p>
              </div>
              <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5">
                <h3 className="text-xl font-bold mb-4">作成したプレイリスト</h3>
                <p className="text-zinc-500 text-sm">まだプレイリストがありません。</p>
              </div>
            </div>
          </div>
        );
      case 'いいねした曲':
        return (
          <div className="px-8 py-8">
            <div className="flex items-end gap-6 mb-12">
              <div className="w-48 h-48 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl flex items-center justify-center">
                <Heart size={80} fill="white" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">プレイリスト</p>
                <h2 className="text-6xl font-black mb-4">いいねした曲</h2>
                <p className="text-zinc-400">0曲</p>
              </div>
            </div>
            <div className="border-t border-white/5 pt-8 flex flex-col items-center justify-center py-20">
              <p className="text-zinc-500">まだ「いいね」した曲がありません。お気に入りの曲を見つけましょう！</p>
            </div>
          </div>
        );
      case 'ブログ':
        return (
          <div className="px-8 py-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">クリエイターブログ</h2>
                <p className="text-zinc-500 font-bold">最新の制作秘話やイベント情報をお届けします</p>
              </div>
              <button 
                onClick={() => user ? setIsBlogUploadOpen(true) : handleLogin()}
                className="bg-brand text-white px-6 py-3 rounded-2xl font-black hover:scale-105 transition-transform shadow-lg shadow-brand/20"
              >
                記事を投稿する
              </button>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-[40px]">
                <p className="text-zinc-500 font-bold">まだ記事がありません。最初の記事を投稿しましょう！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <article key={blog.id} className="group cursor-pointer">
                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-4 border border-white/5">
                      <img 
                        src={blog.image_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-brand/90 backdrop-blur-md text-[10px] font-black rounded-full">BLOG</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <Calendar size={12} /> {new Date(blog.created_at).toLocaleDateString()} • {blog.user_name}
                      </div>
                      <h3 className="text-xl font-black group-hover:text-brand transition-colors leading-tight">
                        {blog.title}
                      </h3>
                      <p className="text-zinc-500 text-sm line-clamp-2 font-medium">
                        {blog.content}
                      </p>
                      <div className="flex items-center gap-2 text-brand font-black text-xs pt-2">
                        READ MORE <ArrowRight size={14} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        );
      case 'ショップ':
        return (
          <div className="px-8 py-8 max-w-6xl mx-auto">
            <div className="relative mb-12 rounded-[40px] overflow-hidden h-[300px] border border-white/10">
              <img 
                src="https://picsum.photos/seed/anime-shop-banner/1200/400" 
                className="w-full h-full object-cover opacity-50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent flex flex-col justify-center p-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter mb-4">OFFICIAL SHOP</h2>
                    <p className="text-zinc-400 font-bold text-lg max-w-md">
                      限定CD、グッズ、デジタルコンテンツを今すぐチェック。
                    </p>
                  </div>
                  <button 
                    onClick={() => user ? setIsShopUploadOpen(true) : handleLogin()}
                    className="bg-brand text-white px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl shadow-brand/20"
                  >
                    商品を出品する
                  </button>
                </div>
              </div>
            </div>

            {shopItems.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-[40px]">
                <p className="text-zinc-500 font-bold">まだ商品がありません。最初の商品を出品しましょう！</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {shopItems.map((item) => (
                  <div key={item.id} className="glass-panel p-4 rounded-[32px] group hover:border-brand/50 transition-all">
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-white/5">
                      <img 
                        src={item.image_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-3 right-3">
                        <button className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                          <ShoppingBag size={20} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">By {item.user_name}</p>
                      <h3 className="font-black text-sm mb-2 group-hover:text-brand transition-colors">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-brand font-black">¥{item.price.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-zinc-600">在庫あり</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'メッセージ':
        if (!user) {
          return (
            <div className="px-8 py-8 flex flex-col items-center justify-center h-[60vh]">
              <div className="w-24 h-24 bg-zinc-900 rounded-[32px] flex items-center justify-center mb-6 border border-white/5">
                <Mail size={48} className="text-zinc-500" />
              </div>
              <h2 className="text-3xl font-black mb-2">ログインが必要です</h2>
              <p className="text-zinc-500 mb-8 max-w-md text-center">メッセージ機能を利用するには、Googleアカウントでログインしてください。</p>
              <button 
                onClick={handleLogin}
                className="bg-brand text-white px-10 py-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl shadow-brand/20"
              >
                Googleでログイン
              </button>
            </div>
          );
        }
        return (
          <div className="px-8 py-8 h-[calc(100vh-160px)] flex gap-8">
            {/* User List */}
            <div className="w-80 glass-panel rounded-3xl overflow-hidden flex flex-col">
              <div className="p-6 border-bottom border-white/5">
                <h2 className="text-2xl font-black tracking-tighter">メッセージ</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messageUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedChatUser(u)}
                    className={cn(
                      "w-full flex items-center gap-4 p-3 rounded-2xl transition-all",
                      selectedChatUser?.id === u.id ? "bg-brand/10 border border-brand/20" : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <img src={u.picture} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="text-left">
                      <p className="font-bold text-sm">{u.name}</p>
                      <p className="text-[10px] text-zinc-500">オンライン</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col">
              {selectedChatUser ? (
                <>
                  <div className="p-6 border-bottom border-white/5 flex items-center gap-4 bg-white/5">
                    <img src={selectedChatUser.picture} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-black">{selectedChatUser.name}</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Chatting now</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.filter(m => 
                      (m.sender_id === user.id && m.receiver_id === selectedChatUser.id) ||
                      (m.sender_id === selectedChatUser.id && m.receiver_id === user.id)
                    ).map(m => (
                      <div key={m.id} className={cn(
                        "flex flex-col max-w-[70%]",
                        m.sender_id === user.id ? "ml-auto items-end" : "mr-auto items-start"
                      )}>
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-sm font-medium",
                          m.sender_id === user.id ? "bg-brand text-white rounded-tr-none" : "bg-white/10 text-white rounded-tl-none"
                        )}>
                          {m.content}
                        </div>
                        <span className="text-[8px] text-zinc-600 mt-1 font-bold">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-6 bg-white/5 border-top border-white/5 flex gap-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="メッセージを入力..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                    <button 
                      type="submit"
                      className="bg-brand text-white p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20"
                    >
                      <Send size={20} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                  <Mail size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">チャット相手を選択してください</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'マイページ':
        if (!user) {
          return (
            <div className="px-8 py-8 flex flex-col items-center justify-center h-[60vh]">
              <div className="w-24 h-24 bg-zinc-900 rounded-[32px] flex items-center justify-center mb-6 border border-white/5">
                <User size={48} className="text-zinc-500" />
              </div>
              <h2 className="text-3xl font-black mb-2">ログインが必要です</h2>
              <p className="text-zinc-500 mb-8 max-w-md text-center">マイページにアクセスするには、Googleアカウントでログインしてください。</p>
              <button 
                onClick={handleLogin}
                className="bg-brand text-white px-10 py-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl shadow-brand/20"
              >
                Googleでログイン
              </button>
            </div>
          );
        }
        return (
          <div className="px-8 py-8 max-w-5xl mx-auto">
            <div className="relative mb-12">
              <div className="h-48 w-full bg-gradient-to-r from-brand/20 via-accent/20 to-cyan/20 rounded-3xl overflow-hidden border border-white/5">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              </div>
              <div className="absolute -bottom-6 left-8 flex items-end gap-6">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-brand to-accent p-1 shadow-2xl">
                  <div className="w-full h-full bg-surface rounded-[22px] flex items-center justify-center overflow-hidden">
                    {user.picture ? (
                      <img src={user.picture} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={64} className="text-brand" />
                    )}
                  </div>
                </div>
                <div className="pb-2">
                  <h2 className="text-4xl font-black tracking-tighter mb-1">{user.name}</h2>
                  <p className="text-zinc-500 font-medium">{user.email} • 2026年3月から利用中</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-8">
                <div className="glass-panel p-6 rounded-3xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MusicIcon size={20} className="text-brand" /> あなたの投稿
                  </h3>
                  {tracks.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                      <p className="text-zinc-500">まだ曲を投稿していません。</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tracks.map(track => (
                        <div key={track.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                          <img src={track.cover_url} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="font-bold text-sm">{track.title}</h4>
                            <p className="text-xs text-zinc-500">{track.genre}</p>
                          </div>
                          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:text-brand transition-colors"><Heart size={16} /></button>
                            <button className="p-2 hover:text-white transition-colors"><MoreHorizontal size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-panel p-6 rounded-3xl">
                  <h3 className="text-lg font-bold mb-4">ステータス</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-brand">{tracks.length}</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">投稿数</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-cyan">1.2k</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">フォロワー</p>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-3xl space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold">
                    <Settings size={18} className="text-zinc-500" /> 設定
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold text-accent"
                  >
                    <LogOut size={18} /> ログアウト
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar 
        onUploadClick={() => setIsUploadOpen(true)} 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="flex-1 pb-32">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="アーティスト、曲、ポッドキャストを検索"
              className="w-full bg-zinc-900 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            {user ? (
              <button 
                onClick={() => setCurrentView('マイページ')}
                className={cn(
                  "w-10 h-10 rounded-full overflow-hidden cursor-pointer transition-all border-2",
                  currentView === 'マイページ' ? "border-brand scale-110" : "border-transparent"
                )}
              >
                <img src={user.picture} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-brand text-white px-6 py-2 rounded-xl font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-brand/20"
              >
                ログイン
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        {renderContent()}
      </main>

      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchTracks}
      />

      {isBlogUploadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsBlogUploadOpen(false)} />
          <div className="relative w-full max-w-2xl glass-panel rounded-[40px] p-10 overflow-hidden">
            <h2 className="text-3xl font-black tracking-tighter mb-8">ブログ記事を投稿</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const res = await fetch('/api/blogs', { method: 'POST', body: formData });
                if (res.ok) {
                  fetchBlogs();
                  setIsBlogUploadOpen(false);
                }
              } catch (err) { console.error(err); }
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">タイトル</label>
                <input name="title" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand transition-colors" placeholder="記事のタイトルを入力..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">内容</label>
                <textarea name="content" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand transition-colors h-40" placeholder="記事の内容を入力..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">カバー画像</label>
                <input type="file" name="image" accept="image/*" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand transition-colors" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsBlogUploadOpen(false)} className="flex-1 bg-white/5 py-4 rounded-2xl font-black hover:bg-white/10 transition-colors">キャンセル</button>
                <button type="submit" className="flex-1 bg-brand text-white py-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl shadow-brand/20">投稿する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isShopUploadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsShopUploadOpen(false)} />
          <div className="relative w-full max-w-2xl glass-panel rounded-[40px] p-10 overflow-hidden">
            <h2 className="text-3xl font-black tracking-tighter mb-8">商品を出品</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const res = await fetch('/api/shop-items', { method: 'POST', body: formData });
                if (res.ok) {
                  fetchShopItems();
                  setIsShopUploadOpen(false);
                }
              } catch (err) { console.error(err); }
            }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">商品名</label>
                  <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand transition-colors" placeholder="商品名を入力..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">価格 (円)</label>
                  <input name="price" type="number" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand transition-colors" placeholder="2500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">商品説明</label>
                <textarea name="description" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand transition-colors h-32" placeholder="商品の説明を入力..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">商品画像</label>
                <input type="file" name="image" accept="image/*" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand transition-colors" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsShopUploadOpen(false)} className="flex-1 bg-white/5 py-4 rounded-2xl font-black hover:bg-white/10 transition-colors">キャンセル</button>
                <button type="submit" className="flex-1 bg-brand text-white py-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl shadow-brand/20">出品する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
      `}</style>
    </div>
  );
}
