
import React, { useMemo } from 'react';
import { User, Subscription, Workshop } from '../types';
import { useUser } from '../context/UserContext';
import { CloseIcon, PrintIcon } from './icons';
import { formatArabicDate, downloadHtmlAsPdf } from '../utils';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    subscription: Subscription;
    workshop: Workshop;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, user, subscription, workshop }) => {
    const { drhopeData } = useUser();

    const invoiceDetails = useMemo(() => {
        const totalAmount = subscription.pricePaid || 0;
        const netAmount = totalAmount / 1.05;
        const taxAmount = totalAmount - netAmount;
        return {
            totalAmount,
            netAmount,
            taxAmount,
            invoiceNumber: `INV-${subscription.id.substring(0, 8).toUpperCase()}`,
            invoiceDate: formatArabicDate(subscription.activationDate),
        };
    }, [subscription]);

    if (!isOpen) return null;

    const handlePrint = () => {
        const printContents = document.getElementById('printable-invoice')?.innerHTML;
        if (printContents) {
            const fullHtml = `
                <html>
                <head>
                    <title>Print Invoice</title>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { 
                            font-family: 'Noto Sans Arabic', sans-serif;
                            direction: rtl;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    </style>
                </head>
                <body>${printContents}</body>
                </html>
            `;
            downloadHtmlAsPdf(fullHtml, `Invoice-${invoiceDetails.invoiceNumber}.pdf`, 'portrait');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4">
            <div className="bg-slate-900 text-black rounded-lg shadow-2xl w-full max-w-4xl border border-fuchsia-500/50 max-h-[90vh] flex flex-col">
                <header className="p-3 bg-slate-800 flex justify-between items-center flex-shrink-0 rounded-t-lg">
                    <h2 className="text-lg font-bold text-white">معاينة الفاتورة الضريبية</h2>
                    <div className="flex items-center gap-x-3">
                         <button onClick={handlePrint} className="flex items-center gap-x-2 py-2 px-3 rounded-md bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-700 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 border border-fuchsia-500/20">
                            <PrintIcon className="w-5 h-5" />
                            <span>طباعة / حفظ</span>
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full text-white hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                </header>
                <div className="flex-grow p-4 overflow-y-auto bg-slate-300">
                    <div id="printable-invoice" className="bg-white p-10 A4-size mx-auto shadow-lg font-sans text-gray-800">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            {drhopeData.logoUrl && (
                                <img src={drhopeData.logoUrl} alt="Company Logo" className="w-28 h-28 object-contain" />
                            )}
                            <div className="text-left">
                                <h1 className="text-4xl font-black text-violet-800 tracking-tight">فاتورة ضريبية</h1>
                                <p className="text-gray-500 mt-1">Tax Invoice</p>
                            </div>
                        </div>

                        {/* From & To */}
                        <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
                            <div className="space-y-1">
                                <p className="font-bold text-gray-500">من:</p>
                                <p className="font-extrabold text-base text-violet-800">مؤسسة نوايا للفعاليات</p>
                                <p className="text-gray-600">{drhopeData.companyAddress || '123 Business Bay, Dubai, UAE'}</p>
                                <p className="text-gray-600">الهاتف: {drhopeData.companyPhone || '+971 4 123 4567'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-gray-500">إلى:</p>
                                <p className="font-bold text-gray-800">{user.fullName}</p>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-gray-600">{user.phone}</p>
                            </div>
                        </div>

                        {/* Invoice Meta */}
                        <div className="grid grid-cols-2 gap-8 mb-10 text-sm bg-slate-50 p-4 rounded-lg">
                            <div>
                                <span className="font-bold text-gray-500">رقم الفاتورة: </span>
                                <span className="font-mono text-gray-800">{invoiceDetails.invoiceNumber}</span>
                            </div>
                            <div className="text-left">
                                <span className="font-bold text-gray-500">تاريخ الفاتورة: </span>
                                <span className="font-mono text-gray-800">{invoiceDetails.invoiceDate}</span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b-2 border-gray-300">
                                    <tr>
                                        <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-right">الوصف</th>
                                        <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-center w-32">صافي المبلغ</th>
                                        <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-center w-32">الضريبة (5%)</th>
                                        <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-center w-32">الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="p-4 align-top text-right">
                                            <p className="font-bold text-gray-800">اشتراك في ورشة: {workshop.title}</p>
                                            {subscription.packageId && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    الباقة: {workshop.packages?.find(p => p.id === subscription.packageId)?.name || 'غير محدد'}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4 text-center align-top font-mono">{invoiceDetails.netAmount.toFixed(2)}</td>
                                        <td className="p-4 text-center align-top font-mono">{invoiceDetails.taxAmount.toFixed(2)}</td>
                                        <td className="p-4 text-center align-top font-mono">{invoiceDetails.totalAmount.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mt-8">
                            <div className="w-full max-w-sm space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">المجموع الفرعي:</span>
                                    <span className="font-mono">{invoiceDetails.netAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">ضريبة القيمة المضافة (5%):</span>
                                    <span className="font-mono">{invoiceDetails.taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-violet-100 text-violet-900 border-2 border-violet-200">
                                    <span className="font-extrabold text-base">الإجمالي المستحق (درهم):</span>
                                    <span className="font-mono font-extrabold text-xl">{invoiceDetails.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="mt-12 pt-6 border-t-2 border-gray-200 text-xs text-center text-gray-500">
                            <p className="font-bold mb-2">شكرًا لثقتكم بنا!</p>
                            <p>الرقم الضريبي: {drhopeData.taxRegistrationNumber || 'N/A'}</p>
                            <p>Nawaya Events</p>
                        </footer>
                    </div>
                </div>
            </div>
            <style>{`.A4-size { width: 210mm; min-height: 297mm; } @media print { .A4-size { margin: 0; box-shadow: none; } } .z-100 { z-index: 100 !important; }`}</style>
        </div>
    );
};
