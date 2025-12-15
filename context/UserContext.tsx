
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { User, Workshop, DrhopeData, Notification, SubscriptionStatus, Subscription, Product, Order, OrderStatus, Partner, ConsultationRequest, Theme, ThemeColors, CreditTransaction, PendingGift, Expense, BroadcastCampaign, Review } from '../types';
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

const initialDrhopeData: Omit<DrhopeData, 'themes'> & { themes: Theme[], activeThemeId: string } = {
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
    consultationRequests: ConsultationRequest[];
    pendingGifts: PendingGift[];
    expenses: Expense[];
    broadcastHistory: BroadcastCampaign[];
    
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
    convertToInternalCredit: (userId: number, amount: number, description: string) => void;

    // Workshop Actions
    addWorkshop: (workshop: Omit<Workshop, 'id'>) => void;
    updateWorkshop: (workshop: Workshop) => void;
    deleteWorkshop: (id: number) => void;
    restoreWorkshop: (id: number) => void;
    permanentlyDeleteWorkshop: (id: number) => void;

    // Subscription Actions
    addSubscription: (userId: number, subscriptionData: Partial<Subscription>, isApproved: boolean, sendWhatsApp: boolean, creditToApply?: number) => void;
    updateSubscription: (userId: number, subscriptionId: string, updates: Partial<Subscription>) => void;
    deleteSubscription: (userId: number, subscriptionId: string) => void;
    restoreSubscription: (userId: number, subscriptionId: string) => void;
    permanentlyDeleteSubscription: (userId: number, subscriptionId: string) => void;
    transferSubscription: (userId: number, subscriptionId: string, toWorkshopId: number, notes?: string) => void;
    reactivateSubscription: (userId: number, subscriptionId: string) => void;

    // Store Actions
    placeOrder: (userId: number, order: Omit<Order, 'id' | 'userId' | 'status' | 'orderDate'>, initialStatus?: OrderStatus) => Order;
    confirmOrder: (userId: number, orderId: string) => void;
    
    // Review Actions
    addReview: (workshopId: number, review: { fullName: string; rating: number; comment: string }) => void;
    deleteReview: (workshopId: number, reviewId: string) => void;
    restoreReview: (workshopId: number, reviewId: string) => void;
    permanentlyDeleteReview: (workshopId: number, reviewId: string) => void;

    // Consultation Actions
    addConsultationRequest: (userId: number, subject: string) => void;
    updateConsultationRequest: (requestId: string, updates: Partial<ConsultationRequest>) => void;
    
    // Gifting & Features
    addPendingGift: (giftData: Omit<PendingGift, 'id' | 'createdAt'>) => PendingGift;
    checkAndClaimPendingGifts: (user: User) => number;
    donateToPayItForward: (workshopId: number, amount: number, seats?: number, donorUserId?: number) => void;
    grantPayItForwardSeat: (userId: number, workshopId: number, amount: number, donorSubscriptionId: string, notes?: string) => void;
    updatePendingGift: (id: string, updates: Partial<PendingGift>) => void;
    deletePendingGift: (id: string) => void;
    restorePendingGift: (id: string) => void;
    permanentlyDeletePendingGift: (id: string) => void;
    adminManualClaimGift: (id: string, recipientData: { name: string, email: string, phone: string }) => { success: boolean; message: string };

    // General & Content
    markNotificationsAsRead: () => void;
    addNotificationForMultipleUsers: (userIds: number[], message: string) => void;
    updateDrhopeData: (data: Partial<DrhopeData>) => void;
    addPartner: (partner: Omit<Partner, 'id'>) => void;
    updatePartner: (partner: Partner) => void;
    deletePartner: (id: string) => void;
    addBroadcastToHistory: (campaign: Omit<BroadcastCampaign, 'id' | 'timestamp'>) => BroadcastCampaign;

    // Expenses
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (id: string) => void;
    restoreExpense: (id: string) => void;
    permanentlyDeleteExpense: (id: string) => void;

    // Products
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: number) => void;
    restoreProduct: (id: number) => void;
    permanentlyDeleteProduct: (id: number) => void;

    // Credit Transactions
    deleteCreditTransaction: (userId: number, transactionId: string) => void;
    restoreCreditTransaction: (userId: number, transactionId: string) => void;
    permanentlyDeleteCreditTransaction: (userId: number, transactionId: string) => void;
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
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : [];
    });
    const [drhopeData, setDrhopeData] = useState<DrhopeData>(() => {
        const stored = localStorage.getItem('drhopeData');
        return stored ? JSON.parse(stored) : initialDrhopeData;
    });
    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>(() => {
        const stored = localStorage.getItem('consultationRequests');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : [];
    });
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        const stored = localStorage.getItem('expenses');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : [];
    });
    const [broadcastHistory, setBroadcastHistory] = useState<BroadcastCampaign[]>(() => {
        const stored = localStorage.getItem('broadcastHistory');
        return stored ? (JSON.parse(stored) || []).filter(Boolean) : [];
    });

    useEffect(() => { localStorage.setItem('currentUser', JSON.stringify(currentUser)); }, [currentUser]);
    useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('workshops', JSON.stringify(workshops)); }, [workshops]);
    useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
    useEffect(() => { localStorage.setItem('partners', JSON.stringify(partners)); }, [partners]);
    useEffect(() => { localStorage.setItem('pendingGifts', JSON.stringify(pendingGifts)); }, [pendingGifts]);
    useEffect(() => { localStorage.setItem('consultationRequests', JSON.stringify(consultationRequests)); }, [consultationRequests]);
    useEffect(() => { localStorage.setItem('expenses', JSON.stringify(expenses)); }, [expenses]);
    useEffect(() => { localStorage.setItem('broadcastHistory', JSON.stringify(broadcastHistory)); }, [broadcastHistory]);
    useEffect(() => { localStorage.setItem('drhopeData', JSON.stringify(drhopeData)); }, [drhopeData]);

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
    
    // --- User Actions ---
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
    const deleteUser = (userId: number) => updateUser(userId, { isDeleted: true });
    const restoreUser = (userId: number) => updateUser(userId, { isDeleted: false });
    const permanentlyDeleteUser = (userId: number) => setUsers(prev => prev.filter(u => u.id !== userId));
    const convertToInternalCredit = (userId: number, amount: number, description: string) => {
        setUsers(prev => prev.map(user => {
            if (user.id !== userId) return user;
            const newTransaction: CreditTransaction = {
                id: `tx-${Date.now()}`,
                date: new Date().toISOString(),
                type: 'addition',
                amount: amount,
                description: description,
            };
            return {
                ...user,
                internalCredit: (user.internalCredit || 0) + amount,
                creditTransactions: [...(user.creditTransactions || []), newTransaction]
            };
        }));
    };

    // --- Workshop Actions ---
    const addWorkshop = (workshop: Omit<Workshop, 'id'>) => {
        const newWorkshop: Workshop = { ...workshop, id: Date.now() };
        setWorkshops(prev => [...prev, newWorkshop]);
    };
    const updateWorkshop = (workshop: Workshop) => setWorkshops(prev => prev.map(w => w.id === workshop.id ? workshop : w));
    const deleteWorkshop = (id: number) => setWorkshops(prev => prev.map(w => w.id === id ? { ...w, isDeleted: true } : w));
    const restoreWorkshop = (id: number) => setWorkshops(prev => prev.map(w => w.id === id ? { ...w, isDeleted: false } : w));
    const permanentlyDeleteWorkshop = (id: number) => setWorkshops(prev => prev.filter(w => w.id !== id));

    // --- Subscription Actions ---
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

    const updateSubscription = (userId: number, subscriptionId: string, updates: Partial<Subscription>) => {
        setUsers(prev => prev.map(user => {
            if (user.id !== userId) return user;
            return {
                ...user,
                subscriptions: user.subscriptions.map(sub => sub.id === subscriptionId ? { ...sub, ...updates } : sub)
            };
        }));
    };

    const deleteSubscription = (userId: number, subscriptionId: string) => updateSubscription(userId, subscriptionId, { isDeleted: true });
    const restoreSubscription = (userId: number, subscriptionId: string) => updateSubscription(userId, subscriptionId, { isDeleted: false });
    const permanentlyDeleteSubscription = (userId: number, subscriptionId: string) => {
        setUsers(prev => prev.map(user => {
            if (user.id !== userId) return user;
            return {
                ...user,
                subscriptions: user.subscriptions.filter(sub => sub.id !== subscriptionId)
            };
        }));
    };

    const transferSubscription = (userId: number, subscriptionId: string, toWorkshopId: number, notes?: string) => {
        const user = users.find(u => u.id === userId);
        const sub = user?.subscriptions.find(s => s.id === subscriptionId);
        const toWorkshop = workshops.find(w => w.id === toWorkshopId);
        if(!user || !sub || !toWorkshop) return;

        // Mark old as TRANSFERRED
        updateSubscription(userId, subscriptionId, { 
            status: SubscriptionStatus.TRANSFERRED, 
            transferDate: new Date().toISOString(),
            notes: notes ? (sub.notes ? sub.notes + '\n' + notes : notes) : sub.notes
        });

        // Create new subscription
        const newSubData: Partial<Subscription> = {
            workshopId: toWorkshopId,
            packageId: undefined, // Reset package
            pricePaid: toWorkshop.price || 0, // Simplified: assumes paying full price of new workshop
            paymentMethod: sub.paymentMethod,
            transferrerName: sub.transferrerName,
            notes: `Transferred from workshop ${sub.workshopId}`,
        };
        addSubscription(userId, newSubData, true, false);
    };

    const reactivateSubscription = (userId: number, subscriptionId: string) => {
        updateSubscription(userId, subscriptionId, { status: SubscriptionStatus.ACTIVE, refundDate: undefined, refundMethod: undefined });
    };

    // --- Gift Actions ---
    const addPendingGift = (giftData: Omit<PendingGift, 'id' | 'createdAt'>) => {
        const newGift: PendingGift = { ...giftData, id: `gift-${Date.now()}`, createdAt: new Date().toISOString() };
        setPendingGifts(prev => [newGift, ...prev]);
        return newGift;
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

    const grantPayItForwardSeat = (userId: number, workshopId: number, amount: number, donorSubscriptionId: string, notes?: string) => {
        const donorUser = users.find(u => u.subscriptions.some(s => s.id === donorSubscriptionId));
        if (!donorUser) return;
        const donorSub = donorUser.subscriptions.find(s => s.id === donorSubscriptionId);
        if (!donorSub) return;

        // Deduct from donor
        updateSubscription(donorUser.id, donorSubscriptionId, {
            donationRemaining: (donorSub.donationRemaining || 0) - amount
        });

        // Grant to recipient
        addSubscription(userId, {
            workshopId,
            paymentMethod: 'GIFT',
            pricePaid: 0, // Free for recipient
            isGift: true,
            gifterName: donorUser.fullName,
            notes: notes
        }, true, true);
    };

    const updatePendingGift = (id: string, updates: Partial<PendingGift>) => setPendingGifts(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    const deletePendingGift = (id: string) => updatePendingGift(id, { isDeleted: true });
    const restorePendingGift = (id: string) => updatePendingGift(id, { isDeleted: false });
    const permanentlyDeletePendingGift = (id: string) => setPendingGifts(prev => prev.filter(g => g.id !== id));
    
    const adminManualClaimGift = (id: string, recipientData: { name: string, email: string, phone: string }) => {
        const gift = pendingGifts.find(g => g.id === id);
        if (!gift) return { success: false, message: 'الهدية غير موجودة' };
        if (gift.claimedByUserId) return { success: false, message: 'الهدية مفعلة مسبقاً' };

        let user = findUserByCredential('phone', recipientData.phone) || findUserByCredential('email', recipientData.email);
        if (!user) {
            user = addUser(recipientData.name, recipientData.email, recipientData.phone);
        }

        updatePendingGift(id, { 
            recipientName: recipientData.name, 
            recipientWhatsapp: recipientData.phone,
            claimedByUserId: user.id, 
            claimedAt: new Date().toISOString() 
        });

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

        return { success: true, message: `تم تفعيل الهدية للمستخدم ${user.fullName} بنجاح` };
    };

    // --- Expense Actions ---
    const addExpense = (expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expense, id: `exp-${Date.now()}` };
        setExpenses(prev => [newExpense, ...prev]);
    };
    const updateExpense = (expense: Expense) => setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    const deleteExpense = (id: string) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true } : e));
    const restoreExpense = (id: string) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: false } : e));
    const permanentlyDeleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

    // --- Product Actions ---
    const addProduct = (product: Omit<Product, 'id'>) => {
        const newProduct: Product = { ...product, id: Date.now() };
        setProducts(prev => [...prev, newProduct]);
    };
    const updateProduct = (product: Product) => setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    const deleteProduct = (id: number) => setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: true } : p));
    const restoreProduct = (id: number) => setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false } : p));
    const permanentlyDeleteProduct = (id: number) => setProducts(prev => prev.filter(p => p.id !== id));
    
    // --- Store Actions ---
    const placeOrder = (userId: number, orderData: any, initialStatus?: OrderStatus) => {
        const newOrder: Order = { ...orderData, id: `ord-${Date.now()}`, userId, status: initialStatus || OrderStatus.PENDING, orderDate: new Date().toISOString() };
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, orders: [...u.orders, newOrder] } : u));
        return newOrder;
    };
    const confirmOrder = (userId: number, orderId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id !== userId) return u;
            return {
                ...u,
                orders: u.orders.map(o => o.id === orderId ? { ...o, status: OrderStatus.COMPLETED } : o),
                notifications: [{ id: `notif-${Date.now()}`, message: `تم تأكيد طلبك رقم #${orderId.substring(0, 8)}`, timestamp: new Date().toISOString(), read: false }, ...u.notifications]
            };
        }));
    };

    // --- Reviews ---
    const addReview = (workshopId: number, reviewData: any) => setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: [...(w.reviews || []), { ...reviewData, id: `rev-${Date.now()}`, workshopId, date: new Date().toISOString() }] } : w));
    const deleteReview = (workshopId: number, reviewId: string) => setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: (w.reviews || []).map(r => r.id === reviewId ? { ...r, isDeleted: true } : r) } : w));
    const restoreReview = (workshopId: number, reviewId: string) => setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: (w.reviews || []).map(r => r.id === reviewId ? { ...r, isDeleted: false } : r) } : w));
    const permanentlyDeleteReview = (workshopId: number, reviewId: string) => setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: (w.reviews || []).filter(r => r.id !== reviewId) } : w));

    // --- Consultations ---
    const addConsultationRequest = (userId: number, subject: string) => setConsultationRequests(prev => [{ id: `consult-${Date.now()}`, userId, subject, status: 'NEW', requestedAt: new Date().toISOString() }, ...prev]);
    const updateConsultationRequest = (requestId: string, updates: Partial<ConsultationRequest>) => setConsultationRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updates } : r));

    // --- Broadcast ---
    const addBroadcastToHistory = (campaign: Omit<BroadcastCampaign, 'id' | 'timestamp'>) => {
        const newCampaign: BroadcastCampaign = { ...campaign, id: `bc-${Date.now()}`, timestamp: new Date().toISOString() };
        setBroadcastHistory(prev => [newCampaign, ...prev]);
        return newCampaign;
    };
    const addNotificationForMultipleUsers = (userIds: number[], message: string) => {
        setUsers(prev => prev.map(u => {
            if (userIds.includes(u.id)) {
                return {
                    ...u,
                    notifications: [{ id: `notif-bc-${Date.now()}`, message, timestamp: new Date().toISOString(), read: false }, ...u.notifications]
                };
            }
            return u;
        }));
    };

    // --- Content ---
    const updateDrhopeData = (data: Partial<DrhopeData>) => setDrhopeData(prev => ({ ...prev, ...data }));
    const addPartner = (partner: Omit<Partner, 'id'>) => setPartners(prev => [...prev, { ...partner, id: `p-${Date.now()}` }]);
    const updatePartner = (partner: Partner) => setPartners(prev => prev.map(p => p.id === partner.id ? partner : p));
    const deletePartner = (id: string) => setPartners(prev => prev.filter(p => p.id !== id));

    // --- Credit Transactions (Manage) ---
    const deleteCreditTransaction = (userId: number, transactionId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id !== userId) return u;
            const tx = u.creditTransactions?.find(t => t.id === transactionId);
            if (!tx || tx.isDeleted) return u;
            // Reverse impact
            const newBalance = (u.internalCredit || 0) + (tx.type === 'addition' ? -tx.amount : tx.amount);
            return {
                ...u,
                internalCredit: newBalance,
                creditTransactions: u.creditTransactions?.map(t => t.id === transactionId ? { ...t, isDeleted: true } : t)
            };
        }));
    };
    const restoreCreditTransaction = (userId: number, transactionId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id !== userId) return u;
            const tx = u.creditTransactions?.find(t => t.id === transactionId);
            if (!tx || !tx.isDeleted) return u;
            // Re-apply impact
            const newBalance = (u.internalCredit || 0) + (tx.type === 'addition' ? tx.amount : -tx.amount);
            return {
                ...u,
                internalCredit: newBalance,
                creditTransactions: u.creditTransactions?.map(t => t.id === transactionId ? { ...t, isDeleted: false } : t)
            };
        }));
    };
    const permanentlyDeleteCreditTransaction = (userId: number, transactionId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id !== userId) return u;
            return {
                ...u,
                creditTransactions: u.creditTransactions?.filter(t => t.id !== transactionId)
            };
        }));
    };

    // --- Helpers ---
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
    
    const findUserByCredential = (type: 'email' | 'phone', value: string) => {
        const normalizedValue = type === 'phone' ? normalizePhoneNumber(value) : value.toLowerCase();
        return users.find(u => !u.isDeleted && (type === 'phone' ? normalizePhoneNumber(u.phone) === normalizedValue : u.email.toLowerCase() === normalizedValue)) || null;
    };

    const checkRegistrationAvailability = (email: string, phone: string) => { 
        const lowercasedEmail = email.toLowerCase(); 
        const normalizedPhone = normalizePhoneNumber(phone); 
        return { 
            emailUser: users.find(u => u.email.toLowerCase() === lowercasedEmail && !u.isDeleted), 
            phoneUser: users.find(u => normalizePhoneNumber(u.phone) === normalizedPhone && !u.isDeleted) 
        }; 
    };

    const markNotificationsAsRead = () => { if(currentUser) setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, notifications: u.notifications.map(n => ({ ...n, read: true })) } : u)); };

    const value: UserContextType = useMemo(() => ({
        currentUser, users, workshops, products, partners, drhopeData, activeTheme, notifications, consultationRequests, globalCertificateTemplate: null, pendingGifts, expenses, broadcastHistory,
        
        login,
        logout: () => { if (currentUser) trackEvent('logout', {}, currentUser); setCurrentUser(null); },
        register: (fullName, email, phone) => { const newUser = addUser(fullName, email, phone); setCurrentUser(newUser); trackEvent('register', {}, newUser); return newUser; },
        addUser, updateUser, deleteUser, restoreUser, permanentlyDeleteUser, convertToInternalCredit,
        findUserByCredential, checkRegistrationAvailability,
        
        addWorkshop, updateWorkshop, deleteWorkshop, restoreWorkshop, permanentlyDeleteWorkshop,
        
        addSubscription, updateSubscription, deleteSubscription, restoreSubscription, permanentlyDeleteSubscription, transferSubscription, reactivateSubscription,
        
        placeOrder, confirmOrder,
        addReview, deleteReview, restoreReview, permanentlyDeleteReview,
        addConsultationRequest, updateConsultationRequest,
        
        addPendingGift, checkAndClaimPendingGifts, donateToPayItForward, grantPayItForwardSeat, updatePendingGift, deletePendingGift, restorePendingGift, permanentlyDeletePendingGift, adminManualClaimGift,
        
        markNotificationsAsRead, addNotificationForMultipleUsers, updateDrhopeData, addPartner, updatePartner, deletePartner, addBroadcastToHistory,
        
        addExpense, updateExpense, deleteExpense, restoreExpense, permanentlyDeleteExpense,
        
        addProduct, updateProduct, deleteProduct, restoreProduct, permanentlyDeleteProduct,
        
        deleteCreditTransaction, restoreCreditTransaction, permanentlyDeleteCreditTransaction,
    }), [currentUser, users, workshops, products, partners, drhopeData, activeTheme, notifications, consultationRequests, pendingGifts, expenses, broadcastHistory]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
