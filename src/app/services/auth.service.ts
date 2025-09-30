import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, AuthState } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    tenant: null,
    token: null
  });

  public authState$ = this.authState.asObservable();

  constructor(private apiService: ApiService) {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const tenant = localStorage.getItem('tenant');

    if (token && user && tenant) {
      this.authState.next({
        isAuthenticated: true,
        user: JSON.parse(user),
        tenant: JSON.parse(tenant),
        token
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials);
  }

  setAuthState(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('tenant', JSON.stringify(response.tenant));

    this.authState.next({
      isAuthenticated: true,
      user: response.user,
      tenant: response.tenant,
      token: response.token
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');

    this.authState.next({
      isAuthenticated: false,
      user: null,
      tenant: null,
      token: null
    });
  }

  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  getCurrentUser() {
    return this.authState.value.user;
  }

  getCurrentTenant() {
    return this.authState.value.tenant;
  }
}