import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  currentYear = new Date().getFullYear();
  isAuthenticated = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Verificar si el usuario ya está autenticado
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  navigateToLogin(): void {
    if (this.isAuthenticated) {
      // Si ya está autenticado, ir directamente al dashboard
      this.router.navigate(['/app/dashboard']);
    } else {
      // Si no está autenticado, ir al login
      this.router.navigate(['/login']);
    }
  }

}
