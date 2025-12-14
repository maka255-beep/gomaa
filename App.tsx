
import React, { useState, useEffect } from 'react';
import { useUser } from './context/UserContext';
import { User, Subscription, Workshop, Recording } from './types';
import Toast from './components/Toast';
import AdminPage from './pages/admin/AdminPage';
import WatchPage from './pages/WatchPage';
import { InvoiceModal } from './components/InvoiceModal';
import ProfilePage from './pages/ProfilePage';
import PublicApp from './pages/PublicApp';

type AppView = 'public' | 'admin';

const App: React.FC = () => {
  const { currentUser, loginAsUser, workshops, activeTheme } = useUser();
  
  // Navigation & View State
  const [currentView, setCurrentView] = useState<AppView>('public');
  
  // Admin State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Common UI State (Only for global toasts not handled in sub-apps)
  const [toasts, setToasts] = useState<{ id: string, message: string, type: 'success' | 'warning' | 'error' }[]>([]);

  // Shared state for Admin accessing Profile/Watch features
  const [userProfileToView, setUserProfileToView] = useState<User | null>(null);
  const [invoiceToView, setInvoiceToView] = useState<{ user: User; subscription: Subscription } | null>(null);
  const [watchData, setWatchData] = useState<{ workshop: Workshop, recording: Recording } | null>(null);
  
  // --- Effects ---

  useEffect(() => {
    if (!activeTheme) return;
    const root = document.documentElement;
    const hexToRgb = (hex: string) => {
        if (!hex || !hex.startsWith('#')) return '0, 0, 0';
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    };
    root.style.setProperty('--color-bg-from', activeTheme.background.from);
    root.style.setProperty('--color-bg-to', activeTheme.background.to);
    root.style.setProperty('--color-bg-balance', `${activeTheme.background.balance}%`);
    root.style.setProperty('--color-btn-from', activeTheme.button.from);
    root.style.setProperty('--color-btn-to', activeTheme.button.to);
    root.style.setProperty('--color-btn-balance', `${activeTheme.button.balance}%`);
    root.style.setProperty('--color-card-from', activeTheme.card.from);
    root.style.setProperty('--color-card-to', activeTheme.card.to);
    root.style.setProperty('--color-card-balance', `${activeTheme.card.balance}%`);
    root.style.setProperty('--color-text-primary', activeTheme.text.primary);
    root.style.setProperty('--color-text-accent', activeTheme.text.accent);
    root.style.setProperty('--color-text-accent-rgb', hexToRgb(activeTheme.text.accent));
    root.style.setProperty('--color-text-secondary-accent', activeTheme.text.secondary_accent || activeTheme.text.accent);
    root.style.setProperty('--glow-color', activeTheme.glow.color);
    root.style.setProperty('--glow-intensity-factor', (activeTheme.glow.intensity / 50).toString());
  }, [activeTheme]);

  // --- Handlers ---

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // --- Render Logic ---

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <AdminPage 
          isOpen={true} 
          onClose={() => setCurrentView('public')} 
          onCollapse={() => setCurrentView('public')} 
          showToast={showToast} 
          onViewUserProfile={(u) => setUserProfileToView(u)} 
          onViewInvoice={(d) => setInvoiceToView(d)} 
          isAdminAuthenticated={isAdminAuthenticated} 
          onLoginSuccess={() => setIsAdminAuthenticated(true)} 
          onLoginAsUserId={(uid) => { const user = useUser().users.find(u => u.id === uid); if (user) loginAsUser(user); setCurrentView('public'); showToast('تم تسجيل الدخول كمسؤول.'); }} 
        />
        
        {/* Render Modals accessible from Admin */}
        {userProfileToView && (
          <ProfilePage 
              isOpen={!!userProfileToView} 
              onClose={() => setUserProfileToView(null)} 
              user={userProfileToView} 
              onZoomRedirect={() => {}} // Admin doesn't need to redirect
              onPlayRecording={(w, r) => setWatchData({ workshop: w, recording: r })} 
              onViewAttachment={() => {}} 
              onViewRecommendedWorkshop={() => {}} 
              showToast={showToast} 
              onPayForConsultation={() => {}} 
              onViewInvoice={(details) => setInvoiceToView(details)} 
          />
        )}
        {watchData && (
            <div className="fixed inset-0 z-[100] bg-black">
               <WatchPage workshop={watchData.workshop} recording={watchData.recording} onBack={() => setWatchData(null)} />
            </div>
        )}
        {invoiceToView && <InvoiceModal isOpen={!!invoiceToView} onClose={() => setInvoiceToView(null)} user={invoiceToView.user} subscription={invoiceToView.subscription} workshop={workshops.find(w => w.id === invoiceToView.subscription.workshopId)!} />}
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(prev => prev.filter(item => item.id !== t.id))} />)}
      </div>
    );
  }

  // Public View
  return <PublicApp onSwitchToAdmin={() => setCurrentView('admin')} />;
}

export default App;
