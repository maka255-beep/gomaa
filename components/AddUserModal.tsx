
import React, { useState } from 'react';
import { CloseIcon, UserAddIcon } from './icons';
import { GULF_COUNTRIES, ARAB_COUNTRIES } from '../constants';
import { useUser } from '../context/UserContext';
import { toEnglishDigits } from '../utils';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addUser, checkRegistrationAvailability } = useUser();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');

  if (!isOpen) return null;
  
  const fullPhoneNumber = selectedCountryCode === 'OTHER' ? phone : selectedCountryCode + phone;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();

    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setError('يرجى إدخال الاسم الثنائي على الأقل.');
      return;
    }
    
    if (!selectedCountryCode) {
        setError('يرجى اختيار كود الدولة.');
        return;
    }
    
    const isGulfOrArab = [...GULF_COUNTRIES, ...ARAB_COUNTRIES].some(
      (country) => country.code === selectedCountryCode
    );
    if (isGulfOrArab && phone.length < 8) {
      setError('رقم الهاتف قصير جداً.');
      return;
    }

    const { emailUser, phoneUser } = checkRegistrationAvailability(email, fullPhoneNumber);
    if (emailUser) {
        setError('هذا الايميل مسجل لدينا');
        return;
    }
    if (phoneUser) {
        setError('هذا الرقم مسجل لدينا');
        return;
    }

    setError('');
    addUser(fullName, email, fullPhoneNumber);
    onSuccess('تمت إضافة المستفيد بنجاح!');
    onClose();
  };
  
  const inputClass = "w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white placeholder-slate-400 transition-all text-sm";
  const labelClass = "block mb-1.5 text-xs font-bold text-fuchsia-300";
  
  const isPhoneDisabled = !selectedCountryCode;

  const phoneInputSection = (
    <div>
      <label className={labelClass}>رقم الهاتف</label>
      <div className="space-y-2">
        <select
          value={selectedCountryCode}
          onChange={e => {
            setSelectedCountryCode(e.target.value);
            setPhone(''); 
          }}
          className={inputClass}
        >
          <option value="" disabled>اختر الدولة</option>
          <optgroup label="دول الخليج">
            {GULF_COUNTRIES.map(country => (
              <option key={country.name} value={country.code}>
                {country.flag} {country.name} ({country.code})
              </option>
            ))}
          </optgroup>
          <optgroup label="دول عربية أخرى">
            {ARAB_COUNTRIES.map(country => (
              <option key={country.name} value={country.code}>
                {country.flag} {country.name} ({country.code})
              </option>
            ))}
          </optgroup>
          <optgroup label="باقي دول العالم">
             <option value="OTHER">🌍 باقي دول العالم</option>
          </optgroup>
        </select>
        <input 
            type="tel" 
            value={phone} 
            onChange={e => {
                const englishDigits = toEnglishDigits(e.target.value);
                setPhone(englishDigits.replace(/[^0-9]/g, ''));
            }}
            className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed ltr-input`}
            required 
            disabled={isPhoneDisabled}
            placeholder="5xxxxxxx"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-60 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#2e0235] via-[#3b0764] to-[#4c1d95] text-white rounded-2xl shadow-2xl w-full max-w-lg border border-fuchsia-500/30 flex flex-col animate-fade-in-up">
        <header className="p-5 flex justify-between items-center border-b border-white/10 bg-black/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserAddIcon className="w-6 h-6 text-fuchsia-400" />
            إضافة مستفيد جديد
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-6 h-6" /></button>
        </header>
        <form onSubmit={handleAddUser} className="p-6 space-y-5">
          {error && <p className="text-red-300 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/20 text-center font-bold">{error}</p>}

          <div>
            <label className={labelClass}>الاسم الكامل</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} required placeholder="الاسم الأول واسم العائلة" />
          </div>
          <div>
            <label className={labelClass}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required placeholder="email@example.com" />
          </div>
          {phoneInputSection}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="py-2.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm transition-colors">
              إلغاء
            </button>
            <button type="submit" className="py-2.5 px-8 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-900/30 transition-transform transform hover:scale-105">
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
