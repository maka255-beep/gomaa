import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { ConsultationRequest, User } from '../../types';
import { formatArabicDate, formatArabicTime, normalizePhoneNumber } from '../../utils';
import ConsultationDetailsModal from '../../components/ConsultationDetailsModal';
// FIX: Import PrintIcon and CloseIcon for the PDF preview modal
import { DownloadIcon, ChevronDownIcon, PrintIcon, CloseIcon, WhatsAppIcon } from '../../components/icons';

declare const XLSX: any;

const ConsultationManagementTab: React.FC = () => {
    const { users, consultationRequests, drhopeData, updateDrhopeData, updateConsultationRequest } = useUser();
    const [filter, setFilter] = useState<'ALL' | 'NEW' | 'APPROVED' | 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED'>('ALL');
    const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    // FIX: Add state and ref for PDF preview functionality
    const [pdfPreviewHtml, setPdfPreviewHtml] = useState<string | null>(null);
    const pdfIframeRef = useRef<HTMLIFrameElement>(null);

    // FIX: Add handler for printing the PDF from the preview iframe
    const handlePrintPdf = () => {
        if (pdfIframeRef.current && pdfIframeRef.current.contentWindow) {
            pdfIframeRef.current.contentWindow.focus();
            pdfIframeRef.current.contentWindow.print();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredRequests = useMemo(() => {
        const sortedRequests = [...consultationRequests].sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        if (filter === 'ALL') return sortedRequests;
        return sortedRequests.filter(req => req.status === filter);
    }, [consultationRequests, filter]);

    const totalFeesFiltered = useMemo(() => {
        return filteredRequests.reduce((sum, req) => sum + (req.fee || 0), 0);
    }, [filteredRequests]);

    const getUser = (userId: number): User | undefined => users.find(u => u.id === userId);

    const handleToggleConsultations = () => {
        const newStatus = !(drhopeData.consultationSettings?.consultationsEnabled ?? true);
        updateDrhopeData({
            consultationSettings: {
                ...(drhopeData.consultationSettings || { defaultDurationMinutes: 50, defaultFee: 450 }),
                consultationsEnabled: newStatus
            }
        });
    };

    const isConsultationsEnabled = drhopeData.consultationSettings?.consultationsEnabled ?? true;

    const statusClasses: Record<ConsultationRequest['status'], string> = {
        NEW: 'bg-yellow-500/20 text-yellow-300',
        APPROVED: 'bg-amber-500/20 text-amber-300',
        PENDING_PAYMENT: 'bg-sky-500/20 text-sky-300',
        PAID: 'bg-teal-500/20 text-teal-300',
        COMPLETED: 'bg-green-500/20 text-green-300',
    };
    const statusNames: Record<ConsultationRequest['status'], string> = {
        NEW: 'جديد',
        APPROVED: 'بانتظار الدفع',
        PENDING_PAYMENT: 'بانتظار التأكيد',
        PAID: 'مدفوع',
        COMPLETED: 'مكتمل',
    };
    
    const handleConfirmPayment = (e: React.MouseEvent, req: ConsultationRequest) => {
        e.stopPropagation();
        updateConsultationRequest(req.id, { status: 'PAID' });
    };
    
    const handleExcelExport = () => {
        setIsExportMenuOpen(false);
        const dataToExport = filteredRequests.map((req, index) => {
            const user = getUser(req.userId);
            return {
                '#': index + 1,
                'المشترك': user?.fullName || '-',
                'الهاتف': user?.phone?.replace(/^\+/, '') || '-',
                'الموضوع': req.subject,
                'الحالة': statusNames[req.status],
                'تاريخ الطلب': formatArabicDate(req.requestedAt),
                'تاريخ الاستشارة': req.consultationDate ? formatArabicDate(req.consultationDate) : '-',
                'الوقت': req.consultationTime ? formatArabicTime(req.consultationTime) : '-',
                'الرسوم': req.fee || 0,
            };
        });

        const totalFees = filteredRequests.reduce((sum, req) => sum + (req.fee || 0), 0);
        const totalsRow = {
            '#': 'الإجمالي',
            'المشترك': '', 'الهاتف': '', 'الموضوع': '', 'الحالة': '', 'تاريخ الطلب': '', 'تاريخ الاستشارة': '', 'الوقت': '',
            'الرسوم': totalFees
        };
        
        const finalData = [...dataToExport, totalsRow];

        const worksheet = XLSX.utils.json_to_sheet(finalData);
        worksheet['!cols'] = [
            { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 40 }, { wch: 15 },
            { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 }
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Consultations');
        XLSX.writeFile(workbook, `Consultations_${filter}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePdfExport = () => {
        setIsExportMenuOpen(false);

        const totalFees = filteredRequests.reduce((sum, req) => sum + (req.fee || 0), 0);

        const tableRows = filteredRequests.map((req, index) => {
            const user = getUser(req.userId);
            return `<tr>
                        <td>${index + 1}</td>
                        <td>${user?.fullName || '-'}</td>
                        <td>${req.subject}</td>
                        <td>${statusNames[req.status]}</td>
                        <td>${req.consultationDate ? formatArabicDate(req.consultationDate) : '-'}</td>
                        <td>${req.fee?.toFixed(2) || '0.00'}</td>
                    </tr>`;
        }).join('');
        
        const totalRow = `
            <tfoot>
                <tr>
                    <td colspan="5">الإجمالي</td>
                    <td>${totalFees.toFixed(2)}</td>
                </tr>
            </tfoot>
        `;

        const htmlContent = `
            <html>
                <head>
                    <title>تقرير الاستشارات</title>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; background-color: #f8fafc; margin: 0; padding: 20px; }
                        .report-container { width: 100%; margin: auto; }
                        .report-header { padding: 20px; background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #c026d3 100%); color: white; border-radius: 8px 8px 0 0; text-align: right; }
                        .report-header h1 { margin: 0; font-size: 24px; }
                        .report-header p { margin: 5px 0 0; font-size: 12px; opacity: 0.8; }
                        table { width: 100%; border-collapse: collapse; font-size: 11px; background-color: white; }
                        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: right; }
                        thead tr { background-color: #f3e8ff; color: #5b21b6; font-weight: bold; }
                        tbody tr:nth-child(even) { background-color: #f8fafc; }
                        tfoot tr { background-color: #ede9fe; font-weight: bold; color: #4c1d95; }
                        @page { size: A4 landscape; margin: 15mm; }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <div class="report-header">
                            <h1>تقرير الاستشارات</h1>
                            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG-u-nu-latn')}</p>
                            <p>فلتر الحالة: ${statusNames[filter as keyof typeof statusNames] || 'الكل'}</p>
                        </div>
                        <table>
                            <thead><tr><th>#</th><th>المشترك</th><th>الموضوع</th><th>الحالة</th><th>تاريخ الاستشارة</th><th>الرسوم</th></tr></thead>
                            <tbody>${tableRows}</tbody>
                            ${totalRow}
                        </table>
                    </div>
                </body>
            </html>
        `;
        
        setPdfPreviewHtml(htmlContent);
    };

    return (
        <div className="space-y-4">
            <div className="bg-black/20 p-4 rounded-lg flex items-center justify-between">
                <h3 className="text-base font-bold text-white">حالة خدمة الاستشارات</h3>
                <div className="flex items-center gap-x-4">
                    <span className={`font-bold text-sm ${isConsultationsEnabled ? 'text-green-400' : 'text-red-400'}`}>
                        {isConsultationsEnabled ? 'متاحة حالياً' : 'مغلقة حالياً'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isConsultationsEnabled}
                            onChange={handleToggleConsultations}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                    </label>
                </div>
            </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2 bg-slate-800/60 p-1 rounded-lg w-fit">
                    <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filter === 'ALL' ? 'bg-fuchsia-500/50 text-white' : 'hover:bg-slate-700/50'}`}>الكل</button>
                    <button onClick={() => setFilter('NEW')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filter === 'NEW' ? 'bg-fuchsia-500/50 text-white' : 'hover:bg-slate-700/50'}`}>جديد</button>
                    <button onClick={() => setFilter('APPROVED')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filter === 'APPROVED' ? 'bg-fuchsia-500/50 text-white' : 'hover:bg-slate-700/50'}`}>بانتظار الدفع</button>
                    <button onClick={() => setFilter('PENDING_PAYMENT')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filter === 'PENDING_PAYMENT' ? 'bg-fuchsia-500/50 text-white' : 'hover:bg-slate-700/50'}`}>بانتظار التأكيد</button>
                    <button onClick={() => setFilter('PAID')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filter === 'PAID' ? 'bg-fuchsia-500/50 text-white' : 'hover:bg-slate-700/50'}`}>مدفوع</button>
                    <button onClick={() => setFilter('COMPLETED')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filter === 'COMPLETED' ? 'bg-fuchsia-500/50 text-white' : 'hover:bg-slate-700/50'}`}>مكتمل</button>
                </div>
                 <div className="relative" ref={exportMenuRef}>
                    <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="flex items-center gap-x-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm">
                        <DownloadIcon className="w-5 h-5"/>
                        <span>تصدير</span>
                        <ChevronDownIcon className="w-4 h-4"/>
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-indigo-800 border border-slate-600 rounded-md shadow-lg z-20">
                            <button onClick={handleExcelExport} className="w-full text-right px-4 py-2 text-sm font-bold hover:bg-fuchsia-500/20 flex items-center gap-x-2">
                                <DownloadIcon className="w-4 h-4" /><span>تصدير إلى Excel</span>
                            </button>
                            <button onClick={handlePdfExport} className="w-full text-right px-4 py-2 text-sm font-bold hover:bg-fuchsia-500/20 flex items-center gap-x-2">
                                <PrintIcon className="w-4 h-4" /><span>طباعة/حفظ PDF</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="text-xs text-slate-400 my-2 px-1">
                إجمالي {filteredRequests.length} طلب | إجمالي الرسوم: <span className="font-bold text-white">{totalFeesFiltered.toFixed(2)}</span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-white">
                    <thead className="text-yellow-300 uppercase tracking-wider font-bold text-xs">
                        <tr className="border-b-2 border-yellow-500/50 bg-black/20">
                            <th className="py-3 px-2 text-right">المشترك</th>
                            <th className="py-3 px-2 text-right">الموضوع</th>
                            <th className="py-3 px-2 text-center">الحالة</th>
                            <th className="py-3 px-2 text-center">تاريخ الطلب</th>
                            <th className="py-3 px-2 text-center">تاريخ الاستشارة</th>
                            <th className="py-3 px-2 text-center">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredRequests.map(req => {
                            const user = getUser(req.userId);
                            return (
                                <tr key={req.id} className="hover:bg-yellow-500/10 transition-colors">
                                    <td className="py-3 px-2 text-right">
                                        <p className="font-bold">{user?.fullName}</p>
                                        {user?.phone && (
                                            <a href={`https://wa.me/${normalizePhoneNumber(user.phone)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:underline flex items-center gap-x-1 justify-end">
                                                <span>{user.phone.replace(/^\+/, '')}</span>
                                                <WhatsAppIcon className="w-3 h-3"/>
                                            </a>
                                        )}
                                    </td>
                                    <td className="py-3 px-2 text-right max-w-sm truncate">{req.subject}</td>
                                    <td className="py-3 px-2 text-center">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusClasses[req.status]}`}>
                                            {statusNames[req.status]}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-center">{formatArabicDate(req.requestedAt)}</td>
                                    <td className="py-3 px-2 text-center">
                                        {req.consultationDate ? `${formatArabicDate(req.consultationDate)} - ${formatArabicTime(req.consultationTime)}` : '-'}
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                         <div className="flex items-center justify-center gap-x-2">
                                            {req.status === 'PENDING_PAYMENT' && (
                                                <button onClick={(e) => handleConfirmPayment(e, req)} className="py-1 px-3 bg-green-600 hover:bg-green-500 rounded-md text-xs font-bold">
                                                    تأكيد الدفع
                                                </button>
                                            )}
                                            <button onClick={() => setSelectedRequest(req)} className="py-1 px-3 bg-sky-600 hover:bg-sky-500 rounded-md text-xs font-bold">
                                                عرض التفاصيل
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredRequests.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد طلبات تطابق هذا الفلتر.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConsultationDetailsModal 
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                request={selectedRequest}
            />

            {pdfPreviewHtml && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-80 p-4">
                    <div className="bg-slate-900 text-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-fuchsia-500/50">
                        <header className="p-4 flex justify-between items-center border-b border-fuchsia-500/30 flex-shrink-0">
                            <h2 className="text-lg font-bold">معاينة التقرير</h2>
                            <button onClick={() => setPdfPreviewHtml(null)} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                        </header>
                        <div className="flex-grow p-4 bg-slate-800">
                            <iframe ref={pdfIframeRef} srcDoc={pdfPreviewHtml} title="PDF Preview" className="w-full h-full border-0 bg-white" />
                        </div>
                        <footer className="p-4 flex justify-end gap-4 border-t border-fuchsia-500/30 flex-shrink-0">
                            <button onClick={() => setPdfPreviewHtml(null)} className="py-2 px-4 rounded-md bg-slate-600 hover:bg-slate-500 font-bold text-sm">إغلاق</button>
                            <button onClick={handlePrintPdf} className="py-2 px-4 rounded-md bg-purple-600 hover:bg-purple-500 font-bold text-sm flex items-center gap-x-2">
                                <PrintIcon className="w-5 h-5"/> طباعة / حفظ PDF
                            </button>
                        </footer>
                    </div>
                    <style>{`.z-80 { z-index: 80; }`}</style>
                </div>
            )}
        </div>
    );
};

export default ConsultationManagementTab;