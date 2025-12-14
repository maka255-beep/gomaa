import React, { useState, useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import { Review } from '../../types';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { TrashIcon, RestoreIcon, StarIcon } from '../../components/icons';
import { formatArabicDate } from '../../utils';
import { useAdminTranslation } from './AdminTranslationContext';

interface ReviewWithWorkshop extends Review {
  workshopTitle: string;
}

interface ReviewManagementPageProps {
  showToast: (message: string) => void;
}

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="w-5 h-5 text-yellow-400" filled={i < rating} />
        ))}
    </div>
);

const ReviewManagementPage: React.FC<ReviewManagementPageProps> = ({ showToast }) => {
  const { workshops, deleteReview, restoreReview, permanentlyDeleteReview } = useUser();
  const { t } = useAdminTranslation();
  const [currentTab, setCurrentTab] = useState<'active' | 'trash'>('active');
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const allReviews = useMemo((): ReviewWithWorkshop[] => {
    return workshops.flatMap(w => (w.reviews || []).map(r => ({ ...r, workshopTitle: w.title })));
  }, [workshops]);

  const activeReviews = useMemo(() => allReviews.filter(r => !r.isDeleted), [allReviews]);
  const trashedReviews = useMemo(() => allReviews.filter(r => r.isDeleted), [allReviews]);

  const handleSoftDelete = (review: ReviewWithWorkshop) => {
    setConfirmationState({
      isOpen: true,
      title: 'نقل إلى سلة المهملات',
      message: `هل أنت متأكد من نقل تقييم "${review.fullName}" إلى سلة المهملات؟`,
      onConfirm: () => {
        deleteReview(review.workshopId, review.id);
        showToast('تم نقل التقييم إلى سلة المهملات.');
        closeConfirmationModal();
      },
    });
  };
  
  const handleRestore = (review: ReviewWithWorkshop) => {
    restoreReview(review.workshopId, review.id);
    showToast('تم استعادة التقييم.');
  };
  
  const handlePermanentDelete = (review: ReviewWithWorkshop) => {
    setConfirmationState({
      isOpen: true,
      title: 'حذف نهائي',
      message: `هل أنت متأكد من حذف تقييم "${review.fullName}" نهائياً؟`,
      onConfirm: () => {
        permanentlyDeleteReview(review.workshopId, review.id);
        showToast('تم حذف التقييم نهائياً.');
        closeConfirmationModal();
      },
    });
  };

  const closeConfirmationModal = () => setConfirmationState(prev => ({ ...prev, isOpen: false }));

  const tabButtonClasses = (tab: 'active' | 'trash') => 
    `px-4 py-2 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-x-2 ${
      currentTab === tab 
        ? 'bg-slate-800/50 text-white border-b-2 border-fuchsia-500' 
        : 'text-slate-400 hover:bg-slate-800/20 hover:text-white'
    }`;
    
  const actionButtonClasses = "p-2 rounded-md transition-colors text-slate-300";
  
  const reviewsToDisplay = currentTab === 'active' ? activeReviews : trashedReviews;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">إدارة آراء المشتركات</h2>

      <div className="border-b border-slate-700/50">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button onClick={() => setCurrentTab('active')} className={tabButtonClasses('active')}>
            الآراء النشطة ({activeReviews.length})
          </button>
          <button onClick={() => setCurrentTab('trash')} className={tabButtonClasses('trash')}>
            <TrashIcon className="w-4 h-4" />
            سلة المهملات ({trashedReviews.length})
          </button>
        </nav>
      </div>

      <div className="overflow-x-auto bg-black/20 rounded-b-lg border border-t-0 border-slate-700/50">
        <table className="min-w-full text-sm text-white">
          <thead className="text-fuchsia-300 uppercase text-xs">
            <tr className="border-b border-slate-700/50 bg-black/20">
              <th className="py-4 px-3 text-right">الاسم</th>
              <th className="py-4 px-3 text-right">الورشة</th>
              <th className="py-4 px-3 text-right">التعليق</th>
              <th className="py-4 px-3 text-center">التقييم</th>
              <th className="py-4 px-3 text-center">التاريخ</th>
              <th className="py-4 px-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {reviewsToDisplay.map(review => (
              <tr key={review.id} className="hover:bg-fuchsia-500/10">
                <td className="py-4 px-3 font-semibold">{review.fullName}</td>
                <td className="py-4 px-3">{review.workshopTitle}</td>
                <td className="py-4 px-3 max-w-sm truncate">{review.comment}</td>
                <td className="py-4 px-3"><RatingStars rating={review.rating} /></td>
                <td className="py-4 px-3 whitespace-nowrap">{formatArabicDate(review.date)}</td>
                <td className="py-4 px-3">
                  <div className="flex items-center justify-center gap-x-2">
                    {currentTab === 'active' ? (
                      <button onClick={() => handleSoftDelete(review)} className={`${actionButtonClasses} hover:bg-red-500/20 hover:text-red-400`} title="نقل إلى سلة المهملات"><TrashIcon className="w-5 h-5"/></button>
                    ) : (
                      <>
                        <button onClick={() => handleRestore(review)} className={`${actionButtonClasses} hover:bg-green-500/20 hover:text-green-400`} title="استعادة"><RestoreIcon className="w-5 h-5"/></button>
                        <button onClick={() => handlePermanentDelete(review)} className={`${actionButtonClasses} hover:bg-red-500/20 hover:text-red-400`} title="حذف نهائي"><TrashIcon className="w-5 h-5"/></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {reviewsToDisplay.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد تقييمات في هذا القسم.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <ConfirmationModal {...confirmationState} onClose={closeConfirmationModal} />
    </div>
  );
};

export default ReviewManagementPage;