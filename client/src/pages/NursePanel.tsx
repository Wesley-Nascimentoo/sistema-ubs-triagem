import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogOut, UserCheck, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getTriageQueue, updateAppointment } from '@/lib/storage';
import { playBeep } from '@/lib/audio';
import { callPatient } from '@/lib/speech';
import { PRIORITY_LABELS, PRIORITY_COLORS, SERVICE_TYPES, type Appointment } from '@/../../shared/types';

export default function NursePanel() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Appointment | null>(null);
  const [isTriageDialogOpen, setIsTriageDialogOpen] = useState(false);
  const [triageData, setTriageData] = useState({
    bloodPressure: '',
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    observations: '',
    consultationRoom: '', // Novo campo
  });

  useEffect(() => {
    if (!user || user.role !== 'nurse') {
      toast.error('Acesso não autorizado');
      setLocation('/staff/login');
      return;
    }
    
    loadQueue();
  }, [user, setLocation]);

  const loadQueue = () => {
    const triageQueue = getTriageQueue();
    setQueue(triageQueue);
  };

  const handleCallNext = async () => {
    if (queue.length === 0) {
      toast.error('Não há pacientes na fila de triagem');
      return;
    }

    const nextPatient = queue[0];
    
    // Atualizar status para "em triagem"
    updateAppointment(nextPatient.id, { status: 'in_triage' });
    
    setCurrentPatient(nextPatient);
    setIsTriageDialogOpen(true);
    
    // Alerta sonoro para a triagem
    playBeep();

    // Chamar paciente com áudio 4 vezes
    await callPatient(nextPatient.patientName, 'Sala de Triagem');

    toast.success(`Chamando: ${nextPatient.patientName}`);
  };

  const handleCompleteTriage = () => {
    if (!currentPatient) return;

    // Validar campos obrigatórios
    if (!triageData.bloodPressure || !triageData.temperature || !triageData.heartRate || !triageData.consultationRoom) {
      toast.error('Por favor, preencha os campos obrigatórios (incluindo o Consultório)');
      return;
    }

    // Atualizar atendimento com dados da triagem
    updateAppointment(currentPatient.id, {
      status: 'waiting_doctor',
      consultationRoom: triageData.consultationRoom, // Adicionar o consultório
      triageData: {
        ...triageData,
        nurseId: user!.id,
        nurseName: user!.name,
        completedAt: new Date().toISOString(),
      },
    });

    toast.success('Triagem concluída com sucesso!');
    
    // Resetar formulário
    setTriageData({
      bloodPressure: '',
      temperature: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
      observations: '',
      consultationRoom: '', // Resetar o novo campo
    });
    
    setCurrentPatient(null);
    setIsTriageDialogOpen(false);
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
            <h1 className="text-2xl font-bold text-foreground">Painel do Enfermeiro</h1>
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
                Clique no botão abaixo para chamar o próximo paciente da fila de triagem
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

          {/* Fila de Triagem */}
          <Card>
            <CardHeader>
              <CardTitle>Fila de Triagem</CardTitle>
              <CardDescription>
                Pacientes aguardando triagem (ordenados por prioridade)
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
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: `${priorityColor}15`,
                              color: priorityColor 
                            }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            {priorityLabel}
                          </div>
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

      {/* Dialog de Triagem */}
      <Dialog open={isTriageDialogOpen} onOpenChange={setIsTriageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Realizar Triagem</DialogTitle>
            <DialogDescription>
              Paciente: {currentPatient?.patientName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Pressão Arterial *</Label>
                <Input
                  id="bloodPressure"
                  placeholder="120/80"
                  value={triageData.bloodPressure}
                  onChange={(e) => setTriageData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura (°C) *</Label>
                <Input
                  id="temperature"
                  placeholder="36.5"
                  value={triageData.temperature}
                  onChange={(e) => setTriageData(prev => ({ ...prev, temperature: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heartRate">Frequência Cardíaca (bpm) *</Label>
                <Input
                  id="heartRate"
                  placeholder="72"
                  value={triageData.heartRate}
                  onChange={(e) => setTriageData(prev => ({ ...prev, heartRate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratoryRate">Frequência Respiratória (rpm)</Label>
                <Input
                  id="respiratoryRate"
                  placeholder="16"
                  value={triageData.respiratoryRate}
                  onChange={(e) => setTriageData(prev => ({ ...prev, respiratoryRate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="oxygenSaturation">Saturação O2 (%)</Label>
                <Input
                  id="oxygenSaturation"
                  placeholder="98"
                  value={triageData.oxygenSaturation}
                  onChange={(e) => setTriageData(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  placeholder="70"
                  value={triageData.weight}
                  onChange={(e) => setTriageData(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

	            <div className="space-y-2">
	              <Label htmlFor="height">Altura (cm)</Label>
	              <Input
	                id="height"
	                placeholder="170"
	                value={triageData.height}
	                onChange={(e) => setTriageData(prev => ({ ...prev, height: e.target.value }))}
	              />
	            </div>
	
	            <div className="space-y-2">
	              <Label htmlFor="consultationRoom">Consultório de Atendimento *</Label>
	              <Input
	                id="consultationRoom"
	                placeholder="Ex: Consultório 1, Sala 2"
	                value={triageData.consultationRoom}
	                onChange={(e) => setTriageData(prev => ({ ...prev, consultationRoom: e.target.value }))}
	              />
	            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Observações adicionais sobre o paciente..."
                rows={4}
                value={triageData.observations}
                onChange={(e) => setTriageData(prev => ({ ...prev, observations: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsTriageDialogOpen(false);
                  setCurrentPatient(null);
                  // Voltar paciente para a fila
                  if (currentPatient) {
                    updateAppointment(currentPatient.id, { status: 'waiting_triage' });
                    loadQueue();
                  }
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCompleteTriage}
                className="flex-1"
              >
                Concluir Triagem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
