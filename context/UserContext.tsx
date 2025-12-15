
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { User, Workshop, DrhopeData, Notification, Expense, Review, BroadcastCampaign, CertificateTemplate, Payment, SubscriptionStatus, Subscription, Product, Order, OrderStatus, Partner, ConsultationRequest, Theme, ThemeColors, CreditTransaction, PendingGift, RecordingStats } from '../types';
import { sendWhatsAppMessage } from '../services/whatsappService';
import { formatArabicDate, formatArabicTime, normalizePhoneNumber } from '../utils';
import { trackEvent } from '../analytics';

const initialWorkshops: Workshop[] = [
    {
        id: 1,
        title: 'ورشة فنون الكتابة الإبداعية',
        instructor: 'دكتورة أمل العتيبي',
        startDate: '2025-10-19',
        startTime: '11:00',
        location: 'أونلاين',
        country: 'المملكة العربية السعودية',
        isRecorded: false,
        zoomLink: 'https://zoom.us/j/1234567890',
        isVisible: true,
        price: 350,
        paymentLink: 'https://example.com/payment',
        description: 'ورشة تفاعلية لتطوير مهارات الكتابة الإبداعية واستكشاف عوالم الخيال.',
        topics: ['أساسيات السرد', 'بناء الشخصيات', 'الحبكة القصصية'],
        packages: [
            { id: 1, name: 'الباقة الأساسية', price: 350, features: ['حضور مباشر للورشة', 'تسجيل الورشة لمدة شهر'] },
            { id: 2, name: 'الباقة المميزة', price: 500, discountPrice: 450, features: ['حضور مباشر للورشة', 'تسجيل الورشة لمدة شهر', 'متابعة خاصة مع المدربة'], availability: { endDate: '2025-10-15' } },
        ],
        reviews: [
            { id: 'rev1', workshopId: 1, fullName: 'نورة عبدالله', rating: 5, comment: 'ورشة رائعة ومفيدة جداً!', date: '2025-09-01T10:00:00Z' }
        ],
        certificatesIssued: true,
        trainerPercentage: 70,
        trainerPayments: [],
        payItForwardBalance: 3150,
    },
    {
        id: 2,
        title: 'ورشة الذكاء العاطفي',
        instructor: 'DRHOPE',
        startDate: '2025-11-05',
        startTime: '18:00',
        location: 'حضوري',
        country: 'الإمارات العربية المتحدة',
        city: 'دبي',
        hotelName: 'فندق أرماني',
        hallName: 'قاعة الألماس',
        isRecorded: false,
        zoomLink: 'https://zoom.us/j/9876543210',
        isVisible: true,
        description: 'تعلم كيفية فهم وإدارة مشاعرك ومشاعر الآخرين لتحقيق النجاح في الحياة الشخصية والمهنية.',
        topics: ['مفهوم الذكاء العاطفي', 'الوعي الذاتي', 'إدارة العلاقات'],
        packages: [
             { id: 3, name: 'تسجيل مبكر', price: 1200, discountPrice: 1000, features: ['مقعد حضوري', 'شهادة معتمدة'], availability: { endDate: '2025-10-20' } },
             { id: 4, name: 'المقعد العادي', price: 1200, features: ['مقعد حضوري', 'شهادة معتمدة'] }
        ],
        reviews: [],
        certificatesIssued: false,
        payItForwardBalance: 0,
    },
    {
        id: 3,
        title: 'ورشة أساسيات التصوير الفوتوغرافي (مسجلة)',
        instructor: 'أحمد علي',
        startDate: '2025-01-01',
        startTime: '00:00',
        location: 'مسجلة',
        country: 'عالمي',
        isRecorded: true,
        zoomLink: '',
        isVisible: true,
        price: 250,
        paymentLink: 'https://example.com/payment-photo',
        description: 'تعلم أساسيات التصوير من الصفر، من إعدادات الكاميرا إلى تكوين الصور بشكل احترافي.',
        topics: ['مقدمة للكاميرات', 'التعريض والمثلث', 'قواعد التكوين'],
        recordings: [
            { name: 'الجزء الأول: الأساسيات', url: 'https://player.vimeo.com/video/824804225' },
            { name: 'الجزء الثاني: التطبيق العملي', url: 'https://player.vimeo.com/video/824804225' }
        ],
        notes: [
            { type: 'link', name: 'مذكرة الورشة PDF', value: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
        ],
        reviews: [],
        certificatesIssued: true,
        payItForwardBalance: 0,
    },
    {
        id: 4,
        title: 'التخطيط الاستراتيجي (هجين)',
        instructor: 'DRHOPE',
        startDate: '2025-12-10',
        startTime: '10:00',
        location: 'أونلاين وحضوري',
        country: 'الإمارات العربية المتحدة',
        city: 'أبوظبي',
        hotelName: 'فندق قصر الإمارات',
        hallName: 'قاعة الذهب',
        isRecorded: false,
        zoomLink: 'https://zoom.us/j/1122334455',
        isVisible: true,
        description: 'ورشة شاملة لبناء خطة استراتيجية. تجربة للدفع المختلط.',
        topics: ['تحليل الواقع', 'صياغة الأهداف'],
        packages: [
            { id: 5, name: 'حضور VIP (حضوري)', price: 2000, features: ['مقعد أمامي', 'غداء عمل'], attendanceType: 'حضوري' },
            { id: 6, name: 'حضور عام (حضوري)', price: 1500, features: ['مقعد في القاعة', 'ضيافة'], attendanceType: 'حضوري' },
            { id: 7, name: 'حضور عن بعد (أونلاين)', price: 800, features: ['بث مباشر', 'مذكرة إلكترونية'], attendanceType: 'أونلاين' },
        ],
        certificatesIssued: true,
        payItForwardBalance: 0,
    },
    {
        id: 5,
        title: 'أساسيات التسويق (سعر موحد)',
        instructor: 'سارة خالد',
        startDate: '2025-11-20',
        startTime: '16:00',
        location: 'أونلاين',
        country: 'عالمي',
        isRecorded: false,
        zoomLink: 'https://zoom.us/j/5566778899',
        isVisible: true,
        price: 150, 
        description: 'مدخل سريع وعملي لعالم التسويق الرقمي. تجربة للدفع الموحد.',
        topics: ['أنواع المحتوى', 'الإعلانات'],
        certificatesIssued: true,
        payItForwardBalance: 0,
    },
    {
        id: 6,
        title: 'لقاء مفتوح (مجاني)',
        instructor: 'د. هوب',
        startDate: '2025-11-25',
        startTime: '20:00',
        location: 'أونلاين',
        country: 'عالمي',
        isRecorded: false,
        zoomLink: 'https://zoom.us/j/free-meeting',
        isVisible: true,
        price: 0,
        description: 'لقاء مفتوح مجاني للإجابة على الاستفسارات. تجربة للتسجيل المجاني.',
        topics: ['أسئلة وأجوبة'],
        certificatesIssued: false,
        payItForwardBalance: 0,
    },
    {
        id: 7,
        title: 'رحلة اكتشاف الذات: بوصلة الحياة',
        instructor: 'د. هوب',
        startDate: '2026-01-15',
        startTime: '17:00',
        location: 'أونلاين',
        country: 'عالمي',
        isRecorded: false,
        zoomLink: 'https://zoom.us/j/123123123',
        isVisible: true,
        price: 450,
        description: 'رحلة عميقة لاكتشاف شغفك، تحديد قيمك العليا، ورسم خريطة طريق واضحة لمستقبلك الشخصي والمهني.',
        topics: ['تحليل القيم الشخصية', 'تحديد نقاط القوة', 'رسم خطة الحياة'],
        certificatesIssued: true,
        payItForwardBalance: 450,
    },
    {
        id: 8,
        title: 'أساسيات الرسم بالألوان الزيتية',
        instructor: 'فنانة. سارة النجار',
        startDate: '2026-02-20',
        startTime: '16:00',
        location: 'حضوري',
        country: 'المملكة العربية السعودية',
        city: 'الرياض',
        hotelName: 'فندق نارسيس',
        hallName: 'قاعة الفنون',
        isRecorded: false,
        zoomLink: '',
        isVisible: true,
        description: 'ورشة عملية ممتعة لتعلم تقنيات الرسم بالزيت، دمج الألوان، وتكوين اللوحات الفنية.',
        topics: ['الأدوات والخامات', 'نظرية الألوان', 'رسم الطبيعة الصامتة'],
        packages: [
            { id: 81, name: 'شامل الأدوات', price: 1500, features: ['حضور 3 أيام', 'حقيبة أدوات رسم كاملة', 'شهادة'] },
            { id: 82, name: 'بدون أدوات', price: 1200, features: ['حضور 3 أيام', 'شهادة'] }
        ],
        certificatesIssued: true,
        payItForwardBalance: 0,
    },
    {
        id: 9,
        title: 'التسويق الرقمي للمشاريع الصغيرة (مسجلة)',
        instructor: 'أ. خالد المحمد',
        startDate: '2025-02-01',
        startTime: '00:00',
        location: 'مسجلة',
        country: 'عالمي',
        isRecorded: true,
        zoomLink: '',
        isVisible: true,
        price: 299,
        description: 'تعلم كيف تطلق حملات إعلانية ناجحة وتدير حسابات التواصل الاجتماعي لمشروعك بذكاء.',
        topics: ['إعلانات انستجرام', 'كتابة المحتوى', 'تحليل البيانات'],
        recordings: [
            { name: 'مقدمة في التسويق', url: 'https://player.vimeo.com/video/123456789' },
            { name: 'إطلاق الحملات', url: 'https://player.vimeo.com/video/987654321' }
        ],
        certificatesIssued: true,
        payItForwardBalance: 0,
    },
    {
        id: 10,
        title: 'التوازن الصحي واليوغا',
        instructor: 'كوتش ندى',
        startDate: '2026-03-10',
        startTime: '09:00',
        location: 'أونلاين وحضوري',
        country: 'الإمارات العربية المتحدة',
        city: 'دبي',
        hotelName: 'ستوديو الحياة',
        isRecorded: false,
        zoomLink: 'https://zoom.us/j/yoga123',
        isVisible: true,
        description: 'جلسات يوغا وتأمل لتعزيز الصحة النفسية والجسدية، متاحة للحضور في الاستوديو أو عبر البث المباشر.',
        topics: ['تمارين التنفس', 'وضعيات اليوغا الأساسية', 'التغذية الصحية'],
        packages: [
            { id: 101, name: 'حضور في الاستوديو', price: 800, features: ['4 جلسات حضورية', 'سناك صحي'], attendanceType: 'حضوري' },
            { id: 102, name: 'بث مباشر', price: 400, features: ['4 جلسات أونلاين', 'تسجيل الجلسات'], attendanceType: 'أونلاين' }
        ],
        certificatesIssued: false,
        payItForwardBalance: 0,
    },
    {
        id: 11,
        title: 'التربية الإيجابية للأطفال',
        instructor: 'د. مريم العلي',
        startDate: '2026-04-05',
        startTime: '20:00',
        location: 'أونلاين',
        country: 'عالمي',
        isRecorded: false,
        zoomLink: 'https://zoom.us/j/parenting101',
        isVisible: true,
        price: 350,
        description: 'كيف نبني علاقة قوية مع أبنائنا تقوم على الاحترام المتبادل والحب غير المشروط.',
        topics: ['فهم سلوك الطفل', 'بدائل العقاب', 'التواصل الفعال'],
        certificatesIssued: true,
        payItForwardBalance: 0,
    }
];

const initialUsers: User[] = [
    {
        id: 1,
        fullName: 'فاطمة محمد',
        email: 'fatima@example.com',
        phone: '+971501234567',
        notifications: [],
        subscriptions: [
            { id: 'sub1', workshopId: 1, activationDate: '2025-09-15', expiryDate: '2099-10-15', pricePaid: 350, packageId: 1, status: SubscriptionStatus.ACTIVE, isApproved: true, paymentMethod: 'LINK' },
            { id: 'sub2', workshopId: 3, activationDate: '2025-09-10', expiryDate: '2025-12-10', pricePaid: 250, status: SubscriptionStatus.ACTIVE, isApproved: true, paymentMethod: 'BANK'},
            { id: 'sub-audio', workshopId: 13, activationDate: '2025-03-01', expiryDate: '2099-03-01', pricePaid: 150, status: SubscriptionStatus.ACTIVE, isApproved: true, paymentMethod: 'LINK' }
        ],
        orders: [],
        internalCredit: 0,
        creditTransactions: [],
    },
    {
        id: 2,
        fullName: 'مريم أحمد',
        email: 'maryam@example.com',
        phone: '+966559876543',
        notifications: [],
        subscriptions: [
            { id: 'sub3', workshopId: 1, activationDate: '2025-09-18', expiryDate: '2099-10-18', pricePaid: 450, packageId: 2, status: SubscriptionStatus.PENDING, isApproved: false, paymentMethod: 'BANK' }
        ],
        orders: [],
        internalCredit: 100,
        creditTransactions: [
            { id: 'tx-initial', date: '2025-09-01T10:00:00Z', type: 'addition', amount: 100, description: 'رصيد افتتاحي' }
        ],
    },
    {
        id: 100,
        fullName: 'الجوهرة بنت عبدالله',
        email: 'aljawhara@donor.com',
        phone: '+966505555555',
        notifications: [],
        subscriptions: [
            {
                id: 'sub-donor-1',
                workshopId: 1,
                activationDate: '2025-10-01',
                expiryDate: '2099-10-01',
                pricePaid: 3500,
                paymentMethod: 'LINK',
                isPayItForwardDonation: true,
                donationRemaining: 2450,
                notes: 'دعم لغير القادرين (10 مقاعد). تم منح 3 مقاعد.',
                isApproved: true,
                status: SubscriptionStatus.COMPLETED
            }
        ],
        orders: [],
        internalCredit: 0
    },
];

const initialDrhopeData: Omit<DrhopeData, 'theme'> & { themes: Theme[], activeThemeId: string } = {
     videos: [{id: 'vid1', title: 'فيديو تعريفي', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'}],
    photos: ['https://picsum.photos/400/400?random=1', 'https://picsum.photos/400/400?random=2'],
    instagramLinks: [{id: 'insta1', title: 'بث مباشر #1', url: 'https://instagram.com'}],
    socialMediaLinks: { instagram: 'https://instagram.com', twitter: 'https://twitter.com', snapchat: 'https://snapchat.com', tiktok: 'https://tiktok.com', facebook: 'https://facebook.com' },
    whatsappNumber: '+966501234567',
    backgroundMusicUrl: '',
    backgroundMusicName: '',
    introText: 'يُحِبُّهُمْ وَيُحِبُّهُونَهُۥٓ',
    logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ibG9nby1ncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlYzQ4OTk7IiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM1YjIxYjY7IiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDgiIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNsb2dvLWdyYWRpZW50KSIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgPHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iJ05vdG8gU2FucyBBcmFiaWMnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjUwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7jg4E8L3RleHQ+Cjwvc3ZnPg==',
    cvUrl: '',
    headerLinks: { drhope: 'دكتور هوب', reviews: 'آراء المشتركات', profile: 'ملفي الشخصي' },
    accountHolderName: 'مؤسسة نوايا للفعاليات',
    bankName: 'بنك الراجحي',
    ibanNumber: 'SA00 0000 0000 0000 0000 0000 0000',
    accountNumber: '1234567890123',
    swiftCode: '',
    companyAddress: 'ابوظبي - الامارات العربية المتحدة',
    companyPhone: '+971 4 123 4567',
    taxRegistrationNumber: '100000000000003',
    liveWorkshopRefundPolicy: 'يحق للمشتركة الإنسحاب وإسترجاع المبلغ كامل قبل بدايه الورشة بأسبوع ( ٧ ايام )\nقبل بدء الورشة بسبعة ايام نعتذر لا يمكننا إسترجاع المبلغ\nيتم إسترجاع المبلغ في خلال سبعة ايام عمل',
    recordedWorkshopTerms: 'يتم تفعيل الورشة بعد التحويل وارسال صورة من التحويل على الواتساب\nالدخول بحسابك المسجل على صفحة دوراتك بالموقع - بداخلها تجد الورشة',
    paymentSettings: {
        cardPaymentsEnabled: true,
        bankTransfersEnabled: true,
    },
    themes: [
        { 
            id: 'theme-classic-violet-pink', 
            name: 'السمة الأصلية (موف غامق)', 
            colors: {
                background: { from: '#2e1065', to: '#4a044e', balance: 60 },
                button: { from: '#7c3aed', to: '#db2777', balance: 50 },
                card: { from: 'rgba(46, 16, 101, 0.6)', to: 'rgba(88, 28, 135, 0.4)', balance: 50 },
                text: { primary: '#e2e8f0', accent: '#e879f9', secondary_accent: '#fcd34d' },
                glow: { color: '#d946ef', intensity: 60 },
            }
        },
    ],
    activeThemeId: 'theme-classic-violet-pink',
    consultationSettings: {
        defaultDurationMinutes: 50,
        defaultFee: 450,
        consultationsEnabled: true,
    },
    payItForwardStats: {
        totalFund: 7650,
        beneficiariesCount: 18
    }
};

const initialExpenses: Expense[] = [
    { id: 'exp1', date: '2025-10-01T10:00:00Z', title: 'إعلان فيسبوك لورشة الكتابة', workshopId: 1, supplier: 'Facebook Ads', amount: 500, includesVat: true },
    { id: 'exp2', date: '2025-09-25T10:00:00Z', title: 'اشتراك زووم', supplier: 'Zoom', amount: 150, includesVat: false },
];

const initialBroadcastHistory: BroadcastCampaign[] = [];

const initialPendingGifts: PendingGift[] = [
    {
      id: 'gift-test-123',
      workshopId: 1,
      gifterName: 'مرسل الهدية التجريبي',
      gifterPhone: '+966500000001',
      gifterEmail: 'gifter@test.com',
      gifterUserId: 1,
      giftMessage: 'هذه رسالة هدية تجريبية للتأكد من أن كل شيء يعمل بشكل صحيح.',
      recipientName: 'مستلم الهدية التجريبي',
      recipientWhatsapp: '+966500000002',
      pricePaid: 350,
      createdAt: new Date().toISOString(),
    }
];

const initialProducts: Product[] = [
    { id: 101, name: 'دفتر يوميات نوايا', price: 75, imageUrl: 'https://picsum.photos/id/101/400/400' },
    { id: 102, name: 'مخطط سنوي 2025', price: 120, imageUrl: 'https://picsum.photos/id/102/400/400' },
    { id: 103, name: 'كتاب "تحدث بثقة"', price: 85, imageUrl: 'https://picsum.photos/id/103/400/400' },
];

const initialPartners: Partner[] = [
    { id: 'partner1', name: 'شريك النجاح الأول', logo: 'https://picsum.photos/id/201/200/200', description: 'نبذة مفصلة عن شريك النجاح الأول وما يقدمه من خدمات مميزة.', websiteUrl: 'https://example.com', instagramUrl: 'https://instagram.com' },
    { id: 'partner2', name: 'الشريك الثاني', logo: 'https://picsum.photos/id/202/200/200', description: 'تفاصيل حول الشريك الثاني ودوره في دعم المنصة.', websiteUrl: 'https://example.com' },
];

interface RegistrationAvailability {
  emailUser?: User;
  phoneUser?: User;
}

interface UserContextType {
    currentUser: User | null;
    users: User[];
    workshops: Workshop[];
    products: Product[];
    partners: Partner[];
    pendingGifts: PendingGift[];
    addPendingGift: (giftData: Omit<PendingGift, 'id' | 'createdAt'>) => PendingGift;
    updatePendingGift: (giftId: string, updates: Partial<PendingGift>) => void;
    claimGift: (giftId: string, claimingUserId: number) => { success: boolean; message?: string };
    deletePendingGift: (giftId: string) => void;
    restorePendingGift: (giftId: string) => void;
    permanentlyDeletePendingGift: (giftId: string) => void;
    checkAndClaimPendingGifts: (user: User) => number;
    adminManualClaimGift: (giftId: string, customUserData?: { fullName: string; email: string; phone: string }) => { success: boolean; message: string; status?: 'USER_NOT_FOUND' };
    addPartner: (partner: Omit<Partner, 'id'>) => void;
    updatePartner: (partner: Partner) => void;
    deletePartner: (partnerId: string) => void;
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (productId: number) => void;
    restoreProduct: (productId: number) => void;
    permanentlyDeleteProduct: (productId: number) => void;
    drhopeData: DrhopeData;
    activeTheme: ThemeColors;
    notifications: Notification[];
    expenses: Expense[];
    broadcastHistory: BroadcastCampaign[];
    globalCertificateTemplate: CertificateTemplate | null;
    emailPreview: { title: string; subject: string; messageHtml: string } | null;
    login: (email: string, phone: string) => { user?: User; error?: string };
    loginAsUser: (userToLogin: User) => void;
    logout: () => void;
    register: (fullName: string, email: string, phone: string) => User;
    checkRegistrationAvailability: (email: string, phone: string) => RegistrationAvailability;
    findUserByCredential: (type: 'email' | 'phone', value: string) => User | null;
    addUser: (fullName: string, email: string, phone: string) => User;
    updateUser: (userId: number, updates: Partial<User>) => void;
    deleteUser: (userId: number) => void;
    restoreUser: (userId: number) => void;
    permanentlyDeleteUser: (userId: number) => void;
    addWorkshop: (workshop: Omit<Workshop, 'id'>) => void;
    updateWorkshop: (workshop: Workshop) => void;
    deleteWorkshop: (workshopId: number) => void;
    restoreWorkshop: (workshopId: number) => void;
    permanentlyDeleteWorkshop: (workshopId: number) => void;
    addSubscription: (userId: number, subscriptionData: Partial<Subscription>, isApproved: boolean, sendWhatsApp: boolean, creditToApply?: number) => void;
    updateSubscription: (userId: number, subscriptionId: string, updates: Partial<Subscription>) => void;
    deleteSubscription: (userId: number, subscriptionId: string) => void;
    restoreSubscription: (userId: number, subscriptionId: string) => void;
    permanentlyDeleteSubscription: (userId: number, subscriptionId: string) => void;
    transferSubscription: (userId: number, fromSubId: string, toWorkshopId: number, notes: string) => void;
    reactivateSubscription: (userId: number, subscriptionId: string) => void;
    enrollWithPendingApproval: (workshopId: number, packageId: number | undefined, paymentMethod: 'BANK' | 'LINK', attendanceType?: 'أونلاين' | 'حضوري') => void;
    placeOrder: (userId: number, order: Omit<Order, 'id' | 'userId' | 'status' | 'orderDate'>, initialStatus?: OrderStatus) => Order;
    confirmOrder: (userId: number, orderId: string) => void;
    updateDrhopeData: (updates: Partial<DrhopeData>) => void;
    addNotificationForMultipleUsers: (userIds: number[], message: string, workshopId?: number, whatsappMessage?: string) => void;
    markNotificationsAsRead: () => void;
    addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (expenseId: string) => void;
    restoreExpense: (expenseId: string) => void;
    permanentlyDeleteExpense: (expenseId: string) => void;
    addReview: (workshopId: number, review: { fullName: string; rating: number; comment: string }) => void;
    deleteReview: (workshopId: number, reviewId: string) => void;
    restoreReview: (workshopId: number, reviewId: string) => void;
    permanentlyDeleteReview: (workshopId: number, reviewId: string) => void;
    addBroadcastToHistory: (campaign: Omit<BroadcastCampaign, 'id' | 'timestamp'>) => BroadcastCampaign;
    previewEmail: (title: string, subject: string, messageHtml: string) => void;
    clearEmailPreview: () => void;
    updateGlobalCertificateTemplate: (template: CertificateTemplate) => void;
    convertToInternalCredit: (userId: number, subscriptionId: string) => void;
    deleteCreditTransaction: (userId: number, transactionId: string) => void;
    restoreCreditTransaction: (userId: number, transactionId: string) => void;
    permanentlyDeleteCreditTransaction: (userId: number, transactionId: string) => void;
    consultationRequests: ConsultationRequest[];
    addConsultationRequest: (userId: number, subject: string) => void;
    updateConsultationRequest: (requestId: string, updates: Partial<Omit<ConsultationRequest, 'id' | 'userId' | 'requestedAt'>>) => void;
    logRecordingView: (userId: number, workshopId: number, recordingUrl: string) => void;
    markAttendance: (userId: number, workshopId: number) => void;
    donateToPayItForward: (workshopId: number, amount: number, seats?: number, donorUserId?: number) => void;
    grantPayItForwardSeat: (userId: number, workshopId: number, cost: number, donorSubscriptionId: string, notes?: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    });
    const [users, setUsers] = useState<User[]>(() => {
        const stored = localStorage.getItem('users');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : initialUsers;
    });
    const [workshops, setWorkshops] = useState<Workshop[]>(() => {
        const stored = localStorage.getItem('workshops');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : initialWorkshops;
    });
    const [products, setProducts] = useState<Product[]>(() => {
        const stored = localStorage.getItem('products');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : initialProducts;
    });
    const [partners, setPartners] = useState<Partner[]>(() => {
        const stored = localStorage.getItem('partners');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : initialPartners;
    });
    const [pendingGifts, setPendingGifts] = useState<PendingGift[]>(() => {
        const stored = localStorage.getItem('pendingGifts');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : initialPendingGifts;
    });
    const [drhopeData, setDrhopeData] = useState<DrhopeData>(() => {
        const stored = localStorage.getItem('drhopeData');
        return stored ? JSON.parse(stored) : (initialDrhopeData as DrhopeData);
    });
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        const stored = localStorage.getItem('expenses');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : initialExpenses;
    });
    const [broadcastHistory, setBroadcastHistory] = useState<BroadcastCampaign[]>(() => {
        const stored = localStorage.getItem('broadcastHistory');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : initialBroadcastHistory;
    });
    const [globalCertificateTemplate, setGlobalCertificateTemplate] = useState<CertificateTemplate | null>(() => {
        const stored = localStorage.getItem('globalCertificateTemplate');
        return stored ? JSON.parse(stored) : null;
    });
    const [emailPreview, setEmailPreview] = useState<{ title: string; subject: string; messageHtml: string } | null>(null);

    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>(() => {
        const stored = localStorage.getItem('consultationRequests');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : [];
    });

    useEffect(() => { localStorage.setItem('currentUser', JSON.stringify(currentUser)); }, [currentUser]);
    useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('workshops', JSON.stringify(workshops)); }, [workshops]);
    useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
    useEffect(() => { localStorage.setItem('partners', JSON.stringify(partners)); }, [partners]);
    useEffect(() => { localStorage.setItem('pendingGifts', JSON.stringify(pendingGifts)); }, [pendingGifts]);
    useEffect(() => { localStorage.setItem('drhopeData', JSON.stringify(drhopeData)); }, [drhopeData]);
    useEffect(() => { localStorage.setItem('expenses', JSON.stringify(expenses)); }, [expenses]);
    useEffect(() => { localStorage.setItem('broadcastHistory', JSON.stringify(broadcastHistory)); }, [broadcastHistory]);
    useEffect(() => { localStorage.setItem('globalCertificateTemplate', JSON.stringify(globalCertificateTemplate)); }, [globalCertificateTemplate]);
    useEffect(() => { localStorage.setItem('consultationRequests', JSON.stringify(consultationRequests)); }, [consultationRequests]);

    useEffect(() => {
        const newIds = [4, 5, 6, 7, 8, 9, 10, 11];
        setWorkshops(currentWorkshops => {
            const missing = initialWorkshops.filter(iw => 
                newIds.includes(iw.id) && !currentWorkshops.some(cw => cw.id === iw.id)
            );
            if (missing.length > 0) {
                return [...currentWorkshops, ...missing];
            }
            return currentWorkshops;
        });
    }, []);

    useEffect(() => {
        if (currentUser) {
            const updatedCurrentUser = users.find(u => u.id === currentUser.id);
            if (updatedCurrentUser && JSON.stringify(updatedCurrentUser) !== JSON.stringify(currentUser)) {
                setCurrentUser(updatedCurrentUser);
            } else if (!updatedCurrentUser) {
                setCurrentUser(null);
            }
        }
    }, [users, currentUser]);

    const notifications = useMemo(() => currentUser?.notifications || [], [currentUser]);

    const activeTheme = useMemo(() => {
        const themes = drhopeData.themes || [];
        const activeId = drhopeData.activeThemeId;
        const defaultTheme: ThemeColors = {
            background: { from: '#2e1065', to: '#4a044e', balance: 60 },
            button: { from: '#7c3aed', to: '#db2777', balance: 50 },
            card: { from: 'rgba(46, 16, 101, 0.6)', to: 'rgba(88, 28, 135, 0.4)', balance: 50 },
            text: { primary: '#e2e8f0', accent: '#e879f9' },
            glow: { color: '#d946ef', intensity: 50 },
        };
        if (themes.length === 0) return defaultTheme;
        const foundTheme = themes.find(t => t.id === activeId);
        return foundTheme ? foundTheme.colors : (themes[0]?.colors || defaultTheme);
    }, [drhopeData.themes, drhopeData.activeThemeId]);
    
    const addUser = (fullName: string, email: string, phone: string): User => {
        const newUser: User = { 
            id: Date.now(), 
            fullName, 
            email, 
            phone, 
            subscriptions: [], 
            orders: [], 
            notifications: [], 
            creditTransactions: [] 
        };
        setUsers(prev => [...prev, newUser]);
        return newUser;
    };

    const addSubscription = (userId: number, subData: Partial<Subscription>, isApproved: boolean, sendWhatsApp: boolean, creditToApply = 0) => {
        const workshop = workshops.find(w => w.id === subData.workshopId);
        if (!workshop) return;
        const activationDate = new Date();
        let expiryDate = new Date();
        expiryDate.setFullYear(2099);

        const newSubscription: Subscription = {
            id: `sub-${Date.now()}`,
            workshopId: subData.workshopId as number,
            status: SubscriptionStatus.ACTIVE,
            isApproved,
            activationDate: activationDate.toISOString().split('T')[0],
            expiryDate: expiryDate.toISOString().split('T')[0],
            creditApplied: creditToApply > 0 ? creditToApply : undefined,
            ...subData,
        };

        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                const updatedCredit = (user.internalCredit || 0) - creditToApply;
                const creditTransactions = [...(user.creditTransactions || [])];
                if (creditToApply > 0) {
                    const newTransaction: CreditTransaction = {
                        id: `tx-${Date.now()}`,
                        date: new Date().toISOString(),
                        type: 'subtraction',
                        amount: creditToApply,
                        description: `استخدام رصيد في ورشة: "${workshop.title}"`,
                    };
                    creditTransactions.push(newTransaction);
                }
                const updatedUser = { 
                    ...user, 
                    internalCredit: updatedCredit > 0 ? updatedCredit : 0,
                    subscriptions: [...user.subscriptions, newSubscription],
                    creditTransactions,
                };
                if(sendWhatsApp){
                     const newNotification: Notification = {
                        id: `notif-${Date.now()}`,
                        message: `تم تأكيد اشتراكك في ورشة "${workshop.title}".`,
                        timestamp: new Date().toISOString(),
                        read: false,
                        workshopId: workshop.id,
                    };
                    if(newSubscription.isApproved){
                      updatedUser.notifications = [newNotification, ...user.notifications];
                    }
                }
                return updatedUser;
            }
            return user;
        }));
    };

    const checkAndClaimPendingGifts = (user: User) => {
        const userPhoneNormalized = normalizePhoneNumber(user.phone);
        const giftsToClaim = pendingGifts.filter(g => 
            !g.claimedByUserId && 
            !g.isDeleted &&
            normalizePhoneNumber(g.recipientWhatsapp) === userPhoneNormalized
        );

        if (giftsToClaim.length === 0) return 0;

        let claimedCount = 0;
        setPendingGifts(prev => prev.map(g => {
            if (normalizePhoneNumber(g.recipientWhatsapp) === userPhoneNormalized && !g.claimedByUserId && !g.isDeleted) {
                claimedCount++;
                return { ...g, claimedByUserId: user.id, claimedAt: new Date().toISOString() };
            }
            return g;
        }));

        giftsToClaim.forEach(gift => {
            addSubscription(
                user.id,
                {
                    workshopId: gift.workshopId,
                    packageId: gift.packageId,
                    attendanceType: gift.attendanceType,
                    paymentMethod: 'GIFT',
                    pricePaid: gift.pricePaid,
                    isGift: true,
                    gifterName: gift.gifterName,
                    gifterPhone: gift.gifterPhone,
                    gifterUserId: gift.gifterUserId,
                    giftMessage: gift.giftMessage,
                },
                true, true
            );
        });

        return claimedCount;
    };

    const adminManualClaimGift = (giftId: string, customUserData?: { fullName: string; email: string; phone: string }) => {
        const gift = pendingGifts.find(g => g.id === giftId);
        if (!gift) return { success: false, message: 'الهدية غير موجودة' };

        const normalizedPhone = normalizePhoneNumber(gift.recipientWhatsapp);
        let targetUser = users.find(u => normalizePhoneNumber(u.phone) === normalizedPhone && !u.isDeleted);

        if (!targetUser) {
            if (customUserData) {
                targetUser = addUser(customUserData.fullName, customUserData.email, customUserData.phone);
            } else {
                return { success: false, message: 'المستخدم غير موجود', status: 'USER_NOT_FOUND' as const };
            }
        }

        addSubscription(
            targetUser.id,
            {
                workshopId: gift.workshopId,
                packageId: gift.packageId,
                attendanceType: gift.attendanceType,
                paymentMethod: 'GIFT',
                pricePaid: gift.pricePaid,
                isGift: true,
                gifterName: gift.gifterName,
                gifterPhone: gift.gifterPhone,
                gifterUserId: gift.gifterUserId,
                giftMessage: gift.giftMessage,
            },
            true, true
        );

        setPendingGifts(prev => prev.map(g => 
            g.id === giftId 
            ? { ...g, claimedByUserId: targetUser!.id, claimedAt: new Date().toISOString() } 
            : g
        ));

        return { success: true, message: `تم تفعيل الهدية بنجاح للمستفيد: ${targetUser.fullName}` };
    };

    const donateToPayItForward = (workshopId: number, amount: number, seats: number = 0, donorUserId?: number) => {
        setDrhopeData(prev => ({
            ...prev,
            payItForwardStats: {
                totalFund: (prev.payItForwardStats?.totalFund || 0) + amount,
                beneficiariesCount: (prev.payItForwardStats?.beneficiariesCount || 0) + (seats > 0 ? seats : 0)
            }
        }));

        setWorkshops(prev => prev.map(w => 
            w.id === workshopId 
                ? { ...w, payItForwardBalance: (w.payItForwardBalance || 0) + amount } 
                : w
        ));

        if (donorUserId) {
            addSubscription(donorUserId, {
                workshopId: workshopId,
                paymentMethod: 'GIFT',
                pricePaid: amount,
                donationRemaining: amount,
                isPayItForwardDonation: true,
                notes: `دعم لغير القادرين (${seats} مقاعد).`,
                isApproved: true,
                status: SubscriptionStatus.COMPLETED
            } as any, true, true);
        }
    };
    
    const grantPayItForwardSeat = (userId: number, workshopId: number, cost: number, donorSubscriptionId: string, notes?: string) => {
        setWorkshops(prev => prev.map(w => 
            w.id === workshopId 
                ? { ...w, payItForwardBalance: Math.max(0, (w.payItForwardBalance || 0) - cost) } 
                : w
        ));
        
        let donorName = 'صندوق إهداء غير القادرين';
        
        setUsers(prevUsers => prevUsers.map(u => {
            const hasTargetSub = u.subscriptions.some(s => s.id === donorSubscriptionId);
            if (hasTargetSub) {
                return {
                    ...u,
                    subscriptions: u.subscriptions.map(s => {
                        if (s.id === donorSubscriptionId) {
                            donorName = u.fullName;
                            const newBalance = Math.max(0, (s.donationRemaining || 0) - cost);
                            return { ...s, donationRemaining: newBalance };
                        }
                        return s;
                    })
                };
            }
            return u;
        }));

        addSubscription(userId, {
            workshopId,
            paymentMethod: 'GIFT', 
            pricePaid: 0,
            isGift: true,
            gifterName: donorName,
            giftMessage: 'نتمنى لك رحلة تعليمية موفقة ومفيدة.',
            notes: `تم منح المقعد من دعم: ${donorName}. التكلفة المخصومة: ${cost}. ${notes || ''}`
        }, true, true);
    };

    const login = (email: string, phone: string) => {
        const normalizedPhone = normalizePhoneNumber(phone);
        const lowercasedEmail = email.toLowerCase();

        const user = users.find(u => 
            !u.isDeleted && 
            u.email.toLowerCase() === lowercasedEmail && 
            normalizePhoneNumber(u.phone) === normalizedPhone
        );

        if (user) {
            setCurrentUser(user);
            trackEvent('login', { method: 'credential' }, user);
            return { user };
        } else {
            const emailMatch = users.find(u => !u.isDeleted && u.email.toLowerCase() === lowercasedEmail);
            if (emailMatch) return { error: 'phone' }; 
            
            const phoneMatch = users.find(u => !u.isDeleted && normalizePhoneNumber(u.phone) === normalizedPhone);
            if (phoneMatch) return { error: 'email' };

            return { error: 'not_found' };
        }
    };

    const loginAsUser = (userToLogin: User) => {
        setCurrentUser(userToLogin);
        trackEvent('admin_login_as_user', { adminAction: true }, userToLogin);
    };

    const value: UserContextType = useMemo(() => ({
        currentUser, users, workshops, products, partners, pendingGifts, drhopeData, activeTheme, notifications, expenses, broadcastHistory, globalCertificateTemplate, emailPreview, consultationRequests,
        login,
        loginAsUser,
        findUserByCredential: (type, value) => {
            const normalizedValue = type === 'phone' ? normalizePhoneNumber(value) : value.toLowerCase();
            return users.find(u => !u.isDeleted && (type === 'phone' ? normalizePhoneNumber(u.phone) === normalizedValue : u.email.toLowerCase() === normalizedValue)) || null;
        },
        logRecordingView: (userId, workshopId, recordingUrl) => {
             setUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    const newSubs = u.subscriptions.map(s => {
                        if (s.workshopId === workshopId) {
                            const currentStats = s.recordingStats?.[recordingUrl] || { progress: 0, playCount: 0, lastTimestamp: 0 };
                            return {
                                ...s,
                                recordingStats: {
                                    ...s.recordingStats,
                                    [recordingUrl]: { ...currentStats, playCount: currentStats.playCount + 1, lastWatched: new Date().toISOString() }
                                }
                            };
                        }
                        return s;
                    });
                    return { ...u, subscriptions: newSubs };
                }
                return u;
            }));
        },
        markAttendance: (userId, workshopId) => { /*...*/ },
        addPendingGift: (giftData) => {
            const newGift: PendingGift = { ...giftData, id: `gift-${Date.now()}`, createdAt: new Date().toISOString() };
            setPendingGifts(prev => [newGift, ...prev]);
            return newGift;
        },
        updatePendingGift: (giftId, updates) => setPendingGifts(prev => prev.map(g => g.id === giftId ? { ...g, ...updates } : g)),
        claimGift: (giftId, claimingUserId) => {
            const gift = pendingGifts.find(g => g.id === giftId);
            if (!gift || gift.claimedByUserId) return { success: false, message: 'رابط الهدية غير صالح أو تم استخدامه بالفعل.' };
            const updatedGift = { ...gift, claimedByUserId: claimingUserId, claimedAt: new Date().toISOString() };
            setPendingGifts(prev => prev.map(g => g.id === giftId ? updatedGift : g));
            addSubscription(claimingUserId, { workshopId: gift.workshopId, packageId: gift.packageId, attendanceType: gift.attendanceType, paymentMethod: 'GIFT', pricePaid: gift.pricePaid, isGift: true, gifterName: gift.gifterName, gifterPhone: gift.gifterPhone, gifterUserId: gift.gifterUserId, giftMessage: gift.giftMessage }, true, true);
            return { success: true };
        },
        deletePendingGift: (giftId) => setPendingGifts(prev => prev.map(g => g.id === giftId ? { ...g, isDeleted: true } : g)),
        restorePendingGift: (giftId) => setPendingGifts(prev => prev.map(g => g.id === giftId ? { ...g, isDeleted: false } : g)),
        permanentlyDeletePendingGift: (giftId) => setPendingGifts(prev => prev.filter(g => g.id !== giftId)),
        checkAndClaimPendingGifts,
        adminManualClaimGift,
        donateToPayItForward,
        grantPayItForwardSeat,
        addPartner: (partnerData) => setPartners(prev => [...prev, { ...partnerData, id: `partner-${Date.now()}` }]),
        updatePartner: (partnerData) => setPartners(prev => prev.map(p => p.id === partnerData.id ? partnerData : p)),
        deletePartner: (partnerId) => setPartners(prev => prev.filter(p => p.id !== partnerId)),
        addProduct: (productData) => setProducts(prev => [...prev, { ...productData, id: Date.now() }]),
        updateProduct: (productData) => setProducts(prev => prev.map(p => p.id === productData.id ? productData : p)),
        deleteProduct: (productId) => setProducts(prev => prev.map(p => p.id === productId ? { ...p, isDeleted: true } : p)),
        restoreProduct: (productId) => setProducts(prev => prev.map(p => p.id === productId ? { ...p, isDeleted: false } : p)),
        permanentlyDeleteProduct: (productId) => setProducts(prev => prev.filter(p => p.id !== productId)),
        logout: () => { if (currentUser) { trackEvent('logout', {}, currentUser); setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, sessionId: undefined } : u)); } setCurrentUser(null); },
        register: (fullName, email, phone) => { const newUser = { id: Date.now(), fullName, email, phone, subscriptions: [], orders: [], notifications: [], creditTransactions: [] }; setUsers(prev => [...prev, newUser]); setCurrentUser(newUser); trackEvent('register', {}, newUser); return newUser; },
        addUser,
        updateUser: (userId, updates) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u)),
        checkRegistrationAvailability: (email, phone) => { const lowercasedEmail = email.toLowerCase(); const normalizedPhone = normalizePhoneNumber(phone); const emailUser = users.find(u => u.email.toLowerCase() === lowercasedEmail && !u.isDeleted); const phoneUser = users.find(u => normalizePhoneNumber(u.phone) === normalizedPhone && !u.isDeleted); return { emailUser, phoneUser }; },
        deleteUser: (userId) => setUsers(users.map(u => u.id === userId ? { ...u, isDeleted: true } : u)),
        restoreUser: (userId) => setUsers(users.map(u => u.id === userId ? { ...u, isDeleted: false } : u)),
        permanentlyDeleteUser: (userId) => setUsers(users.filter(u => u.id !== userId)),
        addWorkshop: (workshop) => setWorkshops(prev => [...prev, { ...workshop, id: Date.now() } as Workshop]),
        updateWorkshop: (workshop) => setWorkshops(prev => prev.map(w => w.id === workshop.id ? workshop : w)),
        deleteWorkshop: (workshopId) => setWorkshops(workshops.map(w => w.id === workshopId ? { ...w, isDeleted: true } : w)),
        restoreWorkshop: (workshopId) => setWorkshops(workshops.map(w => w.id === workshopId ? { ...w, isDeleted: false } : w)),
        permanentlyDeleteWorkshop: (workshopId) => setWorkshops(workshops.filter(w => w.id !== workshopId)),
        addSubscription,
        updateSubscription: (userId, subId, updates) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptions: u.subscriptions.map(s => s.id === subId ? { ...s, ...updates } : s) } : u)),
        deleteSubscription: (userId, subId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptions: u.subscriptions.map(s => s.id === subId ? { ...s, isDeleted: true } : s) } : u)),
        restoreSubscription: (userId, subId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptions: u.subscriptions.map(s => s.id === subId ? { ...s, isDeleted: false } : s) } : u)),
        permanentlyDeleteSubscription: (userId, subId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptions: u.subscriptions.filter(s => s.id !== subId) } : u)),
        transferSubscription: (userId, fromSubId, toWorkshopId, notes) => {
             setUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    const newSubs = u.subscriptions.map(s => {
                        if (s.id === fromSubId) {
                            return { ...s, status: SubscriptionStatus.TRANSFERRED, transferDate: new Date().toISOString(), notes: (s.notes || '') + `\nTransferred to workshop ID ${toWorkshopId}. Notes: ${notes}` };
                        }
                        return s;
                    });
                    
                    const oldSub = u.subscriptions.find(s => s.id === fromSubId);
                    if(oldSub) {
                        const newSub: Subscription = {
                            ...oldSub,
                            id: `sub-${Date.now()}`,
                            workshopId: toWorkshopId,
                            status: SubscriptionStatus.ACTIVE,
                            isApproved: true,
                            activationDate: new Date().toISOString().split('T')[0],
                            notes: `Transferred from previous subscription. Notes: ${notes}`,
                            transferDate: undefined
                        };
                        newSubs.push(newSub);
                    }
                    return { ...u, subscriptions: newSubs };
                }
                return u;
            }));
        },
        reactivateSubscription: (userId, subId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptions: u.subscriptions.map(s => s.id === subId ? { ...s, status: SubscriptionStatus.ACTIVE, refundDate: undefined, refundMethod: undefined } : s) } : u)),
        enrollWithPendingApproval: (workshopId, packageId, paymentMethod, attendanceType) => { /* ... */ },
        placeOrder: (userId, orderData, initialStatus) => {
            const newOrder: Order = { ...orderData, id: `ord-${Date.now()}`, userId, status: initialStatus || OrderStatus.PENDING, orderDate: new Date().toISOString() };
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, orders: [...u.orders, newOrder] } : u));
            return newOrder;
        },
        confirmOrder: (userId, orderId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, orders: u.orders.map(o => o.id === orderId ? { ...o, status: OrderStatus.COMPLETED } : o) } : u)),
        updateDrhopeData: (updates) => setDrhopeData(prev => ({...prev, ...updates })),
        addNotificationForMultipleUsers: (userIds, message, workshopId, whatsappMessage) => {
             setUsers(prev => prev.map(u => {
                if (userIds.includes(u.id)) {
                    return { ...u, notifications: [{ id: `notif-${Date.now()}-${u.id}`, message, timestamp: new Date().toISOString(), read: false, workshopId }, ...u.notifications] };
                }
                return u;
            }));
        },
        markNotificationsAsRead: () => { if(currentUser) setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, notifications: u.notifications.map(n => ({ ...n, read: true })) } : u)); },
        addExpense: (expense) => setExpenses(prev => [...prev, { ...expense, id: `exp-${Date.now()}`, date: new Date().toISOString() }]),
        updateExpense: (expense) => setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e)),
        deleteExpense: (expenseId) => setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, isDeleted: true } : e)),
        restoreExpense: (expenseId) => setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, isDeleted: false } : e)),
        permanentlyDeleteExpense: (expenseId) => setExpenses(prev => prev.filter(e => e.id !== expenseId)),
        addReview: (workshopId, reviewData) => setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: [...(w.reviews || []), { ...reviewData, id: `rev-${Date.now()}`, workshopId, date: new Date().toISOString() }] } : w)),
        deleteReview: (workshopId, reviewId) => setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: w.reviews?.map(r => r.id === reviewId ? { ...r, isDeleted: true } : r) } : w)),
        restoreReview: (workshopId, reviewId) => setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: w.reviews?.map(r => r.id === reviewId ? { ...r, isDeleted: false } : r) } : w)),
        permanentlyDeleteReview: (workshopId, reviewId) => setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: w.reviews?.filter(r => r.id !== reviewId) } : w)),
        addBroadcastToHistory: (campaign) => { const newCampaign = { ...campaign, id: `bc-${Date.now()}`, timestamp: new Date().toISOString() }; setBroadcastHistory(prev => [newCampaign, ...prev]); return newCampaign; },
        previewEmail: (title, subject, messageHtml) => setEmailPreview({ title, subject, messageHtml }),
        clearEmailPreview: () => setEmailPreview(null),
        updateGlobalCertificateTemplate: (template) => setGlobalCertificateTemplate(template),
        convertToInternalCredit: (userId, subId) => { /* ... implementation ... */ },
        deleteCreditTransaction: (userId, transactionId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, creditTransactions: u.creditTransactions?.map(t => t.id === transactionId ? { ...t, isDeleted: true } : t) } : u)),
        restoreCreditTransaction: (userId, transactionId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, creditTransactions: u.creditTransactions?.map(t => t.id === transactionId ? { ...t, isDeleted: false } : t) } : u)),
        permanentlyDeleteCreditTransaction: (userId, transactionId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, creditTransactions: u.creditTransactions?.filter(t => t.id !== transactionId) } : u)),
        addConsultationRequest: (userId, subject) => setConsultationRequests(prev => [{ id: `consult-${Date.now()}`, userId, subject, status: 'NEW', requestedAt: new Date().toISOString() }, ...prev]),
        updateConsultationRequest: (requestId, updates) => setConsultationRequests(prev => prev.map(req => req.id === requestId ? { ...req, ...updates } : req)),
    }), [currentUser, users, workshops, products, partners, drhopeData, activeTheme, expenses, broadcastHistory, globalCertificateTemplate, emailPreview, notifications, consultationRequests, pendingGifts]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
