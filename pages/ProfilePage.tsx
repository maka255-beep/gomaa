
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Workshop, Subscription, User, NoteResource, Recording, ConsultationRequest, SubscriptionStatus } from '../types';
import { CloseIcon, VideoIcon, CalendarIcon, ChevronDownIcon, EyeIcon, AcademicCapIcon, UserCircleIcon, LightBulbIcon, DocumentTextIcon, StarIcon, ChatBubbleLeftRightIcon, CreditCardIcon, ShieldCheckIcon, TrashIcon, PencilIcon, GlobeAltIcon, ReceiptTaxIcon, CheckCircleIcon, InformationCircleIcon, EnvelopeIcon, PhoneIcon, MusicalNoteIcon } from '../components/icons';
import { useUser } from '../context/UserContext';
import { formatArabicDate, formatArabicTime, isWorkshopExpired } from '../utils';
import { generateCertificate } from '../components/DynamicCertificateRenderer';
import { GoogleGenAI, Type } from '@google/genai';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { trackEvent } from '../analytics';
import RecordingStatsModal from '../components/RecordingStatsModal';


interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
  onZoomRedirect: (zoomLink: string, workshopId: number) => void;
  onPlayRecording: (workshop: Workshop, recording: Recording, index: number) => void;
  onViewAttachment: (note: NoteResource) => void;
  onViewRecommendedWorkshop: (workshopId: number) => void;
  user?: User | null;
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  onPayForConsultation: (consultation: ConsultationRequest) => void;
  onViewInvoice: (details: { user: User; subscription: Subscription }) => void;
}

type RecordingStatus = 'AVAILABLE' | 'NOT_YET_AVAILABLE' | 'EXPIRED';
type ProfileView = 'my_workshops' | 'recommendations';

interface RecordingAccess {
  status: RecordingStatus;
  startDate?: string;
  endDate?: string;
}

const checkRecordingAccess = (recording: Recording, subscription: Subscription): RecordingAccess => {
  const now = new Date();
  
  const override = subscription.recordingAccessOverrides?.[recording.url];
  
  const startDateString = override?.accessStartDate || recording.accessStartDate;
  const endDateString = override?.accessEndDate || recording.accessEndDate;

  const startDate = startDateString ? new Date(startDateString) : null;
  const endDate = endDateString ? new Date(endDateString) : null;

  // Make sure to compare dates only, ignoring time, by setting hours to 0.
  if (startDate) startDate.setHours(0, 0, 0, 0);
  
  // Set end date to the very end of the day.
  if (endDate) endDate.setHours(23, 59, 59, 999);

  if (startDate && now < startDate) {
      return { status: 'NOT_YET_AVAILABLE', startDate: startDateString, endDate: endDateString };
  }
  if (endDate && now > endDate) {
      return { status: 'EXPIRED', startDate: startDateString, endDate: endDateString };
  }
  return { status: 'AVAILABLE', startDate: startDateString, endDate: endDateString };
};


type Recommendation = {
  workshop: Workshop;
  reason: string;
};

const AddReviewForm: React.FC<{ workshopId: number; onReviewAdded: () => void }> = ({ workshopId, onReviewAdded }) => {
  const { currentUser, addReview } = useUser();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('يرجى اختيار تقييم (من 1 إلى 5 نجوم).');
      return;
    }
    if (!comment.trim()) {
      setError('يرجى كتابة تعليقك.');
      return;
    }
    setError('');
    if (currentUser) {
      addReview(workshopId, {
        fullName: currentUser.fullName,
        rating,
        comment,
      });
      trackEvent('add_review', { workshopId, rating }, currentUser);
      onReviewAdded();
      // Reset form visually
      setRating(0);
      setComment('');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/20">
      <h5 className="font-bold text-fuchsia-300 mb-3">أضف تقييمك</h5>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">تقييمك:</label>
          <div className="flex items-center gap-x-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
                aria-label={`Rate ${star} stars`}
              >
                <StarIcon
                  className={`w-8 h-8 transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-300'
                  }`}
                  filled={star <= rating}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor={`comment-${workshopId}`} className="block text-sm font-medium text-slate-300 mb-2">
            تعليقك:
          </label>
          <textarea
            id={`comment-${workshopId}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500 text-sm"
            placeholder="شاركنا رأيك في الورشة..."
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full bg-theme-gradient-btn text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
        >
          إرسال التقييم
        </button>
      </form>
    </div>
  );
};

const ProfilePage: React.FC<ProfilePageProps> = ({ isOpen, onClose, user, onZoomRedirect, onPlayRecording, onViewAttachment, onViewRecommendedWorkshop, showToast, onPayForConsultation, onViewInvoice }) => {
    // REMOVED updateSubscription from destructuring as it's no longer available in UserContextType
    const { workshops, currentUser: loggedInUser, addReview, consultationRequests, globalCertificateTemplate } = useUser();
    
    const [activeView, setActiveView] = useState<ProfileView>('my_workshops');
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);
    const [expandedWorkshopId, setExpandedWorkshopId] = useState<number | null>(null);
    const [isCreditHistoryVisible, setIsCreditHistoryVisible] = useState(false);
    const [comingSoonModalWorkshop, setComingSoonModalWorkshop] = useState<Workshop | null>(null);

    const subscriptions = useMemo(() => {
        return user?.subscriptions
            .filter(sub => 
                sub.isApproved !== false && 
                sub.status !== SubscriptionStatus.PENDING &&
                !sub.isPayItForwardDonation
            )
            .sort((a, b) => new Date(b.activationDate).getTime() - new Date(a.activationDate).getTime()) || [];
    }, [user]);
    
    const userConsultations = useMemo(() => {
        return consultationRequests
            .filter(req => req.userId === user?.id)
            .sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    }, [consultationRequests, user]);

    useEffect(() => {
        // Reset view when modal is opened for a new user
        setActiveView('my_workshops');
        setRecommendations([]);
        setExpandedWorkshopId(null);
    }, [user]);

    const handleGenerateRecs = async () => {
        if (!process.env.API_KEY) {
            showToast('خدمة الاقتراحات الذكية غير مفعلة حالياً.', 'warning');
            return;
        }

        setIsLoadingRecs(true);
        setRecommendations([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const subscribedWorkshopTitles = subscriptions.map(sub => workshops.find(w => w.id === sub.workshopId)?.title).filter(Boolean);
            const availableWorkshops = workshops.filter(w => w.isVisible && !w.isDeleted && !subscriptions.some(sub => sub.workshopId === w.id)).map(w => ({ id: w.id, title: w.title, topics: w.topics }));

            if (availableWorkshops.length === 0) {
                showToast('لا توجد ورشات جديدة لاقتراحها حالياً.', 'warning');
                setIsLoadingRecs(false);
                return;
            }

            const prompt = `بناءً على الورشات التي اشترك بها المستخدم سابقاً: [${subscribedWorkshopTitles.join(', ')}], رشح له 3 ورشات من القائمة التالية فقط: ${JSON.stringify(availableWorkshops)}. قدم الاقتراحات كقائمة JSON فقط, بدون أي نص إضافي.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                workshop_id: { type: Type.NUMBER },
                                reason: { type: Type.STRING }
                            }
                        }
                    }
                }
            });

            const resultJson = JSON.parse(response.text);
            const recs: Recommendation[] = resultJson.map((item: any) => ({
                workshop: workshops.find(w => w.id === item.workshop_id),
                reason: item.reason,
            })).filter((r: any) => r.workshop);
            setRecommendations(recs);

        } catch (error) {
            console.error('Error generating recommendations:', error);
            showToast('حدث خطأ أثناء توليد الاقتراحات.', 'error');
        } finally {
            setIsLoadingRecs(false);
        }
    };

    const handleReviewAdded = () => {
        showToast('تمت إضافة تقييمك بنجاح!', 'success');
    };

    const handleDownloadCertificate = (workshop: Workshop, user: User) => {
        if (!globalCertificateTemplate) {
            showToast('قالب الشهادة غير متاح حالياً.', 'warning');
            return;
        }
        generateCertificate(globalCertificateTemplate, workshop, user);
    };

    const handleLiveStreamClick = (workshop: Workshop) => {
        if (workshop.zoomLink) {
            onZoomRedirect(workshop.zoomLink, workshop.id);
        } else {
            setComingSoonModalWorkshop(workshop);
        }
    };

    if (!isOpen || !user) {
        return null;
    }
    
    const tabClass = (view: ProfileView) => `py-3 px-4 text-sm font-bold border-b-2 flex items-center gap-x-2 ${activeView === view ? 'text-white border-fuchsia-500' : 'text-slate-400 border-transparent hover:text-white'}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-theme-gradient text-slate-200 rounded-lg shadow-2xl w-full max-w-4xl border border-violet-500/50 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-violet-500/30 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">الملف الشخصي</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                </header>
                
                <div className="p-4 flex items-center gap-x-4 bg-black/10">
                    <UserCircleIcon className="w-12 h-12 text-fuchsia-400 flex-shrink-0"/>
                    <div>
                        <h3 className="text-lg font-bold text-white">{user.fullName}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-6 mt-1 text-sm text-slate-300">
                            <div className="flex items-center gap-x-2">
                                <EnvelopeIcon className="w-4 h-4 text-slate-400"/>
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <PhoneIcon className="w-4 h-4 text-slate-400"/>
                                <span>{user.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-b border-slate-700/50 flex-shrink-0">
                    <nav className="flex space-x-4 px-6">
                        <button onClick={() => setActiveView('my_workshops')} className={tabClass('my_workshops')}><AcademicCapIcon className="w-5 h-5"/><span>ورشاتي واستشاراتي</span></button>
                        <button onClick={() => setActiveView('recommendations')} className={tabClass('recommendations')}><LightBulbIcon className="w-5 h-5"/><span>ورشات مقترحة لك</span></button>
                    </nav>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-8">
                    {activeView === 'my_workshops' ? (
                        <>
                           {/* Subscribed Workshops Section */}
                           <section>
                               <h3 className="text-base font-bold text-fuchsia-300 mb-4">الورش المشترك بها ({subscriptions.length})</h3>
                               <div className="flex flex-col">
                                   {subscriptions.map((sub, index) => {
                                       const workshop = workshops.find(w => w.id === sub.workshopId);
                                       if (!workshop) return null;

                                       const hasReview = workshop.reviews?.some(r => r.fullName === user.fullName);
                                       const canAddReview = isWorkshopExpired(workshop) && !hasReview;
                                       const isExpanded = expandedWorkshopId === workshop.id;
                                       
                                        let dateValue;
                                        if (workshop.isRecorded) {
                                            dateValue = null; 
                                        } else {
                                            dateValue = workshop.endDate 
                                                ? `من ${formatArabicDate(workshop.startDate)} إلى ${formatArabicDate(workshop.endDate)}` 
                                                : formatArabicDate(workshop.startDate);
                                        }

                                        let locationValue: string;
                                        if (workshop.location === 'حضوري' || workshop.location === 'أونلاين وحضوري') {
                                            locationValue = [workshop.hotelName, workshop.city, workshop.country].filter(Boolean).join(', ');
                                        } else if (workshop.location === 'أونلاين') {
                                            locationValue = workshop.application ? `أونلاين عبر ${workshop.application}` : 'أونلاين';
                                        } else { // مسجلة
                                            locationValue = workshop.location;
                                        }
                                        
                                        const showLiveStreamButton = !isWorkshopExpired(workshop) && (
                                            workshop.location === 'أونلاين' || 
                                            (workshop.location === 'أونلاين وحضوري' && sub.attendanceType === 'أونلاين')
                                        );

                                       return (
                                           <React.Fragment key={sub.id}>
                                               <div className={`bg-black/20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${isExpanded ? 'border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/10' : 'border-slate-700/50 hover:border-fuchsia-500/30'}`}>
                                                   <button onClick={() => setExpandedWorkshopId(isExpanded ? null : workshop.id)} className="w-full p-4 text-right flex justify-between items-center hover:bg-fuchsia-500/10 transition-colors">
                                                       <span className="font-bold text-white">{workshop.title}</span>
                                                       <div className="flex items-center gap-x-4">
                                                            {showLiveStreamButton && sub.attended && (
                                                                <span className="flex items-center gap-x-1 bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded-full">
                                                                    <CheckCircleIcon className="w-4 h-4" />
                                                                    <span>تم الحضور</span>
                                                                </span>
                                                            )}
                                                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </div>
                                                   </button>
                                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1500px]' : 'max-h-0'}`}>
                                                        <div className="p-4 space-y-6 border-t-2 border-slate-700/50">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-fuchsia-300 mb-3 text-right">تفاصيل الورشة</h4>
                                                                <div className="space-y-3 text-sm text-slate-300 bg-black/20 p-3 rounded-md">
                                                                    {!workshop.isRecorded && dateValue && (
                                                                        <div className="flex items-center justify-start gap-x-3">
                                                                            <CalendarIcon className="w-5 h-5 text-fuchsia-400 flex-shrink-0"/>
                                                                            <p className="font-semibold text-white">{dateValue}</p>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center justify-start gap-x-3">
                                                                        <GlobeAltIcon className="w-5 h-5 text-fuchsia-400 flex-shrink-0"/>
                                                                        <p className="font-semibold text-white">{locationValue}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="text-sm font-bold text-fuchsia-300 mb-3 text-right">محتويات الورشة</h4>
                                                                <div className="space-y-4">
                                                                    {showLiveStreamButton && (
                                                                        <div>
                                                                            <button 
                                                                                onClick={() => handleLiveStreamClick(workshop)} 
                                                                                className="w-full flex items-center gap-x-4 p-4 text-right rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-transparent hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] group"
                                                                            >
                                                                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-400 flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                                                                                    <VideoIcon className="w-6 h-6"/>
                                                                                </div>
                                                                                <div className="flex-grow">
                                                                                    <span className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
                                                                                        الدخول إلى البث المباشر عبر ZOOM
                                                                                    </span>
                                                                                </div>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {workshop.recordings?.map((rec, index) => {
                                                                        const access = checkRecordingAccess(rec, sub);
                                                                        const disabled = access.status !== 'AVAILABLE';
                                                                        
                                                                        let dateString = '';
                                                                        if (access.status === 'NOT_YET_AVAILABLE' && access.startDate) {
                                                                            dateString = `سيكون متاحاً في: ${formatArabicDate(access.startDate)}`;
                                                                        } else if (access.status === 'EXPIRED' && access.endDate) {
                                                                            dateString = `انتهت صلاحية المشاهدة في: ${formatArabicDate(access.endDate)}`;
                                                                        } else if (access.status === 'AVAILABLE') {
                                                                            if (access.startDate && access.endDate) {
                                                                                dateString = `متاح من ${formatArabicDate(access.startDate)} إلى ${formatArabicDate(access.endDate)}`;
                                                                            } else if (access.endDate) {
                                                                                dateString = `متاح حتى: ${formatArabicDate(access.endDate)}`;
                                                                            } else {
                                                                                dateString = "غير متاحة حاليا";
                                                                            }
                                                                        }

                                                                        return (
                                                                            <div key={index} className="space-y-2">
                                                                                <button onClick={() => onPlayRecording(workshop, rec, index)} disabled={disabled} className="w-full flex items-center gap-x-4 p-4 text-right rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-transparent hover:border-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed group">
                                                                                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-500/10 text-purple-400 flex-shrink-0 group-hover:bg-purple-500/20 transition-colors"><VideoIcon className="w-6 h-6"/></div>
                                                                                    <div className="flex-grow"><span className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">مشاهدة: {rec.name}</span></div>
                                                                                </button>
                                                                                {dateString && (
                                                                                    <div className="mt-2 text-xs text-yellow-400 flex items-center gap-x-2 pr-16">
                                                                                        <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                                                                                        <span className="font-semibold">{dateString}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    {workshop.notes?.map((note, index) => (
                                                                        <button key={index} onClick={() => onViewAttachment(note)} className="w-full flex items-center gap-x-4 p-4 text-right rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-transparent hover:border-green-500/50 transition-all duration-300 transform hover:scale-[1.02] group">
                                                                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500/10 text-green-400 flex-shrink-0 group-hover:bg-green-500/20 transition-colors"><DocumentTextIcon className="w-6 h-6"/></div>
                                                                            <div className="flex-grow"><span className="font-bold text-white text-base group-hover:text-green-300 transition-colors">{note.name}</span></div>
                                                                        </button>
                                                                    ))}
                                                                    {workshop.mediaFiles && workshop.mediaFiles.length > 0 && workshop.mediaFiles.map((media, index) => (
                                                                        <div key={index} className="p-4 rounded-lg bg-slate-800/70 border border-transparent hover:border-teal-500/50 transition-colors duration-300">
                                                                            <div className="w-full flex items-center gap-x-4 text-right">
                                                                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-500/10 text-teal-400 flex-shrink-0">
                                                                                    {media.type === 'audio' ? <MusicalNoteIcon className="w-6 h-6"/> : <VideoIcon className="w-6 h-6"/>}
                                                                                </div>
                                                                                <div className="flex-grow"><span className="font-bold text-white text-base">{media.name}</span></div>
                                                                            </div>
                                                                            <div className="mt-3 px-1">
                                                                                {media.type === 'audio' ? (
                                                                                    <audio controls src={media.value} className="w-full h-10">متصفحك لا يدعم تشغيل الصوت.</audio>
                                                                                ) : (
                                                                                    <video controls src={media.value} className="w-full rounded-md">متصفحك لا يدعم تشغيل الفيديو.</video>
                                                                                )}
                                                                            </div>
                                                                            {media.notes && (
                                                                                <p className="mt-2 text-sm text-slate-400 whitespace-pre-wrap px-1">{media.notes}</p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {workshop.certificatesIssued && (
                                                                        <button onClick={() => handleDownloadCertificate(workshop, user)} className="w-full flex items-center gap-x-4 p-4 text-right rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-transparent hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-[1.02] group">
                                                                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400 flex-shrink-0 group-hover:bg-yellow-500/20 transition-colors"><AcademicCapIcon className="w-6 h-6"/></div>
                                                                            <div className="flex-grow"><span className="font-bold text-white text-base group-hover:text-yellow-300 transition-colors">الحصول على شهادة إتمام الورشة</span></div>
                                                                        </button>
                                                                    )}
                                                                    <button onClick={() => onViewInvoice({ user, subscription: sub })} className="w-full flex items-center gap-x-4 p-4 text-right rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-transparent hover:border-teal-500/50 transition-all duration-300 transform hover:scale-[1.02] group">
                                                                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-500/10 text-teal-400 flex-shrink-0 group-hover:bg-teal-500/20 transition-colors"><ReceiptTaxIcon className="w-6 h-6"/></div>
                                                                        <div className="flex-grow"><span className="font-bold text-white text-base group-hover:text-teal-300 transition-colors">عرض الفاتورة الضريبية</span></div>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            {canAddReview && <AddReviewForm workshopId={workshop.id} onReviewAdded={handleReviewAdded} />}
                                                        </div>
                                                    </div>
                                               </div>
                                               {index < subscriptions.length - 1 && (
                                                   <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                                               )}
                                           </React.Fragment>
                                       );
                                   })}
                               </div>
                           </section>
                           
                           {userConsultations.length > 0 && (
                               <section>
                                   <h3 className="text-base font-bold text-fuchsia-300 mb-4">طلبات الاستشارة ({userConsultations.length})</h3>
                                    <div className="space-y-3">
                                        {userConsultations.map(req => {
                                            const statusClasses: Record<ConsultationRequest['status'], string> = {
                                                NEW: 'bg-yellow-500/20 text-yellow-300', APPROVED: 'bg-sky-500/20 text-sky-300', PENDING_PAYMENT: 'bg-amber-500/20 text-amber-300', PAID: 'bg-teal-500/20 text-teal-300', COMPLETED: 'bg-green-500/20 text-green-300',
                                            };
                                            const statusNames: Record<ConsultationRequest['status'], string> = {
                                                NEW: 'جديد', APPROVED: 'بانتظار الدفع', PENDING_PAYMENT: 'بانتظار التأكيد', PAID: 'مدفوع', COMPLETED: 'مكتمل',
                                            };
                                            return (
                                                <div key={req.id} className="bg-black/20 p-4 rounded-lg border border-slate-700/50">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-white truncate max-w-sm">موضوع: {req.subject}</p>
                                                            <p className="text-xs text-slate-400">تاريخ الطلب: {formatArabicDate(req.requestedAt)}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses[req.status]}`}>{statusNames[req.status]}</span>
                                                    </div>
                                                    {(req.status === 'APPROVED' || req.status === 'PAID') && req.consultationDate && req.consultationTime && (
                                                        <div className="mt-3 pt-3 border-t border-slate-700 text-sm">
                                                            <p className="font-bold">موعدك المحدد:</p>
                                                            <p className="text-slate-300">{formatArabicDate(req.consultationDate)} - الساعة {formatArabicTime(req.consultationTime)}</p>
                                                        </div>
                                                    )}
                                                     {req.status === 'APPROVED' && (
                                                        <div className="mt-4 text-center">
                                                            <button onClick={() => onPayForConsultation(req)} className="bg-theme-gradient-btn text-white font-bold py-2 px-6 rounded-lg text-sm">
                                                                إتمام الدفع (رسوم {req.fee} درهم)
                                                            </button>
                                                        </div>
                                                     )}
                                                </div>
                                            );
                                        })}
                                    </div>
                               </section>
                           )}

                        </>
                    ) : (
                        <section>
                            {isLoadingRecs ? (
                                <div className="text-center p-8">
                                    <div role="status">
                                        <svg aria-hidden="true" className="inline w-8 h-8 text-slate-600 animate-spin fill-fuchsia-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-400">جاري توليد اقتراحات مخصصة لك...</p>
                                </div>
                            ) : recommendations.length > 0 ? (
                                <div className="space-y-4">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className="bg-black/20 p-4 rounded-lg border border-slate-700/50">
                                            <h4 className="font-bold text-white">{rec.workshop.title}</h4>
                                            <blockquote className="mt-2 border-r-4 border-fuchsia-500/50 pr-4 text-sm italic text-slate-300">
                                                "{rec.reason}"
                                            </blockquote>
                                            <div className="text-left mt-3">
                                                <button onClick={() => onViewRecommendedWorkshop(rec.workshop.id)} className="text-xs font-bold text-theme-secondary-accent hover:underline">عرض التفاصيل</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-black/20 rounded-lg">
                                    <h3 className="text-lg font-bold text-white">ورشات مقترحة لك</h3>
                                    <p className="text-sm text-slate-400 my-4">بناءً على اهتماماتك، سيقوم مساعدنا الذكي باقتراح ورشات جديدة قد تهمك. اضغط على الزر أدناه للبدء.</p>
                                    <button onClick={handleGenerateRecs} className="bg-theme-gradient-btn text-white font-bold py-2 px-6 rounded-lg">
                                        توليد الاقتراحات
                                    </button>
                                </div>
                            )}
                        </section>
                    )}

                </div>
            </div>

            {comingSoonModalWorkshop && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[70] p-4" onClick={() => setComingSoonModalWorkshop(null)}>
                    <div 
                        className="bg-theme-gradient text-slate-200 rounded-lg shadow-2xl w-full max-w-md border border-sky-500/50 relative flex flex-col text-center animate-chatbot-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-4 flex justify-between items-center border-b border-sky-500/30">
                            <h2 className="text-lg font-bold text-sky-300">تنبيه</h2>
                            <button onClick={() => setComingSoonModalWorkshop(null)} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                        </header>
                        <div className="p-8 space-y-4">
                            <InformationCircleIcon className="w-16 h-16 mx-auto text-theme-secondary-accent"/>
                            <h3 className="text-xl font-bold text-white">رابط البث المباشر سيظهر هنا قريباً</h3>
                            <p className="text-sm text-slate-300">
                                سيتم تفعيل رابط البث قبل موعد الورشة المحدد في {formatArabicDate(comingSoonModalWorkshop.startDate)} الساعة {formatArabicTime(comingSoonModalWorkshop.startTime)}.
                            </p>
                            <button onClick={() => setComingSoonModalWorkshop(null)} className="mt-4 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg text-sm">
                                حسناً
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`.z-70 { z-index: 70; }`}</style>
        </div>
    );
};

export default ProfilePage;
