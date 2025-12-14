import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { QUESTIONS_BY_SERVICE, calculatePriority } from '@/lib/manchester';
import { SERVICE_TYPES, type ServiceType } from '@/../../shared/types';
import { createAppointment, createPatient, getPatientBySusCard, getSystemConfig } from '@/lib/storage';

export default function PatientQuestionnaire() {
  const [, setLocation] = useLocation();
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean | number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Verificar dados da sessão
    const susCard = sessionStorage.getItem('patient_sus_card');
    const service = sessionStorage.getItem('service_type') as ServiceType;
    
    if (!susCard || !service) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      setLocation('/');
      return;
    }
    
    setServiceType(service);
  }, [setLocation]);

  if (!serviceType) {
    return null;
  }

  const questions = QUESTIONS_BY_SERVICE[serviceType];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

  const handleYesNoAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value === 'yes',
    }));
  };

  const handleScaleAnswer = (value: number[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value[0],
    }));
  };

  const handleNext = () => {
    if (!hasAnsweredCurrent) {
      toast.error('Por favor, responda a pergunta antes de continuar');
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setLocation('/patient/symptoms');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const susCard = sessionStorage.getItem('patient_sus_card')!;
      const config = getSystemConfig()!;

      // Calcular prioridade
      const priority = calculatePriority(serviceType, answers);

      // Criar ou buscar paciente
      let patient = getPatientBySusCard(susCard);
      if (!patient) {
        // Criar paciente com nome genérico baseado no cartão SUS
        const patientName = `Paciente ${susCard.slice(-4)}`;
        patient = createPatient(susCard, patientName);
      }

      // Criar atendimento
      const appointment = createAppointment({
        patientId: patient.id,
        patientName: patient.name,
        susCard: patient.susCard,
        serviceType,
        priority,
        shift: config.currentShift,
        date: config.shiftDate,
        status: 'waiting_triage',
      });

      // Salvar ID do atendimento na sessão
      sessionStorage.setItem('appointment_id', appointment.id);

      // Redirecionar para tela de sucesso
      setLocation('/patient/success');
    } catch (error) {
      toast.error('Erro ao criar atendimento. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const serviceInfo = SERVICE_TYPES.find(s => s.id === serviceType);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl">{serviceInfo?.label}</CardTitle>
              <span className="text-sm text-muted-foreground">
                Pergunta {currentQuestionIndex + 1} de {questions.length}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <CardDescription className="mt-2">
              Responda as perguntas para avaliarmos a prioridade do seu atendimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {currentQuestion.text}
              </h3>

              {currentQuestion.type === 'yes-no' ? (
                <RadioGroup 
                  value={answers[currentQuestion.id] === true ? 'yes' : answers[currentQuestion.id] === false ? 'no' : undefined}
                  onValueChange={handleYesNoAnswer}
                >
                  <div className="flex items-center space-x-2 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="flex-1 cursor-pointer">
                      Sim
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="flex-1 cursor-pointer">
                      Não
                    </Label>
                  </div>
                </RadioGroup>
              ) : (
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={currentQuestion.scaleMax || 10}
                    step={1}
                    value={[answers[currentQuestion.id] as number || 0]}
                    onValueChange={handleScaleAnswer}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0</span>
                    <span className="text-2xl font-bold text-primary">
                      {answers[currentQuestion.id] || 0}
                    </span>
                    <span>{currentQuestion.scaleMax || 10}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!hasAnsweredCurrent || isSubmitting}
              >
                {isSubmitting ? (
                  'Processando...'
                ) : isLastQuestion ? (
                  'Finalizar'
                ) : (
                  <>
                    Próxima
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
