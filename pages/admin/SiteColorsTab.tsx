import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { Theme, ThemeColors } from '../../types';
import { TrashIcon, PlusCircleIcon, LightBulbIcon } from '../../components/icons';

interface SiteColorsTabProps {
    showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

const ColorInput: React.FC<{ label: string; color: string; onChange: (color: string) => void; }> = ({ label, color, onChange }) => (
    <div className="flex items-center gap-2">
        <label className="text-xs font-semibold w-20">{label}</label>
        <input type="color" value={color} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded border-none bg-transparent" style={{ padding: 0 }} />
        <input type="text" value={color} onChange={e => onChange(e.target.value)} className="p-1 bg-slate-700 rounded text-xs w-24 ltr-input" />
    </div>
);

const SiteColorsTab: React.FC<SiteColorsTabProps> = ({ showToast }) => {
    const { drhopeData, updateDrhopeData } = useUser();
    const [localThemes, setLocalThemes] = useState<Theme[]>(drhopeData.themes || []);
    const [activeThemeId, setActiveThemeId] = useState(drhopeData.activeThemeId || '');
    const [selectedThemeForEditing, setSelectedThemeForEditing] = useState<Theme | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const initialThemes = drhopeData.themes || [];
        const initialActiveId = drhopeData.activeThemeId || '';
        setLocalThemes(initialThemes);
        setActiveThemeId(initialActiveId);
        setSelectedThemeForEditing(initialThemes.find(t => t.id === initialActiveId) || initialThemes[0] || null);
        setHasChanges(false);
    }, [drhopeData]);
    
    useEffect(() => {
        if(selectedThemeForEditing) {
            const updatedThemeInList = localThemes.find(t => t.id === selectedThemeForEditing.id);
            if(updatedThemeInList && JSON.stringify(updatedThemeInList) !== JSON.stringify(selectedThemeForEditing)) {
                 setSelectedThemeForEditing(updatedThemeInList);
            }
        }
    }, [localThemes, selectedThemeForEditing]);

    const handleUpdateTheme = (themeId: string, updates: Partial<Theme> | ((theme: Theme) => Theme)) => {
        setLocalThemes(prev => prev.map(t => t.id === themeId ? (typeof updates === 'function' ? updates(t) : { ...t, ...updates }) : t));
        setHasChanges(true);
    };
    
    const handleUpdateColor = (part: keyof ThemeColors, property: string, value: any) => {
        if(!selectedThemeForEditing) return;
        handleUpdateTheme(selectedThemeForEditing.id, (theme) => {
            const newTheme = JSON.parse(JSON.stringify(theme));
            (newTheme.colors[part] as any)[property] = value;
            return newTheme;
        });
    };
    
    const handleSaveChanges = () => {
        updateDrhopeData({ ...drhopeData, themes: localThemes, activeThemeId });
        setHasChanges(false);
        showToast('تم حفظ إعدادات الألوان بنجاح.');
    };
    
    const handleAddNewTheme = () => {
        const newTheme: Theme = {
            id: `theme_${Date.now()}`,
            name: 'سمة جديدة',
            colors: JSON.parse(JSON.stringify(localThemes[0]?.colors || {})),
        };
        setLocalThemes(prev => [...prev, newTheme]);
        setSelectedThemeForEditing(newTheme);
        setHasChanges(true);
    };

    const handleDeleteTheme = (themeId: string) => {
        if(localThemes.length <= 1) {
            showToast('يجب وجود سمة واحدة على الأقل.', 'error');
            return;
        }
        setLocalThemes(prev => prev.filter(t => t.id !== themeId));
        if (selectedThemeForEditing?.id === themeId) {
            setSelectedThemeForEditing(localThemes.find(t => t.id !== themeId) || null);
        }
        if (activeThemeId === themeId) {
            setActiveThemeId(localThemes.find(t => t.id !== themeId)?.id || '');
        }
        setHasChanges(true);
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">إدارة ألوان الموقع والسمات</h3>
                {hasChanges && (
                    <div className="flex gap-4">
                        <button onClick={handleSaveChanges} className="py-2 px-4 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-sm">حفظ التغييرات</button>
                    </div>
                )}
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg border border-slate-700 space-y-4">
                <div>
                    <label className="block mb-2 text-sm font-bold text-fuchsia-300">السمة النشطة حالياً</label>
                    <select value={activeThemeId} onChange={e => { setActiveThemeId(e.target.value); setHasChanges(true); }} className="w-full p-2 bg-slate-800/60 border border-slate-700 rounded-md text-sm">
                        {localThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-bold text-fuchsia-300">تعديل سمة</label>
                    <div className="flex items-center gap-x-2">
                        <select value={selectedThemeForEditing?.id || ''} onChange={e => setSelectedThemeForEditing(localThemes.find(t => t.id === e.target.value) || null)} className="flex-grow p-2 bg-slate-800/60 border border-slate-700 rounded-md text-sm">
                            {localThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button onClick={handleAddNewTheme} className="p-2 bg-green-600/50 rounded-md"><PlusCircleIcon className="w-5 h-5"/></button>
                        <button onClick={() => selectedThemeForEditing && handleDeleteTheme(selectedThemeForEditing.id)} className="p-2 bg-red-600/50 rounded-md"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>

            {selectedThemeForEditing && (
                <div className="bg-black/20 p-4 rounded-lg border border-slate-700 space-y-4">
                     <input type="text" value={selectedThemeForEditing.name} onChange={e => handleUpdateTheme(selectedThemeForEditing.id, { name: e.target.value })} className="w-full p-2 bg-slate-800/60 border border-slate-700 rounded-md text-lg font-bold" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                           <h4 className="font-bold">الخلفية</h4>
                           <ColorInput label="From" color={selectedThemeForEditing.colors.background.from} onChange={c => handleUpdateColor('background', 'from', c)} />
                           <ColorInput label="To" color={selectedThemeForEditing.colors.background.to} onChange={c => handleUpdateColor('background', 'to', c)} />
                        </div>
                         <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                           <h4 className="font-bold">الأزرار</h4>
                           <ColorInput label="From" color={selectedThemeForEditing.colors.button.from} onChange={c => handleUpdateColor('button', 'from', c)} />
                           <ColorInput label="To" color={selectedThemeForEditing.colors.button.to} onChange={c => handleUpdateColor('button', 'to', c)} />
                        </div>
                        <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                           <h4 className="font-bold">البطاقات</h4>
                           <ColorInput label="From" color={selectedThemeForEditing.colors.card.from} onChange={c => handleUpdateColor('card', 'from', c)} />
                           <ColorInput label="To" color={selectedThemeForEditing.colors.card.to} onChange={c => handleUpdateColor('card', 'to', c)} />
                        </div>
                         <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                           <h4 className="font-bold">النصوص</h4>
                           <ColorInput label="Primary" color={selectedThemeForEditing.colors.text.primary} onChange={c => handleUpdateColor('text', 'primary', c)} />
                           <ColorInput label="Accent" color={selectedThemeForEditing.colors.text.accent} onChange={c => handleUpdateColor('text', 'accent', c)} />
                        </div>
                         <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg col-span-full">
                           <h4 className="font-bold">التوهج (Glow)</h4>
                           <ColorInput label="Color" color={selectedThemeForEditing.colors.glow.color} onChange={c => handleUpdateColor('glow', 'color', c)} />
                           <div><label className="text-xs">Intensity</label><input type="range" min="0" max="100" value={selectedThemeForEditing.colors.glow.intensity} onChange={e => handleUpdateColor('glow', 'intensity', parseInt(e.target.value))} /></div>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default SiteColorsTab;
