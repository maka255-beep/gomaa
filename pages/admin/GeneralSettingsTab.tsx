import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { DrhopeData } from '../../types';
import { CogIcon } from '../../components/icons';
import { fileToDataUrl } from '../../utils';

interface GeneralSettingsTabProps {
    showToast: (message: string) => void;
}

const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({ showToast }) => {
    const { drhopeData, updateDrhopeData } = useUser();
    const [localData, setLocalData] = useState<DrhopeData>(drhopeData);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalData(drhopeData);
        setHasChanges(false);
    }, [drhopeData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalData(prev => ({ ...prev, [name]: value }));
        setHasChanges(true);
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalData(prev => ({
            ...prev,
            socialMediaLinks: {
                ...prev.socialMediaLinks,
                [name]: value,
            },
        }));
        setHasChanges(true);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          if (file.size > 1 * 1024 * 1024) { // 1MB limit for logo
            showToast('حجم الشعار كبير جداً. الحد الأقصى 1 ميجابايت.');
            return;
          }
          try {
            const dataUrl = await fileToDataUrl(file);
            setLocalData(prev => ({ ...prev, logoUrl: dataUrl }));
            setHasChanges(true);
          } catch (error) {
            showToast('فشل في قراءة ملف الشعار.');
          }
        }
    };

    const handleSaveChanges = () => {
        updateDrhopeData(localData);
        setHasChanges(false);
        showToast('تم حفظ الإعدادات العامة بنجاح.');
    };

    const handleCancelChanges = () => {
        setLocalData(drhopeData);
        setHasChanges(false);
    };

    const inputClass = "w-full p-2 bg-slate-800/60 border border-slate-700 rounded-md text-sm ltr-input";
    const labelClass = "block mb-1 text-sm font-bold text-fuchsia-300";
    const sectionClass = "bg-black/20 p-6 rounded-xl border border-slate-700/50";
    const sectionHeaderClass = "text-lg font-bold text-fuchsia-300 mb-4 border-b border-fuchsia-500/20 pb-3 flex items-center gap-x-3";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">الإعدادات العامة</h3>
                {hasChanges && (
                    <div className="flex gap-4">
                        <button onClick={handleCancelChanges} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-bold text-sm">إلغاء</button>
                        <button onClick={handleSaveChanges} className="py-2 px-4 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-sm">حفظ التغييرات</button>
                    </div>
                )}
            </div>

            <div className={sectionClass}>
                 <h4 className={sectionHeaderClass}><CogIcon className="w-6 h-6"/><span>الإعدادات الأساسية</span></h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="introText" className={labelClass}>النص الترحيبي</label>
                        <input id="introText" name="introText" value={localData.introText || ''} onChange={handleChange} className={inputClass + ' !text-right !direction-rtl'} />
                    </div>
                    <div>
                        <label htmlFor="logoUrl" className={labelClass}>شعار المنصة (Logo)</label>
                        <div className="flex items-center gap-x-4 mt-2">
                            {localData.logoUrl && (
                                <img src={localData.logoUrl} alt="Logo Preview" className="w-16 h-16 object-contain rounded-full bg-white/10 p-1 flex-shrink-0"/>
                            )}
                            <div className="flex-grow space-y-2">
                                <input 
                                    id="logoUrl" 
                                    name="logoUrl" 
                                    value={localData.logoUrl || ''} 
                                    onChange={handleChange} 
                                    className={inputClass}
                                    placeholder="أو الصق رابط الشعار هنا"
                                />
                                <input 
                                    id="logoUpload" 
                                    type="file" 
                                    onChange={handleLogoUpload} 
                                    accept="image/*" 
                                    className="w-full text-sm text-slate-300 file:mr-4 file:py-1.5 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-50 file:text-fuchsia-700 hover:file:bg-fuchsia-200"
                                />
                            </div>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="whatsappNumber" className={labelClass}>رقم الواتساب</label>
                        <input id="whatsappNumber" name="whatsappNumber" value={localData.whatsappNumber || ''} onChange={handleChange} className={inputClass} placeholder="+966..." />
                    </div>
                 </div>
            </div>
            
             <div className={sectionClass}>
                <h4 className={sectionHeaderClass}><span>بيانات الشركة (للفواتير)</span></h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="companyAddress" className={labelClass}>عنوان الشركة</label>
                        <input id="companyAddress" name="companyAddress" value={localData.companyAddress || ''} onChange={handleChange} className={inputClass + ' !text-right !direction-rtl'} />
                    </div>
                    <div>
                        <label htmlFor="companyPhone" className={labelClass}>هاتف الشركة</label>
                        <input id="companyPhone" name="companyPhone" value={localData.companyPhone || ''} onChange={handleChange} className={inputClass} />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="taxRegistrationNumber" className={labelClass}>الرقم الضريبي (TRN)</label>
                        <input id="taxRegistrationNumber" name="taxRegistrationNumber" value={localData.taxRegistrationNumber || ''} onChange={handleChange} className={inputClass} />
                    </div>
                 </div>
            </div>

             <div className={sectionClass}>
                <h4 className={sectionHeaderClass}><span>سياسات الورش</span></h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="liveWorkshopRefundPolicy" className={labelClass}>سياسة الاسترجاع للورش المباشرة</label>
                        <textarea 
                            id="liveWorkshopRefundPolicy" 
                            name="liveWorkshopRefundPolicy" 
                            value={localData.liveWorkshopRefundPolicy || ''} 
                            onChange={handleChange} 
                            className={inputClass + ' !text-right !direction-rtl'} 
                            rows={5}
                        />
                    </div>
                    <div>
                        <label htmlFor="recordedWorkshopTerms" className={labelClass}>الشروط العامة للورش المسجلة</label>
                        <textarea 
                            id="recordedWorkshopTerms" 
                            name="recordedWorkshopTerms" 
                            value={localData.recordedWorkshopTerms || ''} 
                            onChange={handleChange} 
                            className={inputClass + ' !text-right !direction-rtl'} 
                            rows={5}
                        />
                    </div>
                 </div>
            </div>

            <div className={sectionClass}>
                <h4 className={sectionHeaderClass}><span>روابط التواصل الاجتماعي</span></h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="instagram" className={labelClass}>Instagram</label>
                        <input id="instagram" name="instagram" value={localData.socialMediaLinks?.instagram || ''} onChange={handleSocialChange} className={inputClass} />
                    </div>
                     <div>
                        <label htmlFor="twitter" className={labelClass}>Twitter (X)</label>
                        <input id="twitter" name="twitter" value={localData.socialMediaLinks?.twitter || ''} onChange={handleSocialChange} className={inputClass} />
                    </div>
                     <div>
                        <label htmlFor="facebook" className={labelClass}>Facebook</label>
                        <input id="facebook" name="facebook" value={localData.socialMediaLinks?.facebook || ''} onChange={handleSocialChange} className={inputClass} />
                    </div>
                     <div>
                        <label htmlFor="snapchat" className={labelClass}>Snapchat</label>
                        <input id="snapchat" name="snapchat" value={localData.socialMediaLinks?.snapchat || ''} onChange={handleSocialChange} className={inputClass} />
                    </div>
                     <div>
                        <label htmlFor="tiktok" className={labelClass}>TikTok</label>
                        <input id="tiktok" name="tiktok" value={localData.socialMediaLinks?.tiktok || ''} onChange={handleSocialChange} className={inputClass} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettingsTab;