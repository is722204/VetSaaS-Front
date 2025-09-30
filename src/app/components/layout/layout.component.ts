import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { AuthState } from '../../models/auth.model';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  authState: AuthState | null = null;
  currentRoute = '';
  private authSubscription: Subscription = new Subscription();
  private routerSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.authState$.subscribe(state => {
      this.authState = state;
    });

    // Suscribirse a cambios de ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = (event as NavigationEnd).url;
      });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    // Cerrar sidebar en móvil después de navegar
    if (window.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }
}
