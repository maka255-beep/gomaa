
import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';
import { CloseIcon, BellIcon, ChevronDownIcon, ShoppingCartIcon, MenuIcon, GlobeAltIcon, ArrowLeftOnRectangleIcon, LoginIcon, VideoIcon, CollectionIcon, InstagramIcon, ChatBubbleIcon, ChatBubbleLeftRightIcon, UsersIcon, UserIcon, UserAddIcon } from './icons';
import { useUser } from '../context/UserContext';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void; // New prop
  onNavigate: (target: Page | string) => void;
  onScrollToSection: (sectionId: string) => void;
  onShowVideo: () => void;
  onShowPhotoAlbum: () => void;
  onShowInstagram: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  onBoutiqueClick: () => void;
  onRequestConsultationClick: () => void;
  onOpenNavigationHub: () => void;
  isHomePage?: boolean;
  isVisible?: boolean; 
}

const LogoButton: React.FC<{ logoUrl?: string; onClick: () => void }> = ({ logoUrl, onClick }) => {
  const btnClasses = `group w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full text-xl font-bold tracking-wider transition-all duration-300 transform hover:scale-110 focus:outline-none shadow-lg hover:shadow-xl bg-white/5 text-fuchsia-400 border border-white/10`;

  return (
    <button
      onClick={onClick}
      className={btnClasses}
      aria-label="الصفحة الرئيسية"
    >
      {logoUrl ? (
        <img src={logoUrl} alt="Nawaya Logo" className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:rotate-6" />
      ) : (
        <span>NAWAYA</span>
      )}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ 
    onLoginClick, onRegisterClick, onNavigate, onScrollToSection, onShowVideo, onShowPhotoAlbum, onShowInstagram, 
    isMobileMenuOpen, setIsMobileMenuOpen, onBoutiqueClick, onRequestConsultationClick, onOpenNavigationHub, isHomePage = false,
    isVisible = true
}) => {
  const { currentUser: user, logout: onLogout, notifications, drhopeData, markNotificationsAsRead } = useUser();
  const [isExploreMenuOpen, setIsExploreMenuOpen] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [isMobileNotificationsOpen, setIsMobileNotificationsOpen] = useState(false);
  const desktopNotificationContainerRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth >= 768 && desktopNotificationContainerRef.current && !desktopNotificationContainerRef.current.contains(event.target as Node)) {
        setIsNotificationsPanelOpen(false);
      }
    };

    if (isNotificationsPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsPanelOpen]);

  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileLinkClick = (action: () => void) => {
    action();
    handleCloseMobileMenu();
  }
  
  const handleNotificationsToggle = () => {
      handleCloseMobileMenu();
      const willOpen = !isNotificationsPanelOpen;
      if (willOpen && unreadCount > 0) {
        markNotificationsAsRead();
      }
      setIsNotificationsPanelOpen(willOpen);
  }

  const handleMobileNotificationsToggle = () => {
    handleCloseMobileMenu();
    const willOpen = !isMobileNotificationsOpen;
    if(willOpen && unreadCount > 0) {
      markNotificationsAsRead();
    }
    setIsMobileNotificationsOpen(willOpen);
  }

  const handleHamburgerClick = () => {
    setIsNotificationsPanelOpen(false);
    setIsMobileNotificationsOpen(false);
    setIsMobileMenuOpen(true);
  }
  
  const navLinkClasses = `py-2 px-4 rounded-md font-semibold transition-all duration-300 text-slate-200 hover:text-white hover:bg-white/10`;
  const iconButtonClasses = `p-2 rounded-full transition-all duration-300 transform hover:scale-110 text-slate-200 hover:bg-white/10 hover:text-fuchsia-400`;
  const primaryButtonClasses = "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 border border-fuchsia-500/20 text-sm";
  const outlineButtonClasses = "border border-white/20 hover:bg-white/10 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 text-sm hover:border-fuchsia-400";

  const headerLinks = drhopeData.headerLinks || {
    drhope: 'دكتور هوب',
    reviews: 'آراء المشتركات',
    profile: 'ملفي الشخصي',
  };

  // Always solid background using theme variables
  const headerBgClass = 'bg-theme-header-gradient shadow-xl border-b border-fuchsia-500/20';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-1000 ease-in-out ${headerBgClass} ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <nav className="container mx-auto px-4 sm:px-6 h-20 md:h-24 grid grid-cols-3 items-center">
          
          {/* Left section */}
          <div className="flex justify-start items-center gap-2">
            <div className="md:hidden">
              <button onClick={handleHamburgerClick} className={iconButtonClasses}>
                <MenuIcon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-3" />
              </button>
            </div>
            {/* Show Navigation Hub Button for logged in users (Mobile) */}
            {user && (
                <button onClick={onOpenNavigationHub} className={`md:hidden ${iconButtonClasses}`} title="إلى أين تود الذهاب؟">
                    <GlobeAltIcon className="w-6 h-6"/>
                </button>
            )}
            <div className="hidden md:block">
              <LogoButton logoUrl={drhopeData.logoUrl} onClick={() => onNavigate(Page.WORKSHOPS)} />
            </div>
          </div>

          {/* Center section */}
          <div className="flex justify-center">
            <div className="md:hidden">
              <LogoButton logoUrl={drhopeData.logoUrl} onClick={() => onNavigate(Page.WORKSHOPS)} />
            </div>
            <div className="hidden md:flex items-center justify-center gap-x-6">
              <div className="relative group">
                <button className={`${navLinkClasses} flex items-center gap-x-1`}>
                  <span>دكتور هوب</span>
                  <ChevronDownIcon className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform transition-all duration-300 ease-in-out group-hover:translate-y-2 translate-y-4 bg-theme-header-gradient backdrop-blur-2xl rounded-xl shadow-2xl mt-2 p-2 w-[480px] border border-fuchsia-500/30 z-10 ring-1 ring-black/20">
                  <div className="grid grid-cols-2 gap-2 text-slate-200">
                    {/* Menu Items */}
                    <a onClick={onShowVideo} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <VideoIcon className="w-6 h-6 text-fuchsia-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">من هي دكتور هوب</span><span className="text-xs text-slate-400 block">تعرفي على مسيرتها</span></div>
                    </a>
                     <a onClick={onShowPhotoAlbum} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <CollectionIcon className="w-6 h-6 text-fuchsia-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">ألبوم الصور</span><span className="text-xs text-slate-400 block">لحظات من ورشاتنا</span></div>
                    </a>
                    <a onClick={onShowInstagram} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <InstagramIcon className="w-6 h-6 text-fuchsia-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">بثوث انستجرام</span><span className="text-xs text-slate-400 block">البثوث المباشرة والمسجلة</span></div>
                    </a>
                     <a onClick={onRequestConsultationClick} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <ChatBubbleIcon className="w-6 h-6 text-fuchsia-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">طلب استشارة</span><span className="text-xs text-slate-400 block">جلسة خاصة</span></div>
                    </a>
                    <a onClick={onBoutiqueClick} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <ShoppingCartIcon className="w-6 h-6 text-fuchsia-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">البوتيك</span><span className="text-xs text-slate-400 block">منتجات مختارة</span></div>
                    </a>
                     <a onClick={() => onNavigate(Page.REVIEWS)} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-fuchsia-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">{headerLinks.reviews}</span><span className="text-xs text-slate-400 block">ماذا قالت المشاركات</span></div>
                    </a>
                     <a onClick={() => onNavigate(Page.PARTNERS)} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <UsersIcon className="w-6 h-6 text-fuchsia-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">شركاء النجاح</span><span className="text-xs text-slate-400 block">من يدعمنا</span></div>
                    </a>
                  </div>
                </div>
              </div>
              
              {user && (
                <button onClick={() => onNavigate(Page.PROFILE)} className={navLinkClasses}>
                  {headerLinks.profile}
                </button>
              )}
            </div>
          </div>
          
          {/* Right section */}
          <div className="flex justify-end">
            <div className="flex items-center gap-x-2 md:gap-x-5">
              
              {/* Navigation Hub Trigger (Desktop) */}
              {user && (
                  <button onClick={onOpenNavigationHub} className={`hidden md:inline-flex ${iconButtonClasses}`} title="إلى أين تود الذهاب؟">
                      <GlobeAltIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12"/>
                  </button>
              )}

              <div className="relative" ref={desktopNotificationContainerRef}>
                <button onClick={handleNotificationsToggle} className={`hidden md:inline-flex ${iconButtonClasses} relative group`}>
                    <BellIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12"/>
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-fuchsia-500 ring-2 ring-slate-900 animate-pulse"></span>
                    )}
                </button>
                 <button onClick={handleMobileNotificationsToggle} className={`md:hidden ${iconButtonClasses} relative group`}>
                    <BellIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12"/>
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-fuchsia-500 ring-2 ring-slate-900 animate-pulse"></span>
                    )}
                </button>
                {isNotificationsPanelOpen && <div className="hidden md:block"><NotificationsPanel onClose={() => setIsNotificationsPanelOpen(false)} /></div>}
              </div>
               <div className="hidden md:flex gap-x-3 items-center">
                {user ? (
                      <button onClick={onLogout} className={`${primaryButtonClasses} group flex items-center gap-x-2`}>
                          <ArrowLeftOnRectangleIcon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                          <span>خروج</span>
                      </button>
                  ) : (
                    <>
                      <button onClick={onLoginClick} className={outlineButtonClasses}>
                        تسجيل الدخول
                      </button>
                      <button onClick={onRegisterClick} className={`${primaryButtonClasses} group flex items-center gap-x-2`}>
                        <UserAddIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        <span>إنشاء حساب</span>
                      </button>
                    </>
                  )}
               </div>
            </div>
          </div>

        </nav>
        {/* Animated Line at bottom of header - always visible now */}
        <div
            className="absolute bottom-0 left-0 right-0 h-[1px] opacity-100"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(217, 70, 239, 0.5), transparent)',
              boxShadow: '0 0 10px rgba(217, 70, 239, 0.3)'
            }}
        />
      </header>
      
      {/* Main Mobile Menu - Dark Theme */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
            onClick={handleCloseMobileMenu}
            aria-hidden="true"
        ></div>
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-theme-header-gradient backdrop-blur-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden border-l border-fuchsia-500/20 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/10">
          <h2 className="text-lg font-bold text-fuchsia-400">القائمة الرئيسية</h2>
          <button 
            onClick={handleCloseMobileMenu} 
            className="group p-2 rounded-full text-slate-300 hover:bg-white/20"
            aria-label="إغلاق القائمة"
          >
            <CloseIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-60px)]">
            <div>
                <button 
                    onClick={() => setIsExploreMenuOpen(!isExploreMenuOpen)}
                    className="group w-full flex justify-between items-center px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                >
                    <span className="flex items-center gap-x-4">
                        <UsersIcon className="w-6 h-6 text-fuchsia-400 transition-transform duration-300 group-hover:scale-110" />
                        <span>دكتور هوب</span>
                    </span>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-125 ${isExploreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExploreMenuOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                    <div className="pr-4 pt-2 space-y-1 bg-black/10 rounded-lg my-1">
                        <a onClick={() => handleMobileLinkClick(onShowVideo)} className="group flex items-center gap-x-3 px-4 py-3 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                            <VideoIcon className="w-5 h-5 text-fuchsia-400/80"/> <span>من هي دكتور هوب</span>
                        </a>
                        <a onClick={() => handleMobileLinkClick(onShowPhotoAlbum)} className="group flex items-center gap-x-3 px-4 py-3 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                            <CollectionIcon className="w-5 h-5 text-fuchsia-400/80"/><span>عرض ألبوم الصور</span>
                        </a>
                        <a onClick={() => handleMobileLinkClick(onShowInstagram)} className="group flex items-center gap-x-3 px-4 py-3 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                        <InstagramIcon className="w-5 h-5 text-fuchsia-400/80"/> <span>بثوث انستجرام</span>
                        </a>
                        <div className="h-px bg-white/10 my-1 mx-4"></div>
                        <a onClick={() => handleMobileLinkClick(onRequestConsultationClick)} className="group flex items-center gap-x-3 px-4 py-3 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                            <ChatBubbleIcon className="w-5 h-5 text-fuchsia-400/80" /> <span>طلب استشارة</span>
                        </a>
                        <a onClick={() => handleMobileLinkClick(onBoutiqueClick)} className="group flex items-center gap-x-3 px-4 py-3 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                            <ShoppingCartIcon className="w-5 h-5 text-fuchsia-400/80" /> <span>البوتيك</span>
                        </a>
                        <a onClick={() => handleMobileLinkClick(() => onNavigate(Page.REVIEWS))} className="group flex items-center gap-x-3 px-4 py-3 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-fuchsia-400/80" /> <span>{headerLinks.reviews}</span>
                        </a>
                        <a onClick={() => handleMobileLinkClick(() => onNavigate(Page.PARTNERS))} className="group flex items-center gap-x-3 px-4 py-3 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                            <UsersIcon className="w-5 h-5 text-fuchsia-400/80" /> <span>شركاء النجاح</span>
                        </a>
                    </div>
                </div>
            </div>

            {user && (
              <a onClick={() => handleMobileLinkClick(() => onNavigate(Page.PROFILE))} className="group flex items-center gap-x-4 px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors">
                  <UserIcon className="w-6 h-6 text-fuchsia-400 transition-transform duration-300 group-hover:scale-110" />
                  <span>{headerLinks.profile}</span>
              </a>
            )}
            
            <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                {user ? (
                    <a onClick={() => handleMobileLinkClick(onLogout)} className="group flex items-center gap-x-4 px-4 py-3 rounded-lg text-base font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 cursor-pointer transition-colors">
                        <ArrowLeftOnRectangleIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                        <span>خروج</span>
                    </a>
                ) : (
                    <>
                        <a onClick={() => handleMobileLinkClick(onLoginClick)} className="group flex items-center gap-x-4 px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                            <LoginIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                            <span>تسجيل الدخول</span>
                        </a>
                        <a onClick={() => handleMobileLinkClick(onRegisterClick)} className="group flex items-center gap-x-4 px-4 py-3 rounded-lg text-base font-bold text-fuchsia-300 hover:text-white hover:bg-fuchsia-500/20 cursor-pointer transition-colors">
                            <UserAddIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                            <span>إنشاء حساب جديد</span>
                        </a>
                    </>
                )}
            </div>
        </nav>
      </div>
      
      {/* Mobile Notifications Panel */}
      {isMobileNotificationsOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
            onClick={() => setIsMobileNotificationsOpen(false)}
            aria-hidden="true"
        ></div>
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-theme-header-gradient backdrop-blur-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden border-l border-fuchsia-500/20 ${isMobileNotificationsOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <NotificationsPanel onClose={() => setIsMobileNotificationsOpen(false)} isMobile={true} />
      </div>
    </>
  );
};

export default Header;
