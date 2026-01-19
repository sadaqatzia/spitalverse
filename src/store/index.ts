import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
    AppState,
    PatientProfile,
    MedicalDocument,
    Medication,
    LabReport,
    Appointment,
    HealthSummary
} from '@/types';

const defaultProfile: PatientProfile = {
    id: uuidv4(),
    photo: null,
    fullName: 'Nabel Alsulaiman',
    dateOfBirth: '1997-03-28',
    gender: 'male',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 123-4567',
    },
};

// Sample medications for demo
const sampleMedications: Medication[] = [
    {
        id: uuidv4(),
        name: 'Metformin',
        dosage: '500 mg',
        frequency: 'Twice daily',
        startDate: '2024-01-15',
        endDate: null,
        status: 'active',
        reminderEnabled: true,
        notes: 'Take with meals to reduce stomach upset',
    },
    {
        id: uuidv4(),
        name: 'Amlodipine',
        dosage: '5 mg',
        frequency: 'Once daily',
        startDate: '2024-02-01',
        endDate: null,
        status: 'active',
        reminderEnabled: true,
        notes: 'For blood pressure control',
    },
    {
        id: uuidv4(),
        name: 'Atorvastatin',
        dosage: '10 mg',
        frequency: 'Once daily (at night)',
        startDate: '2024-01-20',
        endDate: null,
        status: 'active',
        reminderEnabled: true,
        notes: 'Cholesterol management',
    },
    {
        id: uuidv4(),
        name: 'Vitamin D3',
        dosage: '60,000 IU',
        frequency: 'Once weekly',
        startDate: '2024-03-01',
        endDate: null,
        status: 'active',
        reminderEnabled: false,
        notes: 'Vitamin D supplementation',
    },
];

// Sample lab report for demo (German/EU Standards)
const sampleLabReports: LabReport[] = [
    {
        id: uuidv4(),
        name: 'Annual Health Checkup',
        date: '2024-12-15',
        values: [
            { id: uuidv4(), name: 'Hemoglobin', value: 14.2, unit: 'g/dL', normalRange: { min: 12.0, max: 17.5 }, trend: 'normal', date: '2024-12-15' },
            { id: uuidv4(), name: 'Fasting Blood Glucose', value: 112, unit: 'mg/dL', normalRange: { min: 70, max: 99 }, trend: 'up', date: '2024-12-15' },
            { id: uuidv4(), name: 'HbA1c', value: 6.1, unit: '%', normalRange: { min: 4.0, max: 5.6 }, trend: 'up', date: '2024-12-15' },
            { id: uuidv4(), name: 'Total Cholesterol', value: 218, unit: 'mg/dL', normalRange: { min: 0, max: 200 }, trend: 'up', date: '2024-12-15' },
            { id: uuidv4(), name: 'LDL Cholesterol', value: 142, unit: 'mg/dL', normalRange: { min: 0, max: 130 }, trend: 'up', date: '2024-12-15' },
            { id: uuidv4(), name: 'HDL Cholesterol', value: 48, unit: 'mg/dL', normalRange: { min: 40, max: 100 }, trend: 'normal', date: '2024-12-15' },
            { id: uuidv4(), name: 'TSH', value: 2.4, unit: 'mIU/L', normalRange: { min: 0.4, max: 4.0 }, trend: 'normal', date: '2024-12-15' },
            { id: uuidv4(), name: 'Vitamin D (25-OH)', value: 24, unit: 'ng/mL', normalRange: { min: 30, max: 100 }, trend: 'down', date: '2024-12-15' },
            { id: uuidv4(), name: 'Creatinine', value: 0.95, unit: 'mg/dL', normalRange: { min: 0.6, max: 1.2 }, trend: 'normal', date: '2024-12-15' },
        ],
    },
];

// Sample appointments for demo
const sampleAppointments: Appointment[] = [
    {
        id: uuidv4(),
        doctorName: 'Dr. Sarah Johnson',
        specialty: 'Endocrinologist',
        date: '2026-02-15',
        time: '10:30',
        location: 'City Medical Center, Room 402',
        notes: 'Follow-up for diabetes management',
        isUpcoming: true,
    },
    {
        id: uuidv4(),
        doctorName: 'Dr. Michael Chen',
        specialty: 'Cardiologist',
        date: '2026-03-01',
        time: '14:00',
        location: 'Heart Care Clinic',
        notes: 'Annual heart checkup',
        isUpcoming: true,
    },
];

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            profile: defaultProfile,
            documents: [],
            medications: sampleMedications,
            labReports: sampleLabReports,
            appointments: sampleAppointments,
            healthSummaries: [],

            updateProfile: (profileUpdate: Partial<PatientProfile>) => {
                set((state) => ({
                    profile: { ...state.profile, ...profileUpdate },
                }));
            },

            addDocument: (document: MedicalDocument) => {
                set((state) => ({
                    documents: [...state.documents, document],
                }));
            },

            deleteDocument: (id: string) => {
                set((state) => ({
                    documents: state.documents.filter((doc) => doc.id !== id),
                }));
            },

            addMedication: (medication: Medication) => {
                set((state) => ({
                    medications: [...state.medications, medication],
                }));
            },

            updateMedication: (id: string, medicationUpdate: Partial<Medication>) => {
                set((state) => ({
                    medications: state.medications.map((med) =>
                        med.id === id ? { ...med, ...medicationUpdate } : med
                    ),
                }));
            },

            deleteMedication: (id: string) => {
                set((state) => ({
                    medications: state.medications.filter((med) => med.id !== id),
                }));
            },

            addLabReport: (report: LabReport) => {
                set((state) => ({
                    labReports: [...state.labReports, report],
                }));
            },

            deleteLabReport: (id: string) => {
                set((state) => ({
                    labReports: state.labReports.filter((report) => report.id !== id),
                }));
            },

            addAppointment: (appointment: Appointment) => {
                set((state) => ({
                    appointments: [...state.appointments, appointment],
                }));
            },

            updateAppointment: (id: string, appointmentUpdate: Partial<Appointment>) => {
                set((state) => ({
                    appointments: state.appointments.map((apt) =>
                        apt.id === id ? { ...apt, ...appointmentUpdate } : apt
                    ),
                }));
            },

            deleteAppointment: (id: string) => {
                set((state) => ({
                    appointments: state.appointments.filter((apt) => apt.id !== id),
                }));
            },

            addHealthSummary: (summary: HealthSummary) => {
                set((state) => ({
                    healthSummaries: [summary, ...state.healthSummaries],
                }));
            },

            exportData: () => {
                const state = get();
                const exportData = {
                    profile: state.profile,
                    documents: state.documents,
                    medications: state.medications,
                    labReports: state.labReports,
                    appointments: state.appointments,
                    healthSummaries: state.healthSummaries,
                    exportedAt: new Date().toISOString(),
                };
                return JSON.stringify(exportData, null, 2);
            },

            clearAllData: () => {
                set({
                    profile: defaultProfile,
                    documents: [],
                    medications: [],
                    labReports: [],
                    appointments: [],
                    healthSummaries: [],
                });
            },
        }),
        {
            name: 'spitalverse-storage',
        }
    )
);
