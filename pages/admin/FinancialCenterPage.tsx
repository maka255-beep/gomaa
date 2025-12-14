
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { SubscriptionStatus, Workshop, Payment, Expense, OrderStatus } from '../../types';
import { 
    DownloadIcon, ChevronDownIcon, CloseIcon, PrintIcon, ReceiptTaxIcon, ChartBarIcon, ArchiveBoxIcon
} from '../../components/icons';
import { formatArabicDate, downloadHtmlAsPdf } from '../../utils';
import PaymentsModal from '../../components/PaymentsModal';
// Named import as per ExpensesModal.tsx definition
import { ExpensesModal } from '../../components/ExpensesModal';
import { useAdminTranslation } from './AdminTranslationContext';
import PaidTaxReportModal from './PaidTaxReportModal';
import CollectedTaxReportModal from './CollectedTaxReportModal';
import AnnualTaxReportModal from './AnnualTaxReportModal';

declare const XLSX: any;

// ====================================================================================
// 1. TRAINER FINANCIAL REPORT TAB (WORKSHOPS ONLY)
// ====================================================================================

interface TrainerFinancialReportTabProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

const TrainerFinancialReportTab: React.FC<TrainerFinancialReportTabProps> = ({ showToast }) => {
    const { users, workshops, expenses, updateWorkshop } = useUser();
    const [editingPaymentsFor, setEditingPaymentsFor] = useState<Workshop | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [workshopFilter, setWorkshopFilter] = useState('all');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const profitData = useMemo(() => {
        return workshops.filter(w => !w.isDeleted).map(workshop => {
          const subscriptions = users.flatMap(u => u.subscriptions.filter(s => s.workshopId === workshop.id && (s.status === SubscriptionStatus.ACTIVE || s.status === SubscriptionStatus.TRANSFERRED) && s.isApproved !== false));
          const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.pricePaid || 0), 0);
          const revenueExcludingTax = totalRevenue / 1.05;
          const workshopExpenses = expenses.filter(e => e.workshopId === workshop.id && !e.isDeleted).reduce((sum, e) => sum + (e.includesVat !== false ? e.amount / 1.05 : e.amount), 0);
          const netProfit = revenueExcludingTax - workshopExpenses;
          const trainerPercentage = workshop.trainerPercentage || 0;
          const trainerShare = netProfit * (trainerPercentage / 100);
          const companyShare = netProfit - trainerShare;
          const totalPaidToTrainer = (workshop.trainerPayments || []).reduce((sum, p) => sum + p.amount, 0);
          const remainingForTrainer = trainerShare - totalPaidToTrainer;

          return { workshop, totalRevenue, revenueExcludingTax, workshopExpenses, netProfit, trainerShare, companyShare, totalPaidToTrainer, remainingForTrainer };
        });
    }, [users, workshops, expenses]);
    
    const filteredWorkshopData = useMemo(() => {
        if (workshopFilter === 'all') {
            return profitData;
        }
        return profitData.filter(d => d.workshop.id === parseInt(workshopFilter, 10));
    }, [profitData, workshopFilter]);


    const handleSavePayments = (workshopId: number, data: { payments: Payment[]; percentage: number }) => {
        const updatedWorkshop = workshops.find(w => w.id === workshopId);
        if (updatedWorkshop) {
            updateWorkshop({ ...updatedWorkshop, trainerPayments: data.payments, trainerPercentage: data.percentage });
            showToast('تم حفظ سجل الدفعات بنجاح.', 'success');
        }
    };
    
    const handleExcelExport = () => {
        setIsExportMenuOpen(false);
        const filterName = workshopFilter === 'all'
            ? 'All_Workshops'
            : workshops.find(w => w.id === parseInt(workshopFilter, 10))?.title.replace(/\s/g, '_') || 'Filtered';
        const filename = `Workshop_Financials_${filterName}_${new Date().toISOString().split('T')[0]}.xlsx`;

        const dataToExport = filteredWorkshopData.map(d => ({
            'الورشة': d.workshop.title,
            'إجمالي الإيرادات': d.totalRevenue.toFixed(2),
            'الإيرادات (بعد الضريبة)': d.revenueExcludingTax.toFixed(2),
            'المصروفات': d.workshopExpenses.toFixed(2),
            'صافي الربح': d.netProfit.toFixed(2),
            'حصة المدربة': d.trainerShare.toFixed(2),
            'حصة الشركة': d.companyShare.toFixed(2),
            'إجمالي المدفوع للمدربة': d.totalPaidToTrainer.toFixed(2),
            'المتبقي للمدربة': d.remainingForTrainer.toFixed(2),
        }));
        
        const totals = filteredWorkshopData.reduce((acc, d) => {
            acc.totalRevenue += d.totalRevenue;
            acc.revenueExcludingTax += d.revenueExcludingTax;
            acc.workshopExpenses += d.workshopExpenses;
            acc.netProfit += d.netProfit;
            acc.trainerShare += d.trainerShare;
            acc.companyShare += d.companyShare;
            acc.totalPaidToTrainer += d.totalPaidToTrainer;
            acc.remainingForTrainer += d.remainingForTrainer;
            return acc;
        }, { totalRevenue: 0, revenueExcludingTax: 0, workshopExpenses: 0, netProfit: 0, trainerShare: 0, companyShare: 0, totalPaidToTrainer: 0, remainingForTrainer: 0 });

        const totalsRow = {
            'الورشة': 'الإجمالي',
            'إجمالي الإيرادات': totals.totalRevenue.toFixed(2),
            'الإيرادات (بعد الضريبة)': totals.revenueExcludingTax.toFixed(2),
            'المصروفات': totals.workshopExpenses.toFixed(2),
            'صافي الربح': totals.netProfit.toFixed(2),
            'حصة المدربة': totals.trainerShare.toFixed(2),
            'حصة الشركة': totals.companyShare.toFixed(2),
            'إجمالي المدفوع للمدربة': totals.totalPaidToTrainer.toFixed(2),
            'المتبقي للمدربة': totals.remainingForTrainer.toFixed(2),
        };

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.sheet_add_json(worksheet, [totalsRow], { skipHeader: true, origin: -1 });

        worksheet['!cols'] = Array(9).fill({ wch: 20 });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Report');
        XLSX.writeFile(workbook, filename);
    };

    const handlePdfExport = () => {
        setIsExportMenuOpen(false);
        const filterName = workshopFilter === 'all'
            ? 'كل الورشات'
            : workshops.find(w => w.id === parseInt(workshopFilter, 10))?.title || 'ورشة محددة';

        const tableRows = filteredWorkshopData.map(d => `
            <tr>
                <td>${d.workshop.title}</td>
                <td>${d.netProfit.toFixed(2)}</td>
                <td>${d.trainerShare.toFixed(2)}</td>
                <td>${d.companyShare.toFixed(2)}</td>
                <td>${d.totalPaidToTrainer.toFixed(2)}</td>
                <td>${d.remainingForTrainer.toFixed(2)}</td>
            </tr>
        `).join('');

        const totals = filteredWorkshopData.reduce((acc, d) => ({
            netProfit: acc.netProfit + d.netProfit,
            trainerShare: acc.trainerShare + d.trainerShare,
            companyShare: acc.companyShare + d.companyShare,
            totalPaidToTrainer: acc.totalPaidToTrainer + d.totalPaidToTrainer,
            remainingForTrainer: acc.remainingForTrainer + d.remainingForTrainer
        }), { netProfit: 0, trainerShare: 0, companyShare: 0, totalPaidToTrainer: 0, remainingForTrainer: 0 });
        
        const totalRow = `
            <tfoot>
                <tr>
                    <td>الإجمالي</td>
                    <td>${totals.netProfit.toFixed(2)}</td>
                    <td>${totals.trainerShare.toFixed(2)}</td>
                    <td>${totals.companyShare.toFixed(2)}</td>
                    <td>${totals.totalPaidToTrainer.toFixed(2)}</td>
                    <td>${totals.remainingForTrainer.toFixed(2)}</td>
                </tr>
            </tfoot>
        `;
        
        const html = `
            <html>
                <head>
                    <title>التقرير المالي - ${filterName}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                        th { background-color: #f2f2f2; }
                        tfoot { font-weight: bold; background-color: #f2f2f2; }
                        @page { size: A4 landscape; margin: 20mm; }
                        h1, h2 { text-align: right; }
                    </style>
                </head>
                <body>
                    <h1>التقرير المالي للورش</h1>
                    <h2>التصنيف: ${filterName}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>الورشة</th>
                                <th>صافي الربح</th>
                                <th>حصة المدربة</th>
                                <th>حصة الشركة</th>
                                <th>إجمالي المدفوع للمدربة</th>
                                <th>المتبقي للمدربة</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                        ${totalRow}
                    </table>
                </body>
            </html>
        `;
        downloadHtmlAsPdf(html, `Financial_Report_${filterName}.pdf`);
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>عرض بيانات {filteredWorkshopData.length} ورشة</span>
                <div className="flex items-center gap-x-4">
                    <div className="flex items-center gap-x-2">
                        <label htmlFor="financial-workshop-filter" className="text-sm font-bold text-slate-300">فلتر الورشة:</label>
                        <select
                            id="financial-workshop-filter"
                            value={workshopFilter}
                            onChange={(e) => setWorkshopFilter(e.target.value)}
                            className="p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm w-60"
                        >
                            <option value="all">كل الورشات</option>
                            {workshops.filter(w => !w.isDeleted).map(w => (
                                <option key={w.id} value={w.id}>{w.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative" ref={exportMenuRef}>
                        <button onClick={() => setIsExportMenuOpen(p => !p)} className="flex items-center gap-x-2 bg-slate-700/70 hover:bg-slate-600/70 text-white font-bold py-2 px-3 rounded-lg text-sm">
                            <DownloadIcon className="w-5 h-5"/><span>تصدير</span><ChevronDownIcon className="w-4 h-4" />
                        </button>
                        {isExportMenuOpen && (
                            <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10">
                                <button onClick={handleExcelExport} className="w-full text-right px-4 py-2 text-sm text-white hover:bg-fuchsia-500/20 flex items-center gap-x-2"><DownloadIcon className="w-4 h-4"/><span>Excel</span></button>
                                <button onClick={handlePdfExport} className="w-full text-right px-4 py-2 text-sm text-white hover:bg-fuchsia-500/20 flex items-center gap-x-2"><PrintIcon className="w-4 h-4"/><span>PDF</span></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-black/20 rounded-lg border border-slate-700/50">
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 p-3">
                    {filteredWorkshopData.map(data => (
                        <div key={data.workshop.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-3 hover:border-yellow-500/50 transition-colors">
                            <h4 className="font-bold text-white text-base">{data.workshop.title}</h4>
                            <div className="grid grid-cols-2 gap-3 text-center text-sm">
                                <div className="bg-slate-700/50 p-2 rounded"><p className="text-xs text-slate-300">إجمالي الإيرادات</p><p className="font-bold">{data.totalRevenue.toFixed(2)}</p></div>
                                <div className="bg-slate-700/50 p-2 rounded"><p className="text-xs text-slate-300">صافي الربح</p><p className="font-bold">{data.netProfit.toFixed(2)}</p></div>
                                <div className="bg-slate-700/50 p-2 rounded"><p className="text-xs text-slate-300">حصة المدربة</p><p className="font-bold">{data.trainerShare.toFixed(2)}</p></div>
                                <div className="bg-slate-700/50 p-2 rounded"><p className="text-xs text-slate-300">حصة الشركة</p><p className="font-bold">{data.companyShare.toFixed(2)}</p></div>
                                <div className="bg-sky-500/10 p-2 rounded"><p className="text-xs text-sky-300">إجمالي المدفوع</p><p className="font-bold">{data.totalPaidToTrainer.toFixed(2)}</p></div>
                                <div className={`${data.remainingForTrainer >= 0 ? 'bg-amber-500/10' : 'bg-red-500/10'} p-2 rounded`}><p className={`text-xs ${data.remainingForTrainer >= 0 ? 'text-amber-300' : 'text-red-300'}`}>المتبقي للمدربة</p><p className="font-bold">{data.remainingForTrainer.toFixed(2)}</p></div>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-600 pt-3 mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold">نسبة المدربة:</label>
                                    <input type="number" value={data.workshop.trainerPercentage || 0} onChange={e => handleSavePayments(data.workshop.id, { payments: data.workshop.trainerPayments || [], percentage: parseInt(e.target.value) || 0 })} className="w-16 p-1 bg-slate-700 border border-slate-600 rounded-md text-center text-sm" min="0" max="100" /> %
                                </div>
                                <button onClick={() => setEditingPaymentsFor(data.workshop)} className="py-2 px-3 bg-sky-600 hover:bg-sky-500 rounded-md text-xs font-bold">إدارة الدفعات</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-sm text-center text-white">
                        <thead className="text-yellow-300 uppercase tracking-wider font-bold text-xs">
                          <tr className="border-b-2 border-yellow-500/50 bg-black/20">
                            <th className="py-3 px-2 text-right">الورشة</th>
                            <th className="py-3 px-2">إجمالي الإيرادات</th>
                            <th className="py-3 px-2">صافي الربح</th>
                            <th className="py-3 px-2">نسبة المدربة</th>
                            <th className="py-3 px-2">حصة المدربة</th>
                            <th className="py-3 px-2">حصة الشركة</th>
                            <th className="py-3 px-2">إجمالي المدفوع للمدربة</th>
                            <th className="py-3 px-2">المتبقي للمدربة</th>
                            <th className="py-3 px-2">إدارة الدفعات</th>
                          </tr>
                        </thead>
                        <tbody className="font-semibold divide-y divide-slate-800">
                            {filteredWorkshopData.map(data => (<tr key={data.workshop.id} className="hover:bg-yellow-500/10 transition-colors">
                              <td className="py-3 px-2 text-right">{data.workshop.title}</td>
                              <td className="py-3 px-2">{data.totalRevenue.toFixed(2)}</td>
                              <td className="py-3 px-2">{data.netProfit.toFixed(2)}</td>
                              <td className="py-3 px-2"><input type="number" value={data.workshop.trainerPercentage || 0} onChange={e => handleSavePayments(data.workshop.id, { payments: data.workshop.trainerPayments || [], percentage: parseInt(e.target.value) || 0 })} className="w-20 p-1 bg-slate-700/50 border border-slate-600 rounded-md text-center" min="0" max="100" /> %</td>
                              <td className="py-3 px-2 font-bold">{data.trainerShare.toFixed(2)}</td>
                              <td className="py-3 px-2 font-bold">{data.companyShare.toFixed(2)}</td>
                              <td className="py-3 px-2 text-sky-300">{data.totalPaidToTrainer.toFixed(2)}</td>
                              <td className={`py-3 px-2 font-bold ${data.remainingForTrainer >= 0 ? 'text-amber-400' : 'text-red-500'}`}>{data.remainingForTrainer.toFixed(2)}</td>
                              <td className="py-3 px-2"><button onClick={() => setEditingPaymentsFor(data.workshop)} className="py-1 px-3 bg-sky-600 hover:bg-sky-500 rounded-md text-xs font-bold">إدارة الدفعات</button></td>
                            </tr>))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingPaymentsFor && (<PaymentsModal workshop={editingPaymentsFor} initialPayments={editingPaymentsFor.trainerPayments || []} initialPercentage={editingPaymentsFor.trainerPercentage || 0} onClose={() => setEditingPaymentsFor(null)} onSave={handleSavePayments} />)}
        </div>
    );
};


// ====================================================================================
// 2. BOUTIQUE REVENUE TAB
// ====================================================================================

const BoutiqueRevenueTab: React.FC = () => {
    const { users, products } = useUser();

    const boutiqueData = useMemo(() => {
        const completedOrders = users.flatMap(u => u.orders).filter(o => o.status === OrderStatus.COMPLETED);
        
        let totalRevenue = 0;
        let totalTax = 0;
        let platformNetRevenue = 0;
        let totalOwnerShares = 0;
        const ownerSharesBreakdown: { [ownerId: number]: { ownerName: string; share: number } } = {};

        completedOrders.forEach(order => {
            totalRevenue += order.totalAmount;
            totalTax += order.taxAmount;

            order.products.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const netPrice = item.price * item.quantity; // Price in order is already net
                    if (product.ownerId && product.ownerPercentage) {
                        const ownerShare = netPrice * (product.ownerPercentage / 100);
                        totalOwnerShares += ownerShare;
                        platformNetRevenue += netPrice - ownerShare;

                        if (!ownerSharesBreakdown[product.ownerId]) {
                            const owner = users.find(u => u.id === product.ownerId);
                            ownerSharesBreakdown[product.ownerId] = { ownerName: owner?.fullName || `Owner ID ${product.ownerId}`, share: 0 };
                        }
                        ownerSharesBreakdown[product.ownerId].share += ownerShare;
                    } else {
                        platformNetRevenue += netPrice;
                    }
                }
            });
        });
        
        const netRevenue = totalRevenue - totalTax;

        return {
            totalRevenue, totalTax, netRevenue, orderCount: completedOrders.length, platformNetRevenue, totalOwnerShares, ownerSharesBreakdown: Object.values(ownerSharesBreakdown)
        };
    }, [users, products]);

    const platformNetProfit = boutiqueData.netRevenue - boutiqueData.totalOwnerShares;
    
    return (
        <div className="space-y-6">
            <div className="text-right text-xs text-slate-400 mb-2">
                ملخص لعدد {boutiqueData.orderCount} طلب مكتمل.
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <table className="min-w-full text-sm text-white">
                    <thead className="text-yellow-300 uppercase font-bold text-xs">
                        <tr className="border-b-2 border-yellow-500/50">
                            <th className="py-3 px-2 text-right">البند</th>
                            <th className="py-3 px-2 text-center">المبلغ (درهم)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 font-semibold">
                        <tr className="hover:bg-yellow-500/10"><td className="py-3 px-2">إجمالي إيرادات البوتيك (شامل الضريبة)</td><td className="py-3 px-2 text-center">{boutiqueData.totalRevenue.toFixed(2)}</td></tr>
                        <tr className="hover:bg-yellow-500/10"><td className="py-3 px-2">إجمالي ضريبة القيمة المضافة (5%)</td><td className="py-3 px-2 text-center">{boutiqueData.totalTax.toFixed(2)}</td></tr>
                        <tr className="hover:bg-yellow-500/10"><td className="py-3 px-2">صافي الإيرادات (بعد الضريبة)</td><td className="py-3 px-2 text-center">{boutiqueData.netRevenue.toFixed(2)}</td></tr>
                        <tr className="hover:bg-yellow-500/10"><td className="py-3 px-2">إجمالي حصص أصحاب المنتجات</td><td className="py-3 px-2 text-center text-red-400">-{boutiqueData.totalOwnerShares.toFixed(2)}</td></tr>
                        <tr className="bg-green-500/10 font-bold text-base"><td className="py-4 px-2">صافي ربح المنصة من البوتيك</td><td className="py-4 px-2 text-center text-green-300">{platformNetProfit.toFixed(2)}</td></tr>
                    </tbody>
                </table>
            </div>

             {boutiqueData.ownerSharesBreakdown.length > 0 && (
                <div className="bg-black/20 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-base font-bold text-fuchsia-300">تفاصيل حصص المالكين</h3>
                    </div>
                    <table className="min-w-full text-sm text-white text-center">
                        <thead className="bg-slate-700 text-xs uppercase text-slate-300">
                            <tr><th className="p-2">المالك</th><th className="p-2">الحصة المستحقة</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-600">
                            {boutiqueData.ownerSharesBreakdown.map((item, idx) => (
                                <tr key={idx}><td className="p-2">{item.ownerName}</td><td className="p-2">{item.share.toFixed(2)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ====================================================================================
// 3. MAIN PAGE COMPONENT
// ====================================================================================

interface FinancialCenterPageProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

const FinancialCenterPage: React.FC<FinancialCenterPageProps> = ({ showToast }) => {
    const { t } = useAdminTranslation();
    const [activeTab, setActiveTab] = useState<'workshops' | 'boutique' | 'expenses'>('workshops');
    
    // Modal states
    const [isPaidTaxReportOpen, setIsPaidTaxReportOpen] = useState(false);
    const [isCollectedTaxReportOpen, setIsCollectedTaxReportOpen] = useState(false);
    const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
    const [isAnnualReportOpen, setIsAnnualReportOpen] = useState(false);

    // Dummy data for annual report - in real scenario calculate from all sources
    const { workshops, users, expenses, products } = useUser();
    
    const annualStats = useMemo(() => {
        // 1. Workshops
        let workshopProfit = 0;
        workshops.filter(w => !w.isDeleted).forEach(w => {
             const subscriptions = users.flatMap(u => u.subscriptions.filter(s => s.workshopId === w.id && (s.status === SubscriptionStatus.ACTIVE || s.status === SubscriptionStatus.TRANSFERRED) && s.isApproved !== false));
             const revenue = subscriptions.reduce((sum, s) => sum + (s.pricePaid || 0), 0) / 1.05;
             const expense = expenses.filter(e => e.workshopId === w.id && !e.isDeleted).reduce((sum, e) => sum + (e.includesVat !== false ? e.amount / 1.05 : e.amount), 0);
             workshopProfit += (revenue - expense);
        });

        // 2. Boutique (Platform Share)
        const completedOrders = users.flatMap(u => u.orders).filter(o => o.status === OrderStatus.COMPLETED);
        let boutiqueRevenue = 0;
        let ownersShare = 0;
        completedOrders.forEach(o => {
            o.products.forEach(p => {
                const prod = products.find(prod => prod.id === p.productId);
                const netPrice = p.price * p.quantity;
                boutiqueRevenue += netPrice;
                if(prod?.ownerId) ownersShare += netPrice * ((prod.ownerPercentage || 0) / 100);
            });
        });
        const boutiqueProfit = (boutiqueRevenue - ownersShare); // Simplified, tax handled inside modal

        // 3. Consultations (Simple placeholder logic as they are not fully tracked in this view yet)
        const consultationProfit = 0; 

        return { workshopProfit, consultationProfit, boutiqueProfit };
    }, [users, workshops, expenses, products]);


    const tabButtonClass = (tabName: 'workshops' | 'boutique' | 'expenses') => 
    `py-3 px-4 text-sm font-bold border-b-2 flex items-center gap-x-2 ${
      activeTab === tabName ? 'text-white border-fuchsia-500' : 'text-slate-400 border-transparent hover:text-white'
    }`;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-x-3">
                <ReceiptTaxIcon className="w-7 h-7 text-fuchsia-300" />
                <span>{t('financialCenter.title')}</span>
            </h2>
            
            <div className="border-b border-slate-700/50">
                <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2">
                    <button onClick={() => setActiveTab('workshops')} className={tabButtonClass('workshops')}>
                        <ChartBarIcon className="w-5 h-5"/><span>{t('financialCenter.workshopReports')}</span>
                    </button>
                    <button onClick={() => setActiveTab('boutique')} className={tabButtonClass('boutique')}>
                        <ArchiveBoxIcon className="w-5 h-5"/><span>{t('financialCenter.boutiqueSummary')}</span>
                    </button>
                    <button onClick={() => setIsExpensesModalOpen(true)} className="py-3 px-4 text-sm font-bold text-slate-400 hover:text-white flex items-center gap-x-2">
                        <ChevronDownIcon className="w-5 h-5"/><span>{t('financialCenter.expensesAndTaxes')}</span>
                    </button>
                </nav>
            </div>

            {/* Quick Action Cards for Taxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setIsPaidTaxReportOpen(true)} className="bg-indigo-900/40 p-4 rounded-xl border border-indigo-500/30 hover:bg-indigo-900/60 transition-colors text-right group">
                    <p className="text-sm text-indigo-300 font-bold mb-1">ضريبة الإيرادات</p>
                    <p className="text-xs text-slate-400 group-hover:text-white">تقرير ضريبة القيمة المضافة المحصلة</p>
                </button>
                <button onClick={() => setIsCollectedTaxReportOpen(true)} className="bg-teal-900/40 p-4 rounded-xl border border-teal-500/30 hover:bg-teal-900/60 transition-colors text-right group">
                    <p className="text-sm text-teal-300 font-bold mb-1">ضريبة المصروفات</p>
                    <p className="text-xs text-slate-400 group-hover:text-white">تقرير الضريبة المستردة</p>
                </button>
                <button onClick={() => setIsAnnualReportOpen(true)} className="bg-purple-900/40 p-4 rounded-xl border border-purple-500/30 hover:bg-purple-900/60 transition-colors text-right group">
                    <p className="text-sm text-purple-300 font-bold mb-1">الضريبة السنوية</p>
                    <p className="text-xs text-slate-400 group-hover:text-white">تقرير ضريبة صافي الربح (9%)</p>
                </button>
            </div>
            
            <div className="mt-6">
                {activeTab === 'workshops' && <TrainerFinancialReportTab showToast={showToast} />}
                {activeTab === 'boutique' && <BoutiqueRevenueTab />}
            </div>

            {isExpensesModalOpen && <ExpensesModal isOpen={isExpensesModalOpen} onClose={() => setIsExpensesModalOpen(false)} />}
            {isPaidTaxReportOpen && <PaidTaxReportModal isOpen={isPaidTaxReportOpen} onClose={() => setIsPaidTaxReportOpen(false)} />}
            {isCollectedTaxReportOpen && <CollectedTaxReportModal isOpen={isCollectedTaxReportOpen} onClose={() => setIsCollectedTaxReportOpen(false)} />}
            {isAnnualReportOpen && <AnnualTaxReportModal isOpen={isAnnualReportOpen} onClose={() => setIsAnnualReportOpen(false)} workshopProfit={annualStats.workshopProfit} consultationProfit={annualStats.consultationProfit} boutiqueProfit={annualStats.boutiqueProfit} />}
        </div>
    );
};

export default FinancialCenterPage;
