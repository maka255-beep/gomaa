import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { User, Workshop, BroadcastRecipient, BroadcastCampaign } from '../../types';
import { PaperAirplaneIcon, EnvelopeIcon, BellIcon, EyeIcon, DownloadIcon, ChevronDownIcon, WhatsAppIcon, VideoIcon, DocumentTextIcon, UserIcon, TrashIcon, LinkIcon, PrintIcon, CloseIcon, UsersIcon, CheckCircleIcon, ExclamationCircleIcon } from '../../components/icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { sendWhatsAppMessage } from '../../services/whatsappService';
import { fileToDataUrl, normalizePhoneNumber, downloadHtmlAsPdf } from '../../utils';
import { GULF_COUNTRIES, ARAB_COUNTRIES } from '../../constants';
import { useAdminTranslation } from './AdminTranslationContext';
import BroadcastPreviewModal from '../../components/BroadcastPreviewModal';
import AudienceManagementModal from '../../components/AudienceManagementModal';
import BroadcastReportModal from '../../components/BroadcastReportModal';


declare const XLSX: any;

const WHATSAPP_TEMPLATES: { [key: string]: string } = {
  recorded_announcement: `رياحين دكتورة أمل العتيبي

متوفر الأن الإشتراك والتحويل في ورش الاونلاين المسجله
من خلال المنصة التالية …

https://www.nawayaevent.com/courses.php#record_events

•⁠ اختر الورشة
•⁠ سجل بالموقع اذا كنت ضيف جديد (اذا لم يكن لديك حساب) / سجل الدخول اذا كنت مستخدم (لديك حساب من قبل)
•⁠ قم بالتحويل
•⁠ ارسل صورة من التحويل لرقم الواتساب

ملاحظات:
•⁠ الورشة سوف تكون متاحة شهر من تاريخ الإشتراك بعدد دخول لا محدود خلال شهر فقط.

دمتم بخير`
};


// Simplified rich text editor toolbar
const EditorToolbar: React.FC<{ editorRef: React.RefObject<HTMLDivElement> }> = ({ editorRef }) => {
    const applyStyle = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };
    return (
        <div className="flex items-center gap-x-2 p-2 bg-slate-800/50 rounded-t-lg border-b border-slate-700">
            <button type="button" onClick={() => applyStyle('bold')} className="p-2 rounded hover:bg-slate-700"><strong>B</strong></button>
            <button type="button" onClick={() => applyStyle('italic')} className="p-2 rounded hover:bg-slate-700"><em>I</em></button>
            <button type="button" onClick={() => applyStyle('underline')} className="p-2 rounded hover:bg-slate-700"><u>U</u></button>
            <button type="button" onClick={() => {
                const url = prompt('Enter link URL:');
                if (url) applyStyle('createLink', url);
            }} className="p-2 rounded hover:bg-slate-700">Link</button>
        </div>
    );
};


interface BroadcastPageProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

const BroadcastPage: React.FC<BroadcastPageProps> = ({ showToast }) => {
  const { users, workshops, drhopeData, addBroadcastToHistory, broadcastHistory, addNotificationForMultipleUsers } = useUser();
  const { t } = useAdminTranslation();
  
  const [channel, setChannel] = useState<'email' | 'notification' | 'whatsapp'>('email');
  
  const [subject, setSubject] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [whatsappTitle, setWhatsappTitle] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappAttachment, setWhatsappAttachment] = useState<{ dataUrl: string; file: File } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const whatsappMessageRef = useRef<HTMLTextAreaElement>(null);
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // New state for modals
  const [recipients, setRecipients] = useState<User[]>([]);
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // New state for reporting
  const [summaryData, setSummaryData] = useState<{ success: number; failed: number; campaign: BroadcastCampaign } | null>(null);
  const [reportData, setReportData] = useState<BroadcastCampaign | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'email' | 'notification' | 'whatsapp'>('all');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 16 * 1024 * 1024) { // 16MB limit, common for WhatsApp
            showToast('حجم الملف كبير جداً. الحد الأقصى 16 ميجابايت.', 'error');
            return;
        }
        const dataUrl = await fileToDataUrl(file);
        setWhatsappAttachment({ dataUrl, file });
    }
  };

  const handleRemoveAttachment = () => {
    setWhatsappAttachment(null);
    const fileInput = document.getElementById('whatsapp-attachment-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const handleInsertLink = () => {
    const url = prompt('الرجاء إدخال الرابط (URL):', 'https://');
    if (url && whatsappMessageRef.current) {
      const { selectionStart, selectionEnd, value } = whatsappMessageRef.current;
      const newText = value.substring(0, selectionStart) + url + value.substring(selectionEnd);
      setWhatsappMessage(newText);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = e.target.value;
    if (templateKey && WHATSAPP_TEMPLATES[templateKey]) {
        setWhatsappMessage(WHATSAPP_TEMPLATES[templateKey]);
    }
    e.target.value = "";
  };


  const handlePreview = () => {
    if (recipients.length === 0) {
      showToast('لا يوجد مستلمون في الجمهور المستهدف.', 'warning');
      return;
    }
    setIsPreviewModalOpen(true);
  };

  const handleActualSend = () => {
    setIsPreviewModalOpen(false);

    // Simulate delivery statuses
    const simulatedRecipients = recipients.map(r => {
        const recipient: BroadcastRecipient = {
            userId: r.id,
            fullName: r.fullName,
            email: r.email,
            phone: r.phone,
            status: 'Sent',
        };
        // Simulate ~10% failure rate
        if (Math.random() < 0.1) {
            if (channel === 'email') {
                recipient.status = 'Bounced (Invalid Email)';
            } else if (channel === 'whatsapp') {
                recipient.status = 'Failed (No WhatsApp)';
            } else {
                recipient.status = 'Failed';
            }
        }
        return recipient;
    });
    
    // Logic for sending...
    simulatedRecipients.forEach(recipient => {
        if (recipient.status !== 'Sent') return; // Don't send to failed ones in simulation

        if (channel === 'email') {
            console.log(`--- SIMULATING EMAIL SEND to ${recipient.email} ---`);
        } else if (channel === 'notification') {
            addNotificationForMultipleUsers([recipient.userId], notificationMessage);
        } else if (channel === 'whatsapp') {
            const fullMessage = whatsappTitle ? `*${whatsappTitle}*\n\n${whatsappMessage}` : whatsappMessage;
            sendWhatsAppMessage(
                recipient.phone!, 
                fullMessage,
                whatsappAttachment ? { url: whatsappAttachment.dataUrl, mimeType: whatsappAttachment.file.type } : undefined
            );
        }
    });

    const messageHtml = editorRef.current?.innerHTML || '';
    const campaign: Omit<BroadcastCampaign, 'id' | 'timestamp'> = {
        subject: subject,
        messageHtml: messageHtml + (drhopeData.signature || ''),
        targetAudience: `جمهور مخصص (${recipients.length})`,
        recipients: simulatedRecipients,
        attachments: [],
        channel: channel,
    };
    
    const newCampaign = addBroadcastToHistory(campaign);

    const successCount = simulatedRecipients.filter(r => r.status === 'Sent').length;
    const failedCount = simulatedRecipients.length - successCount;

    setSummaryData({ success: successCount, failed: failedCount, campaign: newCampaign });

    // Reset form
    setRecipients([]);
    if (channel === 'email') {
        setSubject('');
        if(editorRef.current) editorRef.current.innerHTML = '';
    } else if (channel === 'notification') {
        setNotificationMessage('');
    } else if (channel === 'whatsapp') {
        setWhatsappMessage('');
        setWhatsappTitle('');
        handleRemoveAttachment();
    }
  };
  
    const filteredHistory = useMemo(() => {
        if (historyFilter === 'all') {
            return broadcastHistory;
        }
        return broadcastHistory.filter(c => c.channel === historyFilter);
    }, [broadcastHistory, historyFilter]);

  const handleExcelExport = () => {
    setIsExportMenuOpen(false);
    const dataToExport = filteredHistory.map(c => ({
        'التاريخ': new Date(c.timestamp).toLocaleString('ar-EG'),
        'الموضوع': c.subject,
        'الجمهور': c.targetAudience,
        'الناجحة': c.recipients.filter(r => r.status === 'Sent').length,
        'الفاشلة': c.recipients.filter(r => r.status !== 'Sent').length,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 40 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Broadcast History');
    XLSX.writeFile(workbook, `Broadcast_History_${historyFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePdfExport = () => {
    setIsExportMenuOpen(false);
    const tableRows = filteredHistory.map(c => `
        <tr>
            <td>${new Date(c.timestamp).toLocaleString('ar-EG')}</td>
            <td>${c.subject}</td>
            <td>${c.targetAudience}</td>
            <td style="text-align: center;">${c.recipients.filter(r => r.status === 'Sent').length}</td>
            <td style="text-align: center;">${c.recipients.filter(r => r.status !== 'Sent').length}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <html>
            <head>
                <title>سجل الرسائل المرسلة</title>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; }
                    @page { size: A4 portrait; margin: 20mm; }
                </style>
            </head>
            <body>
                <h1>سجل الرسائل المرسلة (${historyFilter})</h1>
                <table>
                    <thead><tr><th>التاريخ</th><th>الموضوع</th><th>الجمهور</th><th style="text-align: center;">الناجحة</th><th style="text-align: center;">الفاشلة</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </body>
        </html>`;
    
    downloadHtmlAsPdf(htmlContent, `Broadcast_History_${historyFilter}_${new Date().toISOString().split('T')[0]}.pdf`, 'portrait');
  };
  
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">{t('broadcast.title')}</h2>
        <div className="flex items-center gap-x-4">
          <button onClick={() => setIsHistoryModalOpen(true)} className="text-sm font-bold text-slate-300 hover:underline">
            {t('broadcast.history')} ({broadcastHistory.length})
          </button>
        </div>
      </header>

      {/* Channel Selection */}
      <div className="flex items-center gap-x-2 bg-slate-800/60 p-1 rounded-lg w-fit">
        <button onClick={() => setChannel('email')} className={`flex items-center gap-x-2 px-3 py-1.5 text-xs font-bold rounded-md ${channel === 'email' ? 'bg-yellow-500/50 text-white' : 'hover:bg-slate-700/50'}`}><EnvelopeIcon className="w-4 h-4" /> <span>{t('broadcast.email')}</span></button>
        <button onClick={() => setChannel('notification')} className={`flex items-center gap-x-2 px-3 py-1.5 text-xs font-bold rounded-md ${channel === 'notification' ? 'bg-yellow-500/50 text-white' : 'hover:bg-slate-700/50'}`}><BellIcon className="w-4 h-4" /> <span>{t('broadcast.notification')}</span></button>
        <button onClick={() => setChannel('whatsapp')} className={`flex items-center gap-x-2 px-3 py-1.5 text-xs font-bold rounded-md ${channel === 'whatsapp' ? 'bg-yellow-500/50 text-white' : 'hover:bg-slate-700/50'}`}><WhatsAppIcon className="w-4 h-4" /> <span>{t('broadcast.whatsapp')}</span></button>
      </div>

      {/* Audience & Message */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-black/20 p-4 rounded-lg border border-slate-700/50">
            <h3 className="font-bold text-white mb-3">1. تحديد الجمهور</h3>
             <button onClick={() => setIsAudienceModalOpen(true)} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-x-2">
                <UsersIcon className="w-5 h-5"/>
                <span>تحديد المستلمين ({recipients.length})</span>
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 bg-black/20 p-4 rounded-lg border border-slate-700/50">
          <h3 className="font-bold text-white mb-3">2. كتابة الرسالة</h3>
          {channel === 'email' && (
            <div className="space-y-3">
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="موضوع البريد الإلكتروني" className="w-full p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm" />
              <EditorToolbar editorRef={editorRef} />
              <div ref={editorRef} contentEditable suppressContentEditableWarning className="w-full p-2 bg-slate-800/60 border border-slate-700 rounded-b-lg min-h-[200px]" />
              <div className="flex items-center gap-x-2 text-xs text-slate-400">
                <span>سيتم إلحاق توقيعك تلقائيًا.</span>
              </div>
            </div>
          )}
          {channel === 'notification' && (
            <div className="space-y-3">
              <textarea value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} placeholder="نص الإشعار..." className="w-full p-2 bg-slate-800/60 border border-slate-700 rounded-lg min-h-[150px] text-sm" />
            </div>
          )}
          {channel === 'whatsapp' && (
            <div className="space-y-3">
              <input type="text" value={whatsappTitle} onChange={e => setWhatsappTitle(e.target.value)} placeholder="عنوان الرسالة (اختياري، سيظهر بخط عريض)" className="w-full p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm" />
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleInsertLink} className="p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm"><LinkIcon className="w-5 h-5"/></button>
                <select onChange={handleTemplateChange} defaultValue="" className="p-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm">
                  <option value="" disabled>اختر قالب جاهز</option>
                  <option value="recorded_announcement">إعلان ورشة مسجلة</option>
                </select>
              </div>
              <textarea ref={whatsappMessageRef} value={whatsappMessage} onChange={e => setWhatsappMessage(e.target.value)} placeholder="نص الرسالة..." className="w-full p-2 bg-slate-800/60 border border-slate-700 rounded-lg min-h-[200px] text-sm" />
              <div>
                <input type="file" id="whatsapp-attachment-input" onChange={handleFileChange} className="hidden" />
                {!whatsappAttachment ? (
                  <label htmlFor="whatsapp-attachment-input" className="cursor-pointer text-sm text-sky-400 hover:underline">
                    إضافة مرفق (صورة، فيديو، مستند)
                  </label>
                ) : (
                  <div className="flex items-center gap-x-2 text-sm bg-slate-700/50 p-2 rounded-lg">
                    <span>{whatsappAttachment.file.name}</span>
                    <button type="button" onClick={handleRemoveAttachment} className="p-1 rounded-full hover:bg-red-500/20"><TrashIcon className="w-4 h-4 text-red-400"/></button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="flex justify-end items-center mt-4">
        <button onClick={handlePreview} className="py-2 px-6 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-sm flex items-center gap-x-2">
          <EyeIcon className="w-5 h-5"/>
          <span>معاينة وإرسال</span>
        </button>
      </footer>
      
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
            <header className="p-4 flex justify-between items-center border-b border-yellow-500/50">
                <h3 className="text-lg font-bold text-yellow-300">سجل الرسائل المرسلة</h3>
                <div className="flex items-center gap-x-4">
                    <div className="relative" ref={exportMenuRef}>
                        <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="flex items-center gap-x-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 rounded-lg text-sm">
                            <DownloadIcon className="w-5 h-5"/><span>تصدير</span><ChevronDownIcon className="w-4 h-4"/>
                        </button>
                        {isExportMenuOpen && (
                            <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10">
                                <button onClick={handleExcelExport} className="w-full text-right px-4 py-2 text-sm text-white hover:bg-yellow-500/20 flex items-center gap-x-2"><DownloadIcon className="w-4 h-4"/><span>Excel</span></button>
                                <button onClick={handlePdfExport} className="w-full text-right px-4 py-2 text-sm text-white hover:bg-yellow-500/20 flex items-center gap-x-2"><PrintIcon className="w-4 h-4"/><span>PDF</span></button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6"/></button>
                </div>
            </header>
            <div className="p-2 border-b border-slate-800">
                <div className="flex items-center gap-x-2 bg-slate-800/60 p-1 rounded-lg w-fit">
                    <button onClick={() => setHistoryFilter('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${historyFilter === 'all' ? 'bg-yellow-500/50' : 'hover:bg-slate-700/50'}`}>الكل</button>
                    <button onClick={() => setHistoryFilter('email')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${historyFilter === 'email' ? 'bg-yellow-500/50' : 'hover:bg-slate-700/50'}`}>بريد إلكتروني</button>
                    <button onClick={() => setHistoryFilter('whatsapp')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${historyFilter === 'whatsapp' ? 'bg-yellow-500/50' : 'hover:bg-slate-700/50'}`}>واتساب</button>
                    <button onClick={() => setHistoryFilter('notification')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${historyFilter === 'notification' ? 'bg-yellow-500/50' : 'hover:bg-slate-700/50'}`}>إشعارات</button>
                </div>
            </div>
            <div className="overflow-y-auto">
                <table className="min-w-full text-sm text-white">
                  <thead className="bg-slate-800"><tr>
                      <th className="p-2 text-right">التاريخ</th>
                      <th className="p-2 text-right">الموضوع</th>
                      <th className="p-2 text-right">الجمهور</th>
                      <th className="p-2 text-center">الحالة</th>
                      <th className="p-2 text-center">الإجراءات</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-800">{filteredHistory.map(c => {
                      const successCount = c.recipients.filter(r => r.status === 'Sent').length;
                      const failedCount = c.recipients.length - successCount;
                      return (
                      <tr key={c.id} className="hover:bg-slate-800/50">
                        <td className="p-2 whitespace-nowrap">{new Date(c.timestamp).toLocaleString('ar-EG')}</td>
                        <td className="p-2">{c.subject}</td>
                        <td className="p-2">{c.targetAudience}</td>
                        <td className="p-2 text-center text-xs">
                          <span className="text-green-400 font-semibold">ناجح: {successCount}</span> / 
                          <span className="text-red-400 font-semibold"> فاشل: {failedCount}</span>
                        </td>
                        <td className="p-2 text-center">
                          <button onClick={() => { setReportData(c); setIsHistoryModalOpen(false); }} className="p-1 rounded-full hover:bg-sky-500/20" title="عرض التقرير">
                            <EyeIcon className="w-5 h-5 text-sky-400"/>
                          </button>
                        </td>
                      </tr>
                      );
                  })}</tbody>
                </table>
            </div>
          </div>
        </div>
      )}
      
      {isPreviewModalOpen && (
        <BroadcastPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          onConfirm={handleActualSend}
          channel={channel}
          recipientsCount={recipients.length}
          subject={subject}
          messageHtml={editorRef.current?.innerHTML || ''}
          notificationMessage={notificationMessage}
          whatsappTitle={whatsappTitle}
          whatsappMessage={whatsappMessage}
          whatsappAttachment={whatsappAttachment}
          signature={drhopeData.signature || ''}
        />
      )}

      {isAudienceModalOpen && (
          <AudienceManagementModal
              isOpen={isAudienceModalOpen}
              onClose={() => setIsAudienceModalOpen(false)}
              onSave={setRecipients}
              channel={channel}
              showToast={showToast}
          />
      )}

      {summaryData && (
          <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-green-500/50 rounded-lg shadow-xl w-full max-w-md p-6 text-center">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-400 mb-4"/>
                  <h3 className="text-lg font-bold text-white mb-2">تم إرسال الحملة</h3>
                  <p className="text-slate-300 mb-4">تمت معالجة الإرسال إلى {summaryData.success + summaryData.failed} مستلم.</p>
                  <div className="flex justify-around text-center mb-6">
                      <div><p className="text-2xl font-bold text-green-400">{summaryData.success}</p><p className="text-xs text-slate-400">إرسال ناجح</p></div>
                      <div><p className="text-2xl font-bold text-red-400">{summaryData.failed}</p><p className="text-xs text-slate-400">إرسال فاشل</p></div>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={() => setSummaryData(null)} className="flex-1 py-2 px-4 rounded-md bg-slate-600 hover:bg-slate-500 font-bold text-sm">إغلاق</button>
                      <button onClick={() => { setReportData(summaryData.campaign); setSummaryData(null); }} className="flex-1 py-2 px-4 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">عرض التقرير المفصل</button>
                  </div>
              </div>
          </div>
      )}

      <BroadcastReportModal isOpen={!!reportData} onClose={() => setReportData(null)} campaign={reportData} />

    </div>
  );
};

export default BroadcastPage;