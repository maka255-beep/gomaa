
import React, { useEffect } from 'react';
import { Workshop, Recording } from '../types';
import { useUser } from '../context/UserContext';
import { ArrowLeftIcon, LockClosedIcon, ShieldCheckIcon, VideoIcon } from '../components/icons';

interface WatchPageProps {
  workshop: Workshop;
  recording: Recording;
  onBack: () => void;
}

const WatchPage: React.FC<WatchPageProps> = ({ workshop, recording, onBack }) => {
  const { currentUser } = useUser();

  // Security: Prevent right-click and common keyboard shortcuts for inspection/copying
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && ['c', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      // Prevent F12 and Inspect Element
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    // Clear any potential white bleeds from html/body
    document.documentElement.style.backgroundColor = '#000';
    document.body.style.backgroundColor = '#000';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  const isSubscribed = currentUser?.subscriptions.some(
    sub => sub.workshopId === workshop.id && sub.isApproved !== false && !sub.isPayItForwardDonation
  );

  const getPlayerUrl = (url: string) => {
    try {
      if (url.includes('vimeo.com')) {
        const vUrl = new URL(url.includes('player.vimeo.com') ? url : `https://player.vimeo.com/video/${url.split('/').pop()}`);
        vUrl.searchParams.set('title', '0');
        vUrl.searchParams.set('byline', '0');
        vUrl.searchParams.set('portrait', '0');
        vUrl.searchParams.set('dnt', '1');
        return vUrl.href;
      }
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
      // Zoom links usually redirect to their own player, we keep them in the iframe if allowed, or it forces a new tab
      return url;
    } catch (e) {
      return url;
    }
  };

  const videoUrl = getPlayerUrl(recording.url);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in select-none" dir="rtl">
      {/* High-End Theater Header */}
      <header className="flex-shrink-0 p-4 bg-gradient-to-b from-slate-900 to-black border-b border-fuchsia-500/30 flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/40">
                <VideoIcon className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
                <h1 className="text-sm sm:text-base font-bold text-white leading-tight">مشاهدة: {workshop.title}</h1>
                <p className="text-[10px] sm:text-xs text-fuchsia-300/70 font-medium">{recording.name || 'تسجيل المحاضرة'}</p>
            </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>اتصال آمن ومحمي</span>
            </div>
            <button 
                onClick={onBack} 
                className="flex items-center gap-x-2 py-2 px-4 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs sm:text-sm transition-all transform hover:scale-105 shadow-lg shadow-fuchsia-900/40"
            >
                <span>الخروج من المشاهدة</span>
                <ArrowLeftIcon className="w-4 h-4 transform rotate-180" />
            </button>
        </div>
      </header>

      {/* Main Player Area */}
      <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-fuchsia-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        {isSubscribed ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-6 relative z-10">
                <div className="w-full max-w-6xl aspect-video bg-slate-900 rounded-2xl shadow-2xl border border-white/5 overflow-hidden relative group">
                    {/* Protection Overlay (Invisible) */}
                    <div className="absolute inset-0 z-20 pointer-events-none"></div>
                    
                    <iframe
                        src={videoUrl}
                        className="w-full h-full border-0 relative z-10"
                        title={`Recording for ${workshop.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>

                    {/* Watermark */}
                    <div className="absolute bottom-4 right-4 z-30 opacity-20 pointer-events-none">
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase">Nawaya Events Protected Content</span>
                    </div>
                </div>
                
                {/* Instruction bar */}
                <div className="mt-6 flex items-center gap-4 text-slate-500 text-[10px] sm:text-xs">
                    <p>ميثاق الأمانة: يمنع تسجيل الشاشة أو مشاركة المحتوى</p>
                    <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                    <p>{currentUser?.fullName}</p>
                </div>
            </div>
        ) : (
            <div className="text-center p-8 relative z-10">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                    <LockClosedIcon className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">الوصول محجوب</h2>
                <p className="text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
                    عذراً، يجب أن تكون مشتركاً بشكل فعال في هذه الورشة لمشاهدة التسجيل. يرجى مراجعة اشتراكاتك في الملف الشخصي.
                </p>
                <button onClick={onBack} className="mt-8 text-fuchsia-400 font-bold hover:underline">العودة للخلف</button>
            </div>
        )}
      </main>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WatchPage;
