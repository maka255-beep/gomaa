
import React, { useState, useMemo, useEffect, useRef, useReducer, ChangeEvent } from 'react';
import { useUser } from '../../context/UserContext';
import { User, Subscription, Workshop, SubscriptionStatus, Package, PendingGift } from '../../types';
import TransferWorkshopModal from '../../components/TransferWorkshopModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { TrashIcon, RefundIcon, PlusCircleIcon, SwitchIcon, UserCircleIcon, RestoreIcon, CloseIcon, DownloadIcon, ChevronDownIcon, CalendarIcon, CollectionIcon, CheckCircleIcon, PencilIcon, UsersIcon, PrintIcon, CogIcon, EnvelopeIcon, PhoneIcon, WhatsAppIcon, InformationCircleIcon, CreditCardIcon, BanknotesIcon, GiftIcon, ClipboardCopyIcon, ReceiptTaxIcon, ExclamationCircleIcon, TagIcon, GlobeAltIcon, AcademicCapIcon, UserIcon, EyeIcon, HeartIcon, UserAddIcon } from '../../components/icons';
import { formatArabicDate, normalizePhoneNumber, toEnglishDigits, isWorkshopExpired, downloadHtmlAsPdf } from '../../utils';
import RefundModal from '../../components/RefundModal';
import AddSubscriptionModal from '../../components/AddSubscriptionModal';
import EditSubscriptionModal from '../../components/EditSubscriptionModal';
import TransfersStatsModal from '../../components/TransfersStatsModal';
import RefundsStatsModal from '../../components/RefundsStatsModal';
import DetailedStatsModal from '../../components/DetailedStatsModal';
import RecordingAccessModal from '../../components/RecordingAccessModal';
import { useAdminTranslation } from './AdminTranslationContext';
import CreditBalancesModal from '../../components/CreditBalancesModal';
import CreditPaymentsModal from '../../components/CreditPaymentsModal';
import SubscriptionRecordingAccessModal from '../../components/SubscriptionRecordingAccessModal';
import GrantSeatModal from '../../components/GrantSeatModal';
import BeneficiariesModal from '../../components/BeneficiariesModal';
import ManageDonationModal from '../../components/ManageDonationModal';
import ManagePendingGiftModal from '../../components/ManagePendingGiftModal';

declare const XLSX: any;
declare const jspdf: any;
declare const html2canvas: any;

export interface SubscriptionWithDetails {
    user: User;
    subscription: Subscription;
    workshop: Workshop;
    pkg: Package | undefined;
    requiredPrice: number;
    remainingAmount: number;
}

interface TransfersPageProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  onViewUserProfile: (user: User) => void;
  onViewInvoice: (details: { user: User; subscription: Subscription }) => void;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.FC<{ className?: string }>;
    colorClass: string;
    onClick?: () => void;
    badge?: boolean;
    footerText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass, onClick, badge, footerText }) => {
    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className="relative bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-right group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-fuchsia-500/10 disabled:cursor-default disabled:hover:transform-none w-full"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-400 font-bold">{title}</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
                    {footerText && <p className="text-xs text-slate-500 mt-2">{footerText}</p>}
                </div>
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${colorClass.replace('text-', 'bg-')}/10`}>
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
            </div>

            {badge && <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-yellow-400 ring-2 ring-slate-900"></span>}
        </button>
    );
};

const NotApprovedModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  subscriptions: SubscriptionWithDetails[];
  onApprove: (s: SubscriptionWithDetails) => void;
}> = ({ isOpen, onClose, subscriptions, onApprove }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-70 p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 text-white rounded-lg shadow-2xl w-full max-w-4xl border border-yellow-500/80 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-yellow-500/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-yellow-300">الموافقات المعلقة</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
        </header>
        <div className="p-6 overflow-y-auto">
          <table className="min-w-full text-sm text-white">
            <thead className="border-b-2 border-yellow-500/30 text-yellow-300 uppercase font-bold text-xs">
              <tr className="border-b-2 border-yellow-500/30 text-yellow-300 uppercase font-bold text-xs">
                <th className="p-2 text-right">المشترك</th>
                <th className="p-2 text-right">رقم الهاتف</th>
                <th className="p-2 text-right">الورشة</th>
                <th className="p-2 text-center">نوع الطلب</th>
                <th className="p-2 text-center">تاريخ الطلب</th>
                <th className="p-2 text-center">طريقة الدفع</th>
                <th className="p-2 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.subscription.id} className="border-b border-slate-800 hover:bg-yellow-500/10">
                  <td className="p-2 text-right font-semibold">{s.user.fullName}</td>
                  <td className="p-2 text-right">{s.user.phone}</td>
                  <td className="p-2 text-right">{s.workshop.title}</td>
                  <td className="p-2 text-center">
                    {s.subscription.isPayItForwardDonation ? (
                        <span className="bg-pink-500/20 text-pink-300 text-xs px-2 py-1 rounded font-bold">دعم</span>
                    ) : (
                        <span className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded">اشتراك</span>
                    )}
                  </td>
                  <td className="p-2 text-center">{formatArabicDate(s.subscription.activationDate)}</td>
                  <td className="p-2 text-center">{s.subscription.paymentMethod}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => onApprove(s)} className="py-1 px-3 bg-green-600 hover:bg-green-500 rounded-md text-xs font-bold">موافقة</button>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center">لا توجد موافقات معلقة.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`.z-70 { z-index: 70; }`}</style>
    </div>
  );
};

const DebtModal: React.FC<{ isOpen: boolean; onClose: () => void; subscriptions: SubscriptionWithDetails[] }> = ({ isOpen, onClose, subscriptions }) => {
    const [selectedWorkshopId, setSelectedWorkshopId] = useState('all');

    const workshopsWithDebts = useMemo(() => {
        const workshopsMap = new Map<number, { id: number; title: string }>();
        subscriptions.forEach(sub => {
            if (!workshopsMap.has(sub.workshop.id)) {
                workshopsMap.set(sub.workshop.id, { id: sub.workshop.id, title: sub.workshop.title });
            }
        });
        return Array.from(workshopsMap.values());
    }, [subscriptions]);

    const filteredDebtors = useMemo(() => {
        if (selectedWorkshopId === 'all') {
            return subscriptions;
        }
        const workshopIdNum = parseInt(selectedWorkshopId, 10);
        return subscriptions.filter(sub => sub.workshop.id === workshopIdNum);
    }, [subscriptions, selectedWorkshopId]);

    const totalDebt = useMemo(() => {
        return filteredDebtors.reduce((sum, sub) => sum + sub.remainingAmount, 0);
    }, [filteredDebtors]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-70 p-4" onClick={onClose}>
            <div className="bg-slate-900 text-white rounded-lg shadow-2xl w-full max-w-4xl border border-red-500/80 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-red-500/50 flex-shrink-0">
                    <h2 className="text-xl font-bold text-red-300">المشتركون المدينون</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-4 border-b border-red-500/50 flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
                     <select
                        value={selectedWorkshopId}
                        onChange={e => setSelectedWorkshopId(e.target.value)}
                        className="w-full md:w-1/2 p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm"
                    >
                        <option value="all">كل الورشات</option>
                        {workshopsWithDebts.map(w => (
                            <option key={w.id} value={w.id.toString()}>{w.title}</option>
                        ))}
                    </select>
                    <div className="text-center bg-black/20 p-2 rounded-lg">
                        <p className="text-sm font-bold text-red-300">إجمالي المديونيات المحددة</p>
                        <p className="text-xl font-bold">{totalDebt.toFixed(2)}</p>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto">
                    <table className="min-w-full text-sm text-white">
                        <thead className="border-b-2 border-red-500/30 text-red-300 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-2 text-right">المشترك</th>
                                <th className="p-2 text-right">رقم الهاتف</th>
                                <th className="p-2 text-right">الورشة</th>
                                <th className="p-2 text-center">المبلغ المتبقي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDebtors.map(({ user, subscription, workshop, remainingAmount }) => (
                                <tr key={subscription.id} className="border-b border-slate-800 hover:bg-red-500/10">
                                    <td className="p-2 text-right font-semibold">{user.fullName}</td>
                                    <td className="p-2 text-right">{user.phone}</td>
                                    <td className="p-2 text-right">{workshop.title}</td>
                                    <td className="p-2 text-center font-bold text-red-400">{remainingAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                             {filteredDebtors.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400">
                                        لا توجد مديونيات تطابق الفلتر المحدد.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`.z-70 { z-index: 70; }`}</style>
        </div>
    );
};

const paymentMethodColors: Record<string, string> = {
    'BANK': 'bg-blue-500/20 text-blue-300', 'LINK': 'bg-green-500/20 text-green-300', 'GIFT': 'bg-purple-500/20 text-purple-300', 'CREDIT': 'bg-amber-500/20 text-amber-300',
};

const statusColors: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.ACTIVE]: 'bg-green-500/20 text-green-300',
    [SubscriptionStatus.TRANSFERRED]: 'bg-blue-500/20 text-blue-300',
    [SubscriptionStatus.REFUNDED]: 'bg-red-500/20 text-red-300',
    [SubscriptionStatus.PENDING]: 'bg-yellow-500/20 text-yellow-300',
    [SubscriptionStatus.COMPLETED]: 'bg-gray-500/20 text-gray-300',
};

const statusNames: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.ACTIVE]: 'نشط',
    [SubscriptionStatus.TRANSFERRED]: 'محول',
    [SubscriptionStatus.REFUNDED]: 'مسترد',
    [SubscriptionStatus.PENDING]: 'قيد الانتظار',
    [SubscriptionStatus.COMPLETED]: 'مكتمل',
};

const getCellValue = (item: SubscriptionWithDetails, key: string): string | number => {
    switch (key) {
        case 'user': return item.user.fullName;
        case 'workshop': return item.workshop.title;
        case 'phone': return item.user.phone ? item.user.phone.replace(/^\+/, '') : '';
        case 'email': return item.user.email;
        case 'subscriptionDate': return formatArabicDate(item.subscription.activationDate);
        case 'package': return item.pkg?.name || '-';
        case 'paymentMethod': return item.subscription.paymentMethod || '-';
        case 'amountPaid': return item.subscription.pricePaid || 0;
        case 'remainingAmount': return item.remainingAmount || 0;
        case 'status': return statusNames[item.subscription.status] || item.subscription.status;
        default: return '';
    }
};

const ITEMS_PER_PAGE = 50;

type ActiveTab = 'all' | 'trash';
type ModalType = 'transfer' | 'refund' | 'edit' | 'add' | 'notApproved' | 'statsTransfers' | 'statsRefunds' | 'statsDetailed' | 'recordingAccess' | 'confirmation' | 'creditPayments' | 'creditBalances' | 'excelImport' | 'subscriptionRecordingAccess' | 'debt' | 'grantSeat' | 'manageDonation' | 'managePendingGift';

interface ConfirmationState {
    title: string;
    message: string;
    onConfirm: () => void;
}

interface State {
    activeTab: ActiveTab;
    searchTerm: string;
    workshopFilter: string;
    secondaryFilter: string;
    currentPage: number;
    isExportMenuOpen: boolean;
    activeModals: Set<ModalType>;
    modalPayloads: { [key: string]: any };
    confirmationState: ConfirmationState | null;
}

type Action =
    | { type: 'SET_TAB'; payload: ActiveTab }
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'SET_WORKSHOP_FILTER'; payload: string }
    | { type: 'SET_SECONDARY_FILTER'; payload: string }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_EXPORT_MENU'; payload: boolean }
    | { type: 'OPEN_MODAL'; payload: { type: ModalType; data?: any } }
    | { type: 'CLOSE_MODAL'; payload: ModalType }
    | { type: 'SHOW_CONFIRMATION'; payload: ConfirmationState };

const initialState: State = {
    activeTab: 'all',
    searchTerm: '',
    workshopFilter: 'all',
    secondaryFilter: 'all',
    currentPage: 1,
    isExportMenuOpen: false,
    activeModals: new Set(),
    modalPayloads: {},
    confirmationState: null,
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_TAB':
            return { ...state, activeTab: action.payload, currentPage: 1, searchTerm: '', workshopFilter: 'all', secondaryFilter: 'all' };
        case 'SET_SEARCH':
            return { ...state, searchTerm: action.payload, currentPage: 1 };
        case 'SET_WORKSHOP_FILTER':
            return { ...state, workshopFilter: action.payload, currentPage: 1, secondaryFilter: 'all' };
        case 'SET_SECONDARY_FILTER':
            return { ...state, secondaryFilter: action.payload, currentPage: 1 };
        case 'SET_PAGE':
            return { ...state, currentPage: action.payload };
        case 'SET_EXPORT_MENU':
            return { ...state, isExportMenuOpen: action.payload };
        case 'OPEN_MODAL': {
            const newModals = new Set(state.activeModals);
            newModals.add(action.payload.type);
            return {
                ...state,
                activeModals: newModals,
                modalPayloads: {
                    ...state.modalPayloads,
                    [action.payload.type]: action.payload.data,
                }
            };
        }
        case 'CLOSE_MODAL': {
            const newModals = new Set(state.activeModals);
            newModals.delete(action.payload);
            const newPayloads = { ...state.modalPayloads };
            delete newPayloads[action.payload];
            return {
                ...state,
                activeModals: newModals,
                modalPayloads: newPayloads,
                confirmationState: action.payload === 'confirmation' ? null : state.confirmationState,
            };
        }
        case 'SHOW_CONFIRMATION': {
            const newModals = new Set(state.activeModals);
            newModals.add('confirmation');
            return { ...state, activeModals: newModals, confirmationState: action.payload };
        }
        default:
            return state;
    }
}

const TransfersPage: React.FC<TransfersPageProps> = ({ showToast, onViewUserProfile, onViewInvoice }) => {
    const { users, workshops, drhopeData, updateSubscription, deleteSubscription, restoreSubscription, permanentlyDeleteSubscription, transferSubscription, reactivateSubscription, addSubscription, checkRegistrationAvailability, addUser, convertToInternalCredit, pendingGifts, deletePendingGift, restorePendingGift, permanentlyDeletePendingGift, donateToPayItForward, adminManualClaimGift, grantPayItForwardSeat, updatePendingGift, updateUser } = useUser();
    const { t } = useAdminTranslation();
    const [state, dispatch] = useReducer(reducer, initialState);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [isPendingGiftsModalOpen, setIsPendingGiftsModalOpen] = useState(false);
    
    const [pendingGiftsViewMode, setPendingGiftsViewMode] = useState<'gifts' | 'fund'>('gifts');
    const [pendingGiftsTab, setPendingGiftsTab] = useState<'active' | 'trash'>('active');
    
    const [fundBalanceTab, setFundBalanceTab] = useState<'active' | 'trash'>('active');

    const [claimGiftModal, setClaimGiftModal] = useState<{ isOpen: boolean; gift: PendingGift | null }>({ isOpen: false, gift: null });
    const [claimFormData, setClaimFormData] = useState({ name: '', email: '', phone: '' });

    const [beneficiariesModal, setBeneficiariesModal] = useState<{ isOpen: boolean; donorName: string; workshop: Workshop | null }>({ isOpen: false, donorName: '', workshop: null });

    const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
    const columnMenuRef = useRef<HTMLDivElement>(null);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        phone: true,
        workshopLocation: true,
        package: true,
        pricePaid: true,
        remainingAmount: true,
        paymentMethod: true,
        subscriptionDate: true,
    });
    const columnLabels: Record<string, string> = {
        phone: 'رقم الهاتف',
        workshopLocation: 'نوع الورشة',
        package: 'الباقة',
        pricePaid: 'المبلغ المدفوع',
        remainingAmount: 'المبلغ المتبقي',
        paymentMethod: 'طريقة الدفع',
        subscriptionDate: 'تاريخ الاشتراك',
    };
    const handleToggleColumn = (key: string) => {
        setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                dispatch({ type: 'SET_EXPORT_MENU', payload: false });
            }
            if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
                setIsColumnMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const allSubscriptions = useMemo((): SubscriptionWithDetails[] => {
        return users.flatMap(user =>
            user.subscriptions.map(subscription => {
                const workshop = workshops.find(w => w.id === subscription.workshopId);
                const pkg = workshop?.packages?.find(p => p.id === subscription.packageId);
                if (!workshop) return null;

                const requiredPrice = pkg?.discountPrice ?? pkg?.price ?? workshop.price ?? 0;
                
                const remainingAmount = subscription.paymentMethod === 'GIFT' 
                    ? 0 
                    : requiredPrice - (subscription.pricePaid ?? 0);

                return { user, subscription, workshop, pkg, requiredPrice, remainingAmount };
            }).filter((item): item is SubscriptionWithDetails => !!item)
        ).sort((a, b) => new Date(b.subscription.activationDate || 0).getTime() - new Date(a.subscription.activationDate || 0).getTime());
    }, [users, workshops]);

    const notApprovedSubscriptions = useMemo(() => allSubscriptions.filter(s => s.subscription.isApproved === false && s.subscription.status === SubscriptionStatus.PENDING), [allSubscriptions]);

    const donationsWithDetails = useMemo(() => {
        return allSubscriptions.filter(s =>
            s.subscription.isPayItForwardDonation
        ).map(s => {
            const price = s.workshop.packages?.[0]?.discountPrice ?? s.workshop.packages?.[0]?.price ?? s.workshop.price ?? 1;
            const seats = Math.floor((s.subscription.donationRemaining || 0) / price);
            
            let originalSeats = '-';
            const notes = s.subscription.notes || '';
            const match = notes.match(/\((\d+)\s*مقاعد\)/);
            if (match && match[1]) {
                originalSeats = match[1];
            }

            return {
                ...s,
                estimatedSeats: seats,
                originalSeats
            };
        });
    }, [allSubscriptions]);

    const displayedDonations = useMemo(() => {
        if (fundBalanceTab === 'active') {
            return donationsWithDetails.filter(s => !s.subscription.isDeleted && (s.subscription.donationRemaining || 0) >= 0);
        } else {
            return donationsWithDetails.filter(s => s.subscription.isDeleted);
        }
    }, [donationsWithDetails, fundBalanceTab]);


    const pendingGiftsWithDetails = useMemo(() => {
        const giftsToDisplay = pendingGiftsTab === 'active' 
            ? pendingGifts.filter(gift => !gift.claimedByUserId && !gift.isDeleted)
            : pendingGifts.filter(gift => gift.isDeleted);
            
        return giftsToDisplay
            .map(gift => {
                const workshop = workshops.find(w => w.id === gift.workshopId);
                return { gift, workshop };
            })
            .filter((item): item is { gift: PendingGift, workshop: Workshop } => !!item.workshop)
            .sort((a, b) => new Date(b.gift.createdAt).getTime() - new Date(a.gift.createdAt).getTime());
    }, [pendingGifts, workshops, pendingGiftsTab]);


    const stats = useMemo(() => {
        const activeSubs = allSubscriptions.filter(s => !s.subscription.isDeleted && s.subscription.isApproved !== false);
        const notApproved = notApprovedSubscriptions.length;
        const total = activeSubs.length;
        const transfers = activeSubs.filter(s => s.subscription.status === SubscriptionStatus.TRANSFERRED);
        const refunds = activeSubs.filter(s => s.subscription.status === SubscriptionStatus.REFUNDED);
        const totalCredit = users.reduce((sum, user) => sum + (user.internalCredit || 0), 0);
        const pendingGiftsCount = pendingGifts.filter(g => !g.claimedByUserId && !g.isDeleted).length;
        const totalDebts = allSubscriptions.reduce((sum, sub) => sum + (sub.remainingAmount > 0 ? sub.remainingAmount : 0), 0);
        return {
            notApproved, total, transfers, refunds, totalCredit, pendingGiftsCount, totalDebts
        };
    }, [allSubscriptions, notApprovedSubscriptions, users, pendingGifts]);
    
    const filteredSubscriptions = useMemo(() => {
        const source = state.activeTab === 'all'
            ? allSubscriptions.filter(s => !s.subscription.isDeleted && s.subscription.isApproved !== false && s.subscription.status !== SubscriptionStatus.PENDING)
            : allSubscriptions.filter(s => s.subscription.isDeleted);

        let filtered = source;

        if (state.workshopFilter !== 'all') {
            const workshopId = parseInt(state.workshopFilter, 10);
            filtered = filtered.filter(s => s.workshop.id === workshopId);
        }

        if (state.secondaryFilter !== 'all') {
            if (state.secondaryFilter === 'notApproved') {
                filtered = filtered.filter(s => s.subscription.isApproved === false && s.subscription.status === SubscriptionStatus.PENDING);
            } else if (Object.values(SubscriptionStatus).includes(state.secondaryFilter as SubscriptionStatus)) {
                filtered = filtered.filter(s => s.subscription.status === state.secondaryFilter);
            } else if (Object.keys(paymentMethodColors).includes(state.secondaryFilter)) {
                filtered = filtered.filter(s => s.subscription.paymentMethod === state.secondaryFilter);
            }
        }

        if (state.searchTerm) {
            const lowercasedFilter = state.searchTerm.toLowerCase();
            const normalizedPhoneFilter = normalizePhoneNumber(state.searchTerm);
            filtered = filtered.filter(s => 
                s && (
                    s.user.fullName.toLowerCase().includes(lowercasedFilter) ||
                    s.user.email.toLowerCase().includes(lowercasedFilter) ||
                    (normalizedPhoneFilter && normalizePhoneNumber(s.user.phone).includes(normalizedPhoneFilter)) ||
                    s.workshop.title.toLowerCase().includes(lowercasedFilter) ||
                    statusNames[s.subscription.status]?.toLowerCase().includes(lowercasedFilter)
                )
            );
        }

        return filtered;
    }, [allSubscriptions, state.activeTab, state.workshopFilter, state.secondaryFilter, state.searchTerm]);


    const totalPages = Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE);
    const paginatedSubscriptions = filteredSubscriptions.slice((state.currentPage - 1) * ITEMS_PER_PAGE, state.currentPage * ITEMS_PER_PAGE);

    const handleExcelExport = () => {
        dispatch({ type: 'SET_EXPORT_MENU', payload: false });
        
        const EXPORT_COLUMNS = [
            { key: 'user', label: 'المشترك' }, { key: 'workshop', label: 'الورشة' },
            { key: 'phone', label: 'رقم الهاتف' }, { key: 'email', label: 'الايميل' },
            { key: 'subscriptionDate', label: 'تاريخ الاشتراك' }, { key: 'package', label: 'الباقة' },
            { key: 'paymentMethod', label: 'طريقة الدفع' }, { key: 'amountPaid', label: 'المبلغ المدفوع' },
            { key: 'remainingAmount', label: 'المبلغ المتبقي' }, { key: 'status', label: 'الحالة' },
        ];

        const dataToExport = filteredSubscriptions.map(item => {
            const row: { [key: string]: string | number } = {};
            EXPORT_COLUMNS.forEach(col => {
                row[col.label] = getCellValue(item, col.key);
            });
            return row;
        });
    
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscriptions');
        XLSX.writeFile(workbook, `Subscriptions_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleSoftDelete = (userId: number, subId: string) => {
        dispatch({
            type: 'SHOW_CONFIRMATION',
            payload: {
                title: 'تأكيد الحذف',
                message: 'هل أنت متأكد من نقل هذا الاشتراك إلى سلة المهملات؟',
                onConfirm: () => {
                    deleteSubscription(userId, subId);
                    dispatch({ type: 'CLOSE_MODAL', payload: 'confirmation' });
                    showToast('تم نقل الاشتراك إلى سلة المهملات.', 'success');
                }
            }
        });
    };

    const handleRestore = (userId: number, subId: string) => {
        dispatch({
            type: 'SHOW_CONFIRMATION',
            payload: {
                title: 'تأكيد الاستعادة',
                message: 'هل أنت متأكد من استعادة هذا الاشتراك؟',
                onConfirm: () => {
                    restoreSubscription(userId, subId);
                    dispatch({ type: 'CLOSE_MODAL', payload: 'confirmation' });
                    showToast('تم استعادة الاشتراك.', 'success');
                }
            }
        });
    };

    const handlePermanentDelete = (userId: number, subId: string) => {
        dispatch({
            type: 'SHOW_CONFIRMATION',
            payload: {
                title: 'حذف نهائي',
                message: 'هل أنت متأكد من حذف هذا الاشتراك نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
                onConfirm: () => {
                    permanentlyDeleteSubscription(userId, subId);
                    dispatch({ type: 'CLOSE_MODAL', payload: 'confirmation' });
                    showToast('تم حذف الاشتراك نهائياً.', 'success');
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">الاشتراكات</h2>
                <div className="flex items-center gap-x-4">
                    <div className="relative" ref={exportMenuRef}>
                        <button onClick={() => dispatch({ type: 'SET_EXPORT_MENU', payload: !state.isExportMenuOpen })} className="flex items-center gap-x-2 bg-slate-700/70 hover:bg-slate-600/70 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm">
                            <DownloadIcon className="w-5 h-5"/><span>تصدير</span><ChevronDownIcon className="w-4 h-4"/>
                        </button>
                        {state.isExportMenuOpen && (
                            <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10">
                                <button onClick={handleExcelExport} className="w-full text-right px-4 py-2 text-sm text-white hover:bg-fuchsia-500/20 flex items-center gap-x-2"><DownloadIcon className="w-4 h-4"/><span>Excel</span></button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'add' } })} className="flex items-center gap-x-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-3 rounded-lg text-sm">
                        <PlusCircleIcon className="w-5 h-5"/><span>اشتراك جديد</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
                <StatCard title="إجمالي الاشتراكات" value={stats.total} icon={SwitchIcon} colorClass="text-sky-400" />
                <StatCard title="موافقات معلقة" value={stats.notApproved} icon={CheckCircleIcon} colorClass="text-yellow-400" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'notApproved' } })} badge={stats.notApproved > 0} />
                <StatCard title="هدايا معلقة" value={stats.pendingGiftsCount} icon={GiftIcon} colorClass="text-purple-400" onClick={() => setIsPendingGiftsModalOpen(true)} badge={stats.pendingGiftsCount > 0} footerText="إدارة الهدايا والتبرعات" />
                <StatCard title="إجمالي التحويلات" value={stats.transfers.length} icon={SwitchIcon} colorClass="text-blue-400" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'statsTransfers', data: stats.transfers } })} />
                <StatCard title="إجمالي المسترد" value={stats.refunds.length} icon={RefundIcon} colorClass="text-red-400" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'statsRefunds', data: stats.refunds } })} />
                <StatCard title="المديونيات المستحقة" value={stats.totalDebts.toFixed(2)} icon={ExclamationCircleIcon} colorClass="text-red-500" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'debt' } })} badge={stats.totalDebts > 0} />
                <StatCard title="أرصدة المشتركين" value={stats.totalCredit.toFixed(2)} icon={BanknotesIcon} colorClass="text-emerald-400" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'creditBalances' } })} footerText="اضغط للتفاصيل" />
            </div>

            <div className="flex flex-wrap gap-4 items-center bg-black/20 p-4 rounded-lg border border-slate-700/50">
                <div className="flex-grow flex gap-4">
                    <input type="text" placeholder="بحث شامل..." value={state.searchTerm} onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })} className="flex-grow p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm min-w-[200px]" />
                    <select value={state.workshopFilter} onChange={e => dispatch({ type: 'SET_WORKSHOP_FILTER', payload: e.target.value })} className="p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm">
                        <option value="all">كل الورشات</option>
                        {workshops.filter(w => !w.isDeleted).map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                    </select>
                    <select value={state.secondaryFilter} onChange={e => dispatch({ type: 'SET_SECONDARY_FILTER', payload: e.target.value })} className="p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm">
                        <option value="all">كل الحالات</option>
                        <option value={SubscriptionStatus.ACTIVE}>نشط</option>
                        <option value={SubscriptionStatus.PENDING}>قيد الانتظار</option>
                        <option value={SubscriptionStatus.TRANSFERRED}>محول</option>
                        <option value={SubscriptionStatus.REFUNDED}>مسترد</option>
                        <option value="LINK">رابط دفع</option>
                        <option value="BANK">تحويل بنكي</option>
                        <option value="GIFT">هدية</option>
                    </select>
                </div>
                <div className="flex bg-slate-800/60 p-1 rounded-lg">
                    <button onClick={() => dispatch({ type: 'SET_TAB', payload: 'all' })} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${state.activeTab === 'all' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`}>الكل</button>
                    <button onClick={() => dispatch({ type: 'SET_TAB', payload: 'trash' })} className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${state.activeTab === 'trash' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}><TrashIcon className="w-4 h-4"/> سلة المهملات</button>
                </div>
            </div>

            <div className="overflow-x-auto bg-black/20 rounded-lg border border-slate-700/50">
                <table className="min-w-full text-sm text-white">
                    <thead className="bg-slate-800 text-yellow-300 uppercase font-bold text-xs">
                        <tr>
                            <th className="py-3 px-2 text-right">المشترك</th>
                            {visibleColumns.phone && <th className="py-3 px-2 text-right">الهاتف</th>}
                            <th className="py-3 px-2 text-right">الورشة</th>
                            {visibleColumns.package && <th className="py-3 px-2 text-center">الباقة</th>}
                            {visibleColumns.amountPaid && <th className="py-3 px-2 text-center">المدفوع</th>}
                            {visibleColumns.remainingAmount && <th className="py-3 px-2 text-center">المتبقي</th>}
                            {visibleColumns.paymentMethod && <th className="py-3 px-2 text-center">الدفع</th>}
                            {visibleColumns.subscriptionDate && <th className="py-3 px-2 text-center">التاريخ</th>}
                            <th className="py-3 px-2 text-center">الحالة</th>
                            <th className="py-3 px-2 text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {paginatedSubscriptions.map(({ user, subscription, workshop, pkg, requiredPrice, remainingAmount }) => (
                            <tr key={subscription.id} className="hover:bg-yellow-500/10 transition-colors">
                                <td className="py-3 px-2 font-semibold">{user.fullName}</td>
                                {visibleColumns.phone && <td className="py-3 px-2 text-right dir-ltr">{user.phone.replace(/^\+/, '')}</td>}
                                <td className="py-3 px-2">{workshop.title}</td>
                                {visibleColumns.package && <td className="py-3 px-2 text-center text-xs">{pkg?.name || '-'}</td>}
                                {visibleColumns.amountPaid && <td className="py-3 px-2 text-center">{subscription.pricePaid?.toFixed(2) || '0.00'}</td>}
                                {visibleColumns.remainingAmount && <td className={`py-3 px-2 text-center font-bold ${remainingAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>{remainingAmount > 0 ? remainingAmount.toFixed(2) : '-'}</td>}
                                {visibleColumns.paymentMethod && <td className="py-3 px-2 text-center"><span className={`px-2 py-1 text-xs rounded-full ${paymentMethodColors[subscription.paymentMethod || ''] || 'bg-gray-600'}`}>{subscription.paymentMethod || '-'}</span></td>}
                                {visibleColumns.subscriptionDate && <td className="py-3 px-2 text-center">{formatArabicDate(subscription.activationDate)}</td>}
                                <td className="py-3 px-2 text-center"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[subscription.status]}`}>{statusNames[subscription.status]}</span></td>
                                <td className="py-3 px-2 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {state.activeTab === 'all' ? (
                                            <>
                                                <button onClick={() => onViewInvoice({ user, subscription })} className="p-1.5 rounded text-slate-300 hover:text-green-400 hover:bg-green-500/10" title="الفاتورة"><ReceiptTaxIcon className="w-4 h-4"/></button>
                                                <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'edit', data: { user, subscription } } })} className="p-1.5 rounded text-slate-300 hover:text-yellow-400 hover:bg-yellow-500/10" title="تعديل"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'transfer', data: { user, subscription } } })} className="p-1.5 rounded text-slate-300 hover:text-blue-400 hover:bg-blue-500/10" title="تحويل"><SwitchIcon className="w-4 h-4"/></button>
                                                
                                                {workshop.location === 'مسجلة' && (
                                                    <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'subscriptionRecordingAccess', data: { user, subscription, workshop } } })} className="p-1.5 rounded text-slate-300 hover:text-purple-400 hover:bg-purple-500/10" title="صلاحية المشاهدة"><CalendarIcon className="w-4 h-4"/></button>
                                                )}
                                                
                                                {subscription.status !== SubscriptionStatus.REFUNDED && (
                                                    <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'refund', data: { user, subscription } } })} className="p-1.5 rounded text-slate-300 hover:text-red-400 hover:bg-red-500/10" title="استرداد"><RefundIcon className="w-4 h-4"/></button>
                                                )}
                                                
                                                <button onClick={() => handleSoftDelete(user.id, subscription.id)} className="p-1.5 rounded text-slate-300 hover:text-red-400 hover:bg-red-500/10" title="نقل للمهملات"><TrashIcon className="w-4 h-4"/></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleRestore(user.id, subscription.id)} className="p-1.5 rounded text-slate-300 hover:text-green-400 hover:bg-green-500/10" title="استعادة"><RestoreIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handlePermanentDelete(user.id, subscription.id)} className="p-1.5 rounded text-slate-300 hover:text-red-400 hover:bg-red-500/10" title="حذف نهائي"><TrashIcon className="w-4 h-4"/></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <AddSubscriptionModal isOpen={state.activeModals.has('add')} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'add' })} onSuccess={(msg) => showToast(msg, 'success')} showToast={showToast} />
            <NotApprovedModal isOpen={state.activeModals.has('notApproved')} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'notApproved' })} subscriptions={notApprovedSubscriptions} onApprove={(s) => { updateSubscription(s.user.id, s.subscription.id, { isApproved: true, status: SubscriptionStatus.ACTIVE }); showToast('تمت الموافقة بنجاح.', 'success'); }} />
            <CreditBalancesModal isOpen={state.activeModals.has('creditBalances')} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'creditBalances' })} />
            <TransfersStatsModal isOpen={state.activeModals.has('statsTransfers')} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'statsTransfers' })} subscriptions={state.modalPayloads['statsTransfers'] || []} />
            <RefundsStatsModal isOpen={state.activeModals.has('statsRefunds')} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'statsRefunds' })} subscriptions={state.modalPayloads['statsRefunds'] || []} />
            <DebtModal isOpen={state.activeModals.has('debt')} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'debt' })} subscriptions={allSubscriptions.filter(s => s.remainingAmount > 0)} />
            
            {state.activeModals.has('edit') && <EditSubscriptionModal isOpen={true} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'edit' })} onSuccess={(msg) => showToast(msg, 'success')} user={state.modalPayloads['edit'].user} subscription={state.modalPayloads['edit'].subscription} />}
            {state.activeModals.has('transfer') && <TransferWorkshopModal isOpen={true} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'transfer' })} user={state.modalPayloads['transfer'].user} subscription={state.modalPayloads['transfer'].subscription} onConfirm={(uid, sid, wid, notes) => { transferSubscription(uid, sid, wid, notes); showToast('تم تحويل الاشتراك بنجاح.', 'success'); }} />}
            {state.activeModals.has('refund') && <RefundModal isOpen={true} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'refund' })} user={state.modalPayloads['refund'].user} subscription={state.modalPayloads['refund'].subscription} onConfirm={(uid, sid, method) => { updateSubscription(uid, sid, { status: SubscriptionStatus.REFUNDED, refundMethod: method, refundDate: new Date().toISOString() }); showToast('تم استرداد الاشتراك بنجاح.', 'success'); }} />}
            {state.activeModals.has('subscriptionRecordingAccess') && <SubscriptionRecordingAccessModal isOpen={true} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'subscriptionRecordingAccess' })} user={state.modalPayloads['subscriptionRecordingAccess'].user} subscription={state.modalPayloads['subscriptionRecordingAccess'].subscription} workshop={state.modalPayloads['subscriptionRecordingAccess'].workshop} showToast={showToast} />}

            {isPendingGiftsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-70 p-4">
                    <div className="bg-slate-900 text-white rounded-lg shadow-2xl w-full max-w-5xl border border-purple-500/50 max-h-[90vh] flex flex-col">
                        <header className="p-4 flex justify-between items-center border-b border-purple-500/50">
                            <div className="flex gap-4">
                                <button onClick={() => setPendingGiftsViewMode('gifts')} className={`text-lg font-bold ${pendingGiftsViewMode === 'gifts' ? 'text-purple-300 border-b-2 border-purple-500' : 'text-slate-400'}`}>هدايا معلقة ({pendingGiftsWithDetails.length})</button>
                                <button onClick={() => setPendingGiftsViewMode('fund')} className={`text-lg font-bold ${pendingGiftsViewMode === 'fund' ? 'text-pink-300 border-b-2 border-pink-500' : 'text-slate-400'}`}>صندوق الدعم ({displayedDonations.length})</button>
                            </div>
                            <button onClick={() => setIsPendingGiftsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                        </header>
                        <div className="p-6 overflow-y-auto">
                            {pendingGiftsViewMode === 'gifts' ? (
                                <div className="space-y-4">
                                    <div className="flex gap-4 mb-4 border-b border-slate-700 pb-2">
                                        <button onClick={() => setPendingGiftsTab('active')} className={`text-sm font-bold ${pendingGiftsTab === 'active' ? 'text-white' : 'text-slate-500'}`}>نشطة</button>
                                        <button onClick={() => setPendingGiftsTab('trash')} className={`text-sm font-bold ${pendingGiftsTab === 'trash' ? 'text-white' : 'text-slate-500'}`}>سلة المهملات</button>
                                    </div>
                                    {pendingGiftsWithDetails.map(({ gift, workshop }) => (
                                        <div key={gift.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-bold">من: {gift.gifterName} <span className="text-slate-400 text-xs">({gift.gifterPhone})</span></p>
                                                <p className="text-purple-300 text-sm">إلى: {gift.recipientName} <span className="text-slate-400">({gift.recipientWhatsapp})</span></p>
                                                <p className="text-xs text-slate-500 mt-1">الورشة: {workshop.title}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {pendingGiftsTab === 'active' ? (
                                                    <>
                                                        <button onClick={() => { setClaimGiftModal({ isOpen: true, gift }); setClaimFormData({ name: gift.recipientName, email: '', phone: gift.recipientWhatsapp }); }} className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold text-white">تفعيل يدوي</button>
                                                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'managePendingGift', data: { gift, workshop } } })} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-bold text-white">إدارة</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => restorePendingGift(gift.id)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><RestoreIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => permanentlyDeletePendingGift(gift.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><TrashIcon className="w-5 h-5"/></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {pendingGiftsWithDetails.length === 0 && <p className="text-center text-slate-400">لا توجد هدايا معلقة.</p>}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex gap-4">
                                            <button onClick={() => setFundBalanceTab('active')} className={`text-sm font-bold ${fundBalanceTab === 'active' ? 'text-white' : 'text-slate-500'}`}>الأرصدة المتاحة</button>
                                            <button onClick={() => setFundBalanceTab('trash')} className={`text-sm font-bold ${fundBalanceTab === 'trash' ? 'text-white' : 'text-slate-500'}`}>سجل الاستهلاك</button>
                                        </div>
                                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'grantSeat' } })} className="flex items-center gap-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-1 px-3 rounded text-xs">
                                            <UserAddIcon className="w-4 h-4"/> منح مقعد
                                        </button>
                                    </div>
                                    {displayedDonations.map(item => (
                                        <div key={item.subscription.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-bold">المتبرع: {item.user.fullName}</p>
                                                <p className="text-xs text-slate-400">الورشة: {item.workshop.title}</p>
                                                <div className="flex gap-4 mt-1 text-xs">
                                                    <span className="text-green-400">المبلغ المتبقي: {item.subscription.donationRemaining}</span>
                                                    <span className="text-pink-300">المقاعد المتاحة (تقديري): {item.estimatedSeats}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setBeneficiariesModal({ isOpen: true, donorName: item.user.fullName, workshop: item.workshop })} className="px-3 py-1 bg-sky-600 hover:bg-sky-500 rounded text-xs font-bold text-white">المستفيدين</button>
                                                <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'manageDonation', data: { donor: item.user, subscription: item.subscription, workshop: item.workshop } } })} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs font-bold text-white">إدارة</button>
                                            </div>
                                        </div>
                                    ))}
                                    {displayedDonations.length === 0 && <p className="text-center text-slate-400">لا توجد أرصدة متاحة.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {claimGiftModal.isOpen && claimGiftModal.gift && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[90] p-4">
                    <div className="bg-slate-900 p-6 rounded-lg w-full max-w-md border border-green-500/50">
                        <h3 className="text-lg font-bold text-green-400 mb-4">تفعيل الهدية يدوياً</h3>
                        <p className="text-sm text-white mb-4">سيتم إنشاء حساب للمستلم (إذا لم يوجد) وتفعيل الهدية فوراً.</p>
                        <div className="space-y-3">
                            <input type="text" placeholder="الاسم الكامل" value={claimFormData.name} onChange={e => setClaimFormData({...claimFormData, name: e.target.value})} className="w-full p-2 bg-slate-800 rounded border border-slate-600 text-sm" />
                            <input type="email" placeholder="البريد الإلكتروني" value={claimFormData.email} onChange={e => setClaimFormData({...claimFormData, email: e.target.value})} className="w-full p-2 bg-slate-800 rounded border border-slate-600 text-sm" />
                            <input type="text" placeholder="رقم الهاتف" value={claimFormData.phone} onChange={e => setClaimFormData({...claimFormData, phone: e.target.value})} className="w-full p-2 bg-slate-800 rounded border border-slate-600 text-sm ltr-input" />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setClaimGiftModal({ isOpen: false, gift: null })} className="px-4 py-2 rounded bg-slate-600 text-white text-xs">إلغاء</button>
                            <button onClick={() => {
                                if (!claimFormData.name || !claimFormData.email || !claimFormData.phone) return alert('جميع البيانات مطلوبة');
                                const res = adminManualClaimGift(claimGiftModal.gift!.id, claimFormData);
                                if (res.success) { showToast(res.message, 'success'); setClaimGiftModal({ isOpen: false, gift: null }); }
                                else alert(res.message);
                            }} className="px-4 py-2 rounded bg-green-600 text-white text-xs">تفعيل</button>
                        </div>
                    </div>
                </div>
            )}

            <GrantSeatModal isOpen={state.activeModals.has('grantSeat')} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'grantSeat' })} onSuccess={(msg) => showToast(msg, 'success')} data={state.modalPayloads['grantSeat']} />
            <BeneficiariesModal isOpen={beneficiariesModal.isOpen} onClose={() => setBeneficiariesModal({ isOpen: false, donorName: '', workshop: null })} donorName={beneficiariesModal.donorName} workshop={beneficiariesModal.workshop!} allUsers={users} />
            {state.activeModals.has('manageDonation') && <ManageDonationModal isOpen={true} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'manageDonation' })} donor={state.modalPayloads['manageDonation'].donor} subscription={state.modalPayloads['manageDonation'].subscription} workshop={state.modalPayloads['manageDonation'].workshop} onSuccess={(msg) => showToast(msg, 'success')} />}
            {state.activeModals.has('managePendingGift') && <ManagePendingGiftModal isOpen={true} onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'managePendingGift' })} gift={state.modalPayloads['managePendingGift'].gift} workshop={state.modalPayloads['managePendingGift'].workshop} onSuccess={(msg) => showToast(msg, 'success')} />}
            
            {state.confirmationState && (
                <ConfirmationModal
                    isOpen={state.activeModals.has('confirmation')}
                    onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'confirmation' })}
                    title={state.confirmationState.title}
                    message={state.confirmationState.message}
                    onConfirm={state.confirmationState.onConfirm}
                />
            )}
        </div>
    );
};

export default TransfersPage;
