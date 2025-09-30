import { Component, OnInit } from '@angular/core';
import { BillingService } from '../../services/billing.service';
import { PatientService } from '../../services/patient.service';
import { AppointmentService } from '../../services/appointment.service';
import { ApiService } from '../../services/api.service';

interface DashboardStats {
  totalPatients: number;
  totalRevenue: number;
  weeklyAppointments: number;
  monthlyRevenue?: number;
  newPatientsThisMonth?: number;
  completedAppointments?: number;
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
  recentPatients: any[] = [];
  breedStats: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private billingService: BillingService,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    let completedRequests = 0;
    const totalRequests = 5;

    const checkLoadingComplete = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.isLoading = false;
      }
    };

    // Cargar estadísticas
    this.billingService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.errorMessage = 'Error cargando estadísticas del dashboard';
        checkLoadingComplete();
      }
    });

    // Cargar información de gestación
    this.loadPregnancyInfo().then(() => {
      checkLoadingComplete();
    });

    // Cargar citas de la semana
    this.loadWeeklyAppointments().then(() => {
      checkLoadingComplete();
    });

    // Cargar pacientes recientes
    this.loadRecentPatients().then(() => {
      checkLoadingComplete();
    });

    // Cargar estadísticas de razas
    this.loadBreedStats().then(() => {
      checkLoadingComplete();
    });
  }


  private async loadPregnancyInfo(): Promise<void> {
    try {
      const response = await this.apiService.get('/dashboard/pregnancy').toPromise() as any[];
      this.pregnancyList = response.map((pregnancy: any) => ({
        name: pregnancy.name,
        percentage: pregnancy.percentage,
        estimatedDate: pregnancy.estimatedDate
      }));
    } catch (error) {
      console.error('Error cargando información de gestación:', error);
      this.pregnancyList = [];
    }
  }

  private async loadWeeklyAppointments(): Promise<void> {
    try {
      const response = await this.apiService.get('/dashboard/weekly-appointments').toPromise() as any[];
      this.weeklyAppointments = response.map((appointment: any) => ({
        id: appointment.appointmentId,
        patientName: appointment.patientName || 'Paciente',
        date: this.formatDate(appointment.date),
        description: appointment.description,
        vet: appointment.assignedVet || 'Veterinario'
      }));
    } catch (error) {
      console.error('Error cargando citas de la semana:', error);
      this.weeklyAppointments = [];
    }
  }


  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  private async loadRecentPatients(): Promise<void> {
    try {
      const response = await this.patientService.getPatients().toPromise() as any;
      const patients = Object.values(response || {});
      
      // Ordenar por fecha de creación y tomar los 5 más recientes
      this.recentPatients = patients
        .sort((a: any, b: any) => 
          new Date(b.basicInfo?.createdAt || 0).getTime() - 
          new Date(a.basicInfo?.createdAt || 0).getTime()
        )
        .slice(0, 5)
        .map((patient: any) => ({
          id: patient.basicInfo?.patientId,
          name: patient.basicInfo?.name,
          breed: patient.basicInfo?.breed,
          createdAt: patient.basicInfo?.createdAt,
          photoUrl: patient.basicInfo?.photoUrl
        }));
    } catch (error) {
      console.error('Error cargando pacientes recientes:', error);
      this.recentPatients = [];
    }
  }

  private async loadBreedStats(): Promise<void> {
    try {
      const response = await this.patientService.getPatients().toPromise() as any;
      const patients = Object.values(response || {});
      
      // Contar razas
      const breedCount: { [key: string]: number } = {};
      patients.forEach((patient: any) => {
        const breed = patient.basicInfo?.breed || 'Sin especificar';
        breedCount[breed] = (breedCount[breed] || 0) + 1;
      });
      
      // Convertir a array y ordenar por cantidad
      this.breedStats = Object.entries(breedCount)
        .map(([breed, count]) => ({ breed, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 razas
    } catch (error) {
      console.error('Error cargando estadísticas de razas:', error);
      this.breedStats = [];
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES');
  }

  getPatientAge(birthDate: string): string {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} años`;
    }

    return `${age} años`;
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
