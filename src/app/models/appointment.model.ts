export interface Appointment {
  patientId: string;
  date: string;
  description: string;
  type: 'checkup' | 'emergency' | 'vaccination' | 'ultrasound' | 'surgery' | 'other';
  status: 'scheduled' | 'completed' | 'cancelled';
  assignedVet: string;
  duration: number; // minutos
  notes: string;
}
