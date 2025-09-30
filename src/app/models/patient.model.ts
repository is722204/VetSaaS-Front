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
  images: string[];
  vet: string;
  type: 'vaccine' | 'consultation' | 'emergency' | 'surgery' | 'other';
}

export interface PreventiveMedicine {
  type: string;
  product: string;
  date: string;
  nextDose: string;
  lot: string;
  image: string;
  notes: string;
}

export interface Pregnancy {
  isPregnant: boolean;
  pregnancyPercentage: number;
  estimatedReliefDate: string;
  ultrasoundDate: string;
  notes: string;
}

export interface Patient {
  basicInfo: BasicInfo;
  medicalHistory: { [recordId: string]: MedicalRecord };
  preventiveMedicine: { [medicineId: string]: PreventiveMedicine };
  pregnancy: Pregnancy;
}
