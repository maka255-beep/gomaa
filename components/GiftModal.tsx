
import React, { useState } from 'react';
import { Workshop, Package } from '../types';
import { useUser } from '../context/UserContext';
import { CloseIcon } from './icons';
import { GULF_COUNTRIES, ARAB_COUNTRIES } from '../constants';
import { toEnglishDigits, normalizePhoneNumber } from '../utils';

interface GiftModalProps {
  workshop: Workshop;
  selectedPackage: Package | null;
  onClose: () => void;
  onProceedToPayment: (details: { recipientName: string, recipientWhatsapp: string, giftMessage: string, totalAmount: number }) => void;
}

const GiftModal: React.FC<GiftModalProps> = ({ workshop, selectedPackage, onClose, onProceedToPayment }) => {
    const { currentUser } = useUser();
    
    // Recipient states
    const [recipientName, setRecipientName] = useState('');
    const [recipientWhatsapp, setRecipientWhatsapp] = useState('');
    const [recipientCountryCode, setRecipientCountryCode] = useState('');
    
    const [giftMessage, setGiftMessage] = useState('');
    const [error, setError] = useState('');

    const price = selectedPackage?.discountPrice ?? selectedPackage?.price ?? workshop.price ?? 0;

    const handleProceed = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!recipientName.trim() || !recipientWhatsapp.trim() || !recipientCountryCode) {
            setError('يرجى إدخال بيانات المستلم كاملة.');
            return;
        }
        
        const finalRecipientWhatsapp = recipientCountryCode === 'OTHER' ? recipientWhatsapp : recipientCountryCode + recipientWhatsapp;

        if (currentUser) {
            const normalizedGifterPhone = normalizePhoneNumber(currentUser.phone);
            const normalizedRecipientPhone = normalizePhoneNumber(finalRecipientWhatsapp);
            if (normalizedGifterPhone === normalizedRecipientPhone) {
                setError('لا يمكنك إهداء الورشة لنفسك. يرجى إدخال رقم هاتف المستلم الصحيح.');
                return;
            }
        }

        onProceedToPayment({
            recipientName,
            recipientWhatsapp: finalRecipientWhatsapp,
            giftMessage,
            totalAmount: price,
        });
    };

    const inputClass = "w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white placeholder-slate-400 transition-all text-sm";
    const labelClass = "block mb-1.5 text-xs font-bold text-fuchsia-300";

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-60 p-4 backdrop-blur-sm">
            <form onSubmit={handleProceed} className="bg-gradient-to-br from-[#2e0235] via-[#3b0764] to-[#4c1d95] text-slate-200 rounded-2xl shadow-2xl w-full max-w-lg border border-fuchsia-500/30 flex flex-col max-h-[90vh]">
                <header className="p-5 flex justify-between items-center border-b border-white/10 flex-shrink-0 bg-black/20">
                    <h2 className="text-xl font-bold text-white">إهداء ورشة: {workshop.title}</h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-6 h-6" /></button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30">
                        <p className="text-sm text-green-200 font-medium leading-relaxed">
                            ✨ <strong>جديد:</strong> سيتم ربط الهدية برقم هاتف المستلم تلقائياً!
                            لن يحتاج لروابط معقدة، فقط أخبره أن الهدية بانتظاره عند تسجيل الدخول برقم هاتفه.
                        </p>
                    </div>
                    
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-sm font-bold text-white mb-2 border-b border-white/10 pb-2">بيانات المستلم</h3>
                        <div>
                            <label className={labelClass} htmlFor="recipientName">اسم المستلم</label>
                            <input type="text" id="recipientName" value={recipientName} onChange={e => setRecipientName(e.target.value)} className={inputClass} required placeholder="الاسم الثنائي..." />
                        </div>
                        <div>
                            <label className={labelClass}>رقم واتساب المستلم (مهم جداً للربط)</label>
                            <div className="flex gap-2">
                                <select value={recipientCountryCode} onChange={e => setRecipientCountryCode(e.target.value)} className={`${inputClass} w-32`} required>
                                    <option value="" disabled>الدولة</option>
                                    <optgroup label="دول الخليج">{GULF_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</optgroup>
                                    <optgroup label="دول عربية أخرى">{ARAB_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</optgroup>
                                    <optgroup label="باقي دول العالم"><option value="OTHER">🌍 أخرى</option></optgroup>
                                </select>
                                <input type="tel" value={recipientWhatsapp} onChange={e => setRecipientWhatsapp(toEnglishDigits(e.target.value).replace(/\D/g, ''))} className={`${inputClass} ltr-input flex-grow`} placeholder={recipientCountryCode === 'OTHER' ? "2XXXXXX" : "5XXXXXXX"} required disabled={!recipientCountryCode}/>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>رسالة إهداء (اختياري)</label>
                        <textarea value={giftMessage} onChange={e => setGiftMessage(e.target.value)} rows={3} className={inputClass} placeholder="اكتب رسالتك هنا..."></textarea>
                    </div>

                    {error && <p className="text-sm text-red-300 bg-red-900/20 p-3 rounded-lg border border-red-500/20 text-center">{error}</p>}
                </div>

                <footer className="p-5 flex-shrink-0 bg-black/20 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="text-center sm:text-right">
                        <p className="text-xs text-slate-400 font-medium">إجمالي الدفع</p>
                        <p className="text-2xl font-bold text-white">{price.toFixed(2)} <span className="text-sm font-normal text-fuchsia-300">درهم</span></p>
                    </div>
                    <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-fuchsia-900/40 transition-transform transform hover:scale-105 border border-fuchsia-500/20">
                        الانتقال إلى الدفع
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default GiftModal;
