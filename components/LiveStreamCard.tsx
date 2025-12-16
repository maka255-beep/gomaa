
import React from 'react';
import { User, SubscriptionStatus } from '../types';
import { VideoIcon, InformationCircleIcon, CalendarIcon, ArrowLeftIcon } from './icons';

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

    const hasLink = !!zoomLink;

    const handleAction = () => {
        if (!hasLink) {
             if (!user) {
                onLoginRequest();
                return;
            }
            if (!isSubscribed) {
                 onShowToast(`عفواً، يجب الاشتراك في ورشة "${workshopTitle}" أولاً.`, 'warning');
            } else {
                 onShowToast('رابط البث سيكون متاحاً هنا قريباً قبل موعد الورشة.', 'success');
            }
            return;
        }

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

    // Design for NO Link (Standard "Upcoming" Card)
    if (!hasLink) {
        return (
            <div className="flex justify-center w-full my-8 px-4">
                <button 
                    onClick={handleAction}
                    className="group relative w-full max-w-sm aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-center p-6 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 border border-white/10 overflow-hidden bg-gradient-to-br from-[#2e1065] to-[#581c87] shadow-xl hover:shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 backdrop-blur-md border border-white/5"
                        onClick={(e) => { e.stopPropagation(); onShowHelp(); }}
                    >
                        <InformationCircleIcon className="w-5 h-5" />
                    </div>

                    <div className="relative mb-6 group-hover:-translate-y-2 transition-transform duration-500">
                        <div className="absolute inset-0 rounded-full blur-xl transform scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-fuchsia-500/20"></div>
                        <div className="w-24 h-24 rounded-full border-[3px] border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-2xl relative z-10">
                            <CalendarIcon className="w-12 h-12 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                        </div>
                    </div>

                    <div className="relative z-10 space-y-2">
                        <h2 className="text-3xl font-black text-white leading-tight drop-shadow-md">
                            الورشة القادمة
                        </h2>
                        <p className="text-fuchsia-100 text-sm font-semibold opacity-90 tracking-wide">
                            استعدوا لرحلة ملهمة
                        </p>
                        <div className="mt-4 pt-3 border-t border-white/10 w-full flex justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                             <span className="text-xs font-bold text-white bg-black/20 px-4 py-1.5 rounded-lg backdrop-blur-sm truncate max-w-[250px]">
                                {workshopTitle}
                            </span>
                        </div>
                    </div>
                </button>
            </div>
        );
    }

    // Design for HAS Link (Matched to Hero/Timer Size)
    return (
        <div className="flex justify-center w-full my-6 px-4">
            <div className="relative w-full max-w-xl bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#6b21a8] rounded-xl p-5 text-center shadow-[0_0_20px_rgba(219,39,119,0.25)] border border-white/10 overflow-hidden flex flex-col items-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_35px_rgba(219,39,119,0.4)] ring-1 ring-white/10">
                
                {/* Decorative Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-fuchsia-600/10 rounded-full blur-[60px] pointer-events-none"></div>
                
                {/* Top Right Help Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onShowHelp(); }}
                    className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md py-1 px-2.5 rounded-full text-white text-[9px] font-bold transition-colors border border-white/10 z-20"
                >
                    <span>كيف أدخل؟</span>
                    <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center text-[#2e1065]">
                        <span className="text-[10px] font-black">?</span>
                    </div>
                </button>

                {/* Content Container */}
                <div className="relative z-10 w-full flex flex-col items-center">
                    
                    {/* Icon */}
                    <div className="mb-3 relative mt-1">
                        <div className="absolute inset-0 bg-fuchsia-500/20 rounded-full blur-xl"></div>
                        {/* Pulse Animation around Icon */}
                        <div className="absolute inset-0 rounded-full bg-fuchsia-500/30 animate-ping"></div>
                        
                        <div className="w-16 h-16 rounded-full border border-white/20 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center backdrop-blur-sm relative shadow-lg z-10">
                            <VideoIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Header Text */}
                    <div className="flex flex-col items-center mb-4 w-full">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest animate-pulse flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                LIVE
                            </span>
                            <span className="text-white font-bold text-xs tracking-wide">ZOOM البث المباشر عبر</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-lg mb-1 w-full text-center px-4">
                            {workshopTitle}
                        </h2>
                        <p className="text-slate-300 text-[10px] sm:text-xs max-w-sm leading-relaxed px-4">
                            انضم الآن لتجربة تفاعلية مباشرة. تأكد من أنك في مكان هادئ!
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleAction}
                        className="w-full max-w-xs bg-gradient-to-r from-[#7c3aed] to-[#db2777] hover:from-[#6d28d9] hover:to-[#be185d] text-white font-bold py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:shadow-fuchsia-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm border border-white/10 group z-30"
                    >
                        <span>الدخول إلى البث</span>
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    {/* Footer Hint */}
                    <p className="text-slate-400 text-[9px] mt-2.5 font-medium opacity-80">
                        يجب تسجيل الدخول أولاً للتحقق من اشتراكك.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveStreamCard;
