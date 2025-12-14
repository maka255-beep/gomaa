
import React, { useState } from 'react';
import { CloseIcon, ChatBubbleIcon } from './icons';
import { useUser } from '../context/UserContext';

interface ConsultationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ConsultationRequestModal: React.FC<ConsultationRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, drhopeData, addConsultationRequest } = useUser();
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');

  const settings = drhopeData.consultationSettings || { defaultDurationMinutes: 50, defaultFee: 450, consultationsEnabled: true };
  const consultationsEnabled = settings.consultationsEnabled ?? true;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('يرجى كتابة موضوع الاستشارة.');
      return;
    }
    if (!currentUser) {
      setError('حدث خطأ. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }
    setError('');
    addConsultationRequest(currentUser.id, subject);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div 
        className="bg-gradient-to-br from-[#2e0235] via-[#3b0764] to-[#4c1d95] text-slate-200 rounded-2xl shadow-2xl w-full max-w-lg border border-fuchsia-500/30 flex flex-col animate-fade-in-up"
      >
        <header className="p-5 flex justify-between items-center border-b border-white/10 bg-black/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <ChatBubbleIcon className="w-6 h-6 text-fuchsia-400"/>
             طلب استشارة خاصة
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-6 h-6" /></button>
        </header>
        
        {consultationsEnabled ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="text-sm text-center text-slate-300 bg-white/5 p-4 rounded-xl border border-white/10">
              <p>سيتم مراجعة طلبك والموافقة عليه من قبل الإدارة، ثم إرسال تفاصيل الدفع والموعد إليك.</p>
            </div>
            
            <div>
              <label htmlFor="subject" className="block mb-2 text-sm font-bold text-fuchsia-300">موضوع الاستشارة</label>
              <textarea
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                rows={5}
                className="w-full p-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
                placeholder="اكتب هنا شرحاً موجزاً لموضوع الاستشارة التي ترغب بها..."
                required
              />
            </div>

            {error && <p className="text-sm text-red-300 bg-red-900/20 p-2 rounded text-center border border-red-500/20">{error}</p>}

            <footer className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="py-2.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm transition-colors">إلغاء</button>
              <button type="submit" className="py-2.5 px-8 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-900/40 transition-all transform hover:scale-105">
                إرسال الطلب
              </button>
            </footer>
          </form>
        ) : (
          <div className="p-10 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <ChatBubbleIcon className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">خدمة الاستشارات مغلقة</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">عذراً، خدمة الاستشارات الخاصة غير متاحة حالياً. يرجى المحاولة في وقت لاحق.</p>
              <button
                  type="button"
                  onClick={onClose}
                  className="mt-8 py-2.5 px-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
              >
                  إغلاق
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationRequestModal;
