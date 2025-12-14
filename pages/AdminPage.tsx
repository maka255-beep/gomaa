import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { CloseIcon, ShieldCheckIcon, ArrowCircleDownIcon, GlobeAltIcon, MenuIcon } from '../components/icons';
import { AdminSidebar } from '../components/AdminSidebar';
// FIX: Add Subscription to types import for onViewInvoice prop
import { User, Subscription } from '../types';
import { LanguageProvider, useAdminTranslation } from './admin/AdminTranslationContext';

// --- Lazy Load Components ---

const UserManagementPage = lazy(() => import('./admin/UserManagementPage'));
const WorkshopManagementPage = lazy(() => import('./admin/WorkshopManagementPage'));
const TransfersPage = lazy(() => import('./admin/TransfersPage'));
const CertificatesPage = lazy(() => import('./admin/CertificatesPage'));
const FinancialCenterPage = lazy(() => import('./admin/FinancialCenterPage'));
const BroadcastPage = lazy(() => import('./admin/BroadcastPage'));
const LinksManagementPage = lazy(() => import('./admin/LinksManagementPage'));
const BoutiqueManagementPage = lazy(() => import('./admin/BoutiqueManagementPage'));
const AdvancedAnalyticsPage = lazy(() => import('./admin/AdvancedAnalyticsPage'));

type AdminView = 'users' | 'workshops' | 'transfers' | 'certificates' | 'financialCenter' | 'broadcast' | 'drhope' | 'links' | 'boutiqueManagement' | 'activity';

interface AdminPageProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapse: () => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  onViewUserProfile: (user: User) => void;
  // FIX: Add missing onViewInvoice prop
  onViewInvoice: (details: { user: User; subscription: Subscription }) => void;
  isAdminAuthenticated: boolean;
  onLoginSuccess: () => void;
}

const AdminLayout: React.FC<AdminPageProps> = (props) => {
    const [currentView, setCurrentView] = useState<AdminView>('users');
    const [isClosing, setIsClosing] = useState(false);
    const { language, setLanguage, t } = useAdminTranslation();
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mainPanelRef = useRef<HTMLDivElement>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        if (mainPanelRef.current) {
            mainPanelRef.current.scrollTop = 0;
        }
    }, [currentView]);
    
    useEffect(() => {
      const rootHtml = document.documentElement;
      rootHtml.lang = language;
      rootHtml.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const handleClose = () => {
        setIsClosing(true);
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        closeTimerRef.current = setTimeout(() => {
            props.onClose();
            setIsClosing(false);
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
        }, 300);
    };
    
    const handleCollapse = () => {
        setIsClosing(true);
        if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = setTimeout(() => {
            props.onCollapse();
            setIsClosing(false);
        }, 300);
    };

    const handleSetCurrentView = (view: AdminView) => {
      setCurrentView(view);
      setIsMobileSidebarOpen(false); // Close sidebar on mobile after navigation
    };

    const renderView = () => {
        switch (currentView) {
            case 'users': return <UserManagementPage showToast={props.showToast} onViewUserProfile={props.onViewUserProfile} />;
            case 'workshops': return <WorkshopManagementPage showToast={props.showToast} />;
            // FIX: Pass down onViewInvoice prop to TransfersPage to satisfy its prop requirements.
            case 'transfers': return <TransfersPage showToast={props.showToast} onViewUserProfile={props.onViewUserProfile} onViewInvoice={props.onViewInvoice} />;
            case 'certificates': return <CertificatesPage showToast={props.showToast} />;
            case 'financialCenter': return <FinancialCenterPage showToast={props.showToast} />;
            case 'broadcast': return <BroadcastPage showToast={props.showToast} />;
            case 'links': return <LinksManagementPage showToast={props.showToast} />;
            case 'boutiqueManagement': return <BoutiqueManagementPage showToast={props.showToast} onViewUserProfile={props.onViewUserProfile} />;
            case 'activity': return <AdvancedAnalyticsPage showToast={props.showToast} />;
            default: return <div>Select a view</div>;
        }
    };
    
    return (
        <div className={`fixed inset-0 bg-black/60 z-50 flex transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            
            <div 
                className={`bg-slate-950/80 backdrop-blur-2xl text-white shadow-2xl h-full flex transition-transform duration-300 ease-in-out w-full ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
                style={{
                  transform: isClosing ? `translateX(${language === 'ar' ? '100%' : '-100%'})` : 'translateX(0)',
                }}
            >
                {/* Sidebar (Mobile Fixed, Desktop Static) */}
                <div className={`
                    fixed top-0 h-full z-40
                    md:static md:flex-shrink-0 
                    transition-transform duration-300 ease-in-out
                    ${language === 'ar' ? 'right-0' : 'left-0'} 
                    ${isMobileSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
                    md:translate-x-0
                `}>
                    <AdminSidebar 
                        currentView={currentView} 
                        setCurrentView={handleSetCurrentView} 
                        onClose={handleClose} 
                        onCollapse={handleCollapse}
                    />
                </div>
                
                {/* Content Area */}
                <div ref={mainPanelRef} className="flex-grow flex flex-col p-4 md:p-6 overflow-y-auto">
                    {/* Mobile Header */}
                    <div className="flex md:hidden justify-between items-center mb-4 flex-shrink-0">
                        <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 -m-2 rounded-full hover:bg-white/10" title="Open Menu">
                            <MenuIcon className="w-6 h-6"/>
                        </button>
                         <h1 className="text-lg font-bold text-white">{t('adminHeader.title')}</h1>
                         <div className="w-8"></div> {/* Spacer */}
                    </div>
                    {/* View Content */}
                    <div className="flex-grow">
                        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
                            {renderView()}
                        </Suspense>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileSidebarOpen(false)}
            />
        </div>
    );
};


const AdminPage: React.FC<AdminPageProps> = (props) => {
    if (!props.isAdminAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" dir="rtl">
                <div className="bg-slate-900/50 p-8 rounded-xl border border-fuchsia-500/50 text-center">
                    <ShieldCheckIcon className="w-12 h-12 mx-auto text-fuchsia-400 mb-4"/>
                    <h2 className="text-xl font-bold mb-2">مطلوب تسجيل الدخول</h2>
                    <p className="text-slate-300 mb-6">الرجاء إدخال كلمة المرور للوصول إلى لوحة التحكم.</p>
                    <form onSubmit={(e) => { e.preventDefault(); if ((e.target as any).password.value === '1983') props.onLoginSuccess(); else alert('Incorrect password'); }}>
                        <input type="password" name="password" className="p-2 bg-slate-800 border border-slate-600 rounded-md text-center" />
                        <button type="submit" className="mt-4 py-2 px-6 bg-fuchsia-600 rounded-md font-bold">دخول</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
      <LanguageProvider>
        <AdminLayout {...props} />
      </LanguageProvider>
    );
};

export default AdminPage;
