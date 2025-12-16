
// Types for User-Facing Application

export enum Page {
    WORKSHOPS = 'WORKSHOPS',
    PROFILE = 'PROFILE',
    REVIEWS = 'REVIEWS',
    PARTNERS = 'PARTNERS',
    BOUTIQUE = 'BOUTIQUE',
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    REFUNDED = 'REFUNDED',
    TRANSFERRED = 'TRANSFERRED',
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
}

export interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    isDeleted?: boolean;
    ownerId?: number;
    ownerPercentage?: number;
}

export interface Order {
    id: string;
    userId: number;
    products: { productId: number; quantity: number; price: number }[];
    totalAmount: number;
    taxAmount: number;
    status: OrderStatus;
    orderDate: string;
}

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
    workshopId?: number;
}

export interface CreditTransaction {
    id: string;
    date: string;
    type: 'addition' | 'subtraction';
    amount: number;
    description: string;
    isDeleted?: boolean;
}

export interface User {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    subscriptions: Subscription[];
    orders: Order[];
    notifications: Notification[];
    isDeleted?: boolean;
    sessionId?: string;
    internalCredit?: number;
    creditTransactions?: CreditTransaction[];
}

export interface Package {
    id: number;
    name: string;
    price: number;
    discountPrice?: number;
    features: string[];
    paymentLink?: string;
    availability?: {
        endDate?: string;
    };
    attendanceType?: 'أونلاين' | 'حضوري';
}

export interface NoteResource {
    type: 'link' | 'file';
    name: string;
    value: string;
}

export interface Recording {
    name: string;
    url: string;
    accessStartDate?: string;
    accessEndDate?: string;
}

export interface MediaResource {
    type: 'audio' | 'video';
    name: string;
    value: string; 
    notes?: string;
}

export interface RecordingStats {
    progress: number;
    playCount: number;
    lastTimestamp: number;
    firstWatched?: string;
    lastWatched?: string;
}

export interface Review {
    id: string;
    workshopId: number;
    fullName: string;
    rating: number;
    comment: string;
    date: string;
    isDeleted?: boolean;
}

export interface Payment {
    id: string;
    amount: number;
    date: string;
    notes?: string;
}

export interface Workshop {
    id: number;
    isNew?: boolean;
    title: string;
    instructor: string;
    startDate: string;
    endDate?: string;
    startTime: string;
    endTime?: string;
    location: 'أونلاين' | 'حضوري' | 'مسجلة' | 'أونلاين وحضوري';
    country: string;
    city?: string;
    hotelName?: string;
    hallName?: string;
    application?: string;
    isRecorded: boolean;
    zoomLink: string;
    description?: string;
    topics?: string[];
    isVisible: boolean;
    isDeleted?: boolean;
    packages?: Package[];
    price?: number;
    paymentLink?: string;
    recordings?: Recording[];
    notes?: NoteResource[];
    mediaFiles?: MediaResource[];
    reviews?: Review[];
    certificatesIssued?: boolean;
    trainerPercentage?: number;
    trainerPayments?: Payment[];
    payItForwardBalance?: number; 
}

export interface Subscription {
    id: string;
    workshopId: number;
    activationDate: string;
    expiryDate: string;
    pricePaid?: number;
    packageId?: number;
    status: SubscriptionStatus;
    isApproved?: boolean;
    isDeleted?: boolean;
    paymentMethod?: 'BANK' | 'LINK' | 'GIFT' | 'CREDIT';
    transferrerName?: string;
    notes?: string;
    originalWorkshopId?: number;
    transferDate?: string;
    transferMethod?: string;
    refundDate?: string;
    refundMethod?: string;
    recordingStats?: { [key: string]: RecordingStats };
    creditApplied?: number;
    recordingAccessOverrides?: { [recordingUrl: string]: { accessStartDate?: string; accessEndDate?: string } };
    isGift?: boolean;
    isPayItForwardDonation?: boolean;
    donationRemaining?: number; 
    gifterName?: string;
    gifterUserId?: number;
    giftMessage?: string;
    gifterPhone?: string;
    attended?: boolean;
    attendanceType?: 'أونلاين' | 'حضوري';
}

export interface PendingGift {
  id: string;
  workshopId: number;
  packageId?: number;
  attendanceType?: 'أونلاين' | 'حضوري';
  gifterName: string;
  gifterPhone: string;
  gifterEmail: string;
  gifterUserId?: number;
  giftMessage?: string;
  recipientName: string;
  recipientWhatsapp: string;
  pricePaid: number;
  createdAt: string;
  claimedByUserId?: number;
  claimedAt?: string;
  isDeleted?: boolean;
}

export interface SocialMediaLinks {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
    tiktok?: string;
}

export interface ThemeColors {
  background: { from: string; to: string; balance?: number; };
  button: { from: string; to: string; balance?: number; };
  card: { from: string; to: string; balance?: number; };
  text: { primary: string; accent: string; secondary_accent?: string; };
  glow: { color: string; intensity: number; borderWidth?: number; animationSpeed?: number; };
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

export interface ConsultationRequest {
    id: string;
    userId: number;
    subject: string;
    status: 'NEW' | 'APPROVED' | 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED';
    requestedAt: string;
    consultationDate?: string;
    consultationTime?: string;
    durationMinutes?: number;
    fee?: number;
    paymentMethod?: 'CARD' | 'BANK_TRANSFER';
}

export interface DrhopeData {
    videos: { id: string; title: string; url: string }[];
    photos: string[];
    instagramLinks: { id: string; title: string; url: string }[];
    socialMediaLinks: SocialMediaLinks;
    whatsappNumber: string;
    backgroundMusicUrl: string;
    backgroundMusicName: string;
    introText: string;
    logoUrl: string;
    signature?: string;
    cvUrl: string;
    headerLinks: {
        drhope: string;
        reviews: string;
        profile: string;
    };
    accountHolderName?: string;
    bankName?: string;
    ibanNumber?: string;
    accountNumber?: string;
    swiftCode?: string;
    activeThemeId?: string;
    themes?: Theme[];
    consultationSettings?: {
        defaultDurationMinutes: number;
        defaultFee: number;
        consultationsEnabled?: boolean;
    };
    paymentSettings?: {
        cardPaymentsEnabled: boolean;
        bankTransfersEnabled: boolean;
    };
    companyAddress?: string;
    companyPhone?: string;
    taxRegistrationNumber?: string;
    liveWorkshopRefundPolicy?: string;
    recordedWorkshopTerms?: string;
    payItForwardStats?: {
        totalFund: number;
        beneficiariesCount: number;
    };
}

export interface CertificateFieldConfig {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    fontFamily: string;
    maxWidth: number;
}

export type CustomCertificateField = CertificateFieldConfig;

export interface CertificateTemplate {
    imageDataUrl: string;
    imageWidth: number;
    imageHeight: number;
    fields: CustomCertificateField[];
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: string;
  websiteUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
}

export interface PaymentIntent {
    type: 'workshop' | 'consultation' | 'gift' | 'payItForward';
    item: any; 
    pkg?: Package;
    amount?: number;
    recipientDetails?: any;
}
