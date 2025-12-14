import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Partner } from '../../types';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { TrashIcon, PencilIcon, PlusCircleIcon, UsersIcon } from '../../components/icons';

interface PartnersManagementTabProps {
    showToast: (message: string) => void;
}

const PartnersManagementTab: React.FC<PartnersManagementTabProps> = ({ showToast }) => {
    const { partners, addPartner, updatePartner, deletePartner } = useUser();
    const [editingPartner, setEditingPartner] = useState<Partial<Partner> | null>(null);
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean; onConfirm: () => void; message: string; } | null>(null);

    const handleEdit = (partner: Partner) => {
        setEditingPartner({ ...partner });
    };

    const handleAddNew = () => {
        setEditingPartner({ name: '', logo: '', description: '' });
    };

    const handleSave = () => {
        if (!editingPartner || !editingPartner.name || !editingPartner.logo || !editingPartner.description) {
            showToast('يرجى ملء جميع الحقول المطلوبة.');
            return;
        }
        if (editingPartner.id) {
            updatePartner(editingPartner as Partner);
            showToast('تم تحديث الشريك بنجاح.');
        } else {
            addPartner(editingPartner as Omit<Partner, 'id'>);
            showToast('تمت إضافة الشريك بنجاح.');
        }
        setEditingPartner(null);
    };

    const handleDelete = (partner: Partner) => {
        setConfirmation({
            isOpen: true,
            message: `هل أنت متأكد من حذف الشريك "${partner.name}"؟`,
            onConfirm: () => {
                deletePartner(partner.id);
                showToast('تم حذف الشريك.');
                setConfirmation(null);
            },
        });
    };

    const inputClass = "w-full p-2 bg-slate-800/60 border border-slate-700 rounded-md text-sm";
    
    const editingRow = (
        <tr className="bg-fuchsia-900/20">
            <td className="p-2"><input type="text" placeholder="اسم الشريك" value={editingPartner?.name || ''} onChange={e => setEditingPartner(p => p ? { ...p, name: e.target.value } : null)} className={inputClass} /></td>
            <td className="p-2"><input type="text" placeholder="رابط الشعار" value={editingPartner?.logo || ''} onChange={e => setEditingPartner(p => p ? { ...p, logo: e.target.value } : null)} className={inputClass + ' ltr-input'} /></td>
            <td className="p-2"><textarea placeholder="الوصف" value={editingPartner?.description || ''} onChange={e => setEditingPartner(p => p ? { ...p, description: e.target.value } : null)} className={inputClass} rows={2}></textarea></td>
            <td className="p-2 text-center">
                <div className="flex items-center justify-center gap-x-2">
                    <button onClick={handleSave} className="py-2 px-3 bg-green-600 hover:bg-green-500 rounded-md text-sm font-bold">حفظ</button>
                    <button onClick={() => setEditingPartner(null)} className="py-2 px-3 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-bold">إلغاء</button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-fuchsia-300 flex items-center gap-x-3"><UsersIcon className="w-6 h-6"/><span>إدارة شركاء النجاح</span></h3>
                <button onClick={handleAddNew} className="flex items-center gap-x-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-3 rounded-lg text-sm"><PlusCircleIcon className="w-5 h-5"/><span>شريك جديد</span></button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-white">
                    <thead className="text-yellow-300 uppercase text-xs"><tr className="border-b-2 border-yellow-500/50 bg-black/20">
                        <th className="py-3 px-2 text-right">الاسم</th>
                        <th className="py-3 px-2 text-right">الشعار</th>
                        <th className="py-3 px-2 text-right">الوصف</th>
                        <th className="py-3 px-2 text-center">الإجراءات</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-800">
                        {editingPartner && !editingPartner.id && editingRow}
                        {partners.map(p => editingPartner?.id === p.id ? React.cloneElement(editingRow, { key: p.id }) : (
                            <tr key={p.id} className="hover:bg-yellow-500/10">
                                <td className="p-2 font-semibold">{p.name}</td>
                                <td className="p-2"><img src={p.logo} alt={p.name} className="w-12 h-12 object-contain rounded-md"/></td>
                                <td className="p-2 text-xs max-w-sm truncate">{p.description}</td>
                                <td className="p-2 text-center">
                                    <div className="flex items-center justify-center gap-x-2">
                                        <button onClick={() => handleEdit(p)} className="p-2 rounded-md transition-colors text-slate-300 hover:bg-amber-500/20 hover:text-amber-300"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(p)} className="p-2 rounded-md transition-colors text-slate-300 hover:bg-red-500/20 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {confirmation && <ConfirmationModal isOpen={confirmation.isOpen} onClose={() => setConfirmation(null)} onConfirm={confirmation.onConfirm} title="تأكيد الحذف" message={confirmation.message} />}
        </div>
    );
};

export default PartnersManagementTab;