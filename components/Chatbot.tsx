
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useUser } from '../context/UserContext';
import { ChatBubbleIcon, CloseIcon, PaperAirplaneIcon, LightBulbIcon } from './icons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { workshops } = useUser();
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const initChat = () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        const workshopDataForAI = workshops
          .filter(w => w.isVisible && !w.isDeleted)
          .map(w => ({
            id: w.id,
            title: w.title,
            instructor: w.instructor,
            startDate: w.startDate,
            location: w.location,
            isRecorded: w.isRecorded,
            description: w.description?.substring(0, 150) + '...', // Keep it brief
            price: w.price,
            packages: w.packages?.map(p => ({
              name: p.name,
              price: p.price,
              discountPrice: p.discountPrice,
            }))
          }));

        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `أنت مساعد ذكي لمنصة 'نوايا للفعاليات'. أجب باختصار ومودة.`,
          },
          history: [
            {
              role: "user",
              parts: [{ text: `بيانات الورش:\n${JSON.stringify(workshopDataForAI)}` }],
            },
            {
              role: "model",
              parts: [{ text: "أنا جاهز للمساعدة." }],
            },
          ]
        });

        setMessages([
          { role: 'model', text: 'أهلاً بك في منصة نوايا! 💜 كيف يمكنني مساعدتك اليوم؟' }
        ]);
      } catch (error) {
        console.error("Error initializing Gemini Chat:", error);
        setMessages([
          { role: 'model', text: 'عذراً، المساعد الذكي غير متوفر حالياً.' }
        ]);
      }
    };
    initChat();
  }, [workshops]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const inputText = inputRef.current?.value;
    if (!inputText?.trim() || isLoading || !chatRef.current) return;

    const newUserMessage: Message = { role: 'user', text: inputText };
    setMessages(prev => [...prev, newUserMessage]);
    if (inputRef.current) inputRef.current.value = '';
    setIsLoading(true);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message: inputText });
      
      let currentResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        currentResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = currentResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1].role === 'model' && newMessages[newMessages.length - 1].text === '') {
            newMessages[newMessages.length - 1].text = 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.';
        } else {
            newMessages.push({ role: 'model', text: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' });
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-fab glowing-chatbot-animation border-2 border-fuchsia-400"
        aria-label="افتح المساعد الذكي"
      >
        {isOpen ? <CloseIcon className="w-8 h-8"/> : <ChatBubbleIcon className="w-8 h-8" />}
      </button>

      {isOpen && (
        <div className={`chatbot-window animate-chatbot-in bg-gradient-to-b from-[#2e0235] via-[#2c0838] to-[#1e0b2b] border border-fuchsia-500/40 rounded-2xl shadow-2xl`}>
          <header className="flex-shrink-0 p-4 bg-white/5 flex justify-between items-center border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-x-3">
              <div className="bg-gradient-to-br from-fuchsia-600 to-purple-600 p-2 rounded-full shadow-lg shadow-fuchsia-500/20">
                 <LightBulbIcon className="w-5 h-5 text-white"/>
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">المساعد الذكي</h2>
                <p className="text-[10px] text-fuchsia-300 font-medium">متصل الآن</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
              <CloseIcon className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`message-bubble ${msg.role === 'user' ? 'message-bubble-user bg-gradient-to-r from-purple-800 to-pink-600' : 'message-bubble-model bg-white/10 border-white/5'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="message-bubble message-bubble-model typing-indicator bg-white/10 border-white/5">
                      <span></span><span></span><span></span>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className="flex-shrink-0 p-3 border-t border-white/10 bg-black/20 backdrop-blur-md">
            <form onSubmit={handleSend} className="flex items-center gap-x-2 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="اكتب استفسارك هنا..."
                className="flex-grow py-3 px-4 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 transition-all pl-12"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-800 to-pink-600 hover:from-purple-700 hover:to-pink-500 text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-label="إرسال"
              >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <PaperAirplaneIcon className="w-5 h-5 -rotate-90 transform translate-x-[2px]" />
                )}
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
};

export default Chatbot;
