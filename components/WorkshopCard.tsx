
import React from 'react';
import { Workshop, User, SubscriptionStatus } from '../types';
import { formatArabicDate, formatArabicTime } from '../utils';
import { CalendarIcon, GlobeAltIcon, TagIcon, AcademicCapIcon, CheckCircleIcon, VideoIcon, ClockIcon } from './icons';

interface WorkshopCardProps {
  workshop: Workshop;
  user: User | null;
  onEnroll: (workshopId: number, selectedPackageId?: number) => void;
  onOpenDetails: (workshopId: number) => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, user, onEnroll, onOpenDetails }) => {

  const handleOpenDetails = () => {
    onOpenDetails(workshop.id);
  }

  const dateDisplay = workshop.endDate 
    ? `من ${formatArabicDate(workshop.startDate)} إلى ${formatArabicDate(workshop.endDate)}`
    : formatArabicDate(workshop.startDate);
    
  let locationDisplay;
  if (workshop.location === 'حضوري' || workshop.location === 'أونلاين وحضوري') {
      locationDisplay = [workshop.hotelName, workshop.city, workshop.country].filter(Boolean).join(', ');
  } else if (workshop.location === 'أونلاين') {
      locationDisplay = workshop.application ? `أونلاين عبر ${workshop.application}` : 'أونلاين';
  } else { // مسجلة
      locationDisplay = `${workshop.location}, ${workshop.country}`;
  }

  const isSubscribed = user?.subscriptions.some(sub => 
    sub.workshopId === workshop.id && 
    sub.status !== SubscriptionStatus.REFUNDED &&
    !sub.isPayItForwardDonation
  );

  // Light Theme Badges with Theme Colors
  const locationTypeClasses = {
    'أونلاين': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'حضوري': 'bg-amber-50 text-amber-700 border-amber-100',
    'مسجلة': 'bg-rose-50 text-rose-700 border-rose-100',
    'أونلاين وحضوري': 'bg-purple-50 text-purple-700 border-purple-100',
  };

  const priceToDisplay = workshop.price ?? (workshop.packages?.[0]?.price);

  // Update Icon Color to match site accent (Fuchsia/Pink)
  const iconColorClass = "text-[#db2777]";

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col h-full transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#db2777]/20 hover:border-[#db2777]/30 group overflow-hidden"
    >
      {/* Card Header - Light Background */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-start mb-2">
            <span className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full border ${locationTypeClasses[workshop.location]}`}>
                {workshop.location}
            </span>
        </div>
        <div className="text-center min-h-[4.5rem] sm:min-h-[5.5rem] flex flex-col justify-center items-center">
            {/* Title updated to Dark Purple */}
            <h3 className="text-base sm:text-lg font-bold text-[#2e1065] leading-snug group-hover:text-[#db2777] transition-colors">{workshop.title}</h3>
            <div className="flex items-center justify-center gap-x-2 text-slate-600 text-xs sm:text-sm mt-3 sm:mt-4 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                <AcademicCapIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconColorClass}`} />
                <span className="font-semibold text-slate-700">{workshop.instructor}</span>
            </div>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-grow">
        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <div className="flex items-start gap-x-3">
            <GlobeAltIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColorClass} flex-shrink-0 mt-0.5`} />
            <span className="font-medium leading-tight">{locationDisplay}</span>
          </div>
          {!workshop.isRecorded && (
            <>
              <div className="flex items-start gap-x-3">
                <CalendarIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColorClass} flex-shrink-0 mt-0.5`} />
                <span className="font-medium leading-tight">{dateDisplay}</span>
              </div>
              <div className="flex items-start gap-x-3">
                <ClockIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColorClass} flex-shrink-0 mt-0.5`} />
                <span className="font-medium leading-tight">{formatArabicTime(workshop.startTime)}{workshop.endTime ? ` - ${formatArabicTime(workshop.endTime)}` : ''}</span>
              </div>
            </>
          )}
          {workshop.isRecorded && (
             <div className="flex items-start gap-x-3">
                <VideoIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColorClass} flex-shrink-0 mt-0.5`} />
                <span className="font-medium leading-tight">متاحة للمشاهدة فور الاشتراك</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="p-4 sm:p-5 border-t border-slate-100 mt-auto bg-slate-50/50">
        {isSubscribed ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-x-2 text-emerald-600 font-bold text-xs sm:text-sm bg-emerald-50 px-2 sm:px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>أنت مشترك</span>
            </div>
            <button 
              onClick={handleOpenDetails} 
              className="bg-white border border-[#db2777]/30 text-[#db2777] font-bold py-1.5 px-4 sm:py-2 sm:px-5 rounded-xl transition-all duration-300 hover:bg-pink-50 hover:border-[#db2777] text-xs sm:text-sm shadow-sm"
            >
              عرض التفاصيل
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            {workshop.location === 'حضوري' || workshop.location === 'أونلاين وحضوري' ? (
              <div className="text-xs sm:text-sm text-[#db2777] font-bold bg-pink-50 px-3 py-1.5 rounded-lg border border-pink-100">باقات متعددة</div>
            ) : priceToDisplay !== undefined ? (
              <div className="flex items-center gap-x-1">
                <TagIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColorClass} flex-shrink-0`} />
                {/* Price updated to Dark Purple */}
                <span className="text-xl sm:text-2xl font-black text-[#2e1065]">{priceToDisplay}</span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold mt-1">درهم</span>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-500 font-medium">التفاصيل بالداخل</div>
            )}
            <button 
              onClick={handleOpenDetails} 
              className="bg-gradient-to-r from-[#2e1065] to-[#db2777] hover:from-[#1e0b4b] hover:to-[#be185d] text-white font-bold py-2 px-5 sm:py-2.5 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-200 hover:shadow-purple-300 text-xs sm:text-sm"
            >
              التفاصيل
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopCard;
