export interface Owner {
  name: string;
  phone: string;
  email: string;
}

export interface BasicInfo {
  name: string;
  patientId: string;
  owner: Owner;
  birthDate: string;
  sex: 'macho' | 'hembra';
  color: string;
  breed: string;
  photoUrl: string;
  createdAt: string;
}

export interface MedicalRecord {
  date: string;
  description: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface PreventiveMedicine {
  type: string;
  date: string;
  nextDose: string;
  lot: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface Appointment {
  date: string;
  description: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  createdAt?: string;
}

export interface Pregnancy {
  isPregnant: boolean;
  conceptionDate: string;
  pregnancyPercentage: number;
  estimatedReliefDate: string;
  ultrasoundDate: string;
  notes: string;
}

export interface Patient {
  basicInfo: BasicInfo;
  medicalHistory: { [recordId: string]: MedicalRecord };
  preventiveMedicine: { [medicineId: string]: PreventiveMedicine };
  appointments: { [appointmentId: string]: Appointment };
  pregnancy: Pregnancy;
}
