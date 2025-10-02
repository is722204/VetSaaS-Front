import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PatientsComponent } from './components/patients/patients.component';
import { PatientDetailComponent } from './components/patients/patient-detail/patient-detail.component';
import { PatientFormComponent } from './components/patients/patient-form/patient-form.component';
import { PatientEditComponent } from './components/patients/patient-edit/patient-edit.component';
import { MedicalRecordFormComponent } from './components/patients/medical-record-form/medical-record-form.component';
import { PreventiveMedicineFormComponent } from './components/patients/preventive-medicine-form/preventive-medicine-form.component';
import { AppointmentFormComponent } from './components/patients/appointment-form/appointment-form.component';
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
        path: 'patients/:id/medical-record/new',
        component: MedicalRecordFormComponent
      },
      {
        path: 'patients/:id/preventive-medicine/new',
        component: PreventiveMedicineFormComponent
      },
      {
        path: 'patients/:id/appointment/new',
        component: AppointmentFormComponent
      },
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
