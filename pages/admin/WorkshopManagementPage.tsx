import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { Workshop, SubscriptionStatus } from '../../types';
import { WorkshopForm } from '../../components/WorkshopForm';
import { formatArabicDate } from '../../utils';
import { TrashIcon, RestoreIcon, PencilIcon, PlusCircleIcon, DownloadIcon, ChevronDownIcon, PrintIcon, CloseIcon, CalendarIcon, UserCircleIcon } from '../../components/icons';
// FIX: Changed default import of ConfirmationModal to a named import.
import { ConfirmationModal } from '../../components/ConfirmationModal';
import WorkshopRecordingAccessModal from '../../components/WorkshopRecordingAccessModal';
import { useAdminTranslation } from './AdminTranslationContext';


type ViewTab = 'active' | 'trash';

declare const XLSX: any;

interface WorkshopManagementPageProps {
    showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
    onLoginAsUserId: (userId: number) => void;
}

const WorkshopManagementPage: React.FC<WorkshopManagementPageProps> = ({ showToast, onLoginAsUserId }) => {
  const { workshops, users, updateWorkshop, deleteWorkshop, restoreWorkshop, permanentlyDeleteWorkshop, addUser, addSubscription } = useUser();
  const { t } = useAdminTranslation();
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [editingAccessFor, setEditingAccessFor] = useState<Workshop | null>(null);
  const [currentTab, setCurrentTab] = useState<ViewTab>('active');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // For both mobile and desktop

  const activeWorkshops = workshops.filter(w => !w.isDeleted);
  const trashedWorkshops = workshops.filter(w => w.isDeleted);
  
  const workshopsToDisplay = currentTab === 'active' ? activeWorkshops : trashedWorkshops;
  const totalPages = Math.ceil(workshopsToDisplay.length / ITEMS_PER_PAGE);
  const paginatedWorkshops = workshopsToDisplay.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );
  
  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
  };

  const handleAddNew = () => {
    setEditingWorkshop({ isNew: true } as Workshop);
  };
  
  const handleToggleVisibility = (workshop: Workshop) => {
      updateWorkshop({ ...workshop, isVisible: !workshop.isVisible });
  };

  const handleSoftDelete = (workshop: Workshop) => {
    setConfirmationState({
        isOpen: true,
        title: 'نقل إلى سلة المهملات',
        message: `هل أنت متأكد من نقل ورشة "${workshop.title}" إلى سلة المهملات؟`,
        onConfirm: () => {
            deleteWorkshop(workshop.id);
            setConfirmationState(prev => ({ ...prev, isOpen: false }));
        },
    });
  };
  
  const handleRestore = (workshop: Workshop) => {
    restoreWorkshop(workshop.id);
  };

  const handlePermanentDelete = (workshop: Workshop) => {
      setConfirmationState({
          isOpen: true,
          title: 'تأكيد الحذف النهائي',
          message: `هل أنت متأكد من حذف ورشة "${workshop.title}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
          onConfirm: () => {
              permanentlyDeleteWorkshop(workshop.id);
              setConfirmationState(prev => ({ ...prev, isOpen: false }));
          },
      });
  };

  const handleTryAsParticipant = (workshop: Workshop) => {
    const adminEmail = 'admin@nawaya.com';
    let adminTester = users.find(u => u.email === adminEmail && !u.isDeleted);

    if (!adminTester) {
        adminTester = addUser('Admin Tester', adminEmail, '+971000000000');
        showToast('تم إنشاء حساب اختبار تلقائي.', 'success');
    }

    if (!adminTester) {
        showToast('فشل في إنشاء أو العثور على حساب الاختبار.', 'error');
        return;
    }
    
    // The user object from `users` will be up-to-date on re-render, so we can check it.
    const isSubscribed = adminTester.subscriptions.some(s => s.workshopId === workshop.id && s.status !== SubscriptionStatus.REFUNDED);

    if (!isSubscribed) {
        addSubscription(
            adminTester.id,
            {
                workshopId: workshop.id,
                paymentMethod: 'GIFT',
                pricePaid: 0,
                notes: 'Admin Test Subscription',
            },
            true,  // isApproved
            false // don't send whatsapp
        );
        showToast(`تم تسجيل حساب الاختبار في ورشة "${workshop.title}".`, 'success');
    }

    onLoginAsUserId(adminTester.id);
  };
  
  const handleExcelExport = () => {
    setIsExportMenuOpen(false);
    if (typeof XLSX === 'undefined') {
        alert('حدث خطأ أثناء تحميل مكتبة التصدير. يرجى المحاولة مرة أخرى.');
        return;
    }

    const dataToExport = (currentTab === 'active' ? activeWorkshops : trashedWorkshops).map(w => ({
      'عنوان الورشة': w.title,
      'المدرب': w.instructor,
      'تاريخ البدء': formatArabicDate(w.startDate),
      'نوع الورشة': w.location,
      'السعر': w.price || 'باقات',
      'عدد المشتركين': users.filter(u => u.subscriptions.some(s => s.workshopId === w.id)).length,
      'الحالة': w.isVisible ? 'مرئية' : 'مخفية',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Workshops');
    
    worksheet['!cols'] = [
      { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 }
    ];
    
    XLSX.writeFile(workbook, `Nawaya_Workshops_${currentTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const closeConfirmationModal = () => {
      setConfirmationState(prev => ({ ...prev, isOpen: false }));
  };
  
  const tabButtonClasses = (tabName: ViewTab) => 
    `px-4 py-2 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-x-2 ${
      currentTab === tabName 
        ? 'bg-slate-800/50 text-white border-b-2 border-fuchsia-500' 
        : 'text-slate-400 hover:bg-slate-800/20 hover:text-white'
    }`;
    
  const actionButtonClasses = "p-2 rounded-md transition-colors";
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-4 mt-6">
        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="py-2 px-4 rounded-md bg-slate-700/50 text-white font-bold text-sm disabled:opacity-50">السابق</button>
        <span className="text-white font-bold text-sm">صفحة {currentPage} من {totalPages}</span>
        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="py-2 px-4 rounded-md bg-slate-700/50 text-white font-bold text-sm disabled:opacity-50">التالي</button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white">{t('workshopManagement.title')}</h2>
        <div className="flex items-center gap-x-4">
            <div className="relative" ref={exportMenuRef}>
                <button
                    onClick={() => setIsExportMenuOpen(prev => !prev)}
                    className="flex items-center gap-x-2 bg-slate-700/70 hover:bg-slate-600/70 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">{t('workshopManagement.export')}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
                {isExportMenuOpen && (
                    <div className="absolute left-0 mt-2 w-40 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10">
                        <ul>
                            <li><button onClick={handleExcelExport} className="w-full text-right px-4 py-2 text-sm text-white font-bold hover:bg-fuchsia-500/20 flex items-center gap-x-2"><DownloadIcon className="w-4 h-4" /><span>EXCEL</span></button></li>
                        </ul>
                    </div>
                )}
            </div>
            <button 
                onClick={handleAddNew}
                className="flex items-center gap-x-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-3 rounded-lg text-sm"
            >
                <PlusCircleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('workshopManagement.newWorkshop')}</span>
            </button>
        </div>
      </header>

      <div className="border-b border-slate-700/50">
        <nav className="-mb-px flex flex-wrap gap-x-4 gap-y-2" aria-label="Tabs">
          <button onClick={() => setCurrentTab('active')} className={tabButtonClasses('active')}>
            {t('workshopManagement.activeWorkshops')} ({activeWorkshops.length})
          </button>
          <button onClick={() => setCurrentTab('trash')} className={tabButtonClasses('trash')}>
            {t('workshopManagement.trash')} ({trashedWorkshops.length})
          </button>
        </nav>
      </div>

      <div className="text-right text-xs text-slate-400 mb-2">
        عرض {paginatedWorkshops.length} من أصل {workshopsToDisplay.length} ورشة
      </div>

      <div className="bg-black/20 rounded-b-lg border border-t-0 border-slate-700/50 p-2 md:p-0">
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paginatedWorkshops.map(workshop => {
            const subscriberCount = users.filter(u => u.subscriptions.some(s => s.workshopId === workshop.id)).length;
            return (
              <div key={workshop.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3 hover:border-fuchsia-500/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-base text-white">{workshop.title}</p>
                    <p className="text-sm text-slate-300">{workshop.instructor}</p>
                    <p className="text-xs text-slate-400">{formatArabicDate(workshop.startDate)} - {workshop.location}</p>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <p className="text-xs text-yellow-300 font-semibold">المشتركين</p>
                    <p className="font-bold text-2xl text-white">{subscriberCount}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={workshop.isVisible} onChange={() => handleToggleVisibility(workshop)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                  </label>
                  <div className="flex items-center justify-end gap-x-1">
                    {currentTab === 'active' ? (
                      <>
                        <button onClick={() => handleTryAsParticipant(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-sky-300 hover:bg-sky-500/20`} title="تجربة كمتدرب"><UserCircleIcon className="w-5 h-5"/></button>
                        {workshop.location === 'مسجلة' && (
                          <button onClick={() => setEditingAccessFor(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-sky-300 hover:bg-sky-500/20`} title="إدارة صلاحية التسجيلات"><CalendarIcon className="w-5 h-5"/></button>
                        )}
                        <button onClick={() => handleEdit(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-amber-300 hover:bg-amber-500/20`} title={t('workshopManagement.edit')}><PencilIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleSoftDelete(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-red-400 hover:bg-red-500/20`} title={t('workshopManagement.moveToTrash')}><TrashIcon className="w-5 h-5"/></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleRestore(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-green-400 hover:bg-green-500/20`} title={t('workshopManagement.restore')}><RestoreIcon className="w-5 h-5" /></button>
                        <button onClick={() => handlePermanentDelete(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-red-400 hover:bg-red-500/20`} title={t('workshopManagement.deletePermanently')}><TrashIcon className="w-5 h-5"/></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-center text-white">
                <thead className="text-yellow-300 uppercase tracking-wider font-bold text-xs">
                    <tr className="border-b-2 border-yellow-500/50 bg-black/20">
                        <th className="py-3 px-2 text-right">{t('workshopManagement.workshopTitle')}</th>
                        <th className="py-3 px-2 text-right">{t('workshopManagement.instructor')}</th>
                        <th className="py-3 px-2 text-center">{t('workshopManagement.date')}</th>
                        <th className="py-3 px-2 text-center">{t('workshopManagement.location')}</th>
                        <th className="py-3 px-2 text-center">{t('workshopManagement.subscribers')}</th>
                        <th className="py-3 px-2 text-center">{t('workshopManagement.status')}</th>
                        <th className="py-3 px-2 text-center">صلاحية التسجيلات</th>
                        <th className="py-3 px-2 text-center">{t('workshopManagement.actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {paginatedWorkshops.map(workshop => {
                        const subscriberCount = users.filter(u => u.subscriptions.some(s => s.workshopId === workshop.id)).length;
                        return (
                            <tr key={workshop.id} className="hover:bg-fuchsia-500/10 transition-colors">
                                <td className="py-3 px-2 font-semibold text-right">{workshop.title}</td>
                                <td className="py-3 px-2 text-right">{workshop.instructor}</td>
                                <td className="py-3 px-2 whitespace-nowrap text-center">{formatArabicDate(workshop.startDate)}</td>
                                <td className="py-3 px-2 text-center">{workshop.location}</td>
                                <td className="py-3 px-2 font-semibold text-lg text-center">{subscriberCount}</td>
                                <td className="py-3 px-2 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={workshop.isVisible} onChange={() => handleToggleVisibility(workshop)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                                    </label>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    {workshop.location === 'مسجلة' && (
                                        <button onClick={() => setEditingAccessFor(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-sky-300 hover:bg-sky-500/20 mx-auto`} title="إدارة صلاحية التسجيلات">
                                            <CalendarIcon className="w-5 h-5"/>
                                        </button>
                                    )}
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center justify-center gap-x-2">
                                        {currentTab === 'active' ? (
                                            <>
                                                <button onClick={() => handleTryAsParticipant(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-sky-300 hover:bg-sky-500/20`} title="تجربة كمتدرب"><UserCircleIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleEdit(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-amber-300 hover:bg-amber-500/20`} title={t('workshopManagement.edit')}><PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleSoftDelete(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-red-400 hover:bg-red-500/20`} title={t('workshopManagement.moveToTrash')}><TrashIcon className="w-5 h-5"/></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleRestore(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-green-400 hover:bg-green-500/20`} title={t('workshopManagement.restore')}><RestoreIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handlePermanentDelete(workshop)} className={`${actionButtonClasses} text-slate-300 hover:text-red-400 hover:bg-red-500/20`} title={t('workshopManagement.deletePermanently')}><TrashIcon className="w-5 h-5"/></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {renderPagination()}
      </div>
      
      {editingWorkshop && <WorkshopForm workshop={editingWorkshop} onClose={() => setEditingWorkshop(null)} />}
      {editingAccessFor && <WorkshopRecordingAccessModal workshop={editingAccessFor} onClose={() => setEditingAccessFor(null)} showToast={showToast} />}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
      />
    </div>
  );
};
export default WorkshopManagementPage;