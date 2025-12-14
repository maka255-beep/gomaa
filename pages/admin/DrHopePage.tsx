import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { TrashIcon, VideoIcon, AcademicCapIcon, CollectionIcon, InstagramIcon } from '../../components/icons';
import { DrhopeData } from '../../types';
import { fileToDataUrl } from '../../utils';

interface DrHopePageProps {
  showToast: (message: string) => void;
}

const DrHopePage: React.FC<DrHopePageProps> = ({ showToast }) => {
  const { drhopeData, updateDrhopeData } = useUser();

  const [localData, setLocalData] = useState<DrhopeData>(drhopeData);
  const [hasChanges, setHasChanges] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });
  const [newInstaLink, setNewInstaLink] = useState({ title: '', url: '' });
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  useEffect(() => {
    setLocalData(drhopeData);
    setHasChanges(false);
  }, [drhopeData]);

  const handleSaveChanges = () => {
    updateDrhopeData(localData);
    setHasChanges(false);
    showToast('تم حفظ جميع التغييرات بنجاح.');
  };

  const handleCancelChanges = () => {
    setLocalData(drhopeData);
    setHasChanges(false);
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVideo.title && newVideo.url) {
      const newVideoEntry = { ...newVideo, id: `video-${Date.now()}` };
      setLocalData(prev => ({ ...prev, videos: [...(prev.videos || []), newVideoEntry] }));
      setHasChanges(true);
      setNewVideo({ title: '', url: '' });
    }
  };

  const handleDeleteVideo = (idToDelete: string) => {
    setLocalData(prev => ({ ...prev, videos: (prev.videos || []).filter(video => video.id !== idToDelete) }));
    setHasChanges(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploadingPhotos(true);
      try {
        const dataUrls = await Promise.all(Array.from(files).map(fileToDataUrl));
        setLocalData(prev => ({ ...prev, photos: [...prev.photos, ...dataUrls] }));
        setHasChanges(true);
        showToast(`تمت إضافة ${files.length} صور. لا تنس حفظ التغييرات.`);
        e.target.value = '';
      } catch (error) {
        showToast('فشل رفع بعض الصور.');
      } finally {
        setIsUploadingPhotos(false);
      }
    }
  };
  
  const handleDeletePhoto = (indexToDelete: number) => {
    setLocalData(prev => ({ ...prev, photos: prev.photos.filter((_, index) => index !== indexToDelete) }));
    setHasChanges(true);
  };
  
  const handleAddInstaLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInstaLink.title && newInstaLink.url) {
      const newLink = { ...newInstaLink, id: `insta-${Date.now()}` };
      setLocalData(prev => ({ ...prev, instagramLinks: [...prev.instagramLinks, newLink] }));
      setHasChanges(true);
      setNewInstaLink({ title: '', url: '' });
    }
  };

  const handleDeleteInstaLink = (idToDelete: string) => {
    setLocalData(prev => ({ ...prev, instagramLinks: prev.instagramLinks.filter(link => link.id !== idToDelete) }));
    setHasChanges(true);
  };
  
  const inputClass = "w-full p-2 bg-indigo-900/40 border border-slate-600 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 text-sm text-white font-semibold placeholder:text-slate-400/70";
  const labelClass = "block mb-2 text-sm font-bold text-fuchsia-300 tracking-wide";
  const sectionClass = "bg-black/20 p-4 sm:p-6 rounded-xl border border-slate-700/50";
  const sectionHeaderClass = "flex items-center gap-x-3 text-lg font-bold text-fuchsia-300 mb-4 border-b border-fuchsia-500/20 pb-3";

  return (
    <div>
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-white">إدارة محتوى DRHOPE</h2>
         {hasChanges && (
            <div className="flex gap-4">
                <button onClick={handleCancelChanges} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-bold text-sm">إلغاء</button>
                <button onClick={handleSaveChanges} className="py-2 px-4 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-bold text-sm">حفظ التغييرات</button>
            </div>
        )}
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className={sectionClass}>
            <h3 className={sectionHeaderClass}><CollectionIcon className="w-6 h-6" /><span>ألبوم الصور</span></h3>
            <div>
              <label className={labelClass}>إضافة صور جديدة</label>
              <input type="file" onChange={handlePhotoUpload} accept="image/*" multiple className={`${inputClass} file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-fuchsia-100 file:text-fuchsia-700 hover:file:bg-fuchsia-200 disabled:opacity-50`} disabled={isUploadingPhotos} />
              {isUploadingPhotos && <p className="mt-2 text-sm text-fuchsia-300">جاري معالجة الصور...</p>}
            </div>
            {localData.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 max-h-96 overflow-y-auto pr-2 rounded-lg bg-black/20 p-2">
                {localData.photos.map((src, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img src={src} alt={`Photo ${index}`} className="w-full h-full object-cover rounded-lg" />
                    <button onClick={() => handleDeletePhoto(index)} className="absolute top-1 right-1 bg-red-600/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            ) : <p className="text-center text-slate-400 py-4 mt-4 bg-black/20 rounded-lg">لا توجد صور في الألبوم حالياً.</p>}
          </div>

          <div className={sectionClass}>
             <h3 className={sectionHeaderClass}><InstagramIcon className="w-6 h-6" /><span>روابط بثوث انستجرام</span></h3>
            <form onSubmit={handleAddInstaLink} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-800/50 p-3 rounded-lg">
              <input type="text" value={newInstaLink.title} onChange={e => setNewInstaLink(p => ({...p, title: e.target.value}))} className={inputClass} placeholder="عنوان الرابط" required />
              <input type="url" value={newInstaLink.url} onChange={e => setNewInstaLink(p => ({...p, url: e.target.value}))} className={inputClass} placeholder="https://instagram.com/..." required />
              <button type="submit" className="py-2 px-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm">إضافة رابط</button>
            </form>
            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
              {localData.instagramLinks.length > 0 ? localData.instagramLinks.map(link => (
                <div key={link.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-semibold">{link.title}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:underline truncate max-w-xs block">{link.url}</a>
                  </div>
                  <button onClick={() => handleDeleteInstaLink(link.id)} className="p-2 rounded-full hover:bg-red-500/20"><TrashIcon className="w-5 h-5 text-red-400" /></button>
                </div>
              )) : <p className="text-center text-slate-400 py-4">لا توجد روابط مضافة.</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className={sectionClass}>
             <h3 className={sectionHeaderClass}><VideoIcon className="w-6 h-6" /><span>فيديوهات العرض</span></h3>
            <form onSubmit={handleAddVideo} className="space-y-3 bg-slate-800/50 p-3 rounded-lg">
              <input type="text" value={newVideo.title} onChange={e => setNewVideo(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="عنوان الفيديو" required />
              <input type="url" value={newVideo.url} onChange={e => setNewVideo(p => ({ ...p, url: e.target.value }))} className={inputClass} placeholder="رابط الفيديو (Embed)" required />
              <button type="submit" className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm">إضافة فيديو</button>
            </form>
            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2">
              {(localData.videos || []).length > 0 ? localData.videos.map(video => (
                <div key={video.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-semibold">{video.title}</p>
                    <p className="text-xs text-sky-400 truncate max-w-xs">{video.url}</p>
                  </div>
                  <button onClick={() => handleDeleteVideo(video.id)} className="p-2 rounded-full hover:bg-red-500/20"><TrashIcon className="w-5 h-5 text-red-400" /></button>
                </div>
              )) : <p className="text-center text-slate-400 py-4">لا توجد فيديوهات مضافة.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DrHopePage;