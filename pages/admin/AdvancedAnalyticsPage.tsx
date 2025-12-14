import React, { useState, useEffect } from 'react';
import { getEvents, ActivityEvent } from '../../analytics';
import { ArrowLeftOnRectangleIcon, ChartBarIcon, GlobeAltIcon, PlayCircleIcon, InformationCircleIcon, ChatBubbleIcon, WhatsAppIcon, VideoIcon, UserIcon } from '../../components/icons';
import { timeSince } from '../../utils';
import { useAdminTranslation } from './AdminTranslationContext';

interface AdvancedAnalyticsPageProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

const eventIcons: { [key: string]: React.FC<{className?: string}> } = {
    'login': ArrowLeftOnRectangleIcon,
    'register': UserIcon,
    'view_workshop_details': InformationCircleIcon,
    'play_recording': PlayCircleIcon,
    'add_review': ChatBubbleIcon,
    'contact_whatsapp': WhatsAppIcon,
    'zoom_redirect': VideoIcon,
};

const eventNames: { [key: string]: string } = {
    'login': 'سجل الدخول',
    'register': 'أنشأ حسابًا',
    'view_workshop_details': 'عرض تفاصيل ورشة',
    'play_recording': 'شاهد تسجيلاً',
    'add_review': 'أضاف تقييمًا',
    'contact_whatsapp': 'تواصل عبر واتساب',
    'zoom_redirect': 'انتقل إلى زووم',
};

const StatCard: React.FC<{ title: string; value: string; icon: React.FC<{className?: string}> }> = ({ title, value, icon: Icon }) => (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-x-4">
        <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-fuchsia-500/10">
            <Icon className="w-6 h-6 text-fuchsia-400" />
        </div>
        <div>
            <p className="text-sm text-slate-400 font-bold">{title}</p>
            <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
        </div>
    </div>
);

const AdvancedAnalyticsPage: React.FC<AdvancedAnalyticsPageProps> = ({ showToast }) => {
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const { t } = useAdminTranslation();

    useEffect(() => {
        const interval = setInterval(() => {
            setEvents(getEvents());
        }, 1000); // Poll for new events every second
        return () => clearInterval(interval);
    }, []);

    const topLocations = React.useMemo(() => {
        const locationCounts = events.reduce((acc, event) => {
            if (event.location) {
                acc[event.location] = (acc[event.location] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(locationCounts)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 5);
    }, [events]);

    const topActivities = React.useMemo(() => {
        const activityCounts = events.reduce((acc, event) => {
            const name = eventNames[event.type] || event.type;
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(activityCounts)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 5);
    }, [events]);

    const topActivityMaxCount = Number(topActivities[0]?.[1]) || 1;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-x-3">
                <ChartBarIcon className="w-7 h-7 text-fuchsia-300" />
                <span>{t('userActivity.title')}</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Top Activities */}
                    <div className="bg-black/20 p-6 rounded-xl border border-slate-700/50">
                        <h3 className="text-base font-bold text-white mb-4">الأنشطة الأكثر شيوعًا</h3>
                        <div className="space-y-3">
                            {topActivities.map(([name, count], index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>{name}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                        <div 
                                            className="bg-gradient-to-r from-sky-500 to-cyan-400 h-2.5 rounded-full" 
                                            style={{ width: `${(Number(count) / topActivityMaxCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {topActivities.length === 0 && <p className="text-center text-slate-400 py-4">لا توجد بيانات كافية.</p>}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Geographical Distribution */}
                    <div className="bg-black/20 p-6 rounded-xl border border-slate-700/50">
                        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-x-2"><GlobeAltIcon className="w-5 h-5"/> التوزيع الجغرافي (محاكاة)</h3>
                        <ul className="space-y-2">
                           {topLocations.map(([location, count]) => (
                             <li key={location} className="flex justify-between items-center text-sm font-semibold">
                               <span>{location}</span>
                               <span className="text-fuchsia-300">{count}</span>
                             </li>
                           ))}
                           {topLocations.length === 0 && <p className="text-center text-slate-400 py-4">لا توجد بيانات.</p>}
                        </ul>
                    </div>

                    {/* Live Activity Feed */}
                    <div className="bg-black/20 rounded-xl border border-slate-700/50 flex-grow flex flex-col">
                        <h3 className="text-base font-bold text-white p-4 border-b border-slate-700">سجل النشاط المباشر</h3>
                        <div className="overflow-y-auto p-4 space-y-4 max-h-96">
                             {events.slice(0, 20).map(event => {
                                 const Icon = eventIcons[event.type] || InformationCircleIcon;
                                 const eventName = eventNames[event.type] || event.type;
                                 return (
                                     <div key={event.id} className="flex items-start gap-x-3">
                                         <Icon className="w-5 h-5 mt-0.5 text-slate-400 flex-shrink-0" />
                                         <div className="flex-grow text-sm">
                                             <p><span className="font-bold text-white">{event.userName}</span> {eventName}</p>
                                             <p className="text-xs text-slate-500">{timeSince(event.timestamp)}</p>
                                         </div>
                                     </div>
                                 );
                             })}
                             {events.length === 0 && <p className="text-center text-slate-400 py-8">في انتظار أول نشاط...</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedAnalyticsPage;