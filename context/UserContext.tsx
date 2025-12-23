
import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { User, Workshop, DrhopeData, Notification, SubscriptionStatus, Subscription, Product, Order, OrderStatus, Partner, ConsultationRequest, ThemeColors, PendingGift, CertificateTemplate } from '../types';
import { normalizePhoneNumber } from '../utils';
import { trackEvent } from '../analytics';

// Get today's date in YYYY-MM-DD format
const todayStr = new Date().toISOString().split('T')[0];

// Initial Mock Data for Workshops
const initialWorkshops: Workshop[] = [
    {
        id: 25,
        title: "ورشة القوة الداخلية والاتزان النفسي",
        instructor: "د. أمل العتيبي",
        startDate: "2025-09-15",
        endDate: "2025-09-16",
        startTime: "16:00",
        endTime: "21:00",
        location: "حضوري",
        city: "الشارقة",
        country: "الإمارات",
        hotelName: "فندق راديسون بلو الشارقة",
        hallName: "قاعة المباركية",
        isRecorded: false,
        zoomLink: "",
        description: "رحلة حضورية لاستكشاف مكامن القوة بداخلنا وكيفية تحقيق التوازن بين متطلبات الحياة وهدوء النفس، من خلال تمارين عملية وجلسات تأمل جماعية.",
        topics: ["مفهوم الاتزان الداخلي", "تقنيات التحرر من التوتر", "بناء المرونة النفسية", "جلسة تشافٍ جماعية"],
        isVisible: true,
        price: 1100,
        packages: [
            { id: 2501, name: "حضور المقعد العادي", price: 1100, features: ["حضور يومي الورشة", "مذكرة التمارين مطبوعة", "شهادة حضور", "ضيافة خفيفة"] },
            { id: 2502, name: "باقة الـ VIP", price: 1650, features: ["جلوس في الصف الأول", "جلسة استشارية قصيرة", "مجموعة أحجار كريمة طاقية", "كل مميزات الباقة العادية"] }
        ]
    },
    {
        id: 21,
        title: "ورشة فن الإلقاء والتأثير",
        instructor: "د. أمل العتيبي",
        startDate: "2025-12-10",
        endDate: "2025-12-11",
        startTime: "10:00",
        endTime: "15:00",
        location: "حضوري",
        city: "دبي",
        country: "الإمارات",
        hotelName: "فندق ريتز كارلتون",
        hallName: "قاعة اللؤلؤة",
        isRecorded: false,
        zoomLink: "",
        description: "ورشة تدريبية عملية تركز على تطوير مهارات الخطابة، لغة الجسد، وكيفية التأثير في الجمهور وبناء الكاريزما الشخصية.",
        topics: ["كسر حاجز الخوف", "هيكلة الخطاب المؤثر", "أسرار لغة الجسد", "التعامل مع الأسئلة الصعبة"],
        isVisible: true,
        price: 1500,
        packages: [
            { id: 2101, name: "المقعد الأساسي", price: 1500, features: ["حضور يومي الورشة", "المادة العلمية الرقمية", "شهادة حضور معتمدة", "استراحة قهوة"] },
            { id: 2102, name: "المقعد الماسي", price: 2200, features: ["جلوس في الصفوف الأولى", "تحليل شخصي لأسلوب الإلقاء", "شهادة فاخرة مطبوعة", "غداء VIP مع المدربة"] }
        ]
    },
    {
        id: 20,
        title: "ورشة الذكاء العاطفي في القيادة",
        instructor: "د. أمل العتيبي",
        startDate: "2025-11-15",
        endDate: "2025-11-16",
        startTime: "09:00",
        endTime: "14:00",
        location: "حضوري",
        city: "أبوظبي",
        country: "الإمارات",
        hotelName: "فندق قصر الإمارات",
        hallName: "قاعة الراية",
        isRecorded: false,
        zoomLink: "",
        description: "دورة تدريبية مكثفة حضورياً تهدف إلى تمكين القادة والمديرين من استخدام مهارات الذكاء العاطفي لتحسين الأداء المؤسسي وبناء فرق عمل متناغمة.",
        topics: ["مكونات الذكاء العاطفي الخمسة", "إدارة الضغوط في بيئة العمل", "فن التحفيز الذاتي والآخرين", "بناء العلاقات المهنية العميقة"],
        isVisible: true,
        price: 1200,
        packages: [
            { id: 2001, name: "المقعد العام", price: 1200, features: ["حضور يومي الورشة", "الحقيبة التدريبية مطبوعة", "شهادة حضور معتمدة", "استراحة قهوة وغداء"] },
            { id: 2002, name: "مقعد VIP", price: 1850, features: ["جلوس في الصفوف الأمامية", "جلسة استشارية خاصة 15 دقيقة", "نسخة موقعة من كتاب دكتور هوب", "كل مميزات المقعد العام"] }
        ]
    },
    {
        id: 15,
        title: "جلسة مباشرة: فن التعامل مع النوايا",
        instructor: "د. أمل العتيبي",
        startDate: todayStr,
        startTime: "20:00",
        location: "أونلاين",
        application: "Zoom",
        country: "الإمارات",
        isRecorded: false,
        zoomLink: "https://zoom.us/j/123456789",
        description: "جلسة تفاعلية مباشرة للإجابة على استفساراتكم حول تطبيق النوايا في الحياة اليومية.",
        topics: ["تجاوز العوائق الذهنية", "الاستمرارية في السعي", "تجليات النوايا"],
        isVisible: true,
        price: 150,
        packages: [{ id: 1501, name: "حضور البث المباشر", price: 150, features: ["رابط حضور مباشر", "تسجيل متاح لمدة 48 ساعة"] }]
    },
    {
        id: 12,
        title: "تخطيط النوايا لعام ٢٠٢٦",
        instructor: "د. أمل العتيبي",
        startDate: "2026-01-01",
        startTime: "20:00",
        location: "أونلاين",
        application: "Zoom",
        country: "الإمارات",
        isRecorded: false,
        zoomLink: "", 
        description: "ورشة عمل تفاعلية لوضع حجر الأساس لعامك القادم. سنتعلم كيفية صياغة النوايا بذكاء، وتجاوز عقبات الماضي، ورسم خارطة طريق واضحة لتحقيق التوازن والنجاح في مختلف جوانب الحياة.",
        topics: ["مراجعة إنجازات العام الماضي", "تقنيات صياغة الأهداف الذكية", "التوازن بين الجوانب الروحية والمادية", "جلسة تأمل واستقبال النوايا"],
        isVisible: true,
        price: 350,
        packages: [{ id: 1201, name: "حضور البث المباشر", price: 350, features: ["رابط حضور مباشر", "نسخة PDF من العرض التقديمي", "تسجيل متاح لمدة أسبوع"] }]
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
        description: "دورة شاملة لكل مربي ومربية تتناول أساليب التعامل الحديثة مع الأطفال وبناء شخصية متزنة.",
        isVisible: true,
        price: 299,
        recordings: [
            { name: "الجزء الأول: فهم نفسية الطفل", url: "https://vimeo.com/123456789" }
        ],
        notes: [{ type: 'file', name: 'ملخص الدورة.pdf', value: '#' }]
    },
    {
        id: 10,
        title: "دورة التحرر من الصدمات (أرشيف)",
        instructor: "د. أمل العتيبي",
        startDate: "2023-05-20",
        startTime: "18:00",
        location: "مسجلة",
        country: "الإمارات",
        isRecorded: true,
        zoomLink: "",
        description: "مجموعة جلسات مسجلة تساعدك على فهم الصدمات النفسية وكيفية التحرر من آثارها العالقة في الجسد والمشاعر.",
        isVisible: true,
        price: 450,
        recordings: [
            { name: "الجلسة الأولى: الوعي بالجسد", url: "https://vimeo.com/123456789" }
        ]
    }
];

const initialProducts: Product[] = [
    { id: 1, name: "أجندة نوايا 2025", price: 150, imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&q=80" },
    { id: 2, name: "كتاب: رحلة الروح", price: 85, imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80" }
];

const initialPartners: Partner[] = [
    { id: '1', name: "دائرة السياحة", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Logo_of_the_Department_of_Culture_and_Tourism_-_Abu_Dhabi.svg/1200px-Logo_of_the_Department_of_Culture_and_Tourism_-_Abu_Dhabi.svg.png", description: "شريك استراتيجي في تنظيم الفعاليات" }
];

const defaultThemeData: ThemeColors = {
    background: { from: '#1a0b2e', to: '#0f051a', balance: 50 },
    button: { from: '#7c3aed', to: '#db2777', balance: 50 },
    card: { from: 'rgba(26, 11, 46, 0.8)', to: 'rgba(15, 5, 26, 0.6)', balance: 50 },
    text: { primary: '#f8fafc', accent: '#d4af37' },
    glow: { color: '#d4af37', intensity: 40 },
};

const initialDrhopeData: DrhopeData = {
    videos: [{id: 'v1', title: 'مقدمة عن الوعي', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'}],
    photos: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80"],
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
    liveWorkshopRefundPolicy: "سياسة الاسترجاع...",
    recordedWorkshopTerms: "شروط المحتوى المسجل..."
};

const testUser: User = {
    id: 999,
    fullName: "مستخدم تجريبي",
    email: "test@nawaya.com",
    phone: "+971501234567",
    isDeleted: false,
    subscriptions: [
        {
            id: "sub-test-0",
            workshopId: 15, // LIVE
            status: SubscriptionStatus.ACTIVE,
            isApproved: true,
            activationDate: new Date().toISOString(),
            expiryDate: "2030-01-01",
            pricePaid: 150
        },
        {
            id: "sub-test-recorded",
            workshopId: 3, // RECORDED WORKSHOP (Positive Parenting)
            status: SubscriptionStatus.ACTIVE,
            isApproved: true,
            activationDate: new Date().toISOString(),
            expiryDate: "2030-01-01",
            pricePaid: 299
        },
        {
            id: "sub-test-1",
            workshopId: 12, 
            status: SubscriptionStatus.ACTIVE,
            isApproved: true,
            activationDate: new Date().toISOString(),
            expiryDate: "2030-01-01",
            pricePaid: 350
        }
    ],
    orders: [],
    notifications: [
        { id: "n1", message: "مرحباً بك في منصة نوايا! تم تفعيل حسابك التجريبي.", timestamp: new Date().toISOString(), read: false }
    ],
    creditTransactions: []
};

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
    users: User[]; 
    globalCertificateTemplate: CertificateTemplate | null;
    login: (email: string, phone: string) => { user?: User; error?: string };
    logout: () => void;
    register: (fullName: string, email: string, phone: string) => User;
    checkRegistrationAvailability: (email: string, phone: string) => { emailUser?: User; phoneUser?: User };
    findUserByCredential: (type: 'email' | 'phone', value: string) => User | null;
    addSubscription: (userId: number, subscriptionData: Partial<Subscription>, isApproved: boolean, sendWhatsApp: boolean, creditToApply?: number) => void;
    placeOrder: (userId: number, order: any, initialStatus?: OrderStatus) => Order;
    addReview: (workshopId: number, review: any) => void;
    addConsultationRequest: (userId: number, subject: string) => void;
    addPendingGift: (giftData: Omit<PendingGift, 'id' | 'createdAt'>) => PendingGift;
    checkAndClaimPendingGifts: (user: User) => number;
    donateToPayItForward: (workshopId: number, amount: number, seats?: number, donorUserId?: number) => void;
    markNotificationsAsRead: () => void;
    updateConsultationRequest: (id: string, data: any) => void;
    updateSubscription: (userId: number, subscriptionId: string, data: Partial<Subscription>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem('nawaya_current_user');
            return saved ? JSON.parse(saved) : null;
        } catch(e) { return null; }
    });

    const [workshops, setWorkshops] = useState<Workshop[]>(() => {
        try {
            const saved = localStorage.getItem('nawaya_workshops');
            if (!saved) return initialWorkshops;
            const parsed: Workshop[] = JSON.parse(saved);
            return parsed.length > 0 ? parsed : initialWorkshops;
        } catch(e) { return initialWorkshops; }
    });

    const [users, setUsers] = useState<User[]>(() => {
        try {
            const saved = localStorage.getItem('nawaya_users');
            const parsed = saved ? JSON.parse(saved) : [];
            if (parsed.length === 0 || !parsed.find((u: any) => u.id === 999)) return [testUser];
            return parsed;
        } catch(e) { return [testUser]; }
    }); 

    const [pendingGifts, setPendingGifts] = useState<PendingGift[]>([]);
    const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
    const [products] = useState<Product[]>(initialProducts);
    const [partners] = useState<Partner[]>(initialPartners);
    const [drhopeData] = useState<DrhopeData>(initialDrhopeData);

    useEffect(() => { localStorage.setItem('nawaya_users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('nawaya_workshops', JSON.stringify(workshops)); }, [workshops]);
    useEffect(() => { 
        if (currentUser) {
            const fresh = users.find(u => u.id === currentUser.id);
            localStorage.setItem('nawaya_current_user', JSON.stringify(fresh || currentUser)); 
        } else {
            localStorage.removeItem('nawaya_current_user');
        }
    }, [currentUser, users]);

    const login = (email: string, phone: string) => {
        const normalizedPhone = normalizePhoneNumber(phone);
        const lowercasedEmail = email.toLowerCase();
        const user = users.find(u => !u.isDeleted && u.email.toLowerCase() === lowercasedEmail && normalizePhoneNumber(u.phone) === normalizedPhone);
        if (user) {
            setCurrentUser(user);
            return { user };
        }
        return { error: 'not_found' };
    };

    const register = (fullName: string, email: string, phone: string): User => {
        const newUser: User = { id: Date.now(), fullName, email, phone, subscriptions: [], orders: [], notifications: [], creditTransactions: [], isDeleted: false };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
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

    const addSubscription = (userId: number, subData: Partial<Subscription>, isApproved: boolean) => {
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                const newSub: Subscription = { id: `sub-${Date.now()}`, workshopId: subData.workshopId!, status: SubscriptionStatus.ACTIVE, isApproved, activationDate: new Date().toISOString(), expiryDate: '2099-12-31', ...subData };
                return { ...user, subscriptions: [...user.subscriptions, newSub] };
            }
            return user;
        }));
    };

    const value = useMemo(() => ({
        currentUser: users.find(u => u.id === currentUser?.id) || null,
        workshops, products, partners, drhopeData, activeTheme: defaultThemeData, notifications: currentUser?.notifications || [], consultationRequests, pendingGifts,
        users, globalCertificateTemplate: null,
        login, logout: () => setCurrentUser(null), register, checkRegistrationAvailability, findUserByCredential,
        addSubscription, 
        placeOrder: (userId: number, orderData: any) => ({ ...orderData, id: '1' }), 
        addReview: () => {}, 
        addConsultationRequest: () => {},
        addPendingGift: (d: any) => d, checkAndClaimPendingGifts: () => 0, donateToPayItForward: () => {},
        markNotificationsAsRead: () => {}, updateConsultationRequest: () => {}, updateSubscription: () => {}
    }), [currentUser, users, workshops, consultationRequests, pendingGifts]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};
