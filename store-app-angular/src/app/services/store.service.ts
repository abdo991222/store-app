import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CartItem, CartLine, CustomerForm, Order, Product, ViewName, ViewParams } from '../models';

interface ToastState {
  show: boolean;
  message: string;
}

const CART_KEY = 'store_cart';
const LAST_ORDER_ID_KEY = 'store_last_order_id';
const VIEW_STATE_KEY = 'store_view_state';

@Injectable({ providedIn: 'root' })
export class StoreService {
  constructor(private api: ApiService, private auth: AuthService) {
    this.init();
  }

  // ---- core data (comes from the backend) ----
  readonly ready = signal(false);
  readonly errorMsg = signal('');
  readonly products = signal<Product[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly storeName = signal('');
  readonly waNumber = signal('');

  // ---- navigation / ui state ----
  // Restored from sessionStorage so a page refresh keeps the customer on the
  // same screen (e.g. the order confirmation page) instead of bouncing them
  // back to Home and making it look like everything "disappeared".
  readonly view = signal<ViewName>(this.loadViewState().view);
  readonly params = signal<ViewParams>(this.loadViewState().params);
  readonly search = signal('');
  readonly activeCategory = signal('all');

  // Cart is kept in localStorage (not just in memory) so it survives a page
  // refresh or the customer closing the tab and coming back later.
  readonly cart = signal<CartItem[]>(this.loadCart());

  readonly toast = signal<ToastState>({ show: false, message: '' });
  readonly lastOrder = signal<Order | null>(null);

  /** Lives here (not inside the checkout page component) so the customer's
   *  typed info survives if they navigate away from checkout and come back. */
  readonly checkoutForm = signal<CustomerForm>({ name: '', phone: '', address: '', location: '', notes: '' });

  readonly isAdmin = this.auth.isAuthenticated;

  // ---- derived state ----
  readonly cartCount = computed(() => this.cart().reduce((s, c) => s + c.qty, 0));

  readonly cartTotal = computed(() => {
    const products = this.products();
    return this.cart().reduce((s, c) => {
      const prod = products.find((p) => p.id === c.id);
      return s + (prod ? prod.price * c.qty : 0);
    }, 0);
  });

  readonly cartMap = computed(() => Object.fromEntries(this.cart().map((c) => [c.id, c.qty])));

  readonly currentProduct = computed(() => this.products().find((p) => p.id === this.params().id));

  // ---- init: load products & settings from the backend on startup ----
  private async init() {
    try {
      const [products, settings] = await Promise.all([this.api.getProducts(), this.api.getSettings()]);
      this.products.set(products);
      this.storeName.set(settings.storeName);
      this.waNumber.set(settings.waNumber);
      await this.auth.verifySession();
      if (this.isAdmin()) await this.refreshOrders();
      await this.restoreLastOrder();
    } catch (e: any) {
      this.errorMsg.set('تعذّر الاتصال بالسيرفر. تأكد إن الـ backend شغال على ' + (e?.url || ''));
    } finally {
      this.ready.set(true);
    }
  }

  async refreshOrders() {
    this.orders.set(await this.api.getOrders());
  }

  // ---- cart persistence (localStorage) ----
  private loadCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.cart()));
  }

  // ---- last-order persistence, so "طلبي" / order confirmation survives a refresh ----
  private async restoreLastOrder() {
    const savedId = localStorage.getItem(LAST_ORDER_ID_KEY);
    if (!savedId) return;
    try {
      const order = await this.api.getOrder(savedId);
      this.lastOrder.set(order);
    } catch {
      // Order no longer exists (or DB was reset) — forget it quietly.
      localStorage.removeItem(LAST_ORDER_ID_KEY);
    }
  }

  /** Re-fetches the current status of the last order (e.g. when the customer opens the success/tracking page). */
  async refreshLastOrder() {
    const savedId = localStorage.getItem(LAST_ORDER_ID_KEY);
    if (!savedId) return;
    try {
      this.lastOrder.set(await this.api.getOrder(savedId));
    } catch {
      /* keep showing the last known state if the refresh fails */
    }
  }

  // ---- view-state persistence (sessionStorage: cleared when the tab closes) ----
  private loadViewState(): { view: ViewName; params: ViewParams } {
    try {
      const raw = sessionStorage.getItem(VIEW_STATE_KEY);
      if (!raw) return { view: 'home', params: {} };
      const parsed = JSON.parse(raw);
      return { view: parsed.view || 'home', params: parsed.params || {} };
    } catch {
      return { view: 'home', params: {} };
    }
  }

  // ---- navigation ----
  go(v: ViewName, p: ViewParams = {}) {
    this.view.set(v);
    this.params.set(p);
    sessionStorage.setItem(VIEW_STATE_KEY, JSON.stringify({ view: v, params: p }));
    window.scrollTo?.(0, 0);
  }

  // ---- toast ----
  showToast(message: string) {
    this.toast.set({ show: true, message });
    setTimeout(() => this.toast.set({ show: false, message: '' }), 1800);
  }

  // ---- cart ----
  addToCart(product: Product) {
    this.cart.update((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id: product.id, qty: 1 }];
    });
    this.saveCart();
    this.showToast(`تمت إضافة ${product.name} إلى السلة`);
  }

  setQty(id: string, qty: number) {
    this.cart.update((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
    this.saveCart();
  }

  removeItem(id: string) {
    this.cart.update((prev) => prev.filter((c) => c.id !== id));
    this.saveCart();
  }

  getCartLines(): CartLine[] {
    const products = this.products();
    return this.cart()
      .map((c) => ({ ...c, product: products.find((p) => p.id === c.id)! }))
      .filter((c) => !!c.product);
  }

  // ---- checkout ----
  async submitOrder(
    orderData: { customer: CustomerForm; method: 'website' | 'whatsapp' },
    navigate = true
  ): Promise<Order> {
    const order = await this.api.createOrder({
      items: this.cart(),
      customer: orderData.customer,
      method: orderData.method,
    });
    this.lastOrder.set(order);
    localStorage.setItem(LAST_ORDER_ID_KEY, order.id);
    this.cart.set([]);
    this.saveCart();
    this.checkoutForm.set({ name: '', phone: '', address: '', location: '', notes: '' });
    if (navigate) this.go('success');
    return order;
  }

  // ---- admin: products ----
  async createProduct(data: Partial<Product>) {
    const created = await this.api.createProduct(data);
    this.products.update((prev) => [...prev, created]);
  }

  async updateProduct(id: string, data: Partial<Product>) {
    const updated = await this.api.updateProduct(id, data);
    this.products.update((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async deleteProduct(id: string) {
    await this.api.deleteProduct(id);
    this.products.update((prev) => prev.filter((p) => p.id !== id));
  }

  // ---- admin: orders ----
  async updateOrderStatus(id: string, status: string) {
    const updated = await this.api.updateOrderStatus(id, status);
    this.orders.update((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }

  // ---- admin: settings ----
  async setStoreName(v: string) {
    this.storeName.set(v);
    await this.api.updateSettings({ storeName: v });
  }

  async setWaNumber(v: string) {
    this.waNumber.set(v);
    await this.api.updateSettings({ waNumber: v });
  }

  // ---- admin: auth ----
  async login(password: string) {
    await this.auth.login(password);
    await this.refreshOrders();
    this.go('admin');
  }

  logout() {
    this.auth.logout();
    this.go('home');
  }
}
