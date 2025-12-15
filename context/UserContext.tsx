
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { User, Workshop, DrhopeData, Notification, SubscriptionStatus, Subscription, Product, Order, OrderStatus, Partner, ConsultationRequest, Theme, ThemeColors, CreditTransaction, PendingGift, Expense, BroadcastCampaign } from '../types';
import { normalizePhoneNumber } from '../utils';
import { trackEvent } from '../analytics';

// Initial Data (Simulated Database)
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
        ],
        orders: [],
        internalCredit: 0,
        creditTransactions: [],
    }
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
    logoUrl: '',
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

const initialProducts: Product[] = [
    { id: 101, name: 'دفتر يوميات نوايا', price: 75, imageUrl: 'https://picsum.photos/id/101/400/400' },
    { id: 102, name: 'مخطط سنوي 2025', price: 120, imageUrl: 'https://picsum.photos/id/102/400/400' },
    { id: 103, name: 'كتاب "تحدث بثقة"', price: 85, imageUrl: 'https://picsum.photos/id/103/400/400' },
];

const initialPartners: Partner[] = [
    { id: 'partner1', name: 'شريك النجاح الأول', logo: 'https://picsum.photos/id/201/200/200', description: 'نبذة مفصلة عن شريك النجاح الأول وما يقدمه من خدمات مميزة.', websiteUrl: 'https://example.com', instagramUrl: 'https://instagram.com' },
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
    drhopeData: DrhopeData;
    activeTheme: ThemeColors;
    notifications: Notification[];
    globalCertificateTemplate: any | null;
    expenses: Expense[];
    broadcastHistory: BroadcastCampaign[];
    pendingGifts: PendingGift[]; // Add pendingGifts to context type

    // Auth & User Actions
    login: (email: string, phone: string) => { user?: User; error?: string };
    logout: () => void;
    register: (fullName: string, email: string, phone: string) => User;
    checkRegistrationAvailability: (email: string, phone: string) => RegistrationAvailability;
    findUserByCredential: (type: 'email' | 'phone', value: string) => User | null;
    addUser: (fullName: string, email: string, phone: string) => User;
    updateUser: (userId: number, updates: Partial<User>) => void;
    deleteUser: (userId: number) => void;
    restoreUser: (userId: number) => void;
    permanentlyDeleteUser: (userId: number) => void;
    convertToInternalCredit: (userId: number, amount: number) => void;

    // Store Actions & Data Management
    addSubscription: (userId: number, subscriptionData: Partial<Subscription>, isApproved: boolean, sendWhatsApp: boolean, creditToApply?: number) => void;
    updateSubscription: (userId: number, subId: string, updates: Partial<Subscription>) => void;
    deleteSubscription: (userId: number, subId: string) => void;
    restoreSubscription: (userId: number, subId: string) => void;
    permanentlyDeleteSubscription: (userId: number, subId: string) => void;
    transferSubscription: (userId: number, subId: string, toWorkshopId: number, notes: string) => void;
    reactivateSubscription: (userId: number, subId: string) => void;

    placeOrder: (userId: number, order: Omit<Order, 'id' | 'userId' | 'status' | 'orderDate'>, initialStatus?: OrderStatus) => Order;
    confirmOrder: (userId: number, orderId: string) => void;

    addReview: (workshopId: number, review: { fullName: string; rating: number; comment: string }) => void;
    deleteReview: (workshopId: number, reviewId: string) => void;
    restoreReview: (workshopId: number, reviewId: string) => void;
    permanentlyDeleteReview: (workshopId: number, reviewId: string) => void;

    addConsultationRequest: (userId: number, subject: string) => void;
    updateConsultationRequest: (id: string, updates: Partial<ConsultationRequest>) => void;
    
    // Gifting & Features
    addPendingGift: (giftData: Omit<PendingGift, 'id' | 'createdAt'>) => PendingGift;
    updatePendingGift: (id: string, updates: Partial<PendingGift>) => void;
    deletePendingGift: (id: string) => void;
    restorePendingGift: (id: string) => void;
    permanentlyDeletePendingGift: (id: string) => void;
    checkAndClaimPendingGifts: (user: User) => number;
    adminManualClaimGift: (giftId: string, recipientData: { name: string, email: string, phone: string }) => { success: boolean; message: string };
    
    donateToPayItForward: (workshopId: number, amount: number, seats?: number, donorUserId?: number) => void;
    grantPayItForwardSeat: (userId: number, workshopId: number, amount: number, donorSubscriptionId: string, notes: string) => void;
    
    markNotificationsAsRead: () => void;
    addNotificationForMultipleUsers: (userIds: number[], message: string) => void;

    // Workshops
    addWorkshop: (workshopData: Omit<Workshop, 'id'>) => void;
    updateWorkshop: (updatedWorkshop: Workshop) => void;
    deleteWorkshop: (id: number) => void;
    restoreWorkshop: (id: number) => void;
    permanentlyDeleteWorkshop: (id: number) => void;

    // Products
    addProduct: (productData: Omit<Product, 'id'>) => void;
    updateProduct: (updatedProduct: Product) => void;
    deleteProduct: (id: number) => void;
    restoreProduct: (id: number) => void;
    permanentlyDeleteProduct: (id: number) => void;

    // Partners
    addPartner: (partnerData: Omit<Partner, 'id'>) => void;
    updatePartner: (updatedPartner: Partner) => void;
    deletePartner: (id: string) => void;

    // Expenses
    addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (id: string) => void;
    restoreExpense: (id: string) => void;
    permanentlyDeleteExpense: (id: string) => void;

    // DrhopeData
    updateDrhopeData: (updates: Partial<DrhopeData>) => void;

    // Broadcast
    addBroadcastToHistory: (campaign: Omit<BroadcastCampaign, 'id' | 'timestamp'>) => BroadcastCampaign;

    // Credit Transactions
    deleteCreditTransaction: (userId: number, txId: string) => void;
    restoreCreditTransaction: (userId: number, txId: string) => void;
    permanentlyDeleteCreditTransaction: (userId: number, txId: string) => void;

    // Read-only Data Access
    consultationRequests: ConsultationRequest[];
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
        return stored ? JSON.parse(stored) : initialProducts;
    });
    const [partners, setPartners] = useState<Partner[]>(() => {
        const stored = localStorage.getItem('partners');
        return stored ? JSON.parse(stored) : initialPartners;
    });
    const [pendingGifts, setPendingGifts] = useState<PendingGift[]>(() => {
        const stored = localStorage.getItem('pendingGifts');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : [];
    });
    const [drhopeData, setDrhopeData] = useState<DrhopeData>(() => {
        const stored = localStorage.getItem('drhopeData');
        return stored ? JSON.parse(stored) : (initialDrhopeData as DrhopeData);
    });
    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>(() => {
        const stored = localStorage.getItem('consultationRequests');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : [];
    });
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        const stored = localStorage.getItem('expenses');
        return stored ? JSON.parse(stored) : [];
    });
    const [broadcastHistory, setBroadcastHistory] = useState<BroadcastCampaign[]>(() => {
        const stored = localStorage.getItem('broadcastHistory');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => { localStorage.setItem('currentUser', JSON.stringify(currentUser)); }, [currentUser]);
    useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('workshops', JSON.stringify(workshops)); }, [workshops]);
    useEffect(() => { localStorage.setItem('pendingGifts', JSON.stringify(pendingGifts)); }, [pendingGifts]);
    useEffect(() => { localStorage.setItem('consultationRequests', JSON.stringify(consultationRequests)); }, [consultationRequests]);
    useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
    useEffect(() => { localStorage.setItem('partners', JSON.stringify(partners)); }, [partners]);
    useEffect(() => { localStorage.setItem('drhopeData', JSON.stringify(drhopeData)); }, [drhopeData]);
    useEffect(() => { localStorage.setItem('expenses', JSON.stringify(expenses)); }, [expenses]);
    useEffect(() => { localStorage.setItem('broadcastHistory', JSON.stringify(broadcastHistory)); }, [broadcastHistory]);

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
        const foundTheme = themes.find(t => t.id === activeId);
        return foundTheme ? foundTheme.colors : defaultTheme;
    }, [drhopeData.themes, drhopeData.activeThemeId]);
    
    // User Actions
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

    const updateUser = (userId: number, updates: Partial<User>) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    
    const deleteUser = (userId: number) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, isDeleted: true } : u));
    const restoreUser = (userId: number) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, isDeleted: false } : u));
    const permanentlyDeleteUser = (userId: number) => setUsers(prev => prev.filter(u => u.id !== userId));
    const convertToInternalCredit = (userId: number, amount: number) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, internalCredit: (u.internalCredit || 0) + amount } : u));

    // Subscription Actions
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

    const updateSubscription = (userId: number, subId: string, updates: Partial<Subscription>) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return {
                    ...u,
                    subscriptions: u.subscriptions.map(s => s.id === subId ? { ...s, ...updates } : s)
                };
            }
            return u;
        }));
    };
    const deleteSubscription = (userId: number, subId: string) => updateSubscription(userId, subId, { isDeleted: true });
    const restoreSubscription = (userId: number, subId: string) => updateSubscription(userId, subId, { isDeleted: false });
    const permanentlyDeleteSubscription = (userId: number, subId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, subscriptions: u.subscriptions.filter(s => s.id !== subId) };
            }
            return u;
        }));
    };
    const reactivateSubscription = (userId: number, subId: string) => updateSubscription(userId, subId, { status: SubscriptionStatus.ACTIVE, refundDate: undefined, refundMethod: undefined });
    const transferSubscription = (userId: number, subId: string, toWorkshopId: number, notes: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        const oldSub = user.subscriptions.find(s => s.id === subId);
        if (!oldSub) return;

        updateSubscription(userId, subId, { status: SubscriptionStatus.TRANSFERRED, transferDate: new Date().toISOString(), notes: (oldSub.notes || '') + '\n' + notes });
        
        addSubscription(userId, {
            workshopId: toWorkshopId,
            paymentMethod: oldSub.paymentMethod,
            pricePaid: oldSub.pricePaid,
            notes: `Transferred from workshop ${oldSub.workshopId}. ${notes}`,
            isApproved: true,
            status: SubscriptionStatus.ACTIVE
        } as any, true, false);
    };

    // Gift Actions
    const addPendingGift = (giftData: Omit<PendingGift, 'id' | 'createdAt'>) => {
        const newGift: PendingGift = { ...giftData, id: `gift-${Date.now()}`, createdAt: new Date().toISOString() };
        setPendingGifts(prev => [newGift, ...prev]);
        return newGift;
    };
    const updatePendingGift = (id: string, updates: Partial<PendingGift>) => setPendingGifts(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    const deletePendingGift = (id: string) => setPendingGifts(prev => prev.map(g => g.id === id ? { ...g, isDeleted: true } : g));
    const restorePendingGift = (id: string) => setPendingGifts(prev => prev.map(g => g.id === id ? { ...g, isDeleted: false } : g));
    const permanentlyDeletePendingGift = (id: string) => setPendingGifts(prev => prev.filter(g => g.id !== id));
    
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

    const adminManualClaimGift = (giftId: string, recipientData: { name: string, email: string, phone: string }) => {
        const gift = pendingGifts.find(g => g.id === giftId);
        if(!gift) return { success: false, message: 'الهدية غير موجودة' };
        
        let user = users.find(u => !u.isDeleted && (u.email === recipientData.email || normalizePhoneNumber(u.phone) === normalizePhoneNumber(recipientData.phone)));
        if (!user) {
            user = addUser(recipientData.name, recipientData.email, recipientData.phone);
        }
        
        updatePendingGift(giftId, { claimedByUserId: user.id, claimedAt: new Date().toISOString() });
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
        return { success: true, message: `تم تفعيل الهدية للمستخدم ${user.fullName}` };
    };

    const donateToPayItForward = (workshopId: number, amount: number, seats: number = 0, donorUserId?: number) => {
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

    const grantPayItForwardSeat = (userId: number, workshopId: number, amount: number, donorSubscriptionId: string, notes: string) => {
        let donorUser: User | undefined;
        let donorSub: Subscription | undefined;
        
        for (const u of users) {
            const s = u.subscriptions.find(sub => sub.id === donorSubscriptionId);
            if (s) {
                donorUser = u;
                donorSub = s;
                break;
            }
        }
        
        if (donorUser && donorSub) {
            const newBalance = (donorSub.donationRemaining || 0) - amount;
            updateSubscription(donorUser.id, donorSub.id, { donationRemaining: newBalance });
            
            addSubscription(userId, {
                workshopId,
                paymentMethod: 'GIFT',
                pricePaid: 0,
                notes: `Granted via Pay It Forward from ${donorUser.fullName}. ${notes}`,
                isGift: true,
                gifterName: donorUser.fullName,
                isApproved: true,
                status: SubscriptionStatus.ACTIVE
            } as any, true, true);
        }
    };
    
    // Auth
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

    // Orders
    const placeOrder = (userId: number, orderData: any, initialStatus: any) => {
        const newOrder: Order = { ...orderData, id: `ord-${Date.now()}`, userId, status: initialStatus || OrderStatus.PENDING, orderDate: new Date().toISOString() };
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, orders: [...u.orders, newOrder] } : u));
        return newOrder;
    };
    const confirmOrder = (userId: number, orderId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return {
                    ...u,
                    orders: u.orders.map(o => o.id === orderId ? { ...o, status: OrderStatus.COMPLETED } : o)
                };
            }
            return u;
        }));
    };

    // Workshops
    const addWorkshop = (workshopData: Omit<Workshop, 'id'>) => setWorkshops(prev => [...prev, { ...workshopData, id: Date.now(), isVisible: true, isDeleted: false }]);
    const updateWorkshop = (updatedWorkshop: Workshop) => setWorkshops(prev => prev.map(w => w.id === updatedWorkshop.id ? updatedWorkshop : w));
    const deleteWorkshop = (id: number) => setWorkshops(prev => prev.map(w => w.id === id ? { ...w, isDeleted: true } : w));
    const restoreWorkshop = (id: number) => setWorkshops(prev => prev.map(w => w.id === id ? { ...w, isDeleted: false } : w));
    const permanentlyDeleteWorkshop = (id: number) => setWorkshops(prev => prev.filter(w => w.id !== id));

    // Products
    const addProduct = (productData: Omit<Product, 'id'>) => setProducts(prev => [...prev, { ...productData, id: Date.now(), isDeleted: false }]);
    const updateProduct = (updatedProduct: Product) => setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    const deleteProduct = (id: number) => setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: true } : p));
    const restoreProduct = (id: number) => setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false } : p));
    const permanentlyDeleteProduct = (id: number) => setProducts(prev => prev.filter(p => p.id !== id));

    // Partners
    const addPartner = (partnerData: Omit<Partner, 'id'>) => setPartners(prev => [...prev, { ...partnerData, id: `partner-${Date.now()}` }]);
    const updatePartner = (updatedPartner: Partner) => setPartners(prev => prev.map(p => p.id === updatedPartner.id ? updatedPartner : p));
    const deletePartner = (id: string) => setPartners(prev => prev.filter(p => p.id !== id));

    // Expenses
    const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => setExpenses(prev => [...prev, { ...expense, id: `exp-${Date.now()}`, date: new Date().toISOString(), isDeleted: false }]);
    const updateExpense = (expense: Expense) => setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    const deleteExpense = (id: string) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true } : e));
    const restoreExpense = (id: string) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: false } : e));
    const permanentlyDeleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

    // Consultations
    const addConsultationRequest = (userId: number, subject: string) => setConsultationRequests(prev => [{ id: `consult-${Date.now()}`, userId, subject, status: 'NEW', requestedAt: new Date().toISOString() }, ...prev]);
    const updateConsultationRequest = (id: string, updates: Partial<ConsultationRequest>) => setConsultationRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

    // Others
    const addReview = (workshopId: number, reviewData: any) => setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: [...(w.reviews || []), { ...reviewData, id: `rev-${Date.now()}`, workshopId, date: new Date().toISOString() }] } : w));
    const deleteReview = (workshopId: number, reviewId: string) => setWorkshops(prev => prev.map(w => w.id === workshopId && w.reviews ? { ...w, reviews: w.reviews.map(r => r.id === reviewId ? { ...r, isDeleted: true } : r) } : w));
    const restoreReview = (workshopId: number, reviewId: string) => setWorkshops(prev => prev.map(w => w.id === workshopId && w.reviews ? { ...w, reviews: w.reviews.map(r => r.id === reviewId ? { ...r, isDeleted: false } : r) } : w));
    const permanentlyDeleteReview = (workshopId: number, reviewId: string) => setWorkshops(prev => prev.map(w => w.id === workshopId && w.reviews ? { ...w, reviews: w.reviews.filter(r => r.id !== reviewId) } : w));

    const updateDrhopeData = (updates: Partial<DrhopeData>) => setDrhopeData(prev => ({ ...prev, ...updates }));
    const addBroadcastToHistory = (campaign: Omit<BroadcastCampaign, 'id' | 'timestamp'>) => {
        const newCampaign = { ...campaign, id: `camp-${Date.now()}`, timestamp: new Date().toISOString() };
        setBroadcastHistory(prev => [newCampaign, ...prev]);
        return newCampaign;
    };
    const addNotificationForMultipleUsers = (userIds: number[], message: string) => {
        setUsers(prev => prev.map(u => userIds.includes(u.id) ? { ...u, notifications: [{ id: `notif-${Date.now()}`, message, timestamp: new Date().toISOString(), read: false }, ...u.notifications] } : u));
    };
    const deleteCreditTransaction = (userId: number, txId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId && u.creditTransactions) {
                const tx = u.creditTransactions.find(t => t.id === txId);
                if(tx && !tx.isDeleted) {
                    const newBalance = (u.internalCredit || 0) + (tx.type === 'subtraction' ? tx.amount : -tx.amount);
                    return { ...u, internalCredit: newBalance, creditTransactions: u.creditTransactions.map(t => t.id === txId ? { ...t, isDeleted: true } : t) };
                }
            }
            return u;
        }));
    };
    const restoreCreditTransaction = (userId: number, txId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId && u.creditTransactions) {
                const tx = u.creditTransactions.find(t => t.id === txId);
                if(tx && tx.isDeleted) {
                    const newBalance = (u.internalCredit || 0) + (tx.type === 'addition' ? tx.amount : -tx.amount);
                    return { ...u, internalCredit: newBalance, creditTransactions: u.creditTransactions.map(t => t.id === txId ? { ...t, isDeleted: false } : t) };
                }
            }
            return u;
        }));
    };
    const permanentlyDeleteCreditTransaction = (userId: number, txId: string) => {
        setUsers(prev => prev.map(u => u.id === userId && u.creditTransactions ? { ...u, creditTransactions: u.creditTransactions.filter(t => t.id !== txId) } : u));
    };

    const value: UserContextType = useMemo(() => ({
        currentUser, users, workshops, products, partners, drhopeData, activeTheme, notifications, consultationRequests, expenses, broadcastHistory, pendingGifts,
        globalCertificateTemplate: null,
        login,
        logout: () => { if (currentUser) trackEvent('logout', {}, currentUser); setCurrentUser(null); },
        register: (fullName, email, phone) => { const newUser = addUser(fullName, email, phone); setCurrentUser(newUser); trackEvent('register', {}, newUser); return newUser; },
        addUser,
        updateUser,
        deleteUser,
        restoreUser,
        permanentlyDeleteUser,
        convertToInternalCredit,
        findUserByCredential: (type, value) => {
            const normalizedValue = type === 'phone' ? normalizePhoneNumber(value) : value.toLowerCase();
            return users.find(u => !u.isDeleted && (type === 'phone' ? normalizePhoneNumber(u.phone) === normalizedValue : u.email.toLowerCase() === normalizedValue)) || null;
        },
        checkRegistrationAvailability: (email, phone) => { const lowercasedEmail = email.toLowerCase(); const normalizedPhone = normalizePhoneNumber(phone); return { emailUser: users.find(u => u.email.toLowerCase() === lowercasedEmail && !u.isDeleted), phoneUser: users.find(u => normalizePhoneNumber(u.phone) === normalizedPhone && !u.isDeleted) }; },
        
        addSubscription,
        updateSubscription,
        deleteSubscription,
        restoreSubscription,
        permanentlyDeleteSubscription,
        transferSubscription,
        reactivateSubscription,
        placeOrder,
        confirmOrder,
        addReview,
        deleteReview,
        restoreReview,
        permanentlyDeleteReview,
        addConsultationRequest,
        updateConsultationRequest,
        
        addPendingGift,
        updatePendingGift,
        deletePendingGift,
        restorePendingGift,
        permanentlyDeletePendingGift,
        checkAndClaimPendingGifts,
        adminManualClaimGift,
        donateToPayItForward,
        grantPayItForwardSeat,
        markNotificationsAsRead: () => { if(currentUser) setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, notifications: u.notifications.map(n => ({ ...n, read: true })) } : u)); },
        addNotificationForMultipleUsers,

        addWorkshop,
        updateWorkshop,
        deleteWorkshop,
        restoreWorkshop,
        permanentlyDeleteWorkshop,

        addProduct,
        updateProduct,
        deleteProduct,
        restoreProduct,
        permanentlyDeleteProduct,

        addPartner,
        updatePartner,
        deletePartner,

        addExpense,
        updateExpense,
        deleteExpense,
        restoreExpense,
        permanentlyDeleteExpense,

        updateDrhopeData,
        addBroadcastToHistory,
        
        deleteCreditTransaction,
        restoreCreditTransaction,
        permanentlyDeleteCreditTransaction,
    }), [currentUser, users, workshops, products, partners, drhopeData, activeTheme, notifications, consultationRequests, expenses, broadcastHistory, pendingGifts]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
