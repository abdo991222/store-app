import {
  LucideAngularModule, ShoppingCart, Search, MapPin, Phone, Plus, Minus, Trash2, Check,
  X, Home, LayoutGrid, Settings, LogOut, Edit2, PlusCircle,
  ChevronLeft, MessageCircle, Clock, Tag, ArrowRight, Package,
  ClipboardList, Store, AlertCircle, User,
} from 'lucide-angular';

export const Icons = {
  ShoppingCart, Search, MapPin, Phone, Plus, Minus, Trash2, Check,
  X, Home, LayoutGrid, Settings, LogOut, Edit2, PlusCircle,
  ChevronLeft, MessageCircle, Clock, Tag, ArrowRight, Package,
  ClipboardList, Store, AlertCircle, User,
};

// NOTE: for standalone components we import LucideAngularModule directly
// (not `.pick(...)`, which returns a ModuleWithProviders and is only valid
// in NgModule-based / bootstrap configuration, not in a component's
// `imports` array). Icon selection is handled per-use via the `[img]` input.
export const AppIconsModule = LucideAngularModule;
