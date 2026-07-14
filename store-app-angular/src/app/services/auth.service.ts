import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

const TOKEN_KEY = 'auth_token';

// sessionStorage (not localStorage) on purpose: an admin session ends when
// the browser tab/window is closed, so the admin dashboard never "just
// opens" for whoever uses the computer next — they always have to log in.
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal(!!sessionStorage.getItem(TOKEN_KEY));

  constructor(private api: ApiService) {}

  async login(password: string, username = 'admin'): Promise<void> {
    const { token } = await this.api.login(username, password);
    sessionStorage.setItem(TOKEN_KEY, token);
    this.isAuthenticated.set(true);
  }

  logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    this.isAuthenticated.set(false);
  }

  getToken(): string {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  /** Confirms a stored token is still valid (e.g. after a page reload). Logs out silently if not. */
  async verifySession(): Promise<void> {
    if (!sessionStorage.getItem(TOKEN_KEY)) return;
    try {
      await this.api.me();
    } catch {
      this.logout();
    }
  }
}
