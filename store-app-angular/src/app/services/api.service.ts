import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem, CustomerForm, Order, Product, Settings } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth_token') || '';
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // ---- auth ----
  login(username: string, password: string): Promise<{ token: string; username: string }> {
    return firstValueFrom(
      this.http.post<{ token: string; username: string }>(`${this.base}/auth/login`, { username, password })
    );
  }

  me(): Promise<{ username: string }> {
    return firstValueFrom(this.http.get<{ username: string }>(`${this.base}/auth/me`, { headers: this.authHeaders() }));
  }

  // ---- products ----
  getProducts(): Promise<Product[]> {
    return firstValueFrom(this.http.get<Product[]>(`${this.base}/products`));
  }

  createProduct(data: Partial<Product>): Promise<Product> {
    return firstValueFrom(this.http.post<Product>(`${this.base}/products`, data, { headers: this.authHeaders() }));
  }

  updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return firstValueFrom(this.http.put<Product>(`${this.base}/products/${id}`, data, { headers: this.authHeaders() }));
  }

  deleteProduct(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/products/${id}`, { headers: this.authHeaders() }));
  }

  // ---- orders ----
  getOrders(): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(`${this.base}/orders`, { headers: this.authHeaders() }));
  }

  getOrder(id: string): Promise<Order> {
    return firstValueFrom(this.http.get<Order>(`${this.base}/orders/${id}`));
  }

  lookupOrdersByPhone(phone: string): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(`${this.base}/orders/lookup`, { params: { phone } }));
  }

  createOrder(payload: { items: CartItem[]; customer: CustomerForm; method: 'website' | 'whatsapp' }): Promise<Order> {
    return firstValueFrom(this.http.post<Order>(`${this.base}/orders`, payload));
  }

  updateOrderStatus(id: string, status: string): Promise<Order> {
    return firstValueFrom(
      this.http.patch<Order>(`${this.base}/orders/${id}/status`, { status }, { headers: this.authHeaders() })
    );
  }

  // ---- settings ----
  getSettings(): Promise<Settings> {
    return firstValueFrom(this.http.get<Settings>(`${this.base}/settings`));
  }

  updateSettings(data: Partial<Settings>): Promise<Settings> {
    return firstValueFrom(this.http.put<Settings>(`${this.base}/settings`, data, { headers: this.authHeaders() }));
  }
}
