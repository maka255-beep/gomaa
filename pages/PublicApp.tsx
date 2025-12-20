
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { Page, Workshop, Package, User, Subscription, ConsultationRequest, NoteResource, Recording, PaymentIntent, OrderStatus } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import IntroAnimation from '../components/IntroAnimation';
import Toast from '../components/Toast';
import WhatsAppButton from '../components/WhatsAppButton';
import Chatbot from '../components/Chatbot';
import MusicPlayer from '../components/MusicPlayer';
import AuthModal from '../components/AuthModal';
import PaymentModal from '../components/PaymentModal';
import WorkshopDetailsModal from '../components/WorkshopDetailsModal';
import UnifiedGiftModal from '../components/UnifiedGiftModal';
import ZoomRedirectModal from '../components/ZoomRedirectModal';
import AttachmentViewerModal from '../components/AttachmentViewerModal';
import VideoModal from '../components/VideoModal';
import PhotoAlbumModal from '../components/PhotoAlbumModal';
import InstagramModal from '../components/InstagramModal';
import CvModal from '../components/CvModal';
import NavigationHubModal from '../components/NavigationHubModal';
import WorkshopsPage from '../pages/WorkshopsPage';
import ProfilePage from '../pages/ProfilePage';
import WatchPage from '../pages/WatchPage';
import RecordingPledgeModal from '../components/RecordingPledgeModal';
import { InvoiceModal } from '../components/InvoiceModal';
import ConsultationRequestModal from '../components/ConsultationRequestModal';
import ReviewsModal from '../components/ReviewsModal';
import PartnersModal from '../components/PartnersModal';
import BoutiqueModal from '../components/BoutiqueModal';
import ProductCheckoutModal from '../components/ProductCheckoutModal';
import LegalModal from '../components/LegalModal';
import { PrivacyPolicyContent, TermsContent, ShippingPolicyContent, AboutContent } from '../components/LegalContent';
import { isWorkshopExpired } from '../utils';

const PublicApp: React.FC = () => {
  const { currentUser, workshops, products, placeOrder, addSubscription, addPendingGift, donateToPayItForward, updateConsultationRequest } = useUser();
  
  const [currentPage, setCurrentPage] = useState<Page>(Page.WORKSHOPS);
  const [showIntro, setShowIntro] = useState(true);
  const [toasts, setToasts] = useState<{ id: string, message: string, type: 'success' | 'warning' | 'error' }[]>([]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialView, setAuthModalInitialView] = useState<'login' | 'register'>('login');
  const [authModalHideRegister, setAuthModalHideRegister] = useState(false);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNavigationHubOpen, setIsNavigationHubOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPhotoAlbumModalOpen, setIsPhotoAlbumModalOpen] = useState(false);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [isConsultationRequestModalOpen, setIsConsultationRequestModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isPartnersModalOpen, setIsPartnersModalOpen] = useState(false);
  const [legalModalContent, setLegalModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [isBoutiqueModalOpen, setIsBoutiqueModalOpen] = useState(false);
  const [boutiqueInitialView, setBoutiqueInitialView] = useState<'products' | 'cart'>('products');
  const [isProductCheckoutOpen, setIsProductCheckoutOpen] = useState(false);
  
  const [cart, setCart] = useState<Map<number, number>>(() => {
    const savedCart = localStorage.getItem('nawaya_cart');
    return savedCart ? new Map(JSON.parse(savedCart) as [number, number][]) : new Map();
  });

  const [openedWorkshopId, setOpenedWorkshopId] = useState<number | null>(null);
  const [zoomRedirectLink, setZoomRedirectLink] = useState<string | null>(null);
  const [attachmentToView, setAttachmentToView] = useState<NoteResource | null>(null);
  const [invoiceToView, setInvoiceToView] = useState<{ user: User; subscription: Subscription } | null>(null);
  
  // Watch State
  const [watchData, setWatchData] = useState<{ workshop: Workshop, recording: Recording } | null>(null);
  const [pendingWatchData, setPendingWatchData] = useState<{ workshop: Workshop, recording: Recording } | null>(null);
  
  const [paymentModalIntent, setPaymentModalIntent] = useState<PaymentIntent | null>(null);
  const [giftModalIntent, setGiftModalIntent] = useState<{ workshop: Workshop, pkg: Package | null } | null>(null);
  
  const [postLoginPaymentIntent, setPostLoginPaymentIntent] = useState<PaymentIntent | null>(null);
  const [postLoginGiftIntent, setPostLoginGiftIntent] = useState<{ workshop: Workshop, pkg: Package | null } | null>(null);
  
  const [returnToHub, setReturnToHub] = useState(false);
  const [pendingHubAction, setPendingHubAction] = useState<'profile' | 'live' | 'consultation' | null>(null);
  
  const initialHubOpenRef = useRef(false);

  useEffect(() => { localStorage.setItem('nawaya_cart', JSON.stringify(Array.from(cart.entries()))); }, [cart]);
  useEffect(() => { const timer = setTimeout(() => setShowIntro(false), 3500); return () => clearTimeout(timer); }, []);
  useEffect(() => { 
      if (!showIntro && !initialHubOpenRef.current) { 
          setIsNavigationHubOpen(true); 
          initialHubOpenRef.current = true; 
      } 
  }, [showIntro]);

  useEffect(() => {
      if (currentUser) {
          if (postLoginPaymentIntent) { setPaymentModalIntent(postLoginPaymentIntent); setIsPaymentModalOpen(true); setPostLoginPaymentIntent(null); }
          if (postLoginGiftIntent) { setGiftModalIntent(postLoginGiftIntent); setIsGiftModalOpen(true); setPostLoginGiftIntent(null); }
      }
  }, [currentUser, postLoginPaymentIntent, postLoginGiftIntent]);

  const activeLiveWorkshop = useMemo(() => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const validWorkshops = workshops.filter(w => w.isVisible && !w.isRecorded && !isWorkshopExpired(w));
      return validWorkshops.find(w => {
          const isToday = today >= w.startDate && today <= (w.endDate || w.startDate);
          const hasLink = !!w.zoomLink && w.zoomLink.trim() !== "";
          return isToday || hasLink;
      }) || null;
  }, [workshops]);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleLoginClick = (hideRegister = false) => {
    setAuthModalInitialView('login');
    setAuthModalHideRegister(hideRegister);
    setIsAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthModalInitialView('register');
    setAuthModalHideRegister(false);
    setIsAuthModalOpen(true);
  };

  const processLiveStreamAccess = (user: User) => {
      const nextLiveWorkshop = activeLiveWorkshop;
      if (!nextLiveWorkshop) {
          showToast('لا توجد ورش مباشرة جارية حالياً', 'warning');
          return;
      }
      const isSubscribed = user.subscriptions.some(
          sub => sub.workshopId === nextLiveWorkshop.id && 
          sub.status !== 'REFUNDED' && 
          !sub.isPayItForwardDonation
      );
      if (isSubscribed) {
          if (nextLiveWorkshop.zoomLink) {
              setZoomRedirectLink(nextLiveWorkshop.zoomLink);
          } else {
              showToast('رابط البث سيظهر هنا قريباً قبل موعد الورشة', 'success');
          }
      } else {
          showToast('يجب الاشتراك في الورشة للوصول إلى البث المباشر', 'warning');
          setCurrentPage(Page.WORKSHOPS);
          setTimeout(() => handleScrollToSection('live_stream_card'), 100);
      }
  };

  const handleLiveStreamCardLogin = () => {
      setPendingHubAction('live');
      setReturnToHub(false); 
      handleLoginClick(true);
  };

  const handleRequestConsultation = () => {
      if (currentUser) {
          setIsConsultationRequestModalOpen(true);
      } else {
          setPendingHubAction('consultation');
          handleLoginClick(false);
      }
  };

  const handleAuthModalClose = () => {
      setIsAuthModalOpen(false);
      if (returnToHub) {
          setReturnToHub(false);
          setPendingHubAction(null);
          setTimeout(() => setIsNavigationHubOpen(true), 100);
      } else {
          setPendingHubAction(null);
      }
  };

  const handleAuthModalSuccess = (user: User) => {
      setIsAuthModalOpen(false);
      showToast(`مرحباً ${user.fullName}`);
      if (pendingHubAction === 'profile') {
          setIsProfileOpen(true);
      } else if (pendingHubAction === 'live') {
          processLiveStreamAccess(user);
      } else if (pendingHubAction === 'consultation') {
          setIsConsultationRequestModalOpen(true);
      }
      setReturnToHub(false);
      setPendingHubAction(null);
  };

  const handleNavigate = (target: Page | string) => {
    setIsMobileMenuOpen(false);
    if (target === Page.PROFILE) { if (currentUser) setIsProfileOpen(true); else handleLoginClick(true); }
    else if (target === Page.REVIEWS) setIsReviewsModalOpen(true);
    else if (target === Page.PARTNERS) setIsPartnersModalOpen(true);
    else if (target === Page.BOUTIQUE) { setBoutiqueInitialView('products'); setIsBoutiqueModalOpen(true); }
    else if (target === 'cart') { setBoutiqueInitialView('cart'); setIsBoutiqueModalOpen(true); }
    else if (target === Page.WORKSHOPS) setCurrentPage(Page.WORKSHOPS);
  };

  const handleScrollToSection = (sectionId: string) => {
      if (currentPage !== Page.WORKSHOPS) { setCurrentPage(Page.WORKSHOPS); setTimeout(() => { const element = document.getElementById(sectionId); if (element) element.scrollIntoView({ behavior: 'smooth' }); }, 100); }
      else { const element = document.getElementById(sectionId); if (element) element.scrollIntoView({ behavior: 'smooth' }); }
  };

  const handleAddToCart = (productId: number) => {
    setCart(prev => { 
        const newCart = new Map<number, number>(prev); 
        newCart.set(productId, (newCart.get(productId) || 0) + 1); 
        return newCart; 
    });
    const product = products.find(p => p.id === productId);
    showToast(`تمت إضافة "${product?.name}" إلى السلة!`, 'success');
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) { removeFromCart(productId); return; }
    setCart(prev => { const newCart = new Map(prev); newCart.set(productId, quantity); return newCart; });
  };

  const removeFromCart = (productId: number) => { setCart(prev => { const newCart = new Map(prev); newCart.delete(productId); return newCart; }); };

  const handleCheckout = () => { if (currentUser) { setIsBoutiqueModalOpen(false); setIsProductCheckoutOpen(true); } else { setIsBoutiqueModalOpen(false); handleLoginClick(false); } };

  const handleProductOrderConfirm = (isCard: boolean) => {
    if (!currentUser) return;
    const cartItems = Array.from(cart.entries()).map(([productId, quantity]) => { const product = products.find(p => p.id === productId); return { productId, quantity, price: product!.price }; });
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.05;
    const totalAmount = subtotal + taxAmount;
    placeOrder(currentUser.id, { products: cartItems, totalAmount, taxAmount }, isCard ? OrderStatus.COMPLETED : OrderStatus.PENDING);
    showToast(isCard ? 'تمت عملية الشراء بنجاح!' : 'تم استلام طلبك وهو قيد المراجعة.', 'success');
    setIsProductCheckoutOpen(false);
    setCart(new Map());
  };

  const handleEnrollRequest = (workshop: Workshop, selectedPackage: Package | null) => {
    setOpenedWorkshopId(null);
    let effectivePackage = selectedPackage;
    if (!effectivePackage && workshop.packages && workshop.packages.length > 0) {
        effectivePackage = workshop.packages[0];
    }
    const price = effectivePackage?.discountPrice ?? effectivePackage?.price ?? workshop.price ?? 0;
    const intent: PaymentIntent = { type: 'workshop', item: workshop, pkg: effectivePackage || undefined, amount: price };
    if (currentUser) { setPaymentModalIntent(intent); setIsPaymentModalOpen(true); } else { setPostLoginPaymentIntent(intent); handleLoginClick(false); }
  };

  const handleGiftRequest = (workshop: Workshop, selectedPackage: Package | null) => {
    setOpenedWorkshopId(null);
    setGiftModalIntent({ workshop, pkg: selectedPackage });
    setIsGiftModalOpen(true);
  };

  const handlePayForConsultation = (request: ConsultationRequest) => {
    const intent: PaymentIntent = { type: 'consultation', item: request, amount: request.fee || 0 };
    setPaymentModalIntent(intent);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (method: 'CARD' | 'BANK_TRANSFER') => {
      if (!paymentModalIntent || !currentUser) return;
      const { type, item, pkg, amount, recipientDetails } = paymentModalIntent;
      if (type === 'workshop') {
          const price = amount || pkg?.discountPrice || pkg?.price || item.price || 0;
          addSubscription(currentUser.id, { workshopId: item.id, packageId: pkg?.id, pricePaid: price, paymentMethod: method === 'CARD' ? 'LINK' : 'BANK', attendanceType: pkg?.attendanceType }, method === 'CARD', true);
          showToast('تم الاشتراك بنجاح!', 'success');
      } else if (type === 'gift' && recipientDetails) {
          const { recipients, giftMessage } = recipientDetails;
          const pricePerGift = (amount || 0) / recipients.length;
          recipients.forEach((recipient: any) => {
              addPendingGift({ workshopId: item.id, packageId: pkg?.id, attendanceType: pkg?.attendanceType, gifterName: currentUser.fullName, gifterPhone: currentUser.phone, gifterEmail: currentUser.email, gifterUserId: currentUser.id, giftMessage: giftMessage || 'هدية من ' + currentUser.fullName, recipientName: recipient.name, recipientWhatsapp: recipient.whatsapp, pricePaid: pricePerGift });
          });
          showToast(`تم إرسال ${recipients.length} هدية بنجاح!`, 'success');
      } else if (type === 'payItForward' && recipientDetails) {
          const { seats, totalAmount } = recipientDetails;
          donateToPayItForward(item.id, totalAmount, seats, currentUser.id);
          showToast('شكراً لمساهمتك!', 'success');
      } else if (type === 'consultation') {
          const newStatus = method === 'CARD' ? 'PAID' : 'PENDING_PAYMENT';
          updateConsultationRequest(item.id, { status: newStatus, paymentMethod: method });
          showToast(method === 'CARD' ? 'تم دفع رسوم الاستشارة بنجاح' : 'تم إرسال طلب التحويل للمراجعة', 'success');
      }
      setIsPaymentModalOpen(false);
      setPaymentModalIntent(null);
  };

  const handleGiftProceed = (data: { type: 'friend' | 'fund'; recipients?: any[]; giftMessage?: string; seats?: number; totalAmount: number }) => {
      setIsGiftModalOpen(false);
      if (!giftModalIntent) return;
      const { workshop, pkg } = giftModalIntent;
      const intent: PaymentIntent = { type: data.type === 'fund' ? 'payItForward' : 'gift', item: workshop, pkg: pkg || undefined, amount: data.totalAmount, recipientDetails: data };
      if (currentUser) { setPaymentModalIntent(intent); setIsPaymentModalOpen(true); } else { setPostLoginPaymentIntent(intent); handleLoginClick(false); }
  };

  const handlePledgeConfirm = () => {
    if (pendingWatchData) {
      setWatchData(pendingWatchData);
      setPendingWatchData(null);
    }
  };

  const isHomePage = currentPage === Page.WORKSHOPS;

  return (
    <div className={`min-h-screen font-sans selection:bg-fuchsia-500/30 ${isHomePage ? 'bg-slate-50 text-slate-900' : 'bg-theme-gradient text-slate-200'}`}>
      {showIntro && <IntroAnimation />}
      
      {!watchData && (
        <>
            <Header 
                onLoginClick={handleLoginClick}
                onRegisterClick={handleRegisterClick}
                onNavigate={handleNavigate}
                onScrollToSection={handleScrollToSection}
                onShowVideo={() => setIsVideoModalOpen(true)}
                onShowPhotoAlbum={() => setIsPhotoAlbumModalOpen(true)}
                onShowInstagram={() => setIsInstagramModalOpen(true)}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                onBoutiqueClick={() => { setIsBoutiqueModalOpen(true); setBoutiqueInitialView('products'); }}
                onRequestConsultationClick={handleRequestConsultation}
                onOpenNavigationHub={() => setIsNavigationHubOpen(true)}
                isHomePage={isHomePage}
                isVisible={!showIntro}
            />

            <main className="min-h-screen pt-24 pb-12">
                {currentPage === Page.WORKSHOPS && (
                    <WorkshopsPage 
                        onLiveStreamLoginRequest={handleLiveStreamCardLogin}
                        onScrollToSection={handleScrollToSection}
                        onOpenWorkshopDetails={(id) => setOpenedWorkshopId(id)}
                        onZoomRedirect={(link, id) => { setZoomRedirectLink(link); }}
                        showToast={showToast}
                    />
                )}
            </main>

            <Footer 
                onShippingClick={() => setLegalModalContent({ title: 'سياسة الشحن والتوصيل', content: <ShippingPolicyContent /> })}
                onTermsClick={() => setLegalModalContent({ title: 'الشروط والأحكام', content: <TermsContent /> })}
                onAboutClick={() => setLegalModalContent({ title: 'من نحن', content: <AboutContent /> })}
                onPrivacyClick={() => setLegalModalContent({ title: 'سياسة الخصوصية', content: <PrivacyPolicyContent /> })}
            />
        </>
      )}

      {watchData && (
          <WatchPage 
            workshop={watchData.workshop} 
            recording={watchData.recording} 
            onBack={() => setWatchData(null)} 
          />
      )}

      <RecordingPledgeModal 
        isOpen={!!pendingWatchData} 
        onClose={() => setPendingWatchData(null)} 
        onConfirm={handlePledgeConfirm} 
        workshop={pendingWatchData?.workshop || null} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleAuthModalClose} 
        onSuccess={handleAuthModalSuccess} 
        initialView={authModalInitialView}
        showRegisterView={!authModalHideRegister}
      />
      {openedWorkshopId && <WorkshopDetailsModal workshop={workshops.find(w => w.id === openedWorkshopId)!} onClose={() => setOpenedWorkshopId(null)} onEnrollRequest={handleEnrollRequest} onGiftRequest={handleGiftRequest} showToast={showToast} />}
      {isPaymentModalOpen && paymentModalIntent && <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onCardPaymentSubmit={() => handlePaymentSubmit('CARD')} onBankPaymentSubmit={() => handlePaymentSubmit('BANK_TRANSFER')} itemTitle={paymentModalIntent.item.title || paymentModalIntent.item.subject} itemPackageName={paymentModalIntent.pkg?.name} amount={paymentModalIntent.amount || 0} currentUser={currentUser} onRequestLogin={() => { setIsPaymentModalOpen(false); handleLoginClick(false); setPostLoginPaymentIntent(paymentModalIntent); }} paymentType={paymentModalIntent.type} />}
      {isGiftModalOpen && giftModalIntent && <UnifiedGiftModal workshop={giftModalIntent.workshop} selectedPackage={giftModalIntent.pkg} onClose={() => setIsGiftModalOpen(false)} onProceed={handleGiftProceed} />}
      {isBoutiqueModalOpen && <BoutiqueModal isOpen={isBoutiqueModalOpen} onClose={() => setIsBoutiqueModalOpen(false)} cart={cart} onAddToCart={handleAddToCart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} onCheckout={handleCheckout} initialView={boutiqueInitialView} />}
      {isProductCheckoutOpen && <ProductCheckoutModal isOpen={isProductCheckoutOpen} onClose={() => setIsProductCheckoutOpen(false)} cart={cart} onConfirm={() => handleProductOrderConfirm(false)} onCardPaymentConfirm={() => handleProductOrderConfirm(true)} onRequestLogin={() => { setIsProductCheckoutOpen(false); handleLoginClick(false); }} currentUser={currentUser} />}
      {isProfileOpen && <ProfilePage isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={currentUser} onZoomRedirect={(link) => setZoomRedirectLink(link)} onPlayRecording={(w, r) => { setIsProfileOpen(false); setPendingWatchData({ workshop: w, recording: r }); }} onViewAttachment={(note) => setAttachmentToView(note)} onViewRecommendedWorkshop={(id) => { setIsProfileOpen(false); setOpenedWorkshopId(id); }} showToast={showToast} onPayForConsultation={handlePayForConsultation} onViewInvoice={(details) => setInvoiceToView(details)} />}
      
      {isVideoModalOpen && <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />}
      {isPhotoAlbumModalOpen && <PhotoAlbumModal isOpen={isPhotoAlbumModalOpen} onClose={() => setIsPhotoAlbumModalOpen(false)} />}
      {isInstagramModalOpen && <InstagramModal isOpen={isInstagramModalOpen} onClose={() => setIsInstagramModalOpen(false)} />}
      {isConsultationRequestModalOpen && <ConsultationRequestModal isOpen={isConsultationRequestModalOpen} onClose={() => setIsConsultationRequestModalOpen(false)} onSuccess={() => showToast('تم إرسال طلبك بنجاح', 'success')} />}
      {isReviewsModalOpen && <ReviewsModal isOpen={isReviewsModalOpen} onClose={() => setIsReviewsModalOpen(false)} />}
      {isPartnersModalOpen && <PartnersModal isOpen={isPartnersModalOpen} onClose={() => setIsPartnersModalOpen(false)} />}
      {attachmentToView && <AttachmentViewerModal note={attachmentToView} onClose={() => setAttachmentToView(null)} />}
      {zoomRedirectLink && <ZoomRedirectModal isOpen={!!zoomRedirectLink} zoomLink={zoomRedirectLink} onClose={() => setZoomRedirectLink(null)} />}
      {invoiceToView && <InvoiceModal isOpen={!!invoiceToView} onClose={() => setInvoiceToView(null)} user={invoiceToView.user} subscription={invoiceToView.subscription} workshop={workshops.find(w => w.id === invoiceToView.subscription.workshopId)!} />}
      {isCvModalOpen && <CvModal isOpen={isCvModalOpen} onClose={() => setIsCvModalOpen(false)} />}
      {isNavigationHubOpen && <NavigationHubModal 
        isOpen={isNavigationHubOpen} 
        userFullName={currentUser?.fullName} 
        onNavigate={(target) => { 
            setIsNavigationHubOpen(false); 
            if (target === 'profile') { 
                if (currentUser) {
                    setIsProfileOpen(true); 
                } else { 
                    setReturnToHub(true);
                    setPendingHubAction('profile');
                    handleLoginClick(true); 
                } 
            } else if (target === 'live') { 
                if (currentUser) {
                    processLiveStreamAccess(currentUser);
                } else {
                    setReturnToHub(true);
                    setPendingHubAction('live');
                    handleLoginClick(true);
                }
            } else if (target === 'new') { 
                setCurrentPage(Page.WORKSHOPS); 
                setTimeout(() => handleScrollToSection('workshops_section'), 100); 
            } 
        }} 
        hasActiveLiveStream={!!activeLiveWorkshop}
      />}
      {legalModalContent && <LegalModal isOpen={!!legalModalContent} onClose={() => setLegalModalContent(null)} title={legalModalContent.title} content={legalModalContent.content} />}
      <Chatbot />
      <WhatsAppButton />
      <MusicPlayer />
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(prev => prev.filter(item => item.id !== t.id))} />)}
    </div>
  );
};

export default PublicApp;
