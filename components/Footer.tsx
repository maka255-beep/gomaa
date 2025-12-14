
import React from 'react';
import { InstagramIcon, TwitterIcon, FacebookIcon, SnapchatIcon, TikTokIcon, PhoneIcon, EnvelopeIcon, LockClosedIcon, GlobeAltIcon } from './icons';
import { useUser } from '../context/UserContext';
import { SocialMediaLinks } from '../types';

interface FooterProps {
  onShippingClick: () => void;
  onTermsClick: () => void;
  onAboutClick: () => void;
  onPrivacyClick: () => void;
}

const socialPlatforms: { key: keyof SocialMediaLinks; icon: React.FC<{ className?: string }>; hoverClasses: string; ariaLabel: string }[] = [
    { key: 'instagram', icon: InstagramIcon, hoverClasses: 'hover:bg-pink-600 hover:shadow-[0_0_15px_rgba(219,39,119,0.6)]', ariaLabel: 'Instagram' },
    { key: 'snapchat', icon: SnapchatIcon, hoverClasses: 'hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_15px_rgba(250,204,21,0.6)]', ariaLabel: 'Snapchat' },
    { key: 'twitter', icon: TwitterIcon, hoverClasses: 'hover:bg-sky-500 hover:shadow-[0_0_15px_rgba(14,165,233,0.6)]', ariaLabel: 'Twitter' },
    { key: 'facebook', icon: FacebookIcon, hoverClasses: 'hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.6)]', ariaLabel: 'Facebook' },
    { key: 'tiktok', icon: TikTokIcon, hoverClasses: 'hover:bg-[#00f2ea] hover:text-black hover:shadow-[0_0_15px_rgba(0,242,234,0.6)]', ariaLabel: 'TikTok' },
];

const Footer: React.FC<FooterProps> = ({ onShippingClick, onTermsClick, onAboutClick, onPrivacyClick }) => {
  const { drhopeData } = useUser();
  const { socialMediaLinks } = drhopeData;

  return (
    <footer className="relative mt-16 pt-12 pb-6 bg-[#2e1065] text-slate-300 overflow-hidden border-t border-fuchsia-500/20">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-900/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-900/10 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10">
          
          {/* Column 1: Brand Info & Socials (5 Cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex flex-col items-start">
               {drhopeData.logoUrl ? (
                  <img src={drhopeData.logoUrl} alt="Nawaya Logo" className="h-14 w-auto mb-4 opacity-100 drop-shadow-lg filter brightness-110" />
               ) : (
                  <h2 className="text-2xl font-black text-white tracking-widest mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-fuchsia-300">NAWAYA</h2>
               )}
               <p className="text-sm leading-relaxed text-slate-400 font-medium max-w-sm text-justify">
                 منصة رائدة لإدارة الندوات والفعاليات وورش العمل التطويرية، نسعى لتقديم محتوى يلهمك لتكون أفضل نسخة من نفسك.
               </p>
            </div>
            
            <div>
                <h4 className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider mb-3">تابعنا على</h4>
                <div className="flex gap-3">
                    {socialPlatforms.map(platform => {
                        const link = socialMediaLinks?.[platform.key];
                        if (link) {
                        const Icon = platform.icon;
                        return (
                            <a 
                            key={platform.key}
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            aria-label={platform.ariaLabel}
                            className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-slate-300 transition-all duration-300 border border-white/10 hover:-translate-y-1 ${platform.hoverClasses}`}
                            >
                            <Icon className="w-4 h-4" />
                            </a>
                        );
                        }
                        return null;
                    })}
                </div>
            </div>
          </div>

          {/* Column 2: Quick Links (3 Cols) */}
          <div className="md:col-span-3 pt-2">
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              روابط هامة
              <span className="absolute -bottom-2 right-0 w-8 h-1 bg-fuchsia-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                  <button onClick={onAboutClick} className="flex items-center gap-2 hover:text-fuchsia-300 transition-colors duration-200 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-fuchsia-500 transition-colors"></span>
                      <span>من نحن</span>
                  </button>
              </li>
              <li>
                  <button onClick={onShippingClick} className="flex items-center gap-2 hover:text-fuchsia-300 transition-colors duration-200 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-fuchsia-500 transition-colors"></span>
                      <span>سياسة الشحن والتوصيل</span>
                  </button>
              </li>
              <li>
                  <button onClick={onTermsClick} className="flex items-center gap-2 hover:text-fuchsia-300 transition-colors duration-200 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-fuchsia-500 transition-colors"></span>
                      <span>الشروط والأحكام</span>
                  </button>
              </li>
              <li>
                  <button onClick={onPrivacyClick} className="flex items-center gap-2 hover:text-fuchsia-300 transition-colors duration-200 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-fuchsia-500 transition-colors"></span>
                      <span>سياسة الخصوصية</span>
                  </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info (4 Cols) */}
          <div className="md:col-span-4 pt-2">
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              تواصل معنا
              <span className="absolute -bottom-2 right-0 w-8 h-1 bg-fuchsia-500 rounded-full"></span>
            </h3>
            <div className="space-y-4">
                <a href={`https://wa.me/${(drhopeData.whatsappNumber || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all">
                    <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mt-0.5">
                        <PhoneIcon className="w-4 h-4"/>
                    </div>
                    <div>
                        <p className="text-xs text-fuchsia-300 font-bold mb-0.5">خدمة العملاء (واتساب)</p>
                        <p dir="ltr" className="text-white font-mono text-sm tracking-wide group-hover:text-fuchsia-200 transition-colors">
                            {drhopeData.whatsappNumber || drhopeData.companyPhone}
                        </p>
                    </div>
                </a>
                
                <a href="mailto:info@nawayaevent.com" className="flex items-start gap-3 group p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mt-0.5">
                        <EnvelopeIcon className="w-4 h-4"/>
                    </div>
                    <div>
                        <p className="text-xs text-purple-300 font-bold mb-0.5">البريد الإلكتروني</p>
                        <p className="text-white font-sans text-sm tracking-wide group-hover:text-purple-200 transition-colors">
                            info@nawayaevent.com
                        </p>
                    </div>
                </a>

                {drhopeData.companyAddress && (
                    <div className="flex items-start gap-3 px-3">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center">
                            <GlobeAltIcon className="w-5 h-5 text-slate-500"/>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed pt-1.5">
                            {drhopeData.companyAddress}
                        </p>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p dir="ltr" className="text-xs text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} <span className="text-white">Nawaya Events</span>. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-4">
             {/* Admin Entry Link - Direct href for reliability */}
            <a 
                href="?mode=admin"
                className="text-slate-600 hover:text-fuchsia-500 flex items-center gap-1.5 transition-colors group cursor-pointer"
                title="دخول المسؤول"
            >
                <LockClosedIcon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Admin Portal</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
