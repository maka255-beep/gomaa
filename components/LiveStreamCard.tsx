
import React from 'react';
import { User, SubscriptionStatus } from '../types';
import { VideoIcon, LoginIcon } from './icons';

interface LiveStreamCardProps {
    workshopId: number;
    workshopTitle: string;
    zoomLink: string;
    user: User | null;
    onLoginRequest: () => void;
    onZoomRedirect: (zoomLink: string, workshopId: number) => void;
}

const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ workshopId, workshopTitle, zoomLink, user, onLoginRequest, onZoomRedirect }) => {
    
    const isSubscribed = user?.subscriptions.some(
        sub => sub.workshopId === workshopId && 
        sub.status !== SubscriptionStatus.REFUNDED && 
        !sub.isPayItForwardDonation
    );

    const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!user) {
            e.preventDefault();
            onLoginRequest();
            return;
        }

        if (!isSubscribed) {
            e.preventDefault();
            alert(`عفواً، الوصول إلى بث ورشة "${workshopTitle}" متاح فقط للمشتركين.`);
        } else {
            onZoomRedirect(zoomLink, workshopId);
        }
    };

    return (
        <div className="group relative max-w-lg mx-auto my-8">
            {/* Outer animated glow - Deep Purple to Pink */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse"></div>
            
            {/* Main card - Dark Royal Gradient Background */}
            <div className="relative bg-gradient-to-br from-[#2e0235] via-[#4c1d95] to-[#701a75] rounded-2xl shadow-2xl shadow-black/50 p-6 text-center flex flex-col items-center transform group-hover:-translate-y-1 transition-transform duration-300 border border-purple-500/30">

                {/* Icon section with pulsing effect */}
                <div className="relative mb-4">
                    <span className="absolute -inset-3 animate-ping rounded-full bg-purple-500 opacity-10"></span>
                    <div className="relative bg-white/10 p-4 rounded-full border border-purple-400/30 shadow-[0_0_15px_rgba(147,51,234,0.3)] backdrop-blur-md">
                        {/* Unified Icon Size */}
                        <VideoIcon className="w-10 h-10 text-pink-200 drop-shadow-md"/>
                    </div>
                </div>

                {/* Title with "LIVE" badge */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3">
                    {/* Unified Text Size */}
                    <span className="text-base font-bold text-pink-100 tracking-wide">البث المباشر عبر ZOOM</span>
                    <span className="flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-900/50 border border-red-400/50 tracking-wider">
                        <span className="w-1 h-1 rounded-full bg-white"></span>
                        LIVE
                    </span>
                </div>
                
                {/* Unified Text Size */}
                <h4 className="text-xl font-black text-white mb-2 leading-tight drop-shadow-lg">
                    {workshopTitle}
                </h4>

                {/* Unified Text Size */}
                <p className="text-slate-300 mb-6 max-w-sm text-sm font-medium leading-relaxed">
                    انضم الآن لتجربة تفاع