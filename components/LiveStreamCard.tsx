
import React from 'react';
import { User, SubscriptionStatus } from '../types';
import { VideoIcon, InformationCircleIcon } from './icons';

interface LiveStreamCardProps {
    workshopId: number;
    workshopTitle: string;
    zoomLink: string;
    user: User | null;
    onLoginRequest: () => void;
    onZoomRedirect: (zoomLink: string, workshopId: number) => void;
    onShowToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
    onShowHelp: () => void;
}

const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ workshopId, workshopTitle, zoomLink, user, onLoginRequest, onZoomRedirect, onShowToast, onShowHelp }) => {
    
    const isSubscribed = user?.subscriptions.some(
        sub => sub.workshopId === workshopId && 
        sub.status !== SubscriptionStatus.REFUNDED && 
        !sub.isPayItForwardDonation
    );

    const handleLinkClick = () => {
        if (!user) {
            onLoginRequest();
            return;
        }

        if (!isSubscribed) {
            onShowToast(`عفواً، الوصول إلى بث ورشة "${workshopTitle}" متاح فقط للمشتركين.`, 'warning');
        } else {
            onZoomRedirect(zoomLink, workshopId);
        }
    };

    return (
        <div className="flex justify-center w-full my-8 px-4">
            <button 
                onClick={handleLinkClick}
                className="group relative w-full max-w-sm aspect-[4/3] sm:aspect-square bg-gradient-to-br from-[#4c1d95] to-[#db2777] rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(219,39,119,0.5)] flex flex-col items-center justify-center text-center p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_-10px_rgba(219,39,119,0.7)] border border-white/10 overflow-hidden"
            >
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-900/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                {/* LIVE NOW Badge - Moved Higher to top edge (top-2) */}
                <div className="absolute top-2 right-2 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-900/30 border border-white/10 tracking-widest animate-pulse z-20">
                    <span>LIVE NOW</span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </div>

                {/* Help Button - Moved Higher for symmetry (top-2) */}
                <div 
                    onClick={(e) => { e.stopPropagation(); onShowHelp(); }}
                    className="absolute top-2 left-2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 backdrop-blur-md border border-white/5"
                    title="كيف أدخل؟"
                >
                    <InformationCircleIcon className="w-5 h-5" />
                </div>

                {/* Icon - Reset margin to keep it centered */}
                <div className="relative mb-6 group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl transform scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-md shadow-2xl relative z-10">
                        <VideoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                    </div>
                </div>

                {/* Text */}
                <div className="relative z-10 space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
                        دخول البث الآن
                    </h2>
                    <p className="text-pink-100 text-sm font-semibold opacity-90 tracking-wide">
                        اضغط للانضمام فوراً
                    </p>
                    
                    {/* Workshop Title as a subtle subtitle */}
                    <div className="mt-4 pt-3 border-t border-white/10 w-full flex justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                         <span className="text-xs font-bold text-white bg-black/20 px-4 py-1.5 rounded-lg backdrop-blur-sm truncate max-w-[250px]">
                            {workshopTitle}
                        </span>
                    </div>
                </div>
            </button>
        </div>
    );
};

export default LiveStreamCard;
