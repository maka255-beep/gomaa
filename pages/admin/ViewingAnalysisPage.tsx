import React, { useMemo, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { PlayCircleIcon, ChartBarIcon, UserIcon, AcademicCapIcon } from '../../components/icons';
import { formatArabicDate } from '../../utils';
import { RecordingStats } from '../../types';

interface ViewingStat {
    user: { id: number; fullName: string; };
    workshop: { id: number; title: string; };
    recording: { name: string; url: string; };
    stats: RecordingStats;
}

const KpiCard: React.FC<{ title: string; value: string; icon: React.FC<{ className?: string }>; colorClass: string }> = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-x-4">
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${colorClass.replace('text-', 'bg-')}/10`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div>
            <p className="text-sm text-slate-400 font-bold">{title}</p>
            <p className="text-xl font-extrabold text-white mt-1">{value}</p>
        </div>
    </div>
);

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div 
            className="bg-gradient-to-r from-sky-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

const ViewingAnalysisPage: React.FC = () => {
    const { users, workshops } = useUser();
    const [workshopFilter, setWorkshopFilter] = useState('all');

    const allStats = useMemo((): ViewingStat[] => {
        const stats: ViewingStat[] = [];
        users.forEach(user => {
            if (user.isDeleted) return;
            user.subscriptions.forEach(sub => {
                if (sub.isApproved === false || !sub.recordingStats) return;
                
                const workshop = workshops.find(w => w.id === sub.workshopId);
                if (!workshop || !workshop.isRecorded || !workshop.recordings) return;
                
                workshop.recordings.forEach(rec => {
                    if (sub.recordingStats && sub.recordingStats[rec.url]) {
                        stats.push({
                            user: { id: user.id, fullName: user.fullName },
                            workshop: { id: workshop.id, title: workshop.title },
                            recording: { name: rec.name, url: rec.url },
                            stats: sub.recordingStats[rec.url],
                        });
                    }
                });
            });
        });
        return stats.sort((a,b) => new Date(b.stats.lastWatched || 0).getTime() - new Date(a.stats.lastWatched || 0).getTime());
    }, [users, workshops]);

    const filteredStats = useMemo(() => {
        if (workshopFilter === 'all') return allStats;
        const workshopId = parseInt(workshopFilter, 10);
        return allStats.filter(s => s.workshop.id === workshopId);
    }, [allStats, workshopFilter]);

    const kpiData = useMemo(() => {
        const source = filteredStats.length > 0 ? filteredStats : allStats;
        if (source.length === 0) {
            return { avgCompletion: 0, mostWatchedWorkshop: '-', uniqueViewers: 0 };
        }
        
        const totalProgress = source.reduce((sum, item) => sum + item.stats.progress, 0);
        const avgCompletion = totalProgress / source.length;
        
        const workshopViewCounts: Record<string, Set<number>> = {};
        source.forEach(item => {
            if (!workshopViewCounts[item.workshop.title]) {
                workshopViewCounts[item.workshop.title] = new Set();
            }
            workshopViewCounts[item.workshop.title].add(item.user.id);
        });
        
        const mostWatchedWorkshop = Object.entries(workshopViewCounts).sort((a, b) => b[1].size - a[1].size)[0]?.[0] || '-';

        const uniqueViewers = new Set(source.map(s => s.user.id)).size;

        return {
            avgCompletion,
            mostWatchedWorkshop,
            uniqueViewers,
        };
    }, [allStats, filteredStats]);


    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-x-3">
                <PlayCircleIcon className="w-7 h-7 text-sky-300" />
                <span>تحليل مشاهدات الورش المسجلة</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard title="متوسط نسبة الإكمال" value={`${kpiData.avgCompletion.toFixed(1)}%`} icon={ChartBarIcon} colorClass="text-sky-400" />
                <KpiCard title="الورشة الأكثر مشاهدة" value={kpiData.mostWatchedWorkshop} icon={AcademicCapIcon} colorClass="text-fuchsia-400" />
                <KpiCard title="إجمالي المشاهدين الفريدين" value={kpiData.uniqueViewers.toString()} icon={UserIcon} colorClass="text-emerald-400" />
            </div>

            <div className="bg-black/20 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-white">تفاصيل المشاهدات</h3>
                    <select
                        value={workshopFilter}
                        onChange={e => setWorkshopFilter(e.target.value)}
                        className="p-2 bg-indigo-900/40 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm font-bold text-white"
                    >
                        <option value="all">كل الورش</option>
                        {workshops.filter(w => w.isRecorded).map(w => (
                            <option key={w.id} value={w.id.toString()}>{w.title}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-center text-white">
                        <thead className="text-sky-300 uppercase tracking-wider font-bold text-xs">
                            <tr className="border-b-2 border-sky-500/30 bg-black/20">
                                <th className="py-3 px-3">المستخدم</th>
                                <th className="py-3 px-3">الورشة</th>
                                <th className="py-3 px-3">التسجيل</th>
                                <th className="py-3 px-3 w-40">نسبة الإكمال</th>
                                <th className="py-3 px-3">مرات التشغيل</th>
                                <th className="py-3 px-3">آخر مشاهدة</th>
                            </tr>
                        </thead>
                        <tbody className="font-semibold">
                            {filteredStats.map((item, index) => (
                                <tr key={index} className="border-b border-sky-500/20 hover:bg-sky-500/10 transition-colors">
                                    <td className="py-3 px-3">{item.user.fullName}</td>
                                    <td className="py-3 px-3">{item.workshop.title}</td>
                                    <td className="py-3 px-3 max-w-xs truncate">{item.recording.name}</td>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            <ProgressBar progress={item.stats.progress} />
                                            <span className="text-xs w-8 text-right">{Math.round(item.stats.progress)}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">{item.stats.playCount}</td>
                                    <td className="py-3 px-3">{item.stats.lastWatched ? formatArabicDate(item.stats.lastWatched) : '-'}</td>
                                </tr>
                            ))}
                            {filteredStats.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400">لا توجد بيانات مشاهدة متاحة.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewingAnalysisPage;