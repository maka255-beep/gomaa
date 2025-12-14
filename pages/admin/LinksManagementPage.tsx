
import React, { useState } from 'react';
import { useAdminTranslation } from './AdminTranslationContext';
import { CreditCardIcon, UsersIcon, ChatBubbleLeftRightIcon, LinkIcon, CogIcon, PhotographIcon, LightBulbIcon, ChatBubbleIcon, BanknotesIcon } from '../../components/icons';

// Direct Imports
import DrHopePage from './DrHopePage';
import BankDetailsPage from './BankDetailsPage';
import ConsultationManagementTab from './ConsultationManagementTab';
import ReviewManagementPage from './ReviewManagementPage';
import GeneralSettingsTab from './GeneralSettingsTab';
import SiteColorsTab from './SiteColorsTab';
import PartnersManagementTab from './PartnersManagementTab';
import PaymentSettingsTab from './PaymentSettingsTab';


interface LinksManagementPageProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

type GeneralContentTab = 'general' | 'siteColors' | 'consultations' | 'partners' | 'reviews' | 'drhope' | 'bank' | 'paymentSettings';

const LinksManagementPage: React.FC<LinksManagementPageProps> = ({ showToast }) => {
    const { t } = useAdminTranslation();
    const [activeTab, setActiveTab] = useState<GeneralContentTab>('general');

    const renderTabContent = () => {
        return (
            <>
                {activeTab === 'general' && <GeneralSettingsTab showToast={showToast} />}
                {activeTab === 'siteColors' && <SiteColorsTab showToast={showToast} />}
                {activeTab === 'consultations' && <ConsultationManagementTab />}
                {activeTab === 'partners' && <PartnersManagementTab showToast={showToast} />}
                {activeTab === 'reviews' && <ReviewManagementPage showToast={showToast} />}
                {activeTab === 'drhope' && <DrHopePage showToast={showToast} />}
                {activeTab === 'bank' && <BankDetailsPage showToast={showToast} />}
                {activeTab === 'paymentSettings' && <PaymentSettingsTab showToast={showToast} />}
            </>
        )
    };
    
    const tabButtonClass = (tabName: GeneralContentTab) => 
    `py-3 px-4 text-sm font-bold border-b-2 flex items-center gap-x-2 ${
      activeTab === tabName ? 'text-white border-fuchsia-500' : 'text-slate-400 border-transparent hover:text-white'
    }`;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-x-3">
                <LinkIcon className="w-7 h-7 text-fuchsia-300" />
                <span>{t('generalContent.title')}</span>
            </h2>
            
            <div className="border-b border-slate-700/50">
                <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2">
                    <button onClick={() => setActiveTab('general')} className={tabButtonClass('general')}>
                       <CogIcon className="w-5 h-5"/><span>{t('generalContent.generalSettings')}</span>
                    </button>
                    <button onClick={() => setActiveTab('siteColors')} className={tabButtonClass('siteColors')}>
                       <LightBulbIcon className="w-5 h-5"/><span>{t('generalContent.siteColors')}</span>
                    </button>
                    <button onClick={() => setActiveTab('consultations')} className={tabButtonClass('consultations')}>
                       <ChatBubbleLeftRightIcon className="w-5 h-5"/><span>{t('generalContent.consultationsManagement')}</span>
                    </button>
                    <button onClick={() => setActiveTab('partners')} className={tabButtonClass('partners')}>
                       <UsersIcon className="w-5 h-5"/><span>{t('generalContent.partners')}</span>
                    </button>
                    <button onClick={() => setActiveTab('reviews')} className={tabButtonClass('reviews')}>
                       <ChatBubbleIcon className="w-5 h-5"/><span>{t('generalContent.reviewsManagement')}</span>
                    </button>
                    <button onClick={() => setActiveTab('drhope')} className={tabButtonClass('drhope')}>
                       <PhotographIcon className="w-5 h-5"/><span>{t('generalContent.drhopeContent')}</span>
                    </button>
                     <button onClick={() => setActiveTab('bank')} className={tabButtonClass('bank')}>
                       <BanknotesIcon className="w-5 h-5"/><span>تفاصيل الحساب البنكي</span>
                    </button>
                     <button onClick={() => setActiveTab('paymentSettings')} className={tabButtonClass('paymentSettings')}>
                       <CreditCardIcon className="w-5 h-5"/><span>إعدادات الدفع</span>
                    </button>
                </nav>
            </div>
            
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default LinksManagementPage;
