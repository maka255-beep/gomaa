
import React from 'react';
import { useAdminTranslation } from '../pages/admin/AdminTranslationContext';
import { 
    UsersIcon, 
    AcademicCapIcon, 
    SwitchIcon, 
    DocumentTextIcon, 
    ReceiptTaxIcon, 
    ChartBarIcon, 
    PaperAirplaneIcon, 
    LinkIcon,
    ArchiveBoxIcon,
    ArrowCircleDownIcon,
    CloseIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
} from './icons';

type AdminView = 'users' | 'workshops' | 'transfers' | 'certificates' | 'financialCenter' | 'broadcast' | 'drhope' | 'links' | 'boutiqueManagement' | 'activity';

interface AdminSidebarProps {
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;
  onClose: () => void;
  onCollapse: () => void;
  onMobileClose?: () => void;
}

const menuItems: { view: AdminView; icon: React.FC<{className?: string}>; labelKey: string }[] = [
    { view: 'users', icon: UsersIcon, labelKey: 'sidebar.userManagement' },
    { view: 'workshops', icon: AcademicCapIcon, labelKey: 'sidebar.workshopManagement' },
    { view: 'transfers', icon: SwitchIcon, labelKey: 'sidebar.subscriptions' },
    { view: 'certificates', icon: DocumentTextIcon, labelKey: 'sidebar.certificates' },
    { view: 'financialCenter', icon: ReceiptTaxIcon, labelKey: 'sidebar.financialCenter' },
    { view: 'links', icon: LinkIcon, labelKey: 'sidebar.generalContent' },
    { view: 'broadcast', icon: PaperAirplaneIcon, labelKey: 'sidebar.broadcast' },
    { view: 'boutiqueManagement', icon: ArchiveBoxIcon, labelKey: 'sidebar.boutiqueManagement' },
    { view: 'activity', icon: ChartBarIcon, labelKey: 'sidebar.userActivity' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, setCurrentView, onClose, onCollapse, onMobileClose }) => {
    const { t, language } = useAdminTranslation();

    const buttonClass = (view: AdminView) => `
        group w-full flex items-center gap-x-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300
        ${currentView === view 
            ? `bg-gradient-to-r from-purple-800 to-pink-600 text-white ${language === 'ar' ? 'border-r-4' : 'border-l-4'} border-white/50 shadow-lg shadow-purple-900/40` 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }
        ${language === 'ar' ? 'text-right' : 'text-left'}
    `;

    return (
        <div className={`w-72 bg-[#1e0b2b] flex-shrink-0 flex flex-col h-full ${language === 'ar' ? 'border-l' : 'border-r'} border-white/10 shadow-2xl relative`}>
            
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-32 bg-fuchsia-600/10 blur-[60px] pointer-events-none"></div>

            {/* Header */}
            <header className="relative p-6 border-b border-white/10 flex flex-col items-center justify-center gap-y-2 bg-transparent z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <ShieldCheckIcon className="w-6 h-6 text-white"/>
                </div>
                <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200 tracking-wider mt-2">{t('adminHeader.title')}</h1>
                <button onClick={onMobileClose} className="absolute p-2 -m-2 rounded-full hover:bg-white/10 md:hidden text-white/50" style={{ [language === 'ar' ? 'left' : 'right']: '1rem', top: '1rem' }} title="Close Menu">
                    <CloseIcon className="w-6 h-6"/>
                </button>
            </header>

            {/* Nav */}
            <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar z-10">
                {menuItems.map(({ view, icon: Icon, labelKey }) => (
                    <button key={view} onClick={() => setCurrentView(view)} className={buttonClass(view)}>
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${currentView === view ? 'text-white' : 'text-slate-500 group-hover:text-pink-300'}`} />
                        <span>{t(labelKey)}</span>
                    </button>
                ))}
            </nav>
            
            {/* Footer Actions */}
             <footer className="hidden md:flex p-4 border-t border-white/10 mt-auto items-center justify-center gap-4 bg-black/20 z-10">
                 <button onClick={onCollapse} className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors" title="Collapse Panel"><ArrowCircleDownIcon className="w-6 h-6" /></button>
                 <button onClick={onClose} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors" title="Close Panel"><CloseIcon className="w-6 h-6" /></button>
            </footer>
        </div>
    );
};
