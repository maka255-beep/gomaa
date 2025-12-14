import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { User } from '../../types';
import { TrashIcon, RestoreIcon, DownloadIcon, UserAddIcon, UserCircleIcon, PencilIcon, ChevronDownIcon, PrintIcon, CloseIcon } from '../../components/icons';
// FIX: Changed default import of ConfirmationModal to a named import.
import { ConfirmationModal } from '../../components/ConfirmationModal';
import AddUserModal from '../../components/AddUserModal';
import { normalizePhoneNumber, toEnglishDigits, downloadHtmlAsPdf } from '../../utils';
import UserDetailsModal from '../../components/UserDetailsModal';
import { useAdminTranslation } from './AdminTranslationContext';


type ViewTab = 'active' | 'trash';

// This is needed because the xlsx library is loaded from a CDN script in index.html
declare const XLSX: any;

interface UserManagementPageProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  onViewUserProfile: (user: User) => void;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ showToast, onViewUserProfile }) => {
  const { users, deleteUser, restoreUser, permanentlyDeleteUser } = useUser();
  const { t } = useAdminTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState<ViewTab>('active');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
  const ITEMS_PER_PAGE = 50;
  
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab, searchTerm]);

  const activeUsers = users.filter(u => !u.isDeleted);
  const trashedUsers = users.filter(u => u.isDeleted);

  const usersToDisplay = useMemo(() => {
    const sourceUsers = currentTab === 'active' ? activeUsers : trashedUsers;
    if (!searchTerm) return sourceUsers;
    const lowercasedFilter = searchTerm.toLowerCase();
    const normalizedPhoneFilter = normalizePhoneNumber(searchTerm);
    return sourceUsers.filter(user =>
      user.fullName.toLowerCase().includes(lowercasedFilter) ||
      user.email.toLowerCase().includes(lowercasedFilter) ||
      normalizePhoneNumber(user.phone).includes(normalizedPhoneFilter)
    );
  }, [activeUsers, trashedUsers, currentTab, searchTerm]);
  
  const totalPages = Math.ceil(usersToDisplay.length / ITEMS_PER_PAGE);
  const paginatedUsers = usersToDisplay.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
      setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleSoftDelete = (userId: number) => {
    setConfirmationState({
        isOpen: true,
        title: 'تأكيد النقل إلى سلة المهملات',
        message: 'هل أنت متأكد أنك تريد نقل هذا المشترك إلى سلة المهملات؟',
        onConfirm: () => {
            deleteUser(userId);
            setConfirmationState(prev => ({ ...prev, isOpen: false }));
        },
    });
  };
  
  const handleRestore = (userId: number) => {
    setConfirmationState({
        isOpen: true,
        title: 'تأكيد الاستعادة',
        message: 'هل أنت متأكد من استعادة هذا المشترك؟',
        onConfirm: () => {
            restoreUser(userId);
            setConfirmationState(prev => ({ ...prev, isOpen: false }));
        },
    });
  };

  const handlePermanentDelete = (userId: number) => {
      setConfirmationState({
          isOpen: true,
          title: 'تأكيد الحذف النهائي',
          message: 'هل أنت متأكد من حذف هذا المشترك نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
          onConfirm: () => {
              permanentlyDeleteUser(userId);
              setConfirmationState(prev => ({ ...prev, isOpen: false }));
          },
      });
  };

  const handleExcelExport = () => {
    setIsExportMenuOpen(false);
    if (typeof XLSX === 'undefined') {
        alert('حدث خطأ أثناء تحميل مكتبة التصدير. يرجى المحاولة مرة أخرى.');
        return;
    }

    const dataToExport = usersToDisplay.map(user => ({
      'الاسم الكامل': user.fullName,
      'البريد الإلكتروني': user.email,
      'رقم الهاتف': user.phone.replace(/^\+/, ''),
      'عدد الورش المشترك بها': user.subscriptions.length,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المشتركون');
    
    worksheet['!cols'] = [
      { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 15 },
    ];
    
    XLSX.writeFile(workbook, `Nawaya_Beneficiaries_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePdfExport = () => {
        setIsExportMenuOpen(false);
        const tableRows = usersToDisplay.map(user => `
            <tr>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.phone.replace(/^\+/, '')}</td>
                <td style="text-align: center;">${user.subscriptions.length}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <html>
                <head>
                    <title>بيانات المشتركين</title>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { 
                            font-family: 'Noto Sans Arabic', sans-serif; 
                            direction: rtl; 
                            background-color: #f8fafc;
                            margin: 0;
                            padding: 20px;
                        }
                        .report-container { width: 100%; margin: auto; }
                        .report-header {
                            padding: 20px;
                            background-color: #111827;
                            color: #fcd34d;
                            border-radius: 8px 8px 0 0;
                            text-align: right;
                            border-bottom: 2px solid #fcd34d;
                        }
                        .report-header h1 { margin: 0; font-size: 24px; }
                        .report-header p { margin: 5px 0 0; font-size: 12px; color: #d1d5db; }
                        table { width: 100%; border-collapse: collapse; font-size: 11px; background-color: white; color: #1f2937; }
                        th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
                        thead tr { background-color: #fefce8; font-weight: bold; color: #713f12; }
                        tbody tr:nth-child(even) { background-color: #f9fafb; }
                        @page { size: A4 landscape; margin: 15mm; }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <div class="report-header">
                            <h1>تقرير المشتركين</h1>
                            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG-u-nu-latn')}</p>
                        </div>
                        <table>
                            <thead><tr><th>الاسم الكامل</th><th>البريد الإلكتروني</th><th>رقم الهاتف</th><th style="text-align: center;">عدد الورش</th></tr></thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                </body>
            </html>
        `;
        
        downloadHtmlAsPdf(htmlContent, `Beneficiaries_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-4 mt-4">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="py-2 px-4 rounded-md bg-slate-700/50 hover:bg-slate-600/50 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {t('common.previous')}
            </button>
            <span className="text-white font-bold text-sm">
                {t('common.page')} {currentPage} {t('common.from')} {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="py-2 px-4 rounded-md bg-slate-700/50 hover:bg-slate-600/50 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {t('common.next')}
            </button>
        </div>
    );
  };

  const renderUsersList = () => (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
            <div key={user.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3 hover:border-fuchsia-500/50 transition-colors">
                <div className="flex justify-between items-start gap-3">
                    <div>
                        <p className="font-bold text-base text-white">{user.fullName}</p>
                        <p className="text-sm text-slate-400 break-all">{user.email}</p>
                        <a href={`https://wa.me/${normalizePhoneNumber(user.phone)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:underline">
                            {user.phone.replace(/^\+/, '')}
                        </a>
                    </div>
                    <div className="text-center flex-shrink-0">
                        <p className="text-xs text-yellow-300 font-semibold">{t('userManagement.workshopsSubscribed')}</p>
                        <p className="font-bold text-2xl text-white">{user.subscriptions.length}</p>
                    </div>
                </div>
                
                <div className="border-t border-slate-700/50 pt-3 flex items-center justify-end gap-x-1">
                    {currentTab === 'active' ? (
                        <>
                            <button onClick={() => onViewUserProfile(user)} className={`${actionButtonClasses} text-slate-300 hover:text-sky-300 hover:bg-sky-500/20`} title={t('userManagement.viewProfile')}><UserCircleIcon className="w-5 h-5" /></button>
                            <button onClick={() => setEditingUser(user)} className={`${actionButtonClasses} text-slate-300 hover:text-amber-300 hover:bg-amber-500/20`} title={t('userManagement.editUser')}><PencilIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleSoftDelete(user.id)} className={`${actionButtonClasses} text-slate-300 hover:text-red-400 hover:bg-red-500/20`} title={t('userManagement.moveToTrash')}><TrashIcon className="w-5 h-5"/></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleRestore(user.id)} className={`${actionButtonClasses} text-slate-300 hover:text-green-400 hover:bg-green-500/20`} title={t('userManagement.restore')}><RestoreIcon className="w-5 h-5"/></button>
                            <button onClick={() => handlePermanentDelete(user.id)} className={`${actionButtonClasses} text-slate-300 hover:text-red-400 hover:bg-red-500/20`} title={t('userManagement.deletePermanently')}><TrashIcon className="w-5 h-5"/></button>
                        </>
                    )}
                </div>
            </div>
        )) : (
          <p className="p-8 text-center text-slate-400 font-semibold text-sm">
            {searchTerm ? t('userManagement.noResults') : (currentTab === 'active' ? t('userManagement.emptyActive') : t('userManagement.emptyTrash'))}
          </p>
        )}
      </div>

      {/* Desktop Table View */}
      <table className="hidden md:table min-w-full text-sm text-white">
        <thead className="text-yellow-300 uppercase tracking-wider font-bold text-xs">
          <tr className="border-b-2 border-yellow-500/50 bg-black/20">
            <th className="py-3 px-2 text-right">{t('userManagement.fullName')}</th>
            <th className="py-3 px-2 text-right">{t('userManagement.email')}</th>
            <th className="py-3 px-2 text-right">{t('userManagement.phone')}</th>
            <th className="py-3 px-2 text-center">{t('userManagement.workshopsSubscribed')}</th>
            <th className="py-3 px-2 text-center">{t('userManagement.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {paginatedUsers.map(user => (
            <tr key={user.id} className="hover:bg-fuchsia-500/10 transition-colors">
              <td className="py-3 px-2 font-semibold text-right">{user.fullName}</td>
              <td className="py-3 px-2 text-right">{user.email}</td>
              <td className="py-3 px-2 text-right">
                <a 
                  href={`https://wa.me/${normalizePhoneNumber(user.phone)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline hover:text-yellow-400 transition-colors"
                  title={`Chat with ${user.fullName} on WhatsApp`}
                >
                  {user.phone.replace(/^\+/, '')}
                </a>
              </td>
              <td className="py-3 px-2 text-center font-semibold text-lg">{user.subscriptions.length}</td>
              <td className="py-3 px-2">
                <div className="flex items-center justify-center gap-x-2">
                  {currentTab === 'active' ? (
                    <>
                      <button onClick={() => onViewUserProfile(user)} className={`${actionButtonClasses} text-slate-300 hover:text-sky-300 hover:bg-sky-500/20`} title={t('userManagement.viewProfile')}><UserCircleIcon className="w-5 h-5" /></button>
                      <button onClick={() => setEditingUser(user)} className={`${actionButtonClasses} text-slate-300 hover:text-amber-300 hover:bg-amber-500/20`} title={t('userManagement.editUser')}><PencilIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleSoftDelete(user.id)} className={`${actionButtonClasses} text-slate-300 hover:text-red-400 hover:bg-red-500/20`} title={t('userManagement.moveToTrash')}><TrashIcon className="w-5 h-5"/></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleRestore(user.id)} className={`${actionButtonClasses} text-slate-300 hover:text-green-400 hover:bg-green-500/20`} title={t('userManagement.restore')}><RestoreIcon className="w-5 h-5"/></button>
                      <button onClick={() => handlePermanentDelete(user.id)} className={`${actionButtonClasses} text-slate-300 hover:text-red-400 hover:bg-red-500/20`} title={t('userManagement.deletePermanently')}><TrashIcon className="w-5 h-5"/></button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white">{t('userManagement.title')}</h2>
        <div className="w-full md:w-auto flex items-center gap-x-4">
          <input
            type="text"
            placeholder={t('userManagement.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm"
          />
          <div className="relative" ref={exportMenuRef}>
              <button
                  onClick={() => setIsExportMenuOpen(prev => !prev)}
                  className="flex items-center gap-x-2 bg-slate-700/70 hover:bg-slate-600/70 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
              >
                  <DownloadIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{t('userManagement.export')}</span>
                  <ChevronDownIcon className="w-4 h-4" />
              </button>
              {isExportMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10">
                      <ul>
                          <li><button onClick={handleExcelExport} className="w-full text-right px-4 py-2 text-sm text-white font-bold hover:bg-fuchsia-500/20 flex items-center gap-x-2"><DownloadIcon className="w-4 h-4" /><span>EXCEL</span></button></li>
                          <li><button onClick={handlePdfExport} className="w-full text-right px-4 py-2 text-sm text-white font-bold hover:bg-fuchsia-500/20 flex items-center gap-x-2"><PrintIcon className="w-4 h-4" /><span>PDF</span></button></li>
                      </ul>
                  </div>
              )}
          </div>
          <button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-x-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-3 rounded-lg text-sm"
          >
              <UserAddIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t('userManagement.newUser')}</span>
          </button>
        </div>
      </header>

      <div className="border-b border-slate-700/50">
        <nav className="-mb-px flex flex-wrap gap-x-4 gap-y-2" aria-label="Tabs">
          <button onClick={() => setCurrentTab('active')} className={tabButtonClasses('active')}>
            {t('userManagement.activeUsers')} ({activeUsers.length})
          </button>
          <button onClick={() => setCurrentTab('trash')} className={tabButtonClasses('trash')}>
            {t('userManagement.trash')} ({trashedUsers.length})
          </button>
        </nav>
      </div>
        
      <div className="text-right text-xs text-slate-400 mb-2">
            عرض {paginatedUsers.length} من أصل {usersToDisplay.length} مشترك
      </div>

      <div className="bg-black/20 rounded-b-lg border border-t-0 border-slate-700/50 p-2 md:p-0">
          {renderUsersList()}
      </div>
      
      {renderPaginationControls()}

      {isAddUserModalOpen && <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} onSuccess={(msg) => showToast(msg, 'success')} />}
      {editingUser && <UserDetailsModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} onSuccess={(msg) => showToast(msg, 'success')} userToEdit={editingUser} />}
      <ConfirmationModal isOpen={confirmationState.isOpen} onClose={closeConfirmationModal} onConfirm={confirmationState.onConfirm} title={confirmationState.title} message={confirmationState.message} />
    </div>
  );
};

export default UserManagementPage;