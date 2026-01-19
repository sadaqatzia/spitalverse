export interface PatientProfile {
  id: string;
  photo: string | null;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  };
}

export type DocumentCategory = 'labs' | 'prescriptions' | 'imaging' | 'discharge';

export interface MedicalDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileType: 'pdf' | 'image';
  fileUrl: string;
  uploadDate: string;
  fileSize: number;
}

export type MedicationStatus = 'active' | 'completed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  status: MedicationStatus;
  reminderEnabled: boolean;
  notes?: string;
}

export type TrendDirection = 'up' | 'down' | 'normal';

export interface LabValue {
  id: string;
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  trend: TrendDirection;
  date: string;
}

export interface LabReport {
  id: string;
  name: string;
  date: string;
  documentId?: string;
  values: LabValue[];
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  isUpcoming: boolean;
}

export interface HealthSummary {
  id: string;
  generatedAt: string;
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'moderate' | 'high';
}

export interface AppState {
  profile: PatientProfile;
  documents: MedicalDocument[];
  medications: Medication[];
  labReports: LabReport[];
  appointments: Appointment[];
  healthSummaries: HealthSummary[];

  updateProfile: (profile: Partial<PatientProfile>) => void;
  addDocument: (document: MedicalDocument) => void;
  deleteDocument: (id: string) => void;
  addMedication: (medication: Medication) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  addLabReport: (report: LabReport) => void;
  deleteLabReport: (id: string) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addHealthSummary: (summary: HealthSummary) => void;
  exportData: () => string;
  clearAllData: () => void;
}
