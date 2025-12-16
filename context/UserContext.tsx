
import React, { useState, useMemo, createContext, useContext } from 'react';
import { User, Workshop, DrhopeData, Notification, SubscriptionStatus, Subscription, Product, Order, OrderStatus, Partner, ConsultationRequest, ThemeColors, PendingGift, BroadcastCampaign, Expense, CertificateTemplate } from '../types';
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
    paymentSettings: { cardPaymentsEnabled: true, bankTransfersEnabled: true }
};

interface RegistrationAvailability {
  emailUser?: User;
  phoneUser?: User;
}

// Simplified Context for User-Only access
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
    
    // Read-only accessors needed for UI components (but logic removed)
    users: User[]; 
    expenses: Expense[];
    broadcastHistory: BroadcastCampaign[];
    globalCertificateTemplate: CertificateTemplate | null;
    
    // Stubs and Admin Functions
    updateDrhopeData: (data: Partial<DrhopeData>) => void;
    updateConsultationRequest: (id: string, data: any) => void;
    confirmOrder: (userId: number, orderId: string) => void;

    // Workshop Admin
    addWorkshop: (workshop: Omit<Workshop, 'id'>) => void;
    updateWorkshop: (workshop: Workshop) => void;
    deleteWorkshop: (id: number) => void;
    restoreWorkshop: (id: number) => void;
    permanentlyDeleteWorkshop: (id: number) => void;

    // User Admin
    addUser: (fullName: string, email: string, phone: string) => User;
    updateUser: (userId: number, data: Partial<User>) => void;
    deleteUser: (userId: number) => void;
    restoreUser: (userId: number) => void;
    permanentlyDeleteUser: (userId: number) => void;

    // Subscription Admin
    updateSubscription: (userId: number, subscriptionId: string, data: Partial<Subscription>) => void;
    deleteSubscription: (userId: number, subscriptionId: string) => void;
    restoreSubscription: (userId: number, subscriptionId: string) => void;
    permanentlyDeleteSubscription: (userId: number, subscriptionId: string) => void;
    transferSubscription: (userId: number, subscriptionId: string, targetWorkshopId: number, notes: string) => void;
    reactivateSubscription: (userId: number, subscriptionId: string) => void;

    // Credit Admin
    convertToInternalCredit: (userId: number, amount: number, description: string) => void;
    deleteCreditTransaction: (userId: number, transactionId: string) => void;
    restoreCreditTransaction: (userId: number, transactionId: string) => void;
    permanentlyDeleteCreditTransaction: (userId: number, transactionId: string) => void;

    // Pending Gift Admin
    deletePendingGift: (giftId: string) => void;
    restorePendingGift: (giftId: string) => void;
    permanentlyDeletePendingGift: (giftId: string) => void;
    updatePendingGift: (giftId: string, data: Partial<PendingGift>) => void;
    adminManualClaimGift: (giftId: string, recipientData: { name: string, email: string, phone: string }) => { success: boolean; message: string };
    grantPayItForwardSeat: (userId: number, workshopId: number, amount: number, donorSubscriptionId: string, notes: string) => void;

    // Expense Admin
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (id: string) => void;
    restoreExpense: (id: string) => void;
    permanentlyDeleteExpense: (id: string) => void;

    // Broadcast Admin
    addBroadcastToHistory: (campaign: Omit<BroadcastCampaign, 'id' | 'timestamp'>) => BroadcastCampaign;
    addNotificationForMultipleUsers: (userIds: number[], message: string) => void;

    // Review Admin
    deleteReview: (workshopId: number, reviewId: string) => void;
    restoreReview: (workshopId: number, reviewId: string) => void;
    permanentlyDeleteReview: (workshopId: number, reviewId: string) => void;

    // Product Admin
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: number) => void;
    restoreProduct: (id: number) => void;
    permanentlyDeleteProduct: (id: number) => void;

    // Partner Admin
    addPartner: (partner: Omit<Partner, 'id'>) => void;
    updatePartner: (partner: Partner) => void;
    deletePartner: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [workshops, setWorkshops] = useState<Workshop[]>(initialWorkshops);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [partners, setPartners] = useState<Partner[]>(initialPartners);
    const [drhopeData, setDrhopeData] = useState<DrhopeData>(initialDrhopeData);
    
    // Local simulation of database
    const [users, setUsers] = useState<User[]>([]); 
    const [pendingGifts, setPendingGifts] = useState<PendingGift[]>([]);
    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [broadcastHistory, setBroadcastHistory] = useState<BroadcastCampaign[]>([]);

    const notifications = useMemo(() => currentUser?.notifications || [], [currentUser]);

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
                // Simulate credit deduction if applicable
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
             // We rely on the `users` state update to propagate, but for immediate UI feedback in some cases:
             // Note: In a real app with API, we'd refetch profile.
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
        // Simple logic to claim gifts by phone matching
        return 0; 
    };

    const donateToPayItForward = (workshopId: number, amount: number, seats: number = 0, donorUserId?: number) => {
        // Logic to record donation
    };

    const markNotificationsAsRead = () => { 
        if(currentUser) {
            const updatedNotifications = currentUser.notifications.map(n => ({...n, read: true}));
            // Ideally this updates the backend. For now, local state update.
            setCurrentUser({...currentUser, notifications: updatedNotifications});
        }
    };

    // Stubs for Admin functions to prevent crashes if components are still loaded
    const updateDrhopeData = (data: Partial<DrhopeData>) => { setDrhopeData(prev => ({ ...prev, ...data })); };
    const updateConsultationRequest = (id: string, data: any) => {
        setConsultationRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    };
    const confirmOrder = (userId: number, orderId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, orders: u.orders.map(o => o.id === orderId ? { ...o, status: OrderStatus.COMPLETED } : o) };
            }
            return u;
        }));
    };

    // Workshop Admin
    const addWorkshop = (workshop: Omit<Workshop, 'id'>) => { setWorkshops(prev => [...prev, { ...workshop, id: Date.now() }]); };
    const updateWorkshop = (workshop: Workshop) => { setWorkshops(prev => prev.map(w => w.id === workshop.id ? workshop : w)); };
    const deleteWorkshop = (id: number) => { setWorkshops(prev => prev.map(w => w.id === id ? { ...w, isDeleted: true } : w)); };
    const restoreWorkshop = (id: number) => { setWorkshops(prev => prev.map(w => w.id === id ? { ...w, isDeleted: false } : w)); };
    const permanentlyDeleteWorkshop = (id: number) => { setWorkshops(prev => prev.filter(w => w.id !== id)); };

    // User Admin
    const addUser = (fullName: string, email: string, phone: string): User => {
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
        return newUser;
    };
    const updateUser = (userId: number, data: Partial<User>) => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u)); };
    const deleteUser = (userId: number) => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, isDeleted: true } : u)); };
    const restoreUser = (userId: number) => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, isDeleted: false } : u)); };
    const permanentlyDeleteUser = (userId: number) => { setUsers(prev => prev.filter(u => u.id !== userId)); };

    // Subscription Admin
    const updateSubscription = (userId: number, subscriptionId: string, data: Partial<Subscription>) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, subscriptions: u.subscriptions.map(s => s.id === subscriptionId ? { ...s, ...data } : s) };
            }
            return u;
        }));
    };
    const deleteSubscription = (userId: number, subscriptionId: string) => { updateSubscription(userId, subscriptionId, { isDeleted: true }); };
    const restoreSubscription = (userId: number, subscriptionId: string) => { updateSubscription(userId, subscriptionId, { isDeleted: false }); };
    const permanentlyDeleteSubscription = (userId: number, subscriptionId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, subscriptions: u.subscriptions.filter(s => s.id !== subscriptionId) };
            }
            return u;
        }));
    };
    const transferSubscription = (userId: number, subscriptionId: string, targetWorkshopId: number, notes: string) => {
        // Implement simplified transfer logic
        updateSubscription(userId, subscriptionId, { status: SubscriptionStatus.TRANSFERRED, transferDate: new Date().toISOString(), notes: notes });
    };
    const reactivateSubscription = (userId: number, subscriptionId: string) => { updateSubscription(userId, subscriptionId, { status: SubscriptionStatus.ACTIVE, refundDate: undefined, refundMethod: undefined }); };

    // Credit Admin
    const convertToInternalCredit = (userId: number, amount: number, description: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, internalCredit: (u.internalCredit || 0) + amount };
            }
            return u;
        }));
    };
    const deleteCreditTransaction = (userId: number, transactionId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, creditTransactions: u.creditTransactions?.map(t => t.id === transactionId ? { ...t, isDeleted: true } : t) };
            }
            return u;
        }));
    };
    const restoreCreditTransaction = (userId: number, transactionId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, creditTransactions: u.creditTransactions?.map(t => t.id === transactionId ? { ...t, isDeleted: false } : t) };
            }
            return u;
        }));
    };
    const permanentlyDeleteCreditTransaction = (userId: number, transactionId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, creditTransactions: u.creditTransactions?.filter(t => t.id !== transactionId) };
            }
            return u;
        }));
    };

    // Pending Gift Admin
    const deletePendingGift = (giftId: string) => { setPendingGifts(prev => prev.map(g => g.id === giftId ? { ...g, isDeleted: true } : g)); };
    const restorePendingGift = (giftId: string) => { setPendingGifts(prev => prev.map(g => g.id === giftId ? { ...g, isDeleted: false } : g)); };
    const permanentlyDeletePendingGift = (giftId: string) => { setPendingGifts(prev => prev.filter(g => g.id !== giftId)); };
    const updatePendingGift = (giftId: string, data: Partial<PendingGift>) => { setPendingGifts(prev => prev.map(g => g.id === giftId ? { ...g, ...data } : g)); };
    const adminManualClaimGift = (giftId: string, recipientData: { name: string, email: string, phone: string }) => { return { success: true, message: "Gift claimed manually" }; };
    const grantPayItForwardSeat = (userId: number, workshopId: number, amount: number, donorSubscriptionId: string, notes: string) => {
        // Logic for granting seat
    };

    // Expense Admin
    const addExpense = (expense: Omit<Expense, 'id'>) => { setExpenses(prev => [...prev, { ...expense, id: `exp-${Date.now()}` }]); };
    const updateExpense = (expense: Expense) => { setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e)); };
    const deleteExpense = (id: string) => { setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true } : e)); };
    const restoreExpense = (id: string) => { setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: false } : e)); };
    const permanentlyDeleteExpense = (id: string) => { setExpenses(prev => prev.filter(e => e.id !== id)); };

    // Broadcast Admin
    const addBroadcastToHistory = (campaign: Omit<BroadcastCampaign, 'id' | 'timestamp'>) => {
        const newCampaign = { ...campaign, id: `bc-${Date.now()}`, timestamp: new Date().toISOString() };
        setBroadcastHistory(prev => [newCampaign, ...prev]);
        return newCampaign;
    };
    const addNotificationForMultipleUsers = (userIds: number[], message: string) => {
        setUsers(prev => prev.map(u => {
            if (userIds.includes(u.id)) {
                return { ...u, notifications: [{ id: `notif-${Date.now()}-${u.id}`, message, timestamp: new Date().toISOString(), read: false }, ...u.notifications] };
            }
            return u;
        }));
    };

    // Review Admin
    const deleteReview = (workshopId: number, reviewId: string) => {
        setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: w.reviews?.map(r => r.id === reviewId ? { ...r, isDeleted: true } : r) } : w));
    };
    const restoreReview = (workshopId: number, reviewId: string) => {
        setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: w.reviews?.map(r => r.id === reviewId ? { ...r, isDeleted: false } : r) } : w));
    };
    const permanentlyDeleteReview = (workshopId: number, reviewId: string) => {
        setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, reviews: w.reviews?.filter(r => r.id !== reviewId) } : w));
    };

    // Product Admin
    const addProduct = (product: Omit<Product, 'id'>) => { setProducts(prev => [...prev, { ...product, id: Date.now() }]); };
    const updateProduct = (product: Product) => { setProducts(prev => prev.map(p => p.id === product.id ? product : p)); };
    const deleteProduct = (id: number) => { setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: true } : p)); };
    const restoreProduct = (id: number) => { setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false } : p)); };
    const permanentlyDeleteProduct = (id: number) => { setProducts(prev => prev.filter(p => p.id !== id)); };

    // Partner Admin
    const addPartner = (partner: Omit<Partner, 'id'>) => { setPartners(prev => [...prev, { ...partner, id: `partner-${Date.now()}` }]); };
    const updatePartner = (partner: Partner) => { setPartners(prev => prev.map(p => p.id === partner.id ? partner : p)); };
    const deletePartner = (id: string) => { setPartners(prev => prev.filter(p => p.id !== id)); };

    const value: UserContextType = useMemo(() => ({
        currentUser, workshops, products, partners, drhopeData, activeTheme, notifications, consultationRequests, pendingGifts,
        users, expenses, broadcastHistory, globalCertificateTemplate: null, // Empty for security
        
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
        
        // Stubs
        updateDrhopeData,
        updateConsultationRequest,
        confirmOrder,

        // Workshop Admin
        addWorkshop,
        updateWorkshop,
        deleteWorkshop,
        restoreWorkshop,
        permanentlyDeleteWorkshop,

        // User Admin
        addUser,
        updateUser,
        deleteUser,
        restoreUser,
        permanentlyDeleteUser,

        // Subscription Admin
        updateSubscription,
        deleteSubscription,
        restoreSubscription,
        permanentlyDeleteSubscription,
        transferSubscription,
        reactivateSubscription,

        // Credit Admin
        convertToInternalCredit,
        deleteCreditTransaction,
        restoreCreditTransaction,
        permanentlyDeleteCreditTransaction,

        // Pending Gift Admin
        deletePendingGift,
        restorePendingGift,
        permanentlyDeletePendingGift,
        updatePendingGift,
        adminManualClaimGift,
        grantPayItForwardSeat,

        // Expense Admin
        addExpense,
        updateExpense,
        deleteExpense,
        restoreExpense,
        permanentlyDeleteExpense,

        // Broadcast Admin
        addBroadcastToHistory,
        addNotificationForMultipleUsers,

        // Review Admin
        deleteReview,
        restoreReview,
        permanentlyDeleteReview,

        // Product Admin
        addProduct,
        updateProduct,
        deleteProduct,
        restoreProduct,
        permanentlyDeleteProduct,

        // Partner Admin
        addPartner,
        updatePartner,
        deletePartner
    }), [currentUser, workshops, products, partners, drhopeData, activeTheme, notifications, consultationRequests, pendingGifts, users, expenses, broadcastHistory]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
