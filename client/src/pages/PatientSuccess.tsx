import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAppointmentById, getTriageQueue } from '@/lib/storage';
import { PRIORITY_LABELS, PRIORITY_COLORS, type Appointment } from '@/../../shared/types';

export default function PatientSuccess() {
  const [, setLocation] = useLocation();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [queuePosition, setQueuePosition] = useState<number>(0);

  useEffect(() => {
    const appointmentId = sessionStorage.getItem('appointment_id');
    
    if (!appointmentId) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      setLocation('/');
      return;
    }

    const apt = getAppointmentById(appointmentId);
    if (!apt) {
      toast.error('Atendimento não encontrado.');
      setLocation('/');
      return;
    }

    setAppointment(apt);

    // Calcular posição na fila
    const queue = getTriageQueue();
    const position = queue.findIndex(a => a.id === appointmentId) + 1;
    setQueuePosition(position);
  }, [setLocation]);

  const handleFinish = () => {
    // Limpar sessão
    sessionStorage.removeItem('patient_sus_card');
    sessionStorage.removeItem('service_type');
    sessionStorage.removeItem('appointment_id');
    
    setLocation('/');
  };

  if (!appointment) {
    return null;
  }

  const priorityColor = PRIORITY_COLORS[appointment.priority];
  const priorityLabel = PRIORITY_LABELS[appointment.priority];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Atendimento Registrado!</CardTitle>
          <CardDescription>
            Seu atendimento foi registrado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Paciente */}
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Paciente:</span>
              <span className="font-semibold">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cartão SUS:</span>
              <span className="font-mono text-sm">{appointment.susCard}</span>
            </div>
          </div>

          {/* Prioridade */}
          <div 
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: `${priorityColor}15`, borderLeft: `4px solid ${priorityColor}` }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertCircle style={{ color: priorityColor }} className="w-5 h-5" />
              <span className="text-sm font-medium text-muted-foreground">
                Classificação de Risco
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: priorityColor }}>
              {priorityLabel}
            </p>
          </div>

          {/* Posição na Fila */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Posição na Fila de Triagem
              </span>
            </div>
            <p className="text-4xl font-bold text-blue-600">
              {queuePosition}º
            </p>
          </div>

          {/* Instruções */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">Instruções:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Aguarde ser chamado para a triagem</li>
              <li>• Fique atento ao painel de chamadas</li>
              <li>• Mantenha seu cartão SUS em mãos</li>
              <li>• A ordem pode variar conforme a prioridade</li>
            </ul>
          </div>

          <Button 
            onClick={handleFinish}
            className="w-full"
            size="lg"
          >
            Finalizar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
