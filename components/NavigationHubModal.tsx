import React from 'react';
import { UserCircleIcon, VideoIcon, AcademicCapIcon, UsersIcon } from './icons';

interface NavigationHubModalProps {
  isOpen: boolean;
  userFullName?: string;
  onNavigate: (target: 'new' | 'recorded' | 'profile' | 'live') => void;
}

interface NavigationButtonProps {
    onClick: () => void;
    icon: React.FC<{className?: string}>;
    title: string;
    subtitle?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ onClick, icon: Icon, title, subtitle }) => (
    <button 
        onClick={onClick}
        className="relative group bg-theme-gradient-card backdrop-blur-lg border border-slate-700 rounded-2xl p-6 text-center transition-all duration-300 hover:border-fuchsia-400/80 hover:-translate-y-2 hover:shadow-2xl hover:shadow-fuchsia-500/30 overflow-hidden"
    >
        {/* Glowing orb effect */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
        
        <div className="relative">
            <div className="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-slate-800/50 border-2 border-slate-600 group-hover:border-fuchsia-400/50 transition-colors">
                <div className="absolute inset-0 bg-fuchsia-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                <Icon className="w-8 h-8 text-fuchsia-300 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-fuchsia-300 transition-colors">{title}</h3>
            {subtitle && (
                <p className="text-slate-400 mt-1" style={{ fontSize: '13px' }}>
                    {subtitle}
                </p>
            )}
        </div>
    </button>
);


const NavigationHubModal: React.FC<NavigationHubModalProps> = ({ isOpen, userFullName, onNavigate }) => {
  if (!isOpen) {
    return null;
  }

  const handleNavigation = (target: 'new' | 'recorded' | 'profile' | 'live') => {
    onNavigate(target);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div 
        style={{ animation: 'fade-in-up 0.5s ease-out forwards' }} 
        className="bg-theme-gradient backdrop-blur-2xl text-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative border border-violet-500/50 opacity-0"
      >
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-violet-400">
            أهلاً بك{userFullName && `, ${userFullName.split(' ')[0]}`}
          </h2>
          <p className="text-slate-300 sm:text-lg mb-8">إلى أين تود الذهاب؟</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <NavigationButton 
            onClick={() => handleNavigation('live')}
            icon={VideoIcon}
            title="البث المباشر - ZOOM"
            subtitle="( خاص بالمشتركات )"
          />
          <NavigationButton 
            onClick={() => handleNavigation('profile')}
            icon={UserCircleIcon}
            title="ملفي الشخصي"
            subtitle="( خاص بالمشتركات )"
          />
          <NavigationButton 
            onClick={() => handleNavigation('new')}
            icon={AcademicCapIcon}
            title="استكشف الورش"
          />
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default NavigationHubModal;