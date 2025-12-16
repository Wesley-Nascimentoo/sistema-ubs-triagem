import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogOut, UserCheck, Clock, AlertCircle, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorQueue, updateAppointment } from '@/lib/storage';
import { playBeep } from '@/lib/audio';
import { callPatient } from '@/lib/speech';
import { PRIORITY_LABELS, PRIORITY_COLORS, SERVICE_TYPES, type Appointment } from '@/../../shared/types';

export default function DoctorPanel() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Appointment | null>(null);
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  const [consultationData, setConsultationData] = useState({
    diagnosis: '',
    prescription: '',
    observations: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      toast.error('Acesso não autorizado');
      setLocation('/staff/login');
      return;
    }
    
    loadQueue();
  }, [user, setLocation]);

  const loadQueue = () => {
    const doctorQueue = getDoctorQueue();
    setQueue(doctorQueue);
  };

  const handleCallNext = async () => {
    if (queue.length === 0) {
      toast.error('Não há pacientes na fila de atendimento');
      return;
    }

    const nextPatient = queue[0];
    
    // Atualizar status para "em consulta"
    updateAppointment(nextPatient.id, { status: 'in_consultation' });
    
    setCurrentPatient(nextPatient);
    setIsConsultationDialogOpen(true);
    
    // Alerta sonoro para o atendimento médico
    playBeep(0.3, 660); // Um beep um pouco mais longo e agudo para diferenciar

    // Chamar paciente com áudio 4 vezes
    await callPatient(nextPatient.patientName, `Consultório ${nextPatient.consultationRoom}`);

    toast.success(`Chamando: ${nextPatient.patientName}`);
  };

  const handleCompleteConsultation = () => {
    if (!currentPatient) return;

    // Validar campos obrigatórios
    if (!consultationData.diagnosis) {
      toast.error('Por favor, informe o diagnóstico');
      return;
    }

    // Atualizar atendimento com dados da consulta
    updateAppointment(currentPatient.id, {
      status: 'completed',
      consultationData: {
        ...consultationData,
        doctorId: user!.id,
        doctorName: user!.name,
        completedAt: new Date().toISOString(),
      },
    });

    toast.success('Consulta concluída com sucesso!');
    
    // Resetar formulário
    setConsultationData({
      diagnosis: '',
      prescription: '',
      observations: '',
    });
    
    setCurrentPatient(null);
    setIsConsultationDialogOpen(false);
    loadQueue();
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso');
    setLocation('/staff/login');
  };

  const getServiceLabel = (serviceType: string) => {
    return SERVICE_TYPES.find(s => s.id === serviceType)?.label || serviceType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel do Médico</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo(a), {user?.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pacientes na Fila</CardDescription>
                <CardTitle className="text-3xl">{queue.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Atendimento Atual</CardDescription>
                <CardTitle className="text-xl">
                  {currentPatient ? currentPatient.patientName : 'Nenhum'}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Status</CardDescription>
                <CardTitle className="text-xl text-green-600">
                  {currentPatient ? 'Em Atendimento' : 'Disponível'}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Ação Principal */}
          <Card>
            <CardHeader>
              <CardTitle>Chamar Próximo Paciente</CardTitle>
              <CardDescription>
                Clique no botão abaixo para chamar o próximo paciente da fila de atendimento médico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCallNext} 
                size="lg" 
                className="w-full"
                disabled={queue.length === 0 || !!currentPatient}
              >
                <UserCheck className="mr-2 w-5 h-5" />
                Chamar Próximo Paciente
              </Button>
            </CardContent>
          </Card>

          {/* Fila de Atendimento */}
          <Card>
            <CardHeader>
              <CardTitle>Fila de Atendimento Médico</CardTitle>
              <CardDescription>
                Pacientes aguardando consulta (ordenados por prioridade)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum paciente na fila</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((appointment, index) => {
                    const priorityColor = PRIORITY_COLORS[appointment.priority];
                    const priorityLabel = PRIORITY_LABELS[appointment.priority];
                    
                    return (
                      <div 
                        key={appointment.id}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                        style={{ borderLeft: `4px solid ${priorityColor}` }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{appointment.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {getServiceLabel(appointment.serviceType)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div 
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mb-1"
                            style={{ 
                              backgroundColor: `${priorityColor}15`,
                              color: priorityColor 
                            }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            {priorityLabel}
                          </div>
                          {appointment.triageData && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Triagem concluída
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dialog de Consulta */}
      <Dialog open={isConsultationDialogOpen} onOpenChange={setIsConsultationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Realizar Consulta</DialogTitle>
            <DialogDescription>
              Paciente: {currentPatient?.patientName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Dados da Triagem */}
            {currentPatient?.triageData && (
              <div className="bg-secondary rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm mb-2">Dados da Triagem:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pressão:</span>{' '}
                    <span className="font-medium">{currentPatient.triageData.bloodPressure}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperatura:</span>{' '}
                    <span className="font-medium">{currentPatient.triageData.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">FC:</span>{' '}
                    <span className="font-medium">{currentPatient.triageData.heartRate} bpm</span>
                  </div>
                  {currentPatient.triageData.oxygenSaturation && (
                    <div>
                      <span className="text-muted-foreground">SpO2:</span>{' '}
                      <span className="font-medium">{currentPatient.triageData.oxygenSaturation}%</span>
                    </div>
                  )}
                </div>
                {currentPatient.triageData.observations && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground text-xs">Observações:</span>
                    <p className="text-sm">{currentPatient.triageData.observations}</p>
                  </div>
                )}
              </div>
            )}

            {/* Formulário de Consulta */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico *</Label>
              <Textarea
                id="diagnosis"
                placeholder="Descreva o diagnóstico..."
                rows={3}
                value={consultationData.diagnosis}
                onChange={(e) => setConsultationData(prev => ({ ...prev, diagnosis: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription">Prescrição</Label>
              <Textarea
                id="prescription"
                placeholder="Prescrição de medicamentos e orientações..."
                rows={4}
                value={consultationData.prescription}
                onChange={(e) => setConsultationData(prev => ({ ...prev, prescription: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultationObs">Observações</Label>
              <Textarea
                id="consultationObs"
                placeholder="Observações adicionais..."
                rows={3}
                value={consultationData.observations}
                onChange={(e) => setConsultationData(prev => ({ ...prev, observations: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConsultationDialogOpen(false);
                  setCurrentPatient(null);
                  // Voltar paciente para a fila
                  if (currentPatient) {
                    updateAppointment(currentPatient.id, { status: 'waiting_doctor' });
                    loadQueue();
                  }
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCompleteConsultation}
                className="flex-1"
              >
                Concluir Consulta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
