
import React, { useEffect, useState } from 'react';
import { useUser } from './context/UserContext';
import PublicApp from './pages/PublicApp';
import AdminPage from './pages/admin/AdminPage';
import { User, Subscription } from './types';
import { InvoiceModal } from './components/InvoiceModal';
import UserDetailsModal from './components/UserDetailsModal';
import Toast from './components/Toast';

const App: React.FC = () => {
  const { activeTheme, workshops } = useUser(); // Removed unused loginAsUser
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  // Admin specific states
  const [toasts, setToasts] = useState<{ id: string, message: string, type: 'success' | 'warning' | 'error' }[]>([]);
  const [invoiceToView, setInvoiceToView] = useState<{ user: User; subscription: Subscription } | null>(null);
  const [userProfileToView, setUserProfileToView] = useState<User | null>(null);

  // --- Effects ---

  useEffect(() => {
    // Check URL for admin mode
    const checkAdminMode = () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'admin') {
            setIsAdminMode(true);
        } else {
            setIsAdminMode(false);
        }
    };

    checkAdminMode();
    
    // Listen for popstate events (back/forward browser buttons)
    window.addEventListener('popstate', checkAdminMode);
    return () => window.removeEventListener('popstate', checkAdminMode);
  }, []);

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

  // --- Admin Handlers ---

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleAdminClose = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      window.history.pushState({}, '', url);
      setIsAdminMode(false);
  };

  const handleLoginAsUser = (userId: number) => {
      // Logic to login as user would normally go here via context
      // For now, we simply exit admin mode to simulate the view
      console.log('Logging in as user ID:', userId);
      handleAdminClose();
      showToast('تم التبديل إلى واجهة المستخدم', 'success');
  };

  if (isAdminMode) {
      return (
        <div className="min-h-screen bg-theme-gradient text-slate-200 font-sans">
            <AdminPage 
                isOpen={true}
                onClose={handleAdminClose}
                onCollapse={() => {}}
                showToast={showToast}
                onViewUserProfile={(user) => setUserProfileToView(user)}
                onViewInvoice={(details) => setInvoiceToView(details)}
                isAdminAuthenticated={isAdminAuthenticated}
                onLoginSuccess={() => setIsAdminAuthenticated(true)}
                onLoginAsUserId={handleLoginAsUser}
            />
            
            {/* Admin Modals */}
            {invoiceToView && (
                <InvoiceModal 
                    isOpen={!!invoiceToView} 
                    onClose={() => setInvoiceToView(null)} 
                    user={invoiceToView.user} 
                    subscription={invoiceToView.subscription} 
                    workshop={workshops.find(w => w.id === invoiceToView.subscription.workshopId)!} 
                />
            )}
            
            {userProfileToView && (
                <UserDetailsModal 
                    isOpen={!!userProfileToView}
                    onClose={() => setUserProfileToView(null)}
                    onSuccess={(msg) => showToast(msg, 'success')}
                    userToEdit={userProfileToView}
                />
            )}

            {toasts.map(t => (
                <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(prev => prev.filter(item => item.id !== t.id))} />
            ))}
        </div>
      );
  }

  // Render Public View
  return <PublicApp />;
}

export default App;
