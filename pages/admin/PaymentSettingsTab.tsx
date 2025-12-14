import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { CreditCardIcon } from '../../components/icons';

interface PaymentSettingsTabProps {
  showToast: (message: string) => void;
}

const PaymentSettingsTab: React.FC<PaymentSettingsTabProps> = ({ showToast }) => {
  const { drhopeData, updateDrhopeData } = useUser();
  
  const [cardEnabled, setCardEnabled] = useState(drhopeData.paymentSettings?.cardPaymentsEnabled ?? true);
  const [bankEnabled, setBankEnabled] = useState(drhopeData.paymentSettings?.bankTransfersEnabled ?? true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setCardEnabled(drhopeData.paymentSettings?.cardPaymentsEnabled ?? true);
    setBankEnabled(drhopeData.paymentSettings?.bankTransfersEnabled ?? true);
    setHasChanges(false);
  }, [drhopeData]);

  const handleSaveChanges = () => {
    updateDrhopeData({
      paymentSettings: {
        cardPaymentsEnabled: cardEnabled,
        bankTransfersEnabled: bankEnabled,
      }
    });
    setHasChanges(false);
    showToast('تم حفظ إعدادات الدفع بنجاح.');
  };

  const handleCancelChanges = () => {
    setCardEnabled(drhopeData.paymentSettings?.cardPaymentsEnabled ?? true);
    setBankEnabled(drhopeData.paymentSettings?.bankTransfersEnabled ?? true);
    setHasChanges(false);
  };
  
  const sectionClass = "bg-black/20 p-6 rounded-xl border border-slate-700/50";
  const sectionHeaderClass = "text-lg font-bold text-fuchsia-300 mb-4 border-b border-fuchsia-500/20 pb-3 flex items-center gap-x-3";

  return (
    <div>
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-white">إدارة طرق الدفع</h2>
        {hasChanges && (
            <div className="flex gap-4">
                <button onClick={handleCancelChanges} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-bold text-sm">إلغاء</button>
                <button onClick={handleSaveChanges} className="py-2 px-4 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-bold text-sm">حفظ التغييرات</button>
            </div>
        )}
      </header>
      
      <div className={sectionClass}>
        <h3 className={sectionHeaderClass}>
          <CreditCardIcon className="w-6 h-6" />
          <span>تفعيل/إلغاء تفعيل طرق الدفع</span>
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          استخدم هذه الإعدادات لإظهار أو إخفاء خيارات الدفع المتاحة للمستخدمين في صفحة الدفع.
        </p>
        <div className="space-y-4 max-w-md">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="font-bold">الدفع بالبطاقة البنكية</span>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={cardEnabled} onChange={() => { setCardEnabled(p => !p); setHasChanges(true); }} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                </label>
            </div>
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="font-bold">الدفع بالتحويل البنكي</span>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={bankEnabled} onChange={() => { setBankEnabled(p => !p); setHasChanges(true); }} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                </label>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsTab;