import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PatientsComponent } from './components/patients/patients.component';
import { PatientDetailComponent } from './components/patients/patient-detail/patient-detail.component';
import { PatientFormComponent } from './components/patients/patient-form/patient-form.component';
import { PatientEditComponent } from './components/patients/patient-edit/patient-edit.component';
import { BillingComponent } from './components/billing/billing.component';
import { MedicalRecordFormComponent } from './components/patients/medical-record-form/medical-record-form.component';
import { PreventiveMedicineFormComponent } from './components/patients/preventive-medicine-form/preventive-medicine-form.component';
import { AppointmentFormComponent } from './components/patients/appointment-form/appointment-form.component';
import { ModalComponent } from './components/shared/modal/modal.component';
import { MedicalRecordModalComponent } from './components/patients/medical-record-modal/medical-record-modal.component';
import { PreventiveMedicineModalComponent } from './components/patients/preventive-medicine-modal/preventive-medicine-modal.component';
import { AppointmentModalComponent } from './components/patients/appointment-modal/appointment-modal.component';
import { MedicalRecordDetailModalComponent } from './components/patients/medical-record-detail-modal/medical-record-detail-modal.component';
import { PreventiveMedicineDetailModalComponent } from './components/patients/preventive-medicine-detail-modal/preventive-medicine-detail-modal.component';
import { AppointmentDetailModalComponent } from './components/patients/appointment-detail-modal/appointment-detail-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    DashboardComponent,
    PatientsComponent,
    PatientDetailComponent,
    PatientFormComponent,
    PatientEditComponent,
    BillingComponent,
    MedicalRecordFormComponent,
    PreventiveMedicineFormComponent,
    AppointmentFormComponent,
    ModalComponent,
    MedicalRecordModalComponent,
    PreventiveMedicineModalComponent,
    AppointmentModalComponent,
    MedicalRecordDetailModalComponent,
    PreventiveMedicineDetailModalComponent,
    AppointmentDetailModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
