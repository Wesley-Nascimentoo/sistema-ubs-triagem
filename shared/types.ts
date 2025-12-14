// Tipos de usuário
export type UserRole = 'patient' | 'nurse' | 'doctor' | 'manager';

// Níveis de prioridade do Protocolo de Manchester
export type Priority = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

export const PRIORITY_LABELS: Record<Priority, string> = {
  red: 'Emergência',
  orange: 'Muito Urgente',
  yellow: 'Urgente',
  green: 'Pouco Urgente',
  blue: 'Não Urgente',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#F59E0B',
  green: '#10B981',
  blue: '#3B82F6',
};

// Turnos
export type Shift = 'morning' | 'afternoon';

export const SHIFT_LABELS: Record<Shift, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
};

// Tipos de atendimento
export type ServiceType = 
  | 'headache'
  | 'fever'
  | 'dental'
  | 'respiratory'
  | 'injury'
  | 'checkup'
  | 'vaccination'
  | 'other';

export interface ServiceTypeInfo {
  id: ServiceType;
  label: string;
  icon: string;
}

export const SERVICE_TYPES: ServiceTypeInfo[] = [
  { id: 'headache', label: 'Dor de Cabeça', icon: 'brain' },
  { id: 'fever', label: 'Febre', icon: 'thermometer' },
  { id: 'dental', label: 'Dentista', icon: 'tooth' },
  { id: 'respiratory', label: 'Problemas Respiratórios', icon: 'wind' },
  { id: 'injury', label: 'Lesão/Ferimento', icon: 'bandage' },
  { id: 'checkup', label: 'Consulta de Rotina', icon: 'stethoscope' },
  { id: 'vaccination', label: 'Vacinação', icon: 'syringe' },
  { id: 'other', label: 'Outros', icon: 'help-circle' },
];

// Interface do Paciente
export interface Patient {
  id: string;
  susCard: string;
  name: string;
  createdAt: string;
}

// Interface do Atendimento
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  susCard: string;
  serviceType: ServiceType;
  priority: Priority;
  shift: Shift;
  date: string;
  queuePosition: number;
  status: 'waiting_triage' | 'in_triage' | 'waiting_doctor' | 'in_consultation' | 'completed';
  triageData?: TriageData;
  consultationRoom?: string;
  consultationData?: ConsultationData;
  createdAt: string;
  updatedAt: string;
}

// Dados da Triagem
export interface TriageData {
  bloodPressure: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
  observations: string;
  nurseId: string;
  nurseName: string;
  completedAt: string;
}

// Dados da Consulta
export interface ConsultationData {
  diagnosis: string;
  prescription: string;
  observations: string;
  doctorId: string;
  doctorName: string;
  completedAt: string;
}

// Interface do Usuário (Funcionário)
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

// Configuração do Sistema
export interface SystemConfig {
  maxAppointmentsPerShift: number;
  currentShift: Shift;
  shiftDate: string;
}

// Constantes
export const MAX_APPOINTMENTS_PER_SHIFT = 16;
