
import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';
import { CloseIcon, BellIcon, ChevronDownIcon, ShoppingCartIcon, MenuIcon, GlobeAltIcon, ArrowLeftOnRectangleIcon, LoginIcon, VideoIcon, CollectionIcon, InstagramIcon, ChatBubbleIcon, ChatBubbleLeftRightIcon, UsersIcon, UserIcon, UserAddIcon, InformationCircleIcon } from './icons';
import { useUser } from '../context/UserContext';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void; // Kept for interface compatibility
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
  const btnClasses = `group w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full text-xl font-bold tracking-wider transition-all duration-300 transform hover:scale-110 focus:outline-none shadow-lg hover:shadow-xl bg-white/5 text-pink-400 border border-white/10`;

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
  const [isMobileDrHopeOpen, setIsMobileDrHopeOpen] = useState(false); // State for mobile accordion
  const [showGuestNotificationMessage, setShowGuestNotificationMessage] = useState(false); // State for guest message
  const desktopNotificationContainerRef = useRef<HTMLDivElement>(null);
  const mobileNotificationContainerRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = user ? notifications.filter(n => !n.read).length : 0;

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close desktop panel
      if (window.innerWidth >= 768 && desktopNotificationContainerRef.current && !desktopNotificationContainerRef.current.contains(event.target as Node)) {
        setIsNotificationsPanelOpen(false);
        setShowGuestNotificationMessage(false);
      }
      // Close mobile guest message
      if (window.innerWidth < 768 && mobileNotificationContainerRef.current && !mobileNotificationContainerRef.current.contains(event.target as Node)) {
         setShowGuestNotificationMessage(false);
      }
    };

    if (isNotificationsPanelOpen || showGuestNotificationMessage) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsPanelOpen, showGuestNotificationMessage]);

  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileLinkClick = (action: () => void) => {
    action();
    handleCloseMobileMenu();
  }
  
  const handleNotificationsToggle = () => {
      if (!user) {
          setShowGuestNotificationMessage(!showGuestNotificationMessage);
          return;
      }
      handleCloseMobileMenu();
      const willOpen = !isNotificationsPanelOpen;
      if (willOpen && unreadCount > 0) {
        markNotificationsAsRead();
      }
      setIsNotificationsPanelOpen(willOpen);
      setShowGuestNotificationMessage(false);
  }

  const handleMobileNotificationsToggle = () => {
    if (!user) {
        setShowGuestNotificationMessage(!showGuestNotificationMessage);
        return;
    }
    handleCloseMobileMenu();
    const willOpen = !isMobileNotificationsOpen;
    if(willOpen && unreadCount > 0) {
      markNotificationsAsRead();
    }
    setIsMobileNotificationsOpen(willOpen);
    setShowGuestNotificationMessage(false);
  }

  const handleHamburgerClick = () => {
    setIsNotificationsPanelOpen(false);
    setIsMobileNotificationsOpen(false);
    setIsMobileMenuOpen(true);
    setShowGuestNotificationMessage(false);
  }
  
  const navLinkClasses = `py-2 px-4 rounded-md font-semibold transition-all duration-300 text-slate-200 hover:text-white hover:bg-white/10`;
  const iconButtonClasses = `p-2 rounded-full transition-all duration-300 transform hover:scale-110 text-slate-200 hover:bg-white/10 hover:text-pink-400`;
  const primaryButtonClasses = "bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-700 hover:to-pink-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-900/30 hover:shadow-pink-500/30 border border-white/10 text-sm";

  const headerLinks = drhopeData.headerLinks || {
    drhope: 'دكتور هوب',
    reviews: 'آراء المشتركات',
    profile: 'ملفي الشخصي',
  };

  const headerBgClass = 'bg-theme-header-gradient shadow-xl border-b border-white/10';

  // Component for Guest Notification Message
  const GuestNotificationMessage = () => (
      <div className="absolute top-full left-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-xl border border-fuchsia-500/30 rounded-xl shadow-2xl p-4 z-50 text-right animate-fade-in-up">
          <div className="flex items-start gap-3">
              <div className="p-2 bg-fuchsia-500/20 rounded-full text-fuchsia-400 flex-shrink-0">
                  <InformationCircleIcon className="w-5 h-5" />
              </div>
              <div>
                  <h4 className="text-white font-bold text-sm mb-1">خاص بالمشتركين</h4>
                  <p className="text-slate-300 text-xs leading-relaxed mb-3">
                      هذه الميزة متاحة فقط للأعضاء المسجلين لمتابعة تحديثات الورش.
                  </p>
                  <button 
                      onClick={() => {
                          setShowGuestNotificationMessage(false);
                          onLoginClick();
                      }}
                      className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                      تسجيل الدخول
                  </button>
              </div>
          </div>
          {/* Arrow */}
          <div className="absolute -top-2 left-4 w-4 h-4 bg-slate-900 border-t border-l border-fuchsia-500/30 transform rotate-45"></div>
      </div>
  );

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
                <div className="absolute top-full left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform transition-all duration-300 ease-in-out group-hover:translate-y-2 translate-y-4 bg-theme-header-gradient backdrop-blur-2xl rounded-xl shadow-2xl mt-2 p-2 w-[550px] border border-white/10 z-10 ring-1 ring-black/20">
                  <div className="grid grid-cols-2 gap-2 text-slate-200">
                    
                    {/* Column 1 */}
                    <a onClick={onShowVideo} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <VideoIcon className="w-6 h-6 text-pink-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">من هي دكتور هوب</span><span className="text-xs text-slate-400 block">تعرفي على مسيرتها</span></div>
                    </a>
                    
                    <a onClick={() => onNavigate(Page.REVIEWS)} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-pink-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">{headerLinks.reviews}</span><span className="text-xs text-slate-400 block">تجارب حقيقية</span></div>
                    </a>

                    <a onClick={onShowPhotoAlbum} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <CollectionIcon className="w-6 h-6 text-pink-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">ألبوم الصور</span><span className="text-xs text-slate-400 block">لحظات من ورشاتنا</span></div>
                    </a>

                    <a onClick={() => onNavigate(Page.PARTNERS)} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <UsersIcon className="w-6 h-6 text-pink-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">شركاء النجاح</span><span className="text-xs text-slate-400 block">شركاؤنا في الرحلة</span></div>
                    </a>

                    {/* Column 2 */}
                    <a onClick={onShowInstagram} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <InstagramIcon className="w-6 h-6 text-pink-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">بثوث انستجرام</span><span className="text-xs text-slate-400 block">البثوث المباشرة</span></div>
                    </a>

                    <a onClick={onBoutiqueClick} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200">
                      <ShoppingCartIcon className="w-6 h-6 text-pink-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">البوتيك</span><span className="text-xs text-slate-400 block">منتجات مختارة لك</span></div>
                    </a>

                     <a onClick={onRequestConsultationClick} className="group flex items-center gap-x-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200 col-span-2 border-t border-white/5 mt-1">
                      <ChatBubbleIcon className="w-6 h-6 text-pink-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      <div><span className="font-bold text-white text-sm">طلب استشارة خاصة</span><span className="text-xs text-slate-400 block">تحدثي مباشرة مع المختصين</span></div>
                    </a>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex justify-end items-center gap-4">
            
            {/* Mobile Notifications Icon - Always Visible (Prompts guest message if guest) */}
            <div className="md:hidden relative" ref={mobileNotificationContainerRef}>
                <button onClick={handleMobileNotificationsToggle} className={`${iconButtonClasses} relative`}>
                    <BellIcon className="w-6 h-6" />
                    {user && unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-fuchsia-600 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse shadow-lg shadow-fuchsia-500/50">
                            {unreadCount}
                        </span>
                    )}
                </button>
                {/* Guest Hint for Mobile */}
                {!user && showGuestNotificationMessage && <GuestNotificationMessage />}
            </div>

            {/* Desktop Notifications Icon - Always Visible (Prompts guest message if guest) */}
            <div className="hidden md:block relative" ref={desktopNotificationContainerRef}>
                <button onClick={handleNotificationsToggle} className={`${iconButtonClasses} relative`}>
                    <BellIcon className="w-6 h-6" />
                    {user && unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-fuchsia-600 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse shadow-lg shadow-fuchsia-500/50">
                            {unreadCount}
                        </span>
                    )}
                </button>
                {user && isNotificationsPanelOpen && <NotificationsPanel onClose={() => setIsNotificationsPanelOpen(false)} />}
                
                {/* Guest Hint for Desktop */}
                {!user && showGuestNotificationMessage && <GuestNotificationMessage />}
            </div>

            {user ? (
                <>
                    <button onClick={onOpenNavigationHub} className={`${iconButtonClasses} hidden md:block`} title="إلى أين تود الذهاب؟">
                        <GlobeAltIcon className="w-6 h-6"/>
                    </button>
                    <button 
                        onClick={() => onNavigate(Page.PROFILE)} 
                        className={`hidden md:flex items-center gap-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all duration-300 border border-white/10`}
                    >
                        <span className="text-sm font-bold truncate max-w-[100px]">{user.fullName.split(' ')[0]}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="font-bold text-xs">{user.fullName.charAt(0)}</span>
                        </div>
                    </button>
                </>
            ) : (
              <div className="hidden md:flex gap-3">
                <button onClick={onLoginClick} className={primaryButtonClasses}>
                  تسجيل دخول / انشاء حساب
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Notifications Fullscreen Overlay */}
      {isMobileNotificationsOpen && (
        <div className="fixed inset-0 z-[60] bg-theme-header-gradient md:hidden flex flex-col">
            <NotificationsPanel onClose={() => setIsMobileNotificationsOpen(false)} isMobile={true} />
        </div>
      )}

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/90 z-[60] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`fixed inset-y-0 right-0 w-[85%] max-w-sm bg-theme-header-gradient shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto flex flex-col`}>
            
            <div className="p-5 flex justify-between items-center border-b border-white/10">
                <span className="text-xl font-bold text-white">القائمة</span>
                <button onClick={handleCloseMobileMenu} className="p-2 rounded-full hover:bg-white/10 text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="p-5 flex flex-col gap-4 flex-grow">
                {user && (
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg text-xl font-bold text-white">
                            {user.fullName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-white text-lg">{user.fullName}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                    </div>
                )}

                <button onClick={() => handleMobileLinkClick(() => onNavigate(Page.WORKSHOPS))} className="text-right text-slate-200 font-bold text-lg hover:text-fuchsia-400 transition-colors p-2 bg-white/5 rounded-lg border border-white/5">
                    الرئيسية
                </button>

                {/* Collapsible Dr Hope Section */}
                <div className="bg-black/20 rounded-xl border border-fuchsia-500/20 mt-2 overflow-hidden transition-all duration-300">
                    <button 
                        onClick={() => setIsMobileDrHopeOpen(!isMobileDrHopeOpen)}
                        className="w-full p-4 flex justify-between items-center text-fuchsia-400 font-bold text-sm hover:bg-white/5 transition-colors"
                    >
                        <span>عالم دكتور هوب</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isMobileDrHopeOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className={`flex flex-col gap-1 px-4 pb-4 ${isMobileDrHopeOpen ? 'block' : 'hidden'}`}>
                        <button onClick={() => handleMobileLinkClick(onShowVideo)} className="text-right text-slate-200 font-medium text-sm hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors flex items-center gap-2">
                            <VideoIcon className="w-4 h-4 text-fuchsia-500"/> من هي دكتور هوب
                        </button>
                        <button onClick={() => handleMobileLinkClick(onShowPhotoAlbum)} className="text-right text-slate-200 font-medium text-sm hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors flex items-center gap-2">
                            <CollectionIcon className="w-4 h-4 text-fuchsia-500"/> ألبوم الصور
                        </button>
                        <button onClick={() => handleMobileLinkClick(onShowInstagram)} className="text-right text-slate-200 font-medium text-sm hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors flex items-center gap-2">
                            <InstagramIcon className="w-4 h-4 text-fuchsia-500"/> بثوث انستجرام
                        </button>
                        <button onClick={() => handleMobileLinkClick(onRequestConsultationClick)} className="text-right text-slate-200 font-medium text-sm hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors flex items-center gap-2">
                            <ChatBubbleIcon className="w-4 h-4 text-fuchsia-500"/> طلب استشارة
                        </button>
                        <button onClick={() => handleMobileLinkClick(() => onNavigate(Page.REVIEWS))} className="text-right text-slate-200 font-medium text-sm hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 text-fuchsia-500"/> آراء المشتركات
                        </button>
                        <button onClick={() => handleMobileLinkClick(() => onNavigate(Page.PARTNERS))} className="text-right text-slate-200 font-medium text-sm hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors flex items-center gap-2">
                            <UsersIcon className="w-4 h-4 text-fuchsia-500"/> شركاء النجاح
                        </button>
                        <button onClick={() => handleMobileLinkClick(onBoutiqueClick)} className="text-right text-slate-200 font-medium text-sm hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors flex items-center gap-2">
                            <ShoppingCartIcon className="w-4 h-4 text-fuchsia-500"/> البوتيك
                        </button>
                    </div>
                </div>

                {user && (
                    <>
                        <div className="h-px bg-white/10 my-1"></div>
                        <button onClick={() => handleMobileLinkClick(() => onNavigate(Page.PROFILE))} className="text-right text-slate-200 font-bold text-lg hover:text-fuchsia-400 transition-colors p-2 flex items-center gap-2">
                            <UserIcon className="w-5 h-5"/> ملفي الشخصي
                        </button>
                        <button onClick={() => handleMobileLinkClick(onLogout)} className="text-right text-red-400 font-bold text-lg hover:text-red-300 transition-colors p-2 flex items-center gap-2">
                            <ArrowLeftOnRectangleIcon className="w-5 h-5"/>
                            تسجيل خروج
                        </button>
                    </>
                )}
            </div>

            {!user && (
                <div className="p-5 border-t border-white/10 bg-black/20">
                    <button onClick={() => handleMobileLinkClick(onLoginClick)} className="w-full bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-700 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">تسجيل دخول / انشاء حساب</button>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default Header;
