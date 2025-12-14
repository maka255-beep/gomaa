import React, { useState, useMemo, useRef, useEffect, ChangeEvent } from 'react';
import { useUser } from '../../context/UserContext';
import { Product, Order, OrderStatus, User } from '../../types';
// FIX: Changed default import of ConfirmationModal to a named import.
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { TrashIcon, RestoreIcon, PencilIcon, PlusCircleIcon, CheckCircleIcon, ArchiveBoxIcon, TagIcon, DownloadIcon, PrintIcon, ChevronDownIcon, CloseIcon, WhatsAppIcon } from '../../components/icons';
import { toEnglishDigits, formatArabicDate, normalizePhoneNumber } from '../../utils';
import { useAdminTranslation } from './AdminTranslationContext';

declare const XLSX: any;

// --- Product Management Component ---

interface ProductManagementTabProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

const ProductManagementTab: React.FC<ProductManagementTabProps> = ({ showToast }) => {
  const { users, products, addProduct, updateProduct, deleteProduct, restoreProduct, permanentlyDeleteProduct } = useUser();
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [currentTab, setCurrentTab] = useState<'active' | 'trash'>('active');
  const [confirmationState, setConfirmationState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const activeProducts = useMemo(() => products.filter(p => !p.isDeleted), [products]);
  const trashedProducts = useMemo(() => products.filter(p => p.isDeleted), [products]);

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setImagePreview(product.imageUrl);
  };
  
  const handleAddNew = () => {
    setEditingProduct({ name: '', price: 0, imageUrl: '' });
    setImagePreview(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditingProduct(p => p ? { ...p, imageUrl: result } : null);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.price || !editingProduct.imageUrl) {
      showToast('يرجى ملء جميع الحقول المطلوبة.', 'error');
      return;
    }
    
    const finalProductData = { ...editingProduct };
    if (!finalProductData.ownerId) {
        delete finalProductData.ownerId;
        delete finalProductData.ownerPercentage;
    }
    
    if (editingProduct.id) {
      updateProduct(finalProductData as Product);
      showToast('تم تحديث المنتج بنجاح.', 'success');
    } else {
      addProduct(finalProductData as Omit<Product, 'id'>);
      showToast('تم إضافة المنتج بنجاح.', 'success');
    }
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleSoftDelete = (product: Product) => {
    setConfirmationState({
      isOpen: true,
      title: 'نقل إلى سلة المهملات',
      message: `هل أنت متأكد من نقل منتج "${product.name}" إلى سلة المهملات؟`,
      onConfirm: () => {
        deleteProduct(product.id);
        showToast('تم نقل المنتج إلى سلة المهملات.');
        closeConfirmationModal();
      },
    });
  };
  
  const handlePermanentDelete = (product: Product) => {
    setConfirmationState({
      isOpen: true,
      title: 'حذف نهائي',
      message: `هل أنت متأكد من حذف منتج "${product.name}" نهائياً؟`,
      onConfirm: () => {
        permanentlyDeleteProduct(product.id);
        showToast('تم حذف المنتج نهائياً.');
        closeConfirmationModal();
      },
    });
  };

  const closeConfirmationModal = () => setConfirmationState(prev => ({ ...prev, isOpen: false }));

  const inputClass = "w-full p-2 bg-slate-800/60 border border-slate-700 rounded-md text-sm";
  const actionButtonClasses = "p-2 rounded-md transition-colors text-slate-300";
  const subTabButtonClasses = (tab: 'active' | 'trash') => `px-3 py-1.5 text-xs font-bold rounded-md ${currentTab === tab ? 'bg-fuchsia-500/50 text-white' : 'hover:bg-slate-700/50'}`;
  
  const trainers = useMemo(() => users.filter(u => !u.isDeleted && u.subscriptions.length > 0), [users]);

  const renderProductRow = (product: Product) => {
      const owner = product.ownerId ? users.find(u => u.id === product.ownerId) : null;
      return (
        <tr key={product.id} className="hover:bg-yellow-500/10 transition-colors">
          <td className="py-3 px-2 text-center"><img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md mx-auto" /></td>
          <td className="py-3 px-2 font-semibold text-right">{product.name}</td>
          <td className="py-3 px-2 font-semibold text-center">{product.price.toFixed(2)}</td>
          <td className="py-3 px-2 text-center">{owner ? owner.fullName : 'المنصة'} ({product.ownerPercentage || 0}%)</td>
          <td className="py-3 px-2 text-center">
            {currentTab === 'active' ? (
              <div className="flex items-center justify-center gap-x-2">
                <button onClick={() => handleEdit(product)} className={`${actionButtonClasses} hover:bg-amber-500/20 hover:text-amber-300`} title="تعديل"><PencilIcon className="w-5 h-5"/></button>
                <button onClick={() => handleSoftDelete(product)} className={`${actionButtonClasses} hover:bg-red-500/20 hover:text-red-400`} title="نقل إلى سلة المهملات"><TrashIcon className="w-5 h-5"/></button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-x-2">
                <button onClick={() => restoreProduct(product.id)} className={`${actionButtonClasses} hover:bg-green-500/20 hover:text-green-400`} title="استعادة"><RestoreIcon className="w-5 h-5"/></button>
                <button onClick={() => handlePermanentDelete(product)} className={`${actionButtonClasses} hover:bg-red-500/20 hover:text-red-400`} title="حذف نهائي"><TrashIcon className="w-5 h-5"/></button>
              </div>
            )}
          </td>
        </tr>
      );
  };
  
  const editingRow = (
    <tr className="bg-fuchsia-900/20">
      <td className="p-2 align-middle">
        <div className="flex flex-col items-center gap-2">
          {imagePreview && <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md" />}
          <input type="file" accept="image/*" onChange={handleImageUpload} className={`${inputClass} text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-fuchsia-50 file:text-fuchsia-700 hover:file:bg-fuchsia-200`} />
        </div>
      </td>
      <td className="p-2 align-middle"><input type="text" placeholder="اسم المنتج" value={editingProduct?.name || ''} onChange={(e) => setEditingProduct(p => p ? { ...p, name: e.target.value } : null)} className={inputClass} /></td>
      <td className="p-2 align-middle"><input type="number" placeholder="السعر" value={editingProduct?.price || ''} onChange={(e) => setEditingProduct(p => p ? { ...p, price: parseFloat(toEnglishDigits(e.target.value)) || 0 } : null)} className={inputClass} /></td>
      <td className="p-2 align-middle space-y-2">
        <select value={editingProduct?.ownerId || ''} onChange={(e) => setEditingProduct(p => p ? { ...p, ownerId: e.target.value ? parseInt(e.target.value) : undefined } : null)} className={inputClass}>
          <option value="">المنصة</option>
          {trainers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
        </select>
        {editingProduct?.ownerId && (
          <input type="number" placeholder="نسبة المالك %" value={editingProduct?.ownerPercentage || ''} onChange={(e) => setEditingProduct(p => p ? { ...p, ownerPercentage: parseInt(toEnglishDigits(e.target.value)) || 0 } : null)} className={inputClass} min="0" max="100" />
        )}
      </td>
      <td className="p-2 text-center align-middle">
        <div className="flex items-center justify-center gap-x-2">
          <button onClick={handleSave} className="py-2 px-3 bg-green-600 hover:bg-green-500 rounded-md text-sm font-bold">حفظ</button>
          <button onClick={() => setEditingProduct(null)} className="py-2 px-3 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-bold">إلغاء</button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
        <div className="flex items-center gap-x-2 bg-slate-800/60 p-1 rounded-lg w-fit">
          <button onClick={() => setCurrentTab('active')} className={subTabButtonClasses('active')}>المنتجات النشطة ({activeProducts.length})</button>
          <button onClick={() => setCurrentTab('trash')} className={subTabButtonClasses('trash')}>سلة المهملات ({trashedProducts.length})</button>
        </div>
        {!editingProduct && (
            <button onClick={handleAddNew} className="flex items-center gap-x-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-3 rounded-lg text-sm">
                <PlusCircleIcon className="w-5 h-5"/> <span>منتج جديد</span>
            </button>
        )}
      </div>
      <div className="text-right text-xs text-slate-400">
          عرض {currentTab === 'active' ? activeProducts.length : trashedProducts.length} منتج
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead className="text-yellow-300 uppercase tracking-wider font-bold text-xs">
            <tr className="border-b-2 border-yellow-500/50 bg-black/20">
              <th className="py-3 px-2 text-center" style={{ width: '120px' }}>صورة</th>
              <th className="py-3 px-2 text-right">اسم المنتج</th>
              <th className="py-3 px-2 text-center" style={{ width: '150px' }}>السعر (درهم)</th>
              <th className="py-3 px-2 text-center" style={{ width: '200px' }}>المالك (النسبة)</th>
              <th className="py-3 px-2 text-center" style={{ width: '200px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {editingProduct && !editingProduct.id && editingRow}
            {(currentTab === 'active' ? activeProducts : trashedProducts).map(p => 
              editingProduct?.id === p.id ? React.cloneElement(editingRow, { key: p.id }) : renderProductRow(p)
            )}
          </tbody>
        </table>
      </div>
      
      <ConfirmationModal {...confirmationState} onClose={closeConfirmationModal} />
    </div>
  );
};


// --- Order Management Component ---

interface OrderManagementTabProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  onViewUserProfile: (user: User) => void;
}

interface OrderWithDetails extends Order {
  user: User;
}

const OrderManagementTab: React.FC<OrderManagementTabProps> = ({ showToast, onViewUserProfile }) => {
  const { users, products, confirmOrder } = useUser();
  const [currentTab, setCurrentTab] = useState<OrderStatus>(OrderStatus.PENDING);
  const [confirmationState, setConfirmationState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [pdfPreviewHtml, setPdfPreviewHtml] = useState<string | null>(null);
  const pdfIframeRef = useRef<HTMLIFrameElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allOrders = useMemo((): OrderWithDetails[] => {
      return users.flatMap(user => user.orders.map(order => ({ ...order, user })))
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [users]);
  
  const filteredOrders = useMemo(() => allOrders.filter(o => o.status === currentTab), [allOrders, currentTab]);
  
  const handleConfirmOrder = (order: OrderWithDetails) => {
      setConfirmationState({
          isOpen: true,
          title: 'تأكيد الطلب',
          message: `هل أنت متأكد من تأكيد الطلب رقم #${order.id.substring(0, 8)} للمستخدم "${order.user.fullName}"؟ سيتم إرسال إشعار للمستخدم.`,
          onConfirm: () => {
              confirmOrder(order.user.id, order.id);
              showToast('تم تأكيد الطلب بنجاح.');
              closeConfirmationModal();
          },
      });
  };

  const closeConfirmationModal = () => setConfirmationState(prev => ({ ...prev, isOpen: false }));

  const subTabButtonClasses = (tab: OrderStatus) => `px-3 py-1.5 text-xs font-bold rounded-md ${currentTab === tab ? 'bg-fuchsia-500/50 text-white' : 'hover:bg-slate-700/50'}`;

  const renderOrderRow = (order: OrderWithDetails) => {
    const orderProducts = order.products.map(item => {
        const product = products.find(p => p.id === item.productId);
        return `${product?.name || 'منتج محذوف'} (x${item.quantity})`;
    }).join(', ');

    return (
        <tr key={order.id} className="hover:bg-yellow-500/10 transition-colors">
            <td className="p-2 font-semibold text-right">{order.user.fullName}</td>
            <td className="p-2 text-right"><a href={`https://wa.me/${normalizePhoneNumber(order.user.phone)}`} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline flex items-center gap-x-1"><WhatsAppIcon className="w-4 h-4" /> <span>{order.user.phone}</span></a></td>
            <td className="p-2 text-xs text-right max-w-sm">{orderProducts}</td>
            <td className="p-2 text-center">{formatArabicDate(order.orderDate)}</td>
            <td className="p-2 text-center font-bold">{order.totalAmount.toFixed(2)}</td>
            <td className="p-2 text-center">
                {currentTab === OrderStatus.PENDING && (
                    <button onClick={() => handleConfirmOrder(order)} className="p-2 rounded-md transition-colors text-slate-300 hover:bg-green-500/20 hover:text-green-400" title="تأكيد الطلب"><CheckCircleIcon className="w-5 h-5"/></button>
                )}
            </td>
        </tr>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-x-2 bg-slate-800/60 p-1 rounded-lg w-fit">
          <button onClick={() => setCurrentTab(OrderStatus.PENDING)} className={subTabButtonClasses(OrderStatus.PENDING)}>الطلبات المعلقة</button>
          <button onClick={() => setCurrentTab(OrderStatus.COMPLETED)} className={subTabButtonClasses(OrderStatus.COMPLETED)}>الطلبات المكتملة</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead className="text-yellow-300 uppercase text-xs">
            <tr className="border-b-2 border-yellow-500/50 bg-black/20">
              <th className="py-3 px-2 text-right">العميل</th>
              <th className="py-3 px-2 text-right">الهاتف</th>
              <th className="py-3 px-2 text-right">المنتجات</th>
              <th className="py-3 px-2 text-center">تاريخ الطلب</th>
              <th className="py-3 px-2 text-center">الإجمالي</th>
              <th className="py-3 px-2 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredOrders.map(order => renderOrderRow(order))}
            {filteredOrders.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد طلبات في هذا القسم.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {confirmationState.isOpen && <ConfirmationModal {...confirmationState} onClose={closeConfirmationModal} />}
    </div>
  );
};

// --- Main Component ---

interface BoutiqueManagementPageProps {
  showToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  onViewUserProfile: (user: User) => void;
}

const BoutiqueManagementPage: React.FC<BoutiqueManagementPageProps> = ({ showToast, onViewUserProfile }) => {
  const { t } = useAdminTranslation();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  const tabButtonClasses = (tab: 'products' | 'orders') => 
    `py-3 px-4 text-sm font-bold border-b-2 flex items-center gap-x-2 ${
      activeTab === tab ? 'text-white border-fuchsia-500' : 'text-slate-400 border-transparent hover:text-white'
    }`;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-x-3">
        <ArchiveBoxIcon className="w-7 h-7 text-fuchsia-300" />
        <span>{t('boutiqueManagement.title')}</span>
      </h2>
      <div className="border-b border-slate-700/50">
        <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2">
          <button onClick={() => setActiveTab('products')} className={tabButtonClasses('products')}>
            <TagIcon className="w-5 h-5"/><span>{t('boutiqueManagement.manageProducts')}</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={tabButtonClasses('orders')}>
            <ArchiveBoxIcon className="w-5 h-5"/><span>{t('boutiqueManagement.manageOrders')}</span>
          </button>
        </nav>
      </div>
      <div className="mt-6">
        {activeTab === 'products' && <ProductManagementTab showToast={showToast} />}
        {activeTab === 'orders' && <OrderManagementTab showToast={showToast} onViewUserProfile={onViewUserProfile} />}
      </div>
    </div>
  );
};

export default BoutiqueManagementPage;
