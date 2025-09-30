import { Component, OnInit } from '@angular/core';
import { BillingService } from '../../services/billing.service';
import { PatientService } from '../../services/patient.service';
import { AppointmentService } from '../../services/appointment.service';

interface DashboardStats {
  totalPatients: number;
  totalRevenue: number;
  weeklyAppointments: number;
}

interface PregnancyInfo {
  name: string;
  percentage: number;
  estimatedDate: string;
}

interface WeeklyAppointment {
  id: string;
  patientName: string;
  date: string;
  description: string;
  vet: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalPatients: 0,
    totalRevenue: 0,
    weeklyAppointments: 0
  };

  pregnancyList: PregnancyInfo[] = [];
  weeklyAppointments: WeeklyAppointment[] = [];
  isLoading = true;

  constructor(
    private billingService: BillingService,
    private patientService: PatientService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    // Cargar estadísticas
    this.billingService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
      }
    });

    // Cargar pacientes para obtener información de gestación
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.pregnancyList = this.extractPregnancyInfo(patients);
      },
      error: (error) => {
        console.error('Error cargando pacientes:', error);
      }
    });

    // Cargar citas de la semana
    this.loadWeeklyAppointments();

    this.isLoading = false;
  }

  private extractPregnancyInfo(patients: any): PregnancyInfo[] {
    const pregnancyList: PregnancyInfo[] = [];
    
    Object.values(patients).forEach((patient: any) => {
      if (patient.pregnancy?.isPregnant) {
        pregnancyList.push({
          name: patient.basicInfo.name,
          percentage: patient.pregnancy.pregnancyPercentage,
          estimatedDate: patient.pregnancy.estimatedReliefDate
        });
      }
    });

    return pregnancyList;
  }

  private loadWeeklyAppointments(): void {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    this.appointmentService.getAppointmentsByDateRange(
      startOfWeek.toISOString(),
      endOfWeek.toISOString()
    ).subscribe({
      next: (appointments) => {
        this.weeklyAppointments = this.formatWeeklyAppointments(appointments);
      },
      error: (error) => {
        console.error('Error cargando citas:', error);
      }
    });
  }

  private formatWeeklyAppointments(appointments: any): WeeklyAppointment[] {
    return Object.entries(appointments).map(([id, appointment]: [string, any]) => ({
      id,
      patientName: appointment.patientName || 'Paciente',
      date: new Date(appointment.date).toLocaleDateString('es-ES'),
      description: appointment.description,
      vet: appointment.assignedVet || 'Veterinario'
    }));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }
}
