
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { isWorkshopExpired } from '../utils';

interface HeroProps {
  onExploreClick: () => void;
  onOpenWorkshopDetails: (workshopId: number) => void;
}

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-slate-200 tracking-wider">
            {value.toString().padStart(2, '0')}
        </span>
        <span className="text-xs text-fuchsia-400 uppercase tracking-widest font-bold">{label}</span>
    </div>
);

const Hero: React.FC<HeroProps> = ({ onExploreClick, onOpenWorkshopDetails }) => {
    const { workshops } = useUser();

    const nextWorkshop = useMemo(() => {
        const upcomingWorkshops = workshops
            .filter(w => w.isVisible && !w.isRecorded && !isWorkshopExpired(w))
            .sort((a, b) => new Date(`${a.startDate}T${a.startTime}:00Z`).getTime() - new Date(`${b.startDate}T${b.startTime}:00Z`).getTime());
        return upcomingWorkshops[0];
    }, [workshops]);

    const calculateTimeLeft = () => {
        if (!nextWorkshop) return null;

        const targetDate = new Date(`${nextWorkshop.startDate}T${nextWorkshop.startTime}:00Z`);
        const difference = +targetDate - +new Date();
        
        let timeLeft: { days?: number; hours?: number; minutes?: number; seconds?: number } | null = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        } else {
            timeLeft = null; // Countdown finished
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!nextWorkshop) return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [nextWorkshop]);

    // Updated Button Gradient: from-purple-800 to-pink-600
    const btnClasses = "bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-700 hover:to-pink-500 text-white font-bold py-3 md:py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-900/30 hover:shadow-pink-500/30 text-base flex items-center justify-center gap-2 group mx-auto border border-white/10";

    return (
        <section className="hero-section relative text-center py-20 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                {nextWorkshop && timeLeft ? (
                    <>
                        <h2 className="text-xs font-bold text-fuchsia-400 tracking-widest uppercase mb-2">الورشة المباشرة القادمة</h2>
                        <h1 className="text-lg font-bold text-white mb-4">{nextWorkshop.title}</h1>
                        <p className="text-sm text-slate-300 mb-6 font-semibold">{nextWorkshop.instructor}</p>
                        
                        <div className="flex justify-center items-center gap-6 my-6">
                            <CountdownUnit value={timeLeft.days || 0} label="أيام" />
                            <span className="text-2xl font-black text-slate-500 -mt-4">:</span>
                            <CountdownUnit value={timeLeft.hours || 0} label="ساعات" />
                            <span className="text-2xl font-black text-slate-500 -mt-4">:</span>
                            <CountdownUnit value={timeLeft.minutes || 0} label="دقائق" />
                            <span className="text-2xl font-black text-slate-500 -mt-4">:</span>
                            <CountdownUnit value={timeLeft.seconds || 0} label="ثواني" />
                        </div>

                        <button
                            onClick={() => onOpenWorkshopDetails(nextWorkshop.id)}
                            className={btnClasses}
                        >
                            <span>عرض التفاصيل والاشتراك</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-black mb-4 nawaya-intro-text text-glow-animation text-white" style={{ animationDelay: '0s' }}>
                            الحمد لله الذي بنعمته تتم الصالحات
                        </h1>
                        <p className="text-sm text-slate-200 max-w-3xl mx-auto mb-10 nawaya-intro-text font-medium" style={{ animationDelay: '0.2s' }}>
                            اكتشف ورش عمل مباشرة ومسجلة تمنحك المهارات والمعرفة لتحقيق أهدافك.
                        </p>
                        <div className="nawaya-intro-text" style={{ animationDelay: '0.4s' }}>
                            <button
                                onClick={onExploreClick}
                                className={btnClasses}
                            >
                                <span>استكشف الورش الآن</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default Hero;
