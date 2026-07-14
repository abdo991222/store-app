import { Category } from './models';

export const CATEGORIES: Category[] = [
  { id: 'meat', name: 'اللحوم', icon: '🥩', grad: 'linear-gradient(135deg,#8B2E2E,#5C1F1F)' },
  { id: 'vegetables', name: 'الخضروات', icon: '🥦', grad: 'linear-gradient(135deg,#2D6A4F,#1B4332)' },
];

export const STATUS_OPTIONS = [
  { id: 'pending', label: 'قيد الانتظار', color: '#D4A017' },
  { id: 'confirmed', label: 'مؤكد', color: '#2D6A4F' },
  { id: 'preparing', label: 'قيد التجهيز', color: '#1B4332' },
  { id: 'delivering', label: 'قيد التوصيل', color: '#C1440E' },
  { id: 'delivered', label: 'تم التوصيل', color: '#4B5563' },
  { id: 'cancelled', label: 'ملغي', color: '#991B1B' },
];

export const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'meat', label: 'اللحوم' },
  { id: 'vegetables', label: 'الخضروات' },
  { id: 'offers', label: 'العروض' },
];

export const NAV_ITEMS = [
  { id: 'home', label: 'الرئيسية' },
  { id: 'products', label: 'المنتجات' },
  { id: 'cart', label: 'السلة' },
  { id: 'contact', label: 'تواصل' },
];
