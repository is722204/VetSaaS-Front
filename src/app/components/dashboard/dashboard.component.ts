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
  daysUntil: number;
  pregnancyDays: number;
}

interface WeeklyAppointment {
  id: string;
  patientName: string;
  date: string;
  description: string;
  vet: string;
  time?: string;
  status?: string;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: WeeklyAppointment[];
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
  calendarDays: CalendarDay[] = [];
  currentDate = new Date();
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
      // Obtener todos los pacientes y filtrar los que están preñados
      const response = await this.patientService.getPatients().toPromise() as any;
      const patients = Object.values(response || {});
      
      this.pregnancyList = patients
        .filter((patient: any) => patient.pregnancy?.isPregnant && patient.pregnancy?.conceptionDate)
        .map((patient: any) => {
          const pregnancyData = this.calculatePregnancyData(patient.pregnancy.conceptionDate);
          return {
            name: patient.basicInfo?.name || 'Sin nombre',
            percentage: pregnancyData.percentage,
            estimatedDate: pregnancyData.estimatedDate,
            daysUntil: pregnancyData.daysUntil,
            pregnancyDays: pregnancyData.pregnancyDays
          };
        })
        .sort((a, b) => b.percentage - a.percentage); // Ordenar por porcentaje descendente
    } catch (error) {
      console.error('Error cargando información de gestación:', error);
      this.pregnancyList = [];
    }
  }

  private calculatePregnancyData(conceptionDate: string): any {
    const conception = new Date(conceptionDate);
    const today = new Date();
    
    // Calcular días de gestación
    const timeDiff = today.getTime() - conception.getTime();
    const pregnancyDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    // Calcular porcentaje (gestación de caballos: ~340 días)
    const totalPregnancyDays = 340;
    const percentage = Math.min(Math.max(Math.round((pregnancyDays / totalPregnancyDays) * 100), 0), 100);
    
    // Calcular fecha estimada de parto (11 meses = ~330 días)
    const estimatedRelief = new Date(conception);
    estimatedRelief.setDate(estimatedRelief.getDate() + 330);
    const estimatedDate = estimatedRelief.toISOString().split('T')[0];
    
    // Calcular días restantes
    const reliefTimeDiff = estimatedRelief.getTime() - today.getTime();
    const daysUntil = Math.ceil(reliefTimeDiff / (1000 * 3600 * 24));
    
    return {
      percentage,
      estimatedDate,
      daysUntil,
      pregnancyDays
    };
  }

  private async loadWeeklyAppointments(): Promise<void> {
    try {
      // Obtener todas las citas de los pacientes
      const response = await this.patientService.getPatients().toPromise() as any;
      const patients = Object.values(response || {});
      
      // Extraer todas las citas
      const allAppointments: WeeklyAppointment[] = [];
      patients.forEach((patient: any) => {
        if (patient.appointments) {
          Object.values(patient.appointments).forEach((appointment: any) => {
            allAppointments.push({
              id: appointment.id || Math.random().toString(36).substr(2, 9),
              patientName: patient.basicInfo?.name || 'Paciente',
              date: appointment.date,
              description: appointment.description,
              vet: appointment.vet || 'Veterinario',
              time: appointment.time || '09:00',
              status: appointment.status || 'scheduled'
            });
          });
        }
      });
      
      this.weeklyAppointments = allAppointments;
      this.generateCalendar();
    } catch (error) {
      console.error('Error cargando citas de la semana:', error);
      this.weeklyAppointments = [];
      this.generateCalendar();
    }
  }

  private generateCalendar(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Obtener el primer día del mes y el último día
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Obtener el primer lunes de la semana que contiene el primer día del mes
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lunes = 1
    startDate.setDate(firstDay.getDate() - daysToSubtract);
    
    // Generar 42 días (6 semanas)
    this.calendarDays = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayNumber = date.getDate();
      const isCurrentMonth = date.getMonth() === month;
      const isToday = this.isSameDay(date, today);
      
      // Filtrar citas para este día
      const dayAppointments = this.weeklyAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return this.isSameDay(appointmentDate, date);
      });
      
      this.calendarDays.push({
        date,
        dayNumber,
        isCurrentMonth,
        isToday,
        appointments: dayAppointments
      });
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  getMonthName(): string {
    return this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  getWeekDays(): string[] {
    return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  }

  getAppointmentStatusClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getAppointmentStatusText(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'rescheduled':
        return 'Reprogramada';
      default:
        return 'Desconocido';
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
