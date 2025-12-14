
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

  const locationTypeClasses = {
    'أونلاين': 'bg-sky-50 text-sky-700 border-sky-200',
    'حضوري': 'bg-amber-50 text-amber-700 border-amber-200',
    'مسجلة': 'bg-violet-50 text-violet-700 border-violet-200',
    'أونلاين وحضوري': 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const priceToDisplay = workshop.price ?? (workshop.packages?.[0]?.price);

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/10 hover:border-purple-300 group overflow-hidden shadow-md"
    >
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex justify-start mb-2">
            <span className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full border ${locationTypeClasses[workshop.location]}`}>
                {workshop.location}
            </span>
        </div>
        <div className="text-center min-h-[4.5rem] sm:min-h-[5.5rem] flex flex-col justify-center items-center">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-purple-800 transition-colors">{workshop.title}</h3>
            <div className="flex items-center justify-center gap-x-2 text-slate-500 text-xs mt-3 sm:mt-4 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <AcademicCapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                <span className="font-semibold">{workshop.instructor}</span>
            </div>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-grow bg-white">
        <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
          <div className="flex items-center gap-x-3 text-slate-600">
            <GlobeAltIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
            <span>{locationDisplay}</span>
          </div>
          {!workshop.isRecorded && (
            <>
              <div className="flex items-center gap-x-3 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <span className="font-medium">{dateDisplay}</span>
              </div>
              <div className="flex items-center gap-x-3 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <span className="font-medium">{formatArabicTime(workshop.startTime)}{workshop.endTime ? ` - ${formatArabicTime(workshop.endTime)}` : ''}</span>
              </div>
            </>
          )}
          {workshop.isRecorded && (
             <div className="flex items-center gap-x-3 text-slate-600">
                <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                <span>متاحة للمشاهدة فور الاشتراك</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="p-4 sm:p-5 border-t border-slate-100 mt-auto bg-slate-50">
        {isSubscribed ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-x-2 text-emerald-600 font-bold text-xs sm:text-sm bg-emerald-50 px-2 sm:px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>أنت مشترك</span>
            </div>
            <button 
              onClick={handleOpenDetails} 
              className="bg-white border-2 border-purple-500 text-purple-600 font-bold py-1.5 px-4 sm:py-2 sm:px-5 rounded-xl transition-all duration-300 hover:bg-purple-600 hover:text-white text-xs sm:text-sm shadow-sm hover:shadow-md"
            >
              عرض التفاصيل
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            {workshop.location === 'حضوري' || workshop.location === 'أونلاين وحضوري' ? (
              <div className="text-xs sm:text-sm text-purple-700 font-bold bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200">باقات متعددة</div>
            ) : priceToDisplay !== undefined ? (
              <div className="flex items-center gap-x-1">
                <TagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <span className="text-xl sm:text-2xl font-black text-slate-800">{priceToDisplay}</span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold mt-1">درهم</span>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-500 font-medium">التفاصيل بالداخل</div>
            )}
            <button 
              onClick={handleOpenDetails} 
              className="bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-700 hover:to-pink-500 text-white font-bold py-2 px-5 sm:py-2.5 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-900/30 hover:shadow-pink-500/30 text-xs sm:text-sm border border-fuchsia-500/20"
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
