import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Stethoscope, AlertCircle, Home, Volume2, Maximize2, VolumeX } from 'lucide-react';
import { getTriageQueue, getDoctorQueue } from '@/lib/storage';
import { PRIORITY_LABELS, PRIORITY_COLORS, SERVICE_TYPES, type Appointment } from '@/../../shared/types';
import { playBeep } from '@/lib/audio';

export default function QueuesDisplay() {
  const [, setLocation] = useLocation();
  const [triageQueue, setTriageQueue] = useState<Appointment[]>([]);
  const [doctorQueue, setDoctorQueue] = useState<Appointment[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastAnnouncedId, setLastAnnouncedId] = useState<string>('');
  const announcingRef = useRef(false);

  const loadQueues = useCallback(() => {
    setTriageQueue(getTriageQueue());
    setDoctorQueue(getDoctorQueue());
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    loadQueues();
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(loadQueues, 5000);
    
    return () => clearInterval(interval);
  }, [loadQueues]);

  // Emitir alerta sonoro quando um novo paciente é chamado
  useEffect(() => {
    if (announcingRef.current) return;

    const currentTriagePatient = triageQueue[0];
    const currentDoctorPatient = doctorQueue[0];
    let patientToAnnounce: Appointment | null = null;

    // Verificar se há um novo paciente de triagem
    if (currentTriagePatient && currentTriagePatient.id !== lastAnnouncedId) {
      patientToAnnounce = currentTriagePatient;
    }
    // Se não há paciente de triagem, verificar médico
    else if (!currentTriagePatient && currentDoctorPatient && currentDoctorPatient.id !== lastAnnouncedId) {
      patientToAnnounce = currentDoctorPatient;
    }

    if (patientToAnnounce) {
      announcingRef.current = true;
      playBeep(0.5, 880); // Beep de alerta
      
      setTimeout(() => {
        setLastAnnouncedId(patientToAnnounce!.id);
        announcingRef.current = false;
      }, 1000); // Espera 1 segundo para o beep terminar
    }
  }, [triageQueue, doctorQueue, lastAnnouncedId]);

  const getServiceLabel = (serviceType: string) => {
    return SERVICE_TYPES.find(s => s.id === serviceType)?.label || serviceType;
  };

  const getRoomNumber = (index: number, type: 'triage' | 'doctor') => {
    if (type === 'triage') {
      return `Sala T-${index + 1}`;
    } else {
      return `Consultório ${index + 1}`;
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleSpeech = () => {
    if (isSpeechEnabled) {
      stopSpeech();
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  const currentTriagePatient = triageQueue[0];
  const currentDoctorPatient = doctorQueue[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-black">
      {/* Header */}
      <header className="bg-white/80 border-b border-slate-200 backdrop-blur">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel de Filas - UBS</h1>
	            <p className="text-sm text-muted-foreground">Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}</p>
          </div>
          <div className="flex gap-2">
	              <Button 
	                variant="outline" 
	                onClick={loadQueues}
	                className="bg-white border-slate-200 hover:bg-slate-100"
	              >
              <RefreshCw className="mr-2 w-4 h-4" />
              Atualizar
            </Button>
	            {/* Botão de voz removido, pois a funcionalidade foi substituída por um alerta sonoro */}
	              <Button 
	                variant="outline" 
	                onClick={toggleFullscreen}
	                className="bg-white border-slate-200 hover:bg-slate-100"
	              >
              <Maximize2 className="w-4 h-4" />
            </Button>
	              <Button 
	                variant="outline" 
	                onClick={() => setLocation('/')}
	                className="bg-white border-slate-200 hover:bg-slate-100"
	              >
              <Home className="mr-2 w-4 h-4" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seção de Triagem */}
          <div className="space-y-4">
            {/* Paciente Sendo Chamado */}
            {currentTriagePatient && (
              <div 
                className="rounded-lg p-6 text-center animate-pulse"
                style={{ backgroundColor: PRIORITY_COLORS[currentTriagePatient.priority] + '20', borderLeft: `6px solid ${PRIORITY_COLORS[currentTriagePatient.priority]}` }}
              >
	                <div className="flex items-center justify-center gap-2 mb-3">
		                  <Volume2 className="w-6 h-6" style={{ color: PRIORITY_COLORS[currentTriagePatient.priority] }} />
		                  <p className="text-sm font-semibold text-muted-foreground">CHAMANDO AGORA</p>
	                </div>
                <p className="text-4xl font-bold mb-2" style={{ color: PRIORITY_COLORS[currentTriagePatient.priority] }}>
                  {currentTriagePatient.patientName}
                </p>
                <p className="text-2xl font-semibold mb-4">
                  {getRoomNumber(0, 'triage')}
                </p>
	                <p className="text-sm text-muted-foreground">
                  {getServiceLabel(currentTriagePatient.serviceType)}
                </p>
              </div>
            )}

            {/* Fila de Triagem */}
	            <Card className="bg-white border-slate-200">
	              <CardHeader>
	                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5" />
                  Fila de Triagem
                </CardTitle>
	                <CardDescription className="text-muted-foreground">
                  {triageQueue.length} paciente(s) aguardando
                </CardDescription>
              </CardHeader>
              <CardContent>
                {triageQueue.length === 0 ? (
	                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Nenhum paciente na fila de triagem</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {triageQueue.map((appointment, index) => {
                      const priorityColor = PRIORITY_COLORS[appointment.priority];
                      const priorityLabel = PRIORITY_LABELS[appointment.priority];
                      const room = getRoomNumber(index, 'triage');
                      
                      return (
                        <div 
	                          key={appointment.id}
	                          className="flex items-center gap-4 p-4 rounded-lg border bg-slate-50 border-slate-200"
                          style={{ borderLeft: `4px solid ${priorityColor}` }}
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{appointment.patientName}</p>
	                            <p className="text-sm text-muted-foreground">
                              {getServiceLabel(appointment.serviceType)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div 
                              className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium mb-2"
                              style={{ 
                                backgroundColor: `${priorityColor}15`,
                                color: priorityColor 
                              }}
                            >
                              <AlertCircle className="w-4 h-4" />
                              {priorityLabel}
                            </div>
	                            {/* Consultório será exibido após a triagem */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Seção de Atendimento Médico */}
          <div className="space-y-4">
            {/* Paciente Sendo Chamado */}
            {currentDoctorPatient && (
              <div 
                className="rounded-lg p-6 text-center animate-pulse"
                style={{ backgroundColor: PRIORITY_COLORS[currentDoctorPatient.priority] + '20', borderLeft: `6px solid ${PRIORITY_COLORS[currentDoctorPatient.priority]}` }}
              >
	                <div className="flex items-center justify-center gap-2 mb-3">
		                  <Volume2 className="w-6 h-6" style={{ color: PRIORITY_COLORS[currentDoctorPatient.priority] }} />
		                  <p className="text-sm font-semibold text-muted-foreground">CHAMANDO AGORA</p>
	                </div>
                <p className="text-4xl font-bold mb-2" style={{ color: PRIORITY_COLORS[currentDoctorPatient.priority] }}>
                  {currentDoctorPatient.patientName}
                </p>
                <p className="text-2xl font-semibold mb-4">
                  {currentDoctorPatient.consultationRoom || getRoomNumber(0, 'doctor')}
                </p>
	                <p className="text-sm text-muted-foreground">
                  {getServiceLabel(currentDoctorPatient.serviceType)}
                </p>
              </div>
            )}

            {/* Fila de Atendimento */}
	            <Card className="bg-white border-slate-200">
	              <CardHeader>
	                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Stethoscope className="w-5 h-5" />
                  Fila de Atendimento Médico
                </CardTitle>
	                <CardDescription className="text-muted-foreground">
                  {doctorQueue.length} paciente(s) aguardando
                </CardDescription>
              </CardHeader>
              <CardContent>
                {doctorQueue.length === 0 ? (
	                  <div className="text-center py-12 text-muted-foreground">
                    <Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Nenhum paciente na fila de atendimento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doctorQueue.map((appointment, index) => {
                      const priorityColor = PRIORITY_COLORS[appointment.priority];
                      const priorityLabel = PRIORITY_LABELS[appointment.priority];
	                      const room = appointment.consultationRoom || getRoomNumber(index, 'doctor');
                      
                      return (
                        <div 
	                          key={appointment.id}
	                          className="flex items-center gap-4 p-4 rounded-lg border bg-slate-50 border-slate-200"
                          style={{ borderLeft: `4px solid ${priorityColor}` }}
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{appointment.patientName}</p>
	                            <p className="text-sm text-muted-foreground">
                              {getServiceLabel(appointment.serviceType)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div 
                              className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium mb-2"
                              style={{ 
                                backgroundColor: `${priorityColor}15`,
                                color: priorityColor 
                              }}
                            >
                              <AlertCircle className="w-4 h-4" />
                              {priorityLabel}
                            </div>
                            <p className="text-xs text-slate-300 font-mono">{room}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
