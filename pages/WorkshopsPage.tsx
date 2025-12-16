
import React, { useState, useMemo } from 'react';
import { Workshop } from '../types';
import WorkshopCard from '../components/WorkshopCard';
import LiveStreamCard from '../components/LiveStreamCard';
import Hero from '../components/Hero';
import { useUser } from '../context/UserContext';
import { isWorkshopExpired } from '../utils';
import HowToAttendModal from '../components/HowToAttendModal';

interface WorkshopsPageProps {
  onLiveStreamLoginRequest: () => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenWorkshopDetails: (workshopId: number | null) => void;
  onZoomRedirect: (zoomLink: string, workshopId: number) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

const WorkshopsPage: React.FC<WorkshopsPageProps> = ({ 
    onLiveStreamLoginRequest, 
    onScrollToSection, 
    onOpenWorkshopDetails, 
    onZoomRedirect,
    showToast
}) => {
  const { currentUser: user, workshops } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'أونلاين' | 'حضوري' | 'مسجلة' | 'أونلاين وحضوري'>('all');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  const visibleWorkshops = workshops.filter(w => w.isVisible);

  const filteredAndSearchedWorkshops = useMemo(() => {
    return visibleWorkshops
      .filter(workshop => {
        if (activeFilter === 'all') return true;
        return workshop.location === activeFilter;
      })
      .filter(workshop => {
        if (!searchTerm.trim()) return true;
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        return (
          workshop.title.toLowerCase().includes(lowercasedTerm) ||
          workshop.instructor.toLowerCase().includes(lowercasedTerm)
        );
      });
  }, [visibleWorkshops, activeFilter, searchTerm]);

  const newWorkshops = filteredAndSearchedWorkshops.filter(w => !w.isRecorded && !isWorkshopExpired(w));
  const recordedWorkshops = filteredAndSearchedWorkshops.filter(w => w.isRecorded);

  // LOGIC UPDATE: Prioritize any workshop with a Zoom Link (Active Live) regardless of date.
  // If no link exists, fall back to the nearest upcoming unexpired workshop.
  const liveStreamWorkshop = useMemo(() => {
      // 1. Find a workshop with an active link (Manual Override)
      const activeLinkWorkshop = visibleWorkshops.find(w => !w.isRecorded && w.zoomLink);
      if (activeLinkWorkshop) return activeLinkWorkshop;

      // 2. Fallback: Find the nearest upcoming workshop that hasn't expired
      return visibleWorkshops
        .filter(w => !w.isRecorded && !isWorkshopExpired(w))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] || null;
  }, [visibleWorkshops]);

  const filters: Array<'all' | 'أونلاين' | 'حضوري' | 'مسجلة' | 'أونلاين وحضوري'> = ['all', 'أونلاين', 'حضوري', 'مسجلة'];
  const filterLabels = {
    'all': 'الكل',
    'أونلاين': 'أونلاين',
    'حضوري': 'حضوري',
    'أونلاين وحضوري': 'أونلاين وحضوري',
    'مسجلة': 'مسجلة'
  };


  return (
    <>
      <Hero 
        onExploreClick={() => onScrollToSection('workshops_section')} 
        onOpenWorkshopDetails={onOpenWorkshopDetails} 
      />
      
      <div className="container mx-auto px-4 py-8">
        
        {liveStreamWorkshop && (
          <div id="live_stream_card">
            <LiveStreamCard 
                workshopTitle={liveStreamWorkshop.title} 
                workshopId={liveStreamWorkshop.id}
                zoomLink={liveStreamWorkshop.zoomLink} 
                user={user} 
                onLoginRequest={onLiveStreamLoginRequest}
                onZoomRedirect={onZoomRedirect}
                onShowToast={showToast}
                onShowHelp={() => setIsHelpModalOpen(true)}
            />
          </div>
        )}
        
        {/* Search and Filter UI - Reverted to White/Light Theme */}
        <div id="workshops_section" className="my-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-4 relative z-10">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="ابحث عن ورشة أو مدرب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pr-10 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all shadow-inner"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 bg-white/80 p-1.5 rounded-lg border border-slate-200">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-300 ${activeFilter === filter ? 'bg-gradient-to-r from-purple-800 to-pink-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {filterLabels[filter]}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {(filteredAndSearchedWorkshops.length === 0) ? (
             <div className="text-center text-lg sm:text-2xl text-slate-300 bg-white/5 py-16 rounded-xl border border-white/10">
              {searchTerm || activeFilter !== 'all'
                ? 'عفواً، لم نجد ورشات تطابق بحثك. حاول بكلمات أخرى.'
                : 'انتظرونا قريبا...'
              }
            </div>
        ) : (
          <>
            {newWorkshops.length > 0 && (
              <section id="live_events" className="mb-12 sm:mb-16 text-right">
                <div className="relative mb-8">
                  <h2 className="text-xl font-bold text-white pb-2 tracking-wider inline-flex items-center gap-2">
                    <span className="w-1.5 h-8 bg-fuchsia-600 rounded-full"></span>
                    الورش المباشرة
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {newWorkshops.map(workshop => (
                    <WorkshopCard key={workshop.id} workshop={workshop} user={user} onEnroll={() => {}} onOpenDetails={onOpenWorkshopDetails} />
                  ))}
                </div>
              </section>
            )}

            {recordedWorkshops.length > 0 && (
              <section id="record_events" className="text-right">
                <div className="relative mb-8">
                  <h2 className="text-xl font-bold text-white pb-2 tracking-wider inline-flex items-center gap-2">
                    <span className="w-1.5 h-8 bg-violet-600 rounded-full"></span>
                    الورش المسجلة
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {recordedWorkshops.map(workshop => (
                    <WorkshopCard key={workshop.id} workshop={workshop} user={user} onEnroll={() => {}} onOpenDetails={onOpenWorkshopDetails} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      <HowToAttendModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </>
  );
};

export default WorkshopsPage;
