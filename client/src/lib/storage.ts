import type { User, Patient, Appointment, SystemConfig, Shift } from '@/../../shared/types';
import { MAX_APPOINTMENTS_PER_SHIFT } from '@/../../shared/types';

// Keys do localStorage
const STORAGE_KEYS = {
  USERS: 'ubs_users',
  PATIENTS: 'ubs_patients',
  APPOINTMENTS: 'ubs_appointments',
  CURRENT_USER: 'ubs_current_user',
  SYSTEM_CONFIG: 'ubs_system_config',
} as const;

// Inicializar dados padrão
export function initializeStorage() {
  // Criar usuários padrão se não existirem
  const users = getUsers();
  if (users.length === 0) {
    const defaultUsers: User[] = [
      {
        id: '1',
        username: 'enfermeiro',
        password: '123456',
        name: 'Enfermeiro(a) Silva',
        role: 'nurse',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        username: 'medico',
        password: '123456',
        name: 'Dr(a). Santos',
        role: 'doctor',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        username: 'gestor',
        password: '123456',
        name: 'Gestor(a) Oliveira',
        role: 'manager',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // Inicializar configuração do sistema
  const config = getSystemConfig();
  if (!config) {
    const now = new Date();
    const hour = now.getHours();
    const shift: Shift = hour < 12 ? 'morning' : 'afternoon';
    
    const defaultConfig: SystemConfig = {
      maxAppointmentsPerShift: MAX_APPOINTMENTS_PER_SHIFT,
      currentShift: shift,
      shiftDate: now.toISOString().split('T')[0],
    };
    localStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(defaultConfig));
  }
}

// Usuários
export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function getUserByCredentials(username: string, password: string): User | null {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password) || null;
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Pacientes
export function getPatients(): Patient[] {
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  return data ? JSON.parse(data) : [];
}

export function getPatientBySusCard(susCard: string): Patient | null {
  const patients = getPatients();
  return patients.find(p => p.susCard === susCard) || null;
}

export function createPatient(susCard: string, name: string): Patient {
  const patients = getPatients();
  const patient: Patient = {
    id: Date.now().toString(),
    susCard,
    name,
    createdAt: new Date().toISOString(),
  };
  patients.push(patient);
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  return patient;
}

// Atendimentos
export function getAppointments(): Appointment[] {
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  return data ? JSON.parse(data) : [];
}

export function getAppointmentById(id: string): Appointment | null {
  const appointments = getAppointments();
  return appointments.find(a => a.id === id) || null;
}

export function createAppointment(appointment: Omit<Appointment, 'id' | 'queuePosition' | 'createdAt' | 'updatedAt'>): Appointment {
  const appointments = getAppointments();
  const config = getSystemConfig()!;
  
  // Calcular posição na fila
  const waitingAppointments = appointments.filter(
    a => a.status === 'waiting_triage' && a.date === appointment.date && a.shift === appointment.shift
  );
  
  const newAppointment: Appointment = {
    ...appointment,
    id: Date.now().toString(),
    queuePosition: waitingAppointments.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  appointments.push(newAppointment);
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  return newAppointment;
}

export function updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
  const appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  appointments[index] = {
    ...appointments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  return appointments[index];
}

export function getAppointmentsByShift(date: string, shift: Shift): Appointment[] {
  const appointments = getAppointments();
  return appointments.filter(a => a.date === date && a.shift === shift);
}

export function getTriageQueue(): Appointment[] {
  const appointments = getAppointments();
  return appointments
    .filter(a => a.status === 'waiting_triage')
    .sort((a, b) => {
      // Ordenar por prioridade primeiro
      const priorityOrder = { red: 0, orange: 1, yellow: 2, green: 3, blue: 4 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Depois por ordem de chegada
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}

export function getDoctorQueue(): Appointment[] {
  const appointments = getAppointments();
  return appointments
    .filter(a => a.status === 'waiting_doctor')
    .sort((a, b) => {
      // Ordenar por prioridade primeiro
      const priorityOrder = { red: 0, orange: 1, yellow: 2, green: 3, blue: 4 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Depois por ordem de chegada
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}

// Configuração do Sistema
export function getSystemConfig(): SystemConfig | null {
  const data = localStorage.getItem(STORAGE_KEYS.SYSTEM_CONFIG);
  return data ? JSON.parse(data) : null;
}

export function updateSystemConfig(updates: Partial<SystemConfig>) {
  const config = getSystemConfig();
  if (!config) return;
  
  const newConfig = { ...config, ...updates };
  localStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(newConfig));
}

export function checkShiftAndReset() {
  const config = getSystemConfig();
  if (!config) return;
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const hour = now.getHours();
  const currentShift: Shift = hour < 12 ? 'morning' : 'afternoon';
  
  // Se mudou o dia ou o turno, resetar
  if (config.shiftDate !== today || config.currentShift !== currentShift) {
    updateSystemConfig({
      currentShift,
      shiftDate: today,
    });
  }
}

export function canAcceptMoreAppointments(): boolean {
  const config = getSystemConfig();
  if (!config) return false;
  
  checkShiftAndReset();
  
  const appointments = getAppointmentsByShift(config.shiftDate, config.currentShift);
  return appointments.length < config.maxAppointmentsPerShift;
}

export function getAvailableSlots(): number {
  const config = getSystemConfig();
  if (!config) return 0;
  
  checkShiftAndReset();
  
  const appointments = getAppointmentsByShift(config.shiftDate, config.currentShift);
  return Math.max(0, config.maxAppointmentsPerShift - appointments.length);
}
