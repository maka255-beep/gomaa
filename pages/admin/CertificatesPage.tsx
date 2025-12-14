// FIX: Import `useMemo` to resolve 'Cannot find name' error.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import { AcademicCapIcon, DownloadIcon, ChevronDownIcon, PrintIcon, CloseIcon, WhatsAppIcon } from '../../components/icons';
import { Workshop, SubscriptionStatus, User, CertificateTemplate } from '../../types';
import { formatArabicDate, normalizePhoneNumber, downloadHtmlAsPdf } from '../../utils';
import { generateCertificate } from '../../components/DynamicCertificateRenderer';
import { useAdminTranslation } from './AdminTranslationContext';

declare const XLSX: any;

interface CertificateData {
  workshopName: string;
  subscriberName: string;
  phone: string;
  email: string;
  location: string;
  subscriptionDate: string;
  amountPaid: number | undefined;
  paymentMethod: string | undefined;
  userId: number;
  subscriptionId: string;
  isIssued: boolean;
}

interface CertificatesPageProps {
    showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

const CertificatesPage: React.FC<CertificatesPageProps> = ({ showToast }) => {
  const { users, workshops, updateWorkshop, globalCertificateTemplate } = useUser();
  const { t } = useAdminTranslation();
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');
  const [attendeeList, setAttendeeList] = useState<CertificateData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [isWorkshopDropdownOpen, setIsWorkshopDropdownOpen] = useState(false);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 50;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
        if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node)) {
            setIsWorkshopDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedWorkshop = workshops.find(w => w.id === parseInt(selectedWorkshopId, 10));

  const generateAttendeeList = (workshop: Workshop) => {
    const subscribers = users.flatMap(user =>
      user.subscriptions
        .filter(sub =>
          sub.workshopId === workshop.id &&
          (sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.TRANSFERRED) &&
          sub.isApproved !== false
        )
        .map(sub => ({ user, sub }))
    );

    const list: CertificateData[] = subscribers.map(({ user, sub }) => ({
      workshopName: workshop.title,
      subscriberName: user.fullName,
      phone: user.phone,
      email: user.email,
      location: workshop.location === 'حضوري' && workshop.city ? workshop.city : workshop.location,
      subscriptionDate: formatArabicDate(sub.activationDate),
      amountPaid: sub.pricePaid,
      paymentMethod: sub.paymentMethod,
      userId: user.id,
      subscriptionId: sub.id,
      isIssued: true,
    }));

    setAttendeeList(list);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (selectedWorkshop?.certificatesIssued) {
      generateAttendeeList(selectedWorkshop);
    } else {
      setAttendeeList([]);
    }
  }, [selectedWorkshopId, workshops, users, selectedWorkshop?.certificatesIssued]);
  
  const totalAmountFiltered = useMemo(() => {
    return attendeeList.filter(cert => cert.isIssued).reduce((sum, item) => sum + (item.amountPaid || 0), 0);
  }, [attendeeList]);

  const handleToggleWorkshopIssuance = (issue: boolean) => {
    if (!selectedWorkshop) return;
    if (issue && !globalCertificateTemplate) {
      showToast('لا يمكن إصدار الشهادات. يرجى رفع وإعداد قالب الشهادة الموحد أولاً.', 'warning');
      return;
    }
    updateWorkshop({ ...selectedWorkshop, certificatesIssued: issue });
    showToast(issue ? 'تم تفعيل إصدار الشهادات لهذه الورشة.' : 'تم إلغاء تفعيل إصدار الشهادات لهذه الورشة.', 'success');
  };

  const handleToggleIndividualIssued = (subscriptionId: string) => {
    setAttendeeList(prevList =>
      prevList.map(cert =>
        cert.subscriptionId === subscriptionId
          ? { ...cert, isIssued: !cert.isIssued }
          : cert
      )
    );
  };
  
  const handleDownloadCertificate = (user: User) => {
    if (selectedWorkshop && globalCertificateTemplate) {
        generateCertificate(globalCertificateTemplate, selectedWorkshop, user);
    } else {
        showToast('لا يمكن تحميل الشهادة. تأكد من إعداد قالب الشهادة أولاً.', 'warning');
    }
  };

  const totalPages = Math.ceil(attendeeList.length / ITEMS_PER_PAGE);
  const paginatedAttendees = attendeeList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  
  const handleExcelExport = () => {
    setIsExportMenuOpen(false);
    if (!selectedWorkshop) return;

    const issuedAttendees = attendeeList.filter(a => a.isIssued);

    const dataToExport = issuedAttendees.map(attendee => ({
      'اسم المشترك': attendee.subscriberName,
      'الهاتف': attendee.phone.replace(/^\+/, ''),
      'البريد الإلكتروني': attendee.email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 30 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');
    XLSX.writeFile(workbook, `Attendees_${selectedWorkshop.title.replace(/\s/g, '_')}.xlsx`);
  };

  const handlePdfExport = () => {
    setIsExportMenuOpen(false);
    const issuedAttendees = attendeeList.filter(a => a.isIssued);
    const tableRows = issuedAttendees.map((attendee, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${attendee.subscriberName}</td>
            <td>${attendee.phone}</td>
            <td>${attendee.email}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <html>
            <head>
                <title>قائمة الحضور - ${selectedWorkshop?.title}</title>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; }
                    @page { size: A4 portrait; margin: 20mm; }
                </style>
            </head>
            <body>
                <h1>قائمة الحضور - ${selectedWorkshop?.title}</h1>
                <table>
                    <thead><tr><th>#</th><th>الاسم</th><th>الهاتف</th><th>البريد الإلكتروني</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </body>
        </html>
    `;
    downloadHtmlAsPdf(htmlContent, `Attendees_${selectedWorkshop?.title.replace(/\s/g, '_')}.pdf`, 'portrait');
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-4 mt-4">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="py-2 px-4 rounded-md bg-slate-700/50 text-white font-bold text-sm disabled:opacity-50">السابق</button>
            <span className="text-white font-bold text-sm">صفحة {currentPage} من {totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="py-2 px-4 rounded-md bg-slate-700/50 text-white font-bold text-sm disabled:opacity-50">التالي</button>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white">{t('certificates.title')}</h2>
      </div>
      
      <div className="bg-black/20 p-4 rounded-lg border border-slate-700/50">
        <label className="block mb-2 text-sm font-bold text-fuchsia-300">{t('certificates.selectWorkshop')}</label>
        <select value={selectedWorkshopId} onChange={e => setSelectedWorkshopId(e.target.value)} className="w-full p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm">
            <option value="">-- اختر ورشة --</option>
            {workshops.filter(w => !w.isDeleted).map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
        </select>
      </div>

      {selectedWorkshop && (
        <div className="bg-black/20 p-4 rounded-lg border border-slate-700/50">
            <h3 className="text-base font-bold text-white mb-2">{t('certificates.statusTitle')} <span className="text-fuchsia-300">{selectedWorkshop.title}</span></h3>
            <div className="flex items-center justify-between">
                <p className={`font-semibold ${selectedWorkshop.certificatesIssued ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedWorkshop.certificatesIssued ? t('certificates.issued') : t('certificates.notIssued')}
                </p>
                <button onClick={() => handleToggleWorkshopIssuance(!selectedWorkshop.certificatesIssued)} className={`py-2 px-4 rounded-md text-sm font-bold ${selectedWorkshop.certificatesIssued ? 'bg-red-600' : 'bg-green-600'}`}>
                    {selectedWorkshop.certificatesIssued ? t('certificates.cancelIssuance') : t('certificates.issueNow')}
                </button>
            </div>
        </div>
      )}

      <div className="bg-black/20 p-4 rounded-lg border border-slate-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-white">قائمة الحضور ({attendeeList.filter(a => a.isIssued).length} / {attendeeList.length})</h3>
          <div className="flex items-center gap-x-2">
            <p className="text-xs text-slate-300">إجمالي المبلغ: {totalAmountFiltered.toFixed(2)}</p>
            <div className="relative" ref={exportMenuRef}>
              <button onClick={() => setIsExportMenuOpen(prev => !prev)} disabled={!selectedWorkshop} className="flex items-center gap-x-2 bg-slate-700/70 hover:bg-slate-600/70 text-white font-bold py-2 px-3 rounded-lg text-sm disabled:opacity-50">
                <DownloadIcon className="w-5 h-5"/><span>تصدير</span><ChevronDownIcon className="w-4 h-4"/>
              </button>
              {isExportMenuOpen && (<div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10">
                <button onClick={handleExcelExport} className="w-full text-right px-4 py-2 text-sm text-white hover:bg-fuchsia-500/20 flex items-center gap-x-2"><DownloadIcon className="w-4 h-4"/><span>Excel</span></button>
                <button onClick={handlePdfExport} className="w-full text-right px-4 py-2 text-sm text-white hover:bg-fuchsia-500/20 flex items-center gap-x-2"><PrintIcon className="w-4 h-4"/><span>PDF</span></button>
              </div>)}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead className="text-fuchsia-300 uppercase text-xs">
              <tr className="border-b border-slate-700/50 bg-black/20">
                <th className="py-4 px-3 text-center">إصدار</th>
                <th className="py-4 px-3 text-right">الاسم</th>
                <th className="py-4 px-3 text-right">الهاتف</th>
                <th className="py-4 px-3 text-right">الإيميل</th>
                <th className="py-4 px-3 text-center">نوع الورشة</th>
                <th className="py-4 px-3 text-center">تاريخ الاشتراك</th>
                <th className="py-4 px-3 text-center">المبلغ</th>
                <th className="py-4 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedAttendees.map(attendee => {
                const user = users.find(u => u.id === attendee.userId);
                if (!user) return null;
                return (
                  <tr key={attendee.subscriptionId} className="hover:bg-fuchsia-500/10">
                    <td className="py-3 px-3 text-center">
                      <input type="checkbox" checked={attendee.isIssued} onChange={() => handleToggleIndividualIssued(attendee.subscriptionId)} className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-fuchsia-500 focus:ring-fuchsia-500"/>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">{attendee.subscriberName}</td>
                    <td className="py-3 px-3 text-right">
                      <a href={`https://wa.me/${normalizePhoneNumber(attendee.phone)}`} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline flex items-center gap-x-1 justify-end">
                        <span>{attendee.phone.replace(/^\+/, '')}</span>
                        <WhatsAppIcon className="w-3 h-3"/>
                      </a>
                    </td>
                    <td className="py-3 px-3 text-right">{attendee.email}</td>
                    <td className="py-3 px-3 text-center">{attendee.location}</td>
                    <td className="py-3 px-3 text-center">{attendee.subscriptionDate}</td>
                    <td className="py-3 px-3 text-center">{attendee.amountPaid?.toFixed(2) || '-'}</td>
                    <td className="py-3 px-3 text-center">
                      <button onClick={() => handleDownloadCertificate(user)} disabled={!attendee.isIssued} className="p-2 rounded-md transition-colors text-slate-300 hover:text-yellow-400 hover:bg-yellow-500/20 disabled:opacity-50" title="تحميل الشهادة">
                        <DownloadIcon className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>
    </div>
  );
};

export default CertificatesPage;