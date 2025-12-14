
import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, ShieldCheckIcon, MenuIcon, UserIcon, LockClosedIcon } from '../../components/icons';
import { AdminSidebar } from '../../components/AdminSidebar';
import { User, Subscription } from '../../types';
import { LanguageProvider, useAdminTranslation } from './AdminTranslationContext';

// --- Static Imports (Corrected Paths: Sibling files) ---
import UserManagementPage from './UserManagementPage';
import WorkshopManagementPage from './WorkshopManagementPage';
import TransfersPage from './TransfersPage';
import CertificatesPage from './CertificatesPage';
import FinancialCenterPage from './FinancialCenterPage';
import BroadcastPage from './BroadcastPage';
import LinksManagementPage from './LinksManagementPage';
import BoutiqueManagementPage from './BoutiqueManagementPage';
import AdvancedAnalyticsPage from './AdvancedAnalyticsPage';

type AdminView = 'users' | 'workshops' | 'transfers' | 'certificates' | 'financialCenter' | 'broadcast' | 'drhope' | 'links' | 'boutiqueManagement' | 'activity';

interface AdminPageProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapse: () => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  onViewUserProfile: (user: User) => void;
  onViewInvoice: (details: { user: User; subscription: Subscription }) => void;
  isAdminAuthenticated: boolean;
  onLoginSuccess: () => void;
  onLoginAsUserId: (userId: number) => void;
}

const AdminLayout: React.FC<AdminPageProps> = (props) => {
    const [currentView, setCurrentView] = useState<AdminView>('users');
    const [isClosing, setIsClosing] = useState(false);
    const { language, t } = useAdminTranslation();
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
      setIsMobileSidebarOpen(false);
    };

    const renderView = () => {
        switch (currentView) {
            case 'users': return <UserManagementPage showToast={props.showToast} onViewUserProfile={props.onViewUserProfile} />;
            case 'workshops': return <WorkshopManagementPage showToast={props.showToast} onLoginAsUserId={props.onLoginAsUserId} />;
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
                className={`bg-gradient-to-br from-[#2e0235] via-[#1e0b2b] to-[#2e0235] text-white shadow-2xl h-full flex transition-transform duration-300 ease-in-out w-full`}
                style={{
                  transform: isClosing ? `translateX(${language === 'ar' ? '100%' : '-100%'})` : 'translateX(0)',
                }}
            >
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
                        onMobileClose={() => setIsMobileSidebarOpen(false)}
                    />
                </div>
                
                <div ref={mainPanelRef} className="flex-grow flex flex-col p-4 md:p-8 overflow-y-auto bg-black/10 backdrop-blur-sm">
                    <div className="grid grid-cols-3 md:hidden items-center mb-6 flex-shrink-0 border-b border-white/10 pb-4">
                        <div className="justify-start flex">
                            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 -m-2 rounded-full hover:bg-white/10" title="Open Menu">
                                <MenuIcon className="w-6 h-6"/>
                            </button>
                        </div>
                         <h1 className="text-lg font-bold text-white text-center">{t('adminHeader.title')}</h1>
                    </div>
                    <div className="flex-grow">
                        {renderView()}
                    </div>
                </div>

                <div
                    className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            </div>
        </div>
    );
};

const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.toLowerCase() === 'admin' && password === 'admin') {
            setError('');
            props.onLoginSuccess();
        } else {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        }
    };

    if (!props.isAdminAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
                <div className="relative bg-gradient-to-br from-[#2e0235] to-[#4c1d95] p-8 rounded-2xl border border-fuchsia-500/30 text-center w-full max-w-sm text-white shadow-2xl shadow-fuchsia-900/50">
                    <button onClick={props.onClose} className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors" aria-label="إغلاق">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
                        <ShieldCheckIcon className="w-10 h-10 text-fuchsia-300"/>
                    </div>
                    <h2 className="text-2xl font-black mb-2 text-white tracking-tight">لوحة تحكم المسؤولين</h2>
                    <p className="text-fuchsia-200/70 text-sm mb-8 font-medium">الرجاء إدخال اسم المستخدم وكلمة المرور للوصول.</p>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="relative group">
                            <UserIcon className="w-5 h-5 text-fuchsia-300 absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none transition-colors group-focus-within:text-white" />
                            <input
                                id="admin-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 pr-12 bg-black/20 border border-fuchsia-500/20 rounded-xl text-white placeholder-fuchsia-200/30 focus:outline-none focus:border-fuchsia-500 focus:bg-black/40 transition-all font-medium"
                                placeholder="اسم المستخدم"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <LockClosedIcon className="w-5 h-5 text-fuchsia-300 absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none transition-colors group-focus-within:text-white" />
                            <input
                                id="admin-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 pr-12 bg-black/20 border border-fuchsia-500/20 rounded-xl text-white placeholder-fuchsia-200/30 focus:outline-none focus:border-fuchsia-500 focus:bg-black/40 transition-all font-medium"
                                placeholder="كلمة المرور"
                                required
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm font-bold bg-red-900/20 p-2 rounded-lg border border-red-500/20">{error}</p>}
                        <button type="submit" className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-fuchsia-900/40 hover:scale-[1.02]">
                            دخول آمن
                        </button>
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
