import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PatientsComponent } from './components/patients/patients.component';
import { PatientDetailComponent } from './components/patients/patient-detail/patient-detail.component';
import { PatientFormComponent } from './components/patients/patient-form/patient-form.component';
import { PatientEditComponent } from './components/patients/patient-edit/patient-edit.component';
import { BillingComponent } from './components/billing/billing.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'patients',
        component: PatientsComponent
      },
      {
        path: 'patients/new',
        component: PatientFormComponent
      },
      {
        path: 'patients/:id',
        component: PatientDetailComponent
      },
      {
        path: 'patients/:id/edit',
        component: PatientEditComponent
      },
      {
        path: 'billing',
        component: BillingComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
