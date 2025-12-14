import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Thermometer, 
  Wind, 
  Bandage, 
  Stethoscope, 
  Syringe, 
  HelpCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { SERVICE_TYPES, type ServiceType } from '@/../../shared/types';

// Mapeamento de ícones
const ICON_MAP: Record<string, any> = {
  brain: Brain,
  thermometer: Thermometer,
  tooth: Stethoscope, // Usando Stethoscope como alternativa
  wind: Wind,
  bandage: Bandage,
  stethoscope: Stethoscope,
  syringe: Syringe,
  'help-circle': HelpCircle,
};

export default function PatientSymptoms() {
  const [, setLocation] = useLocation();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  useEffect(() => {
    // Verificar se há dados do paciente
    const susCard = sessionStorage.getItem('patient_sus_card');
    
    if (!susCard) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      setLocation('/');
    }
  }, [setLocation]);

  const handleServiceSelect = (serviceType: ServiceType) => {
    setSelectedService(serviceType);
    
    // Salvar tipo de serviço e ir para questionário
    sessionStorage.setItem('service_type', serviceType);
    setLocation('/patient/questionnaire');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Selecione o Tipo de Atendimento</CardTitle>
            <CardDescription>
              Escolha a opção que melhor descreve sua necessidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {SERVICE_TYPES.map((service) => {
                const Icon = ICON_MAP[service.icon] || HelpCircle;
                
                return (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="group relative p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 text-center"
                  >
                    <div className="mx-auto w-16 h-16 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-3 transition-colors">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {service.label}
                    </h3>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
