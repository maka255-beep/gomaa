import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { CreditCardIcon } from '../../components/icons';

interface BankDetailsPageProps {
  showToast: (message: string) => void;
}

const BankDetailsPage: React.FC<BankDetailsPageProps> = ({ showToast }) => {
  const { drhopeData, updateDrhopeData } = useUser();
  
  const [bankName, setBankName] = useState(drhopeData.bankName || '');
  const [ibanNumber, setIbanNumber] = useState(drhopeData.ibanNumber || '');
  const [accountNumber, setAccountNumber] = useState(drhopeData.accountNumber || '');
  const [accountHolderName, setAccountHolderName] = useState(drhopeData.accountHolderName || '');
  const [swiftCode, setSwiftCode] = useState(drhopeData.swiftCode || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setBankName(drhopeData.bankName || '');
    setIbanNumber(drhopeData.ibanNumber || '');
    setAccountNumber(drhopeData.accountNumber || '');
    setAccountHolderName(drhopeData.accountHolderName || '');
    setSwiftCode(drhopeData.swiftCode || '');
    setHasChanges(false);
  }, [drhopeData]);

  const handleSaveChanges = () => {
    updateDrhopeData({
      bankName,
      ibanNumber,
      accountNumber,
      accountHolderName,
      swiftCode,
    });
    setHasChanges(false);
    showToast('تم حفظ تفاصيل الحساب البنكي بنجاح.');
  };

  const handleCancelChanges = () => {
    setBankName(drhopeData.bankName || '');
    setIbanNumber(drhopeData.ibanNumber || '');
    setAccountNumber(drhopeData.accountNumber || '');
    setAccountHolderName(drhopeData.accountHolderName || '');
    setSwiftCode(drhopeData.swiftCode || '');
    setHasChanges(false);
  };
  
  const inputClass = "w-full p-2 bg-indigo-900/40 border border-slate-600 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 text-sm text-white font-semibold placeholder:text-slate-400/70 ltr-input";
  const sectionClass = "bg-black/20 p-6 rounded-xl border border-slate-700/50";
  const sectionHeaderClass = "text-lg font-bold text-fuchsia-300 mb-4 border-b border-fuchsia-500/20 pb-3 flex items-center gap-x-3";

  return (
    <div>
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-white">إدارة تفاصيل الحساب البنكي</h2>
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
          <span>تفاصيل الحساب البنكي</span>
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          هذه المعلومات ستظهر للمستخدمين عند اختيار طريقة الدفع "تحويل بنكي".
        </p>
        <div className="space-y-6 max-w-lg mx-auto">
          <div>
            <label htmlFor="accountHolderName" className="block mb-2 text-sm font-semibold text-white">اسم صاحب الحساب</label>
            <input
              id="accountHolderName"
              type="text"
              value={accountHolderName}
              onChange={(e) => { setAccountHolderName(e.target.value); setHasChanges(true); }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="bankName" className="block mb-2 text-sm font-semibold text-white">اسم البنك</label>
            <input
              id="bankName"
              type="text"
              value={bankName}
              onChange={(e) => { setBankName(e.target.value); setHasChanges(true); }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ibanNumber" className="block mb-2 text-sm font-semibold text-white">رقم IBAN</label>
            <input
              id="ibanNumber"
              type="text"
              value={ibanNumber}
              onChange={(e) => { setIbanNumber(e.target.value); setHasChanges(true); }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="accountNumber" className="block mb-2 text-sm font-semibold text-white">رقم الحساب</label>
            <input
              id="accountNumber"
              type="text"
              value={accountNumber}
              onChange={(e) => { setAccountNumber(e.target.value); setHasChanges(true); }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="swiftCode" className="block mb-2 text-sm font-semibold text-white">SWIFT</label>
            <input
              id="swiftCode"
              type="text"
              value={swiftCode}
              onChange={(e) => { setSwiftCode(e.target.value); setHasChanges(true); }}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsPage;