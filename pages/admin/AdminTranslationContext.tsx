import React, { useState, useCallback, createContext, useContext } from 'react';

const translations = {
  ar: {
    sidebar: {
        userManagement: 'إدارة المشتركين',
        workshopManagement: 'إدارة الورش',
        subscriptions: 'الاشتراكات',
        certificates: 'الشهادات',
        financialCenter: 'المركز المالي',
        generalContent: 'ادارة المحتوى العام',
        broadcast: 'التواصل (Broadcast)',
        boutiqueManagement: 'إدارة البوتيك',
        userActivity: 'نشاط المشترك',
    },
    adminHeader: {
      title: 'لوحة التحكم'
    },
    userManagement: {
        title: 'إدارة المشتركين',
        searchPlaceholder: 'ابحث عن مشترك بالاسم, الايميل, أو الهاتف...',
        export: 'تصدير',
        newUser: 'مشترك جديد',
        activeUsers: 'المشتركون النشطون',
        trash: 'سلة المهملات',
        fullName: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        workshopsSubscribed: 'عدد الورش',
        actions: 'الإجراءات',
        viewProfile: 'عرض الملف الشخصي',
        resetPasskey: 'إعادة تعيين الدخول بالبصمة',
        editUser: 'تعديل بيانات المستفيد',
        moveToTrash: 'نقل إلى سلة المهملات',
        restore: 'استعادة',
        deletePermanently: 'حذف نهائي',
        noResults: 'لم يتم العثور على مشتركين يطابقون بحثك.',
        emptyActive: 'لا يوجد مستخدمون نشطون.',
        emptyTrash: 'سلة المهملات فارغة.',
    },
     workshopManagement: {
      title: 'Workshop Management',
      export: 'Export',
      newWorkshop: 'New Workshop',
      activeWorkshops: 'Active Workshops',
      trash: 'Trash',
      workshopTitle: 'Workshop Title',
      instructor: 'Instructor',
      date: 'Date',
      location: 'Workshop Type',
      subscribers: 'Subscribers',
      status: 'Status',
      actions: 'Actions',
      visible: 'Visible (Click to hide)',
      hidden: 'Hidden (Click to show)',
      edit: 'Edit',
      moveToTrash: 'Move to Trash',
      restore: 'Restore',
      deletePermanently: 'Delete Permanently',
    },
    subscriptions: {
        title: 'الاشتراكات',
        newSubscription: 'اشتراك جديد',
        pendingApprovals: 'موافقات معلقة',
        totalSubscriptions: 'إجمالي الاشتراكات',
        totalTransfers: 'إجمالي التحويلات',
        totalRefunds: 'إجمالي المسترد',
        totalCreditBalances: 'تفاصيل أرصدة المشتركين',
        searchPlaceholder: 'بحث شامل بالاسم, الايميل, الهاتف, الورشة, الحالة...',
        filterByWorkshop: 'فلتر حسب الورشة',
        allWorkshops: 'كل الورشات',
        export: 'تصدير',
        all: 'الكل',
        trash: 'سلة المهملات',
    },
    certificates: {
        title: 'إدارة الشهادات',
        issuedWorkshops: 'الورش التي تم إصدار شهادات لها حالياً',
        noIssuedWorkshops: 'لا توجد ورش تم إصدار شهادات لها حالياً.',
        selectWorkshop: 'اختر الورشة',
        statusTitle: 'حالة إصدار الشهادات لورشة:',
        issued: 'الشهادات مُصدرة حالياً.',
        notIssued: 'الشهادات غير مُصدرة.',
        cancelIssuance: 'إلغاء إصدار الشهادات',
        issueNow: 'إصدار الشهادات الآن',
    },
    financialCenter: {
        title: 'المركز المالي',
        workshopReports: 'التقارير المالية للورش',
        boutiqueSummary: 'ملخص إيرادات البوتيك',
        expensesAndTaxes: 'المصروفات والضرائب',
    },
    generalContent: {
        title: 'ادارة المحتوى العام',
        generalSettings: 'إعدادات عامة',
        siteColors: 'ألوان الموقع',
        consultationsManagement: 'إدارة الاستشارات',
        partners: 'شركاء النجاح',
        reviewsManagement: 'إدارة الآراء',
        drhopeContent: 'محتوى DRHOPE',
    },
    broadcast: {
        title: 'التواصل (Broadcast)',
        history: 'سجل الرسائل المرسلة',
        email: 'بريد إلكتروني',
        notification: 'إشعار داخل المنصة',
        whatsapp: 'واتساب',
    },
    boutiqueManagement: {
        title: 'إدارة البوتيك',
        manageProducts: 'إدارة المنتجات',
        manageOrders: 'إدارة الطلبات',
    },
    userActivity: {
        title: 'نشاط المشترك',
    },
    common: {
        save: 'حفظ',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        delete: 'حذف',
        edit: 'تعديل',
        actions: 'الإجراءات',
        status: 'الحالة',
        search: 'بحث',
        previous: 'السابق',
        next: 'التالي',
        page: 'صفحة',
        from: 'من',
    }
  },
  en: {
    sidebar: {
        userManagement: 'User Management',
        workshopManagement: 'Workshop Management',
        subscriptions: 'Subscriptions',
        certificates: 'Certificates',
        financialCenter: 'Financial Center',
        generalContent: 'General Content',
        broadcast: 'Broadcast',
        boutiqueManagement: 'Boutique Management',
        userActivity: 'User Activity',
    },
    adminHeader: {
      title: 'Admin Panel'
    },
    userManagement: {
        title: 'User Management',
        searchPlaceholder: 'Search by name, email, or phone...',
        export: 'Export',
        newUser: 'New User',
        activeUsers: 'Active Users',
        trash: 'Trash',
        fullName: 'Full Name',
        email: 'Email',
        phone: 'Phone',
        workshopsSubscribed: 'Subscribed Workshops',
        actions: 'Actions',
        viewProfile: 'View Profile',
        resetPasskey: 'Reset Passkey',
        editUser: 'Edit User',
        moveToTrash: 'Move to Trash',
        restore: 'Restore',
        deletePermanently: 'Delete Permanently',
        noResults: 'No users match your search.',
        emptyActive: 'No active users.',
        emptyTrash: 'Trash is empty.',
    },
     workshopManagement: {
      title: 'Workshop Management',
      export: 'Export',
      newWorkshop: 'New Workshop',
      activeWorkshops: 'Active Workshops',
      trash: 'Trash',
      workshopTitle: 'Workshop Title',
      instructor: 'Instructor',
      date: 'Date',
      location: 'Workshop Type',
      subscribers: 'Subscribers',
      status: 'Status',
      actions: 'Actions',
      visible: 'Visible (Click to hide)',
      hidden: 'Hidden (Click to show)',
      edit: 'Edit',
      moveToTrash: 'Move to Trash',
      restore: 'Restore',
      deletePermanently: 'Delete Permanently',
    },
    subscriptions: {
        title: 'Subscriptions',
        newSubscription: 'New Subscription',
        pendingApprovals: 'Pending Approvals',
        totalSubscriptions: 'Total Subscriptions',
        totalTransfers: 'Total Transfers',
        totalRefunds: 'Total Refunds',
        totalCreditBalances: 'User Credit Details',
        searchPlaceholder: 'Search by name, email, phone, workshop, status...',
        filterByWorkshop: 'Filter by Workshop',
        allWorkshops: 'All Workshops',
        export: 'Export',
        all: 'All',
        trash: 'Trash',
    },
    certificates: {
        title: 'Certificate Management',
        issuedWorkshops: 'Workshops with Issued Certificates',
        noIssuedWorkshops: 'No workshops currently have certificates issued.',
        selectWorkshop: 'Select Workshop',
        statusTitle: 'Certificate Issuance Status for:',
        issued: 'Certificates are currently issued.',
        notIssued: 'Certificates are not issued.',
        cancelIssuance: 'Cancel Issuance',
        issueNow: 'Issue Certificates Now',
    },
    financialCenter: {
        title: 'Financial Center',
        workshopReports: 'Workshop Financials',
        boutiqueSummary: 'Boutique Revenue',
        expensesAndTaxes: 'Expenses & Taxes',
    },
    generalContent: {
        title: 'General Content Management',
        generalSettings: 'General Settings',
        siteColors: 'Site Colors',
        consultationsManagement: 'Consultations Mgt.',
        partners: 'Partners',
        reviewsManagement: 'Reviews Management',
        drhopeContent: 'DRHOPE Content',
    },
    broadcast: {
        title: 'Broadcast',
        history: 'Broadcast History',
        email: 'Email',
        notification: 'In-App Notification',
        whatsapp: 'WhatsApp',
    },
    boutiqueManagement: {
        title: 'Boutique Management',
        manageProducts: 'Manage Products',
        manageOrders: 'Manage Orders',
    },
    userActivity: {
        title: 'User Activity',
    },
    common: {
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        actions: 'Actions',
        status: 'Status',
        search: 'Search',
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        from: 'of',
    }
  }
};

// FIX: Add language state management to the context
type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Fallback to key
      }
    }
    if (typeof result === 'string') {
        return result;
    }
    return key; // Fallback if path doesn't lead to a string
  }, [language]);

  const value = { language, setLanguage, t };
  
  return (
    <LanguageContext.Provider value={value}>
        {children}
    </LanguageContext.Provider>
  );
};

export const useAdminTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useAdminTranslation must be used within a LanguageProvider');
    }
    return context;
};