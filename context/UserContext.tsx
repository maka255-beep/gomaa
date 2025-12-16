
import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { User, Workshop, DrhopeData, Notification, SubscriptionStatus, Subscription, Product, Order, OrderStatus, Partner, ConsultationRequest, ThemeColors, PendingGift, CertificateTemplate } from '../types';
import { normalizePhoneNumber } from '../utils';
import { trackEvent } from '../analytics';

// Initial Mock Data for Workshops
const initialWorkshops: Workshop[] = [
    {
        id: 1,
        title: "رحلة الوعي الذاتي",
        instructor: "د. أمل العتيبي",
        startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
        startTime: "18:00",
        location: "أونلاين",
        country: "الإمارات",
        isRecorded: false,
        zoomLink: "https://zoom.us/j/123456789",
        description: "ورشة عمل مكثفة تأخذك في رحلة لاستكشاف أعماق ذاتك وفهم دوافعك ومشاعرك. سنتعلم كيف نتحرر من المعتقدات المعيقة ونبني هوية متزنة.",
        topics: ["مفهوم الوعي الذاتي", "تحليل أنماط الشخصية", "التحرر من صدمات الماضي", "بناء العادات الإيجابية"],
        isVisible: true,
        price: 350,
        packages: [{ id: 101, name: "تذكرة حضور أونلاين", price: 350, features: ["حضور البث المباشر", "مذكرة الدورة PDF"] }]
    },
    {
        id: 2,
        title: "قوة التغيير: ابدأ من جديد",
        instructor: "د. أمل العتيبي",
        startDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0], // 12 days from now
        startTime: "16:00",
        location: "حضوري",
        country: "الإمارات",
        city: "دبي",
        hotelName: "فندق العنوان - دوان تاون",
        hallName: "قاعة الماس",
        isRecorded: false,
        zoomLink: "",
        description: "يوم تدريبي متكامل في قلب دبي، مصمم ليمنحك الطاقة والأدوات اللازمة لإحداث تغيير جذري في حياتك المهنية والشخصية.",
        topics: ["عجلة الحياة المتزنة", "تحديد الأهداف الذكية", "التغلب على التسويف", "صناعة القرار"],
        isVisible: true,
        packages: [
            { id: 201, name: "الباقة الفضية", price: 1200, features: ["مقعد في القاعة", "وجبة غداء", "شهادة حضور"] },
            { id: 202, name: "الباقة الذهبية (VIP)", price: 2500, features: ["مقعد أمامي VIP", "استشارة سريعة", "غداء خاص مع المدربة"] }
        ]
    },
    {
        id: 3,
        title: "أسس التربية الإيجابية",
        instructor: "د. أمل العتيبي",
        startDate: "2023-01-15",
        startTime: "10:00",
        location: "مسجلة",
        country: "السعودية",
        isRecorded: true,
        zoomLink: "",
        description: "دورة شاملة لكل مربي ومربية، تتناول أحدث الأساليب في التعامل مع الأطفال والمراهقين لبناء جيل واثق ومتزن.",
        isVisible: true,
        price: 299,
        recordings: [
            { name: "الجزء الأول: فهم نفسية الطفل", url: "https://vimeo.com/123456789" },
            { name: "الجزء الثاني: أدوات التوجيه", url: "https://vimeo.com/987654321" }
        ],
        notes: [{ type: 'file', name: 'ملخص الدورة.pdf', value: '#' }]
    },
    {
        id: 4,
        title: "فن العلاقات والذكاء الاجتماعي",
        instructor: "د. أمل العتيبي",
        startDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
        startTime: "19:00",
        location: "أونلاين وحضوري",
        country: "الكويت",
        city: "الكويت العاصمة",
        hotelName: "فندق الجميرا",
        isRecorded: false,
        zoomLink: "https://zoom.us/j/111222333",
        description: "ورشة هايبرد (هجين) تجمع بين الحضور الفعلي والأونلاين، تركز على مهارات التواصل الفعال وبناء علاقات صحية ومثمرة.",
        topics: ["أنماط التعلق", "رسم الحدود الشخصية", "لغات الحب الخمس", "فن الاحتواء"],
        isVisible: true,
        packages: [
            { id: 401, name: "حضور أونلاين", price: 400, features: ["بث مباشر عالي الجودة", "تفاعل عبر الشات"], attendanceType: 'أونلاين' },
            { id: 402, name: "حضور في القاعة", price: 1500, features: ["مقعد في القاعة", "ضيافة فاخرة", "فرصة للتصوير"], attendanceType: 'حضوري' }
        ]
    },
    {
        id: 5,
        title: "التشافي الذاتي",
        instructor: "د. أمل العتيبي",
        startDate: "2023-05-20",
        startTime: "09:00",
        location: "مسجلة",
        country: "عالمي",
        isRecorded: true,
        zoomLink: "",
        description: "برنامج عملي مكثف يساعدك على تجاوز آلام الماضي، والتعامل مع مشاعر الفقد والحزن، وبدء صفحة جديدة ملؤها السلام الداخلي.",
        isVisible: true,
        price: 450,
        recordings: [{ name: "جلسة التشافي الكاملة", url: "https://vimeo.com/555666777" }]
    },
    {
        id: 6,
        title: "أسرار الثقة بالنفس",
        instructor: "د. أمل العتيبي",
        startDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
        startTime: "20:00",
        location: "أونلاين",
        country: "الإمارات",
        isRecorded: false,
        zoomLink: "https://zoom.us/j/999888777",
        description: "كيف تبني كاريزما قوية وتتحدث بطلاقة أمام الجمهور؟ ورشة عملية بامتياز.",
        isVisible: true,
        price: 200,
        packages: [{ id: 601, name: "تذكرة عامة", price: 200, features: ["حضور الورشة"] }]
    },
    {
        id: 7,
        title: "جلسة تأمل: هدوء النفس (مجانية)",
        instructor: "د. أمل العتيبي",
        startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        startTime: "20:30",
        location: "أونلاين",
        country: "الإمارات",
        isRecorded: false,
        zoomLink: "https://zoom.us/j/free-session",
        description: "جلسة خاصة مجانية لجميع مشتركينا، نركز فيها على تقنيات التنفس وتفريغ الضغوطات اليومية. هذه الورشة تجريبية لتوضيح آلية التسجيل المجاني.",
        topics: ["تمارين التنفس", "التخيل الموجه", "أسئلة وأجوبة"],
        isVisible: true,
        price: 0,
        packages: [{ id: 701, name: "حضور مجاني", price: 0, features: ["دخول القاعة", "المشاركة في الشات"] }]
    }
];

const initialProducts: Product[] = [
    { id: 1, name: "أجندة نوايا 2025", price: 150, imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&q=80" },
    { id: 2, name: "كتاب: رحلة الروح", price: 85, imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80" },
    { id: 3, name: "طقم أقلام فاخر", price: 120, imageUrl: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&q=80" },
    { id: 4, name: "مفكرة الإنجاز اليومي", price: 65, imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&q=80" },
    { id: 5, name: "كوب قهوة حراري - نوايا", price: 90, imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80" }
];

const initialPartners: Partner[] = [
    { id: '1', name: "دائرة السياحة", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Logo_of_the_Department_of_Culture_and_Tourism_-_Abu_Dhabi.svg/1200px-Logo_of_the_Department_of_Culture_and_Tourism_-_Abu_Dhabi.svg.png", description: "شريك استراتيجي في تنظيم الفعاليات" },
    { id: '2', name: "فنادق روتانا", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Rotana_Hotels_Logo.svg/1200px-Rotana_Hotels_Logo.svg.png", description: "شريك الضيافة الرسمي" },
    { id: '3', name: "مكتبة جرير", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7d/Jarir_Bookstore_logo.svg/1200px-Jarir_Bookstore_logo.svg.png", description: "شريك المعرفة" }
];

const defaultThemeData: ThemeColors = {
    background: { from: '#2e1065', to: '#4a044e', balance: 60 },
    button: { from: '#7c3aed', to: '#db2777', balance: 50 },
    card: { from: 'rgba(46, 16, 101, 0.6)', to: 'rgba(88, 28, 135, 0.4)', balance: 50 },
    text: { primary: '#e2e8f0', accent: '#e879f9' },
    glow: { color: '#d946ef', intensity: 50 },
};

const initialDrhopeData: DrhopeData = {
    videos: [{id: 'v1', title: 'مقدمة عن الوعي', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'}],
    photos: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80", "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=500&q=80", "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=500&q=80"],
    instagramLinks: [],
    socialMediaLinks: { instagram: "https://instagram.com", twitter: "https://twitter.com" },
    whatsappNumber: '+971501234567',
    backgroundMusicUrl: '',
    backgroundMusicName: '',
    introText: 'يُحِبُّهُمْ وَيُحِبُّونَهُۥٓ',
    logoUrl: '',
    cvUrl: '',
    headerLinks: { drhope: 'دكتور هوب', reviews: 'آراء المشتركات', profile: 'ملفي الشخصي' },
    activeThemeId: 'default',
    themes: [], 
    consultationSettings: { defaultDurationMinutes: 50, defaultFee: 450, consultationsEnabled: true },
    paymentSettings: { cardPaymentsEnabled: true, bankTransfersEnabled: true },
    liveWorkshopRefundPolicy: "يحق للمشترك استرداد المبلغ كاملاً في حال الإلغاء قبل موعد الورشة بـ 7 أيام على الأقل.\nلا يمكن استرداد رسوم الاشتراك إذا كان الإلغاء خلال الـ 7 أيام التي تسبق موعد الورشة.\nيمكن تحويل المقعد لشخص آخر بالتنسيق مع إدارة المنصة قبل موعد الورشة بـ 24 ساعة.",
    recordedWorkshopTerms: "المحتوى التعليمي متاح للاستخدام الشخصي فقط للمشترك المسجل.\nيمنع منعاً باتاً مشاركة حساب الدخول أو المحتوى مع أي طرف آخر.\nجميع حقوق الملكية الفكرية محفوظة، ويمنع نسخ أو توزيع المواد.\nالرسوم المدفوعة للمحتوى المسجل غير قابلة للاسترداد بعد إتمام عملية الدفع."
};

interface RegistrationAvailability {
  emailUser?: User;
  phoneUser?: User;
}

// User Context - Public Only
interface UserContextType {
    currentUser: User | null;
    workshops: Workshop[];
    products: Product[];
    partners: Partner[];
    drhopeData: DrhopeData;
    activeTheme: ThemeColors;
    notifications: Notification[];
    consultationRequests: ConsultationRequest[];
    pendingGifts: PendingGift[];
    
    // Read-only accessors for internal use (e.g. Gift claiming)
    users: User[]; 
    globalCertificateTemplate: CertificateTemplate | null;

    // Auth Actions
    login: (email: string, phone: string) => { user?: User; error?: string };
    logout: () => void;
    register: (fullName: string, email: string, phone: string) => User;
    checkRegistrationAvailability: (email: string, phone: string) => RegistrationAvailability;
    findUserByCredential: (type: 'email' | 'phone', value: string) => User | null;

    // User Actions
    addSubscription: (userId: number, subscriptionData: Partial<Subscription>, isApproved: boolean, sendWhatsApp: boolean, creditToApply?: number) => void;
    placeOrder: (userId: number, order: Omit<Order, 'id' | 'userId' | 'status' | 'orderDate'>, initialStatus?: OrderStatus) => Order;
    addReview: (workshopId: number, review: { fullName: string; rating: number; comment: string }) => void;
    addConsultationRequest: (userId: number, subject: string) => void;
    
    // Gifting
    addPendingGift: (giftData: Omit<PendingGift, 'id' | 'createdAt'>) => PendingGift;
    checkAndClaimPendingGifts: (user: User) => number;
    donateToPayItForward: (workshopId: number, amount: number, seats?: number, donorUserId?: number) => void;

    // General
    markNotificationsAsRead: () => void;
    
    // User Updating own data (e.g. after consult update)
    updateConsultationRequest: (id: string, data: any) => void;
    updateSubscription: (userId: number, subscriptionId: string, data: Partial<Subscription>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State with LocalStorage Persistence
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem('nawaya_current_user');
            return saved ? JSON.parse(saved) : null;
        } catch(e) { return null; }
    });

    const [workshops, setWorkshops] = useState<Workshop[]>(() => {
        try {
            const saved = localStorage.getItem('nawaya_workshops');
            return saved ? JSON.parse(saved) : initialWorkshops;
        } catch(e) { return initialWorkshops; }
    });

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [partners, setPartners] = useState<Partner[]>(initialPartners);
    const [drhopeData, setDrhopeData] = useState<DrhopeData>(initialDrhopeData);
    
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const saved = localStorage.getItem('nawaya_users');
            return saved ? JSON.parse(saved) : [];
        } catch(e) { return []; }
    }); 

    const [pendingGifts, setPendingGifts] = useState<PendingGift[]>(() => {
        try {
            const saved = localStorage.getItem('nawaya_pending_gifts');
            return saved ? JSON.parse(saved) : [];
        } catch(e) { return []; }
    });

    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>(() => {
        try {
            const saved = localStorage.getItem('nawaya_consultation_requests');
            return saved ? JSON.parse(saved) : [];
        } catch(e) { return []; }
    });

    // Persistence Effects
    useEffect(() => { localStorage.setItem('nawaya_users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('nawaya_workshops', JSON.stringify(workshops)); }, [workshops]); // To save reviews
    useEffect(() => { localStorage.setItem('nawaya_pending_gifts', JSON.stringify(pendingGifts)); }, [pendingGifts]);
    useEffect(() => { localStorage.setItem('nawaya_consultation_requests', JSON.stringify(consultationRequests)); }, [consultationRequests]);
    useEffect(() => { 
        if (currentUser) {
            // Ensure we save the latest version of the user from the users array
            const updatedUser = users.find(u => u.id === currentUser.id);
            localStorage.setItem('nawaya_current_user', JSON.stringify(updatedUser || currentUser)); 
        } else {
            localStorage.removeItem('nawaya_current_user');
        }
    }, [currentUser, users]);


    const notifications = useMemo(() => {
        // We need to get notifications from the fresh user object in 'users' array, not just the static currentUser state
        const freshUser = users.find(u => u.id === currentUser?.id);
        return freshUser?.notifications || [];
    }, [currentUser, users]);

    const activeTheme = useMemo(() => {
        const themes = drhopeData.themes || [];
        const activeId = drhopeData.activeThemeId;
        const foundTheme = themes.find(t => t.id === activeId);
        return foundTheme ? foundTheme.colors : defaultThemeData;
    }, [drhopeData]);
    
    // --- Auth Actions ---
    const login = (email: string, phone: string) => {
        const normalizedPhone = normalizePhoneNumber(phone);
        const lowercasedEmail = email.toLowerCase();
        
        // Search in local simulated DB
        const user = users.find(u => 
            !u.isDeleted && 
            u.email.toLowerCase() === lowercasedEmail && 
            normalizePhoneNumber(u.phone) === normalizedPhone
        );

        if (user) {
            setCurrentUser(user);
            trackEvent('login', { method: 'credential' }, user);
            return { user };
        }
        return { error: 'not_found' };
    };

    const register = (fullName: string, email: string, phone: string): User => {
        const newUser: User = { 
            id: Date.now(), 
            fullName, 
            email, 
            phone, 
            subscriptions: [], 
            orders: [], 
            notifications: [], 
            creditTransactions: [],
            isDeleted: false
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        trackEvent('register', {}, newUser);
        return newUser;
    };

    const checkRegistrationAvailability = (email: string, phone: string) => { 
        const lowercasedEmail = email.toLowerCase(); 
        const normalizedPhone = normalizePhoneNumber(phone); 
        return { 
            emailUser: users.find(u => u.email.toLowerCase() === lowercasedEmail && !u.isDeleted), 
            phoneUser: users.find(u => normalizePhoneNumber(u.phone) === normalizedPhone && !u.isDeleted) 
        }; 
    };

    const findUserByCredential = (type: 'email' | 'phone', value: string) => {
        const normalizedValue = type === 'phone' ? normalizePhoneNumber(value) : value.toLowerCase();
        return users.find(u => !u.isDeleted && (type === 'phone' ? normalizePhoneNumber(u.phone) === normalizedValue : u.email.toLowerCase() === normalizedValue)) || null;
    };

    // --- User Actions ---
    const addSubscription = (userId: number, subData: Partial<Subscription>, isApproved: boolean, sendWhatsApp: boolean, creditToApply = 0) => {
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                const newSubscription: Subscription = {
                    id: `sub-${Date.now()}`,
                    workshopId: subData.workshopId as number,
                    status: SubscriptionStatus.ACTIVE,
                    isApproved,
                    activationDate: new Date().toISOString(),
                    expiryDate: '2099-12-31',
                    ...subData,
                };
                
                const updatedUser = { ...user, subscriptions: [...user.subscriptions, newSubscription] };
                if (creditToApply > 0) {
                    updatedUser.internalCredit = (updatedUser.internalCredit || 0) - creditToApply;
                }
                return updatedUser;
            }
            return user;
        }));
        
        // If current user is the one subscribing, update session
        if (currentUser?.id === userId) {
             const updatedUser = users.find(u => u.id === userId);
             if (updatedUser) {
                 // The useEffect will handle syncing currentUser with localStorage
             }
        }
    };

    const placeOrder = (userId: number, orderData: any, initialStatus?: OrderStatus) => {
        const newOrder: Order = { ...orderData, id: `ord-${Date.now()}`, userId, status: initialStatus || OrderStatus.PENDING, orderDate: new Date().toISOString() };
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, orders: [...u.orders, newOrder] } : u));
        return newOrder;
    };

    const addReview = (workshopId: number, reviewData: any) => {
        setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: [...(w.reviews || []), { ...reviewData, id: `rev-${Date.now()}`, workshopId, date: new Date().toISOString() }] } : w));
    };

    const addConsultationRequest = (userId: number, subject: string) => {
        setConsultationRequests(prev => [{ id: `consult-${Date.now()}`, userId, subject, status: 'NEW', requestedAt: new Date().toISOString() }, ...prev]);
    };

    const addPendingGift = (giftData: Omit<PendingGift, 'id' | 'createdAt'>) => {
        const newGift: PendingGift = { ...giftData, id: `gift-${Date.now()}`, createdAt: new Date().toISOString() };
        setPendingGifts(prev => [newGift, ...prev]);
        return newGift;
    };

    const checkAndClaimPendingGifts = (user: User) => {
        // Mock implementation
        return 0; 
    };

    const donateToPayItForward = (workshopId: number, amount: number, seats: number = 0, donorUserId?: number) => {
        // Mock implementation
    };

    const markNotificationsAsRead = () => { 
        if(currentUser) {
            setUsers(prev => prev.map(u => {
                if(u.id === currentUser.id) {
                    const updatedNotifications = u.notifications.map(n => ({...n, read: true}));
                    return {...u, notifications: updatedNotifications};
                }
                return u;
            }));
        }
    };

    const updateConsultationRequest = (id: string, data: any) => {
        setConsultationRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    };

    const updateSubscription = (userId: number, subscriptionId: string, data: Partial<Subscription>) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, subscriptions: u.subscriptions.map(s => s.id === subscriptionId ? { ...s, ...data } : s) };
            }
            return u;
        }));
    };

    const value: UserContextType = useMemo(() => ({
        currentUser: users.find(u => u.id === currentUser?.id) || null, // Always return fresh user from state
        workshops, products, partners, drhopeData, activeTheme, notifications, consultationRequests, pendingGifts,
        users, globalCertificateTemplate: null,
        
        login,
        logout: () => { if (currentUser) trackEvent('logout', {}, currentUser); setCurrentUser(null); },
        register,
        checkRegistrationAvailability,
        findUserByCredential,
        
        addSubscription,
        placeOrder,
        addReview,
        addConsultationRequest,
        
        addPendingGift,
        checkAndClaimPendingGifts,
        donateToPayItForward,
        
        markNotificationsAsRead,
        updateConsultationRequest,
        updateSubscription
    }), [currentUser, workshops, products, partners, drhopeData, activeTheme, notifications, consultationRequests, pendingGifts, users]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
